import { Lexer } from './lexer'
import { Parser } from './parser'
import { Interpreter } from './interpreter'
import type { RuntimeError } from './types'

export interface RunResult {
  output: string[]
  errors: RuntimeError[]
  executionTime: number
  variables: Record<string, unknown>
}

export interface RunConfig {
  inputProvider?: (prompt: string) => Promise<string | null>
  stepCallback?: (node: any, env: Record<string, any>) => void
}

export async function runNovaLang(
  source: string,
  config: RunConfig = {}
): Promise<RunResult> {
  const start = performance.now()

  try {
    const lexer = new Lexer(source)
    const tokens = lexer.scanTokens()

    const parser = new Parser(tokens)
    const ast = parser.parse()

    if (parser.getErrors().length > 0) {
      return {
        output: [],
        errors: parser.getErrors().map(e => ({
          message: e.message,
          line: e.line,
          column: e.column,
        } as RuntimeError)),
        executionTime: performance.now() - start,
        variables: {},
      }
    }

    const interpreter = new Interpreter()
    if (config.inputProvider) {
      interpreter.setInputProvider(config.inputProvider)
    }
    if (config.stepCallback) {
      interpreter.setStepCallback(config.stepCallback)
    }

    const result = await interpreter.interpret(ast)

    return {
      output: result.output,
      errors: result.errors,
      executionTime: performance.now() - start,
      variables: interpreter.getEnvironment() as Record<string, unknown>,
    }
  } catch (e: unknown) {
    const err = e as { message?: string; line?: number; column?: number }
    return {
      output: [],
      errors: [{
        message: err.message || 'Unknown error',
        line: err.line ?? 0,
        column: err.column ?? 0,
      }],
      executionTime: performance.now() - start,
      variables: {},
    }
  }
}
