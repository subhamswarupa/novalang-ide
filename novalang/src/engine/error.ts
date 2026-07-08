import type { RuntimeError } from './types'

export interface CompileError {
  type: 'LexicalError' | 'ParseError' | 'RuntimeError'
  message: string
  line: number
  column: number
}

export function friendlyError(message: string, line: number, column: number): string {
  return `Line ${line}: ${message} (at column ${column})`
}

export function formatRuntimeError(err: RuntimeError): string {
  const hints: Record<string, string> = {
    'Undefined variable': 'Did you forget to declare it with LET?',
    'Division by zero': 'Cannot divide by zero. Check your divisor.',
    'Infinite loop': 'Your loop ran too many times. Check your loop condition.',
    'Undefined function': 'Did you define the function before calling it?',
  }
  for (const [key, hint] of Object.entries(hints)) {
    if (err.message.includes(key)) {
      return `[Line ${err.line}] ${err.message}\n  \uD83D\uDCA1 ${hint}`
    }
  }
  return `[Line ${err.line}] ${err.message}`
}
