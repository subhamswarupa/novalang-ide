import type { RuntimeError } from './types'
import type { FunctionDeclaration } from './ast'

export type Value = string | number | boolean | null | Value[]

export class Environment {
  private values = new Map<string, Value>()
  private functions = new Map<string, FunctionDeclaration>()
  public parent: Environment | null = null

  constructor(parent?: Environment) {
    if (parent) this.parent = parent
  }

  define(name: string, value: Value): void {
    this.values.set(name, value)
  }

  get(name: string, line: number, column: number): Value {
    if (this.values.has(name)) return this.values.get(name)!
    if (this.parent) return this.parent.get(name, line, column)
    throw { message: `Undefined variable '${name}'`, line, column } as RuntimeError
  }

  set(name: string, value: Value, line: number, column: number): void {
    if (this.values.has(name)) {
      this.values.set(name, value)
      return
    }
    if (this.parent) {
      return this.parent.set(name, value, line, column)
    }
    throw { message: `Undefined variable '${name}'`, line, column } as RuntimeError
  }

  defineFunction(name: string, func: FunctionDeclaration): void {
    this.functions.set(name, func)
  }

  getFunction(name: string, line: number, column: number): FunctionDeclaration {
    if (this.functions.has(name)) return this.functions.get(name)!
    if (this.parent) return this.parent.getFunction(name, line, column)
    throw { message: `Undefined function '${name}'`, line, column } as RuntimeError
  }

  has(name: string): boolean {
    if (this.values.has(name)) return true
    if (this.parent) return this.parent.has(name)
    return false
  }

  getAll(): Record<string, Value> {
    const result: Record<string, Value> = {}
    if (this.parent) {
      Object.assign(result, this.parent.getAll())
    }
    for (const [key, value] of this.values) {
      result[key] = value
    }
    return result
  }
}
