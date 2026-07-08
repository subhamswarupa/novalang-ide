import type {
  ASTNode,
  Program,
  VariableDeclaration,
  Assignment,
  PrintStatement,
  InputStatement,
  IfStatement,
  WhileLoop,
  ForLoop,
  FunctionDeclaration,
  FunctionCall,
  BinaryExpression,
  UnaryExpression,
  Literal,
  Identifier,
  ArrayLiteral,
} from './ast'

import { Environment, type Value } from './environment'
import type { RuntimeError } from './types'

const MAX_ITERATIONS = 10000

export class Interpreter {
  private environment = new Environment()
  private output: string[] = []
  private inputProvider: ((prompt: string) => Promise<string | null>) | null = null
  private iterationCount = 0
  private runtimeErrors: RuntimeError[] = []
  private stepCallback: ((node: ASTNode, env: Record<string, Value>) => void) | null = null

  constructor() {
    this.environment.define('PI', Math.PI)
    this.environment.define('E', Math.E)
  }

  setInputProvider(provider: (prompt: string) => Promise<string | null>): void {
    this.inputProvider = provider
  }

  setStepCallback(callback: (node: ASTNode, env: Record<string, Value>) => void): void {
    this.stepCallback = callback
  }

  reset(): void {
    this.environment = new Environment()
    this.environment.define('PI', Math.PI)
    this.environment.define('E', Math.E)
    this.output = []
    this.iterationCount = 0
    this.runtimeErrors = []
  }

  getOutput(): string[] {
    return this.output
  }

  getErrors(): RuntimeError[] {
    return this.runtimeErrors
  }

  getEnvironment(): Record<string, Value> {
    return this.environment.getAll()
  }

  async interpret(program: Program): Promise<{ output: string[]; errors: RuntimeError[] }> {
    this.reset()

    // First pass: collect function declarations
    for (const stmt of program.statements) {
      if (stmt.kind === 'FunctionDeclaration') {
        const func = stmt as FunctionDeclaration
        this.environment.defineFunction(func.name, func)
      }
    }

    // Second pass: execute
    for (const stmt of program.statements) {
      if (stmt.kind !== 'FunctionDeclaration') {
        await this.execute(stmt)
        if (this.runtimeErrors.length > 0) break
      }
    }

    return { output: this.output, errors: this.runtimeErrors }
  }

  private async execute(node: ASTNode): Promise<void> {
    if (this.stepCallback) {
      this.stepCallback(node, this.environment.getAll())
    }

    switch (node.kind) {
      case 'VariableDeclaration':
        return this.execVarDeclaration(node as VariableDeclaration)
      case 'Assignment':
        return this.execAssignment(node as Assignment)
      case 'PrintStatement':
        return this.execPrint(node as PrintStatement)
      case 'InputStatement':
        return this.execInput(node as InputStatement)
      case 'IfStatement':
        return this.execIf(node as IfStatement)
      case 'WhileLoop':
        return this.execWhile(node as WhileLoop)
      case 'ForLoop':
        return this.execFor(node as ForLoop)
      case 'FunctionCall':
        await this.execFuncCall(node as FunctionCall)
        return
      case 'Block':
        for (const stmt of (node as any).statements || []) {
          await this.execute(stmt)
          if (this.runtimeErrors.length > 0) return
        }
        return
      default:
        await this.evaluate(node)
    }
  }

  private async execVarDeclaration(node: VariableDeclaration): Promise<void> {
    const value = await this.evaluate(node.initializer)
    this.environment.define(node.name, value)
  }

  private async execAssignment(node: Assignment): Promise<void> {
    const value = await this.evaluate(node.value)
    this.environment.set(node.name, value, 0, 0)
  }

  private async execPrint(node: PrintStatement): Promise<void> {
    const value = await this.evaluate(node.expression)
    this.output.push(this.stringify(value))
  }

  private async execInput(node: InputStatement): Promise<void> {
    if (this.inputProvider) {
      const input = await this.inputProvider(`INPUT ${node.name}> `)
      if (input !== null) {
        const num = Number(input)
        this.environment.define(node.name, isNaN(num) ? input : num)
      }
    } else {
      this.environment.define(node.name, 0)
    }
  }

  private async execIf(node: IfStatement): Promise<void> {
    const condition = await this.evaluate(node.condition)
    if (this.isTruthy(condition)) {
      for (const stmt of node.thenBlock) {
        await this.execute(stmt)
        if (this.runtimeErrors.length > 0) return
      }
    } else if (node.elseBlock) {
      for (const stmt of node.elseBlock) {
        await this.execute(stmt)
        if (this.runtimeErrors.length > 0) return
      }
    }
  }

  private async execWhile(node: WhileLoop): Promise<void> {
    this.iterationCount = 0
    while (this.isTruthy(await this.evaluate(node.condition))) {
      this.iterationCount++
      if (this.iterationCount > MAX_ITERATIONS) {
        this.runtimeErrors.push({
          message: `Infinite loop detected: exceeded ${MAX_ITERATIONS} iterations`,
          line: 0,
          column: 0,
        })
        return
      }
      for (const stmt of node.body) {
        await this.execute(stmt)
        if (this.runtimeErrors.length > 0) return
      }
    }
  }

  private async execFor(node: ForLoop): Promise<void> {
    const startVal = await this.evaluate(node.start)
    const endVal = await this.evaluate(node.end)
    const start = Number(startVal)
    const end = Number(endVal)
    if (isNaN(start) || isNaN(end)) {
      this.runtimeErrors.push({ message: 'FOR loop requires numeric bounds', line: 0, column: 0 })
      return
    }
    const loopEnv = new Environment(this.environment)
    const oldEnv = this.environment
    this.environment = loopEnv
    this.iterationCount = 0
    const step = start <= end ? 1 : -1
    let i = start
    while ((step > 0 && i <= end) || (step < 0 && i >= end)) {
      this.iterationCount++
      if (this.iterationCount > MAX_ITERATIONS) {
        this.runtimeErrors.push({
          message: `Infinite loop detected: exceeded ${MAX_ITERATIONS} iterations`,
          line: 0,
          column: 0,
        })
        this.environment = oldEnv
        return
      }
      loopEnv.define(node.variable, i)
      for (const stmt of node.body) {
        await this.execute(stmt)
        if (this.runtimeErrors.length > 0) {
          this.environment = oldEnv
          return
        }
      }
      i += step
    }
    this.environment = oldEnv
  }

  private async execFuncCall(node: FunctionCall): Promise<Value> {
    const func = this.environment.getFunction(node.callee, 0, 0)
    const args: Value[] = []
    for (const arg of node.arguments) {
      args.push(await this.evaluate(arg))
    }
    const funcEnv = new Environment(this.environment)
    const oldEnv = this.environment
    this.environment = funcEnv
    for (let i = 0; i < func.parameters.length; i++) {
      funcEnv.define(func.parameters[i], args[i] ?? null)
    }
    for (const stmt of func.body) {
      await this.execute(stmt)
      if (this.runtimeErrors.length > 0) {
        this.environment = oldEnv
        return null
      }
    }
    this.environment = oldEnv
    return null
  }

  private async evaluate(node: ASTNode): Promise<Value> {
    if (this.stepCallback) {
      this.stepCallback(node, this.environment.getAll())
    }

    switch (node.kind) {
      case 'Literal':
        return (node as Literal).value as Value
      case 'Identifier':
        return this.environment.get((node as Identifier).name, 0, 0)
      case 'BinaryExpression':
        return this.evalBinary(node as BinaryExpression)
      case 'UnaryExpression':
        return this.evalUnary(node as UnaryExpression)
      case 'ArrayLiteral':
        return this.evalArray(node as ArrayLiteral)
      case 'FunctionCall':
        return this.execFuncCall(node as FunctionCall)
      default:
        return null
    }
  }

  private async evalBinary(node: BinaryExpression): Promise<Value> {
    const left = await this.evaluate(node.left)
    const right = await this.evaluate(node.right)

    switch (node.operator) {
      case '+':
        if (typeof left === 'number' && typeof right === 'number') return left + right
        if (typeof left === 'string' || typeof right === 'string') return this.stringify(left) + this.stringify(right)
        return Number(left) + Number(right)
      case '-':
        return Number(left) - Number(right)
      case '*':
        return Number(left) * Number(right)
      case '/': {
        const r = Number(right)
        if (r === 0) {
          this.runtimeErrors.push({ message: 'Division by zero', line: 0, column: 0 })
          return 0
        }
        return Number(left) / r
      }
      case '%': {
        const r = Number(right)
        if (r === 0) {
          this.runtimeErrors.push({ message: 'Division by zero', line: 0, column: 0 })
          return 0
        }
        return Number(left) % r
      }
      case '==':
        return left === right
      case '!=':
        return left !== right
      case '<':
        return Number(left) < Number(right)
      case '>':
        return Number(left) > Number(right)
      case '<=':
        return Number(left) <= Number(right)
      case '>=':
        return Number(left) >= Number(right)
      case 'AND':
        return this.isTruthy(left) && this.isTruthy(right)
      case 'OR':
        return this.isTruthy(left) || this.isTruthy(right)
      default:
        return null
    }
  }

  private async evalUnary(node: UnaryExpression): Promise<Value> {
    const operand = await this.evaluate(node.operand)
    switch (node.operator) {
      case '-':
        return -Number(operand)
      case 'NOT':
      case '!':
        return !this.isTruthy(operand)
      default:
        return operand
    }
  }

  private async evalArray(node: ArrayLiteral): Promise<Value[]> {
    const elements: Value[] = []
    for (const el of node.elements) {
      elements.push(await this.evaluate(el))
    }
    return elements
  }

  private isTruthy(value: Value): boolean {
    if (value === null) return false
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') return value.length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  private stringify(value: Value): string {
    if (value === null) return 'null'
    if (Array.isArray(value)) return `[${value.map(v => this.stringify(v)).join(', ')}]`
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return String(value)
  }
}
