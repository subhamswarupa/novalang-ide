import { TokenType, type Token } from './types'

const KEYWORDS: Record<string, TokenType> = {
  LET: TokenType.LET,
  PRINT: TokenType.PRINT,
  INPUT: TokenType.INPUT,
  IF: TokenType.IF,
  ELSE: TokenType.ELSE,
  END: TokenType.END,
  WHILE: TokenType.WHILE,
  FOR: TokenType.FOR,
  TO: TokenType.TO,
  FUNC: TokenType.FUNC,
  RETURN: TokenType.RETURN,
  AND: TokenType.AND,
  OR: TokenType.OR,
  NOT: TokenType.NOT,
  TRUE: TokenType.BOOLEAN,
  FALSE: TokenType.BOOLEAN,
}

export class Lexer {
  private source: string
  private tokens: Token[] = []
  private start = 0
  private current = 0
  private line = 1
  private column = 1

  constructor(source: string) {
    this.source = source
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }
    this.tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      literal: null,
      line: this.line,
      column: this.column,
    })
    return this.tokens
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length
  }

  private advance(): string {
    const ch = this.source[this.current]
    this.current++
    this.column++
    return ch
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0'
    return this.source[this.current]
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0'
    return this.source[this.current + 1]
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false
    if (this.source[this.current] !== expected) return false
    this.current++
    this.column++
    return true
  }

  private addToken(type: TokenType, literal: string | number | boolean | null = null): void {
    const lexeme = this.source.slice(this.start, this.current)
    this.tokens.push({ type, lexeme, literal, line: this.line, column: this.column - lexeme.length })
  }

  private scanToken(): void {
    const ch = this.advance()
    switch (ch) {
      case '(':
        this.addToken(TokenType.LPAREN)
        break
      case ')':
        this.addToken(TokenType.RPAREN)
        break
      case '[':
        this.addToken(TokenType.LBRACKET)
        break
      case ']':
        this.addToken(TokenType.RBRACKET)
        break
      case ',':
        this.addToken(TokenType.COMMA)
        break
      case '+':
        this.addToken(TokenType.PLUS)
        break
      case '-':
        this.addToken(TokenType.MINUS)
        break
      case '*':
        this.addToken(TokenType.STAR)
        break
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance()
        } else {
          this.addToken(TokenType.SLASH)
        }
        break
      case '%':
        this.addToken(TokenType.PERCENT)
        break
      case '=':
        if (this.match('=')) {
          this.addToken(TokenType.EQ_EQ)
        } else {
          this.addToken(TokenType.EQ)
        }
        break
      case '!':
        if (this.match('=')) {
          this.addToken(TokenType.NOT_EQ)
        } else {
          this.addToken(TokenType.NOT)
        }
        break
      case '<':
        if (this.match('=')) {
          this.addToken(TokenType.LT_EQ)
        } else {
          this.addToken(TokenType.LT)
        }
        break
      case '>':
        if (this.match('=')) {
          this.addToken(TokenType.GT_EQ)
        } else {
          this.addToken(TokenType.GT)
        }
        break
      case '#':
        while (this.peek() !== '\n' && !this.isAtEnd()) this.advance()
        break
      case '"':
        this.string()
        break
      case '\n':
        this.addToken(TokenType.NEWLINE)
        this.line++
        this.column = 1
        break
      case ' ':
      case '\r':
      case '\t':
        break
      default:
        if (this.isDigit(ch)) {
          this.number()
        } else if (this.isAlpha(ch)) {
          this.identifier()
        } else {
          throw new Error(`Unexpected character '${ch}' at line ${this.line}, column ${this.column}`)
        }
        break
    }
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++
        this.column = 1
      }
      this.advance()
    }
    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`)
    }
    this.advance()
    const value = this.source.slice(this.start + 1, this.current - 1)
    this.addToken(TokenType.STRING, value)
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance()
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance()
      while (this.isDigit(this.peek())) this.advance()
    }
    const numStr = this.source.slice(this.start, this.current)
    this.addToken(TokenType.NUMBER, Number(numStr))
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance()
    const text = this.source.slice(this.start, this.current)
    const type = KEYWORDS[text.toUpperCase()] || KEYWORDS[text] || TokenType.IDENTIFIER
    if (type === TokenType.BOOLEAN) {
      this.addToken(type, text.toUpperCase() === 'TRUE')
    } else {
      this.addToken(type)
    }
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9'
  }

  private isAlpha(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_'
  }

  private isAlphaNumeric(ch: string): boolean {
    return this.isAlpha(ch) || this.isDigit(ch)
  }
}
