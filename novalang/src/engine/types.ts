export const TokenType = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  IDENTIFIER: 'IDENTIFIER',

  LET: 'LET',
  PRINT: 'PRINT',
  INPUT: 'INPUT',
  IF: 'IF',
  ELSE: 'ELSE',
  END: 'END',
  WHILE: 'WHILE',
  FOR: 'FOR',
  TO: 'TO',
  FUNC: 'FUNC',
  RETURN: 'RETURN',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',

  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',

  EQ: 'EQ',
  EQ_EQ: 'EQ_EQ',
  NOT_EQ: 'NOT_EQ',
  LT: 'LT',
  GT: 'GT',
  LT_EQ: 'LT_EQ',
  GT_EQ: 'GT_EQ',

  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  COMMA: 'COMMA',

  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
} as const

export type TokenType = (typeof TokenType)[keyof typeof TokenType]

export interface Token {
  type: TokenType
  lexeme: string
  literal: string | number | boolean | null
  line: number
  column: number
}

export interface RuntimeError {
  message: string
  line: number
  column: number
}

export interface ParseError {
  message: string
  line: number
  column: number
}
