import { TokenType, type Token } from './types'
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
  Literal,
  Identifier,
  ArrayLiteral,
  BinaryExpression,
  UnaryExpression,
} from './ast'

export class Parser {
  private tokens: Token[]
  private current = 0
  private errors: { message: string; line: number; column: number }[] = []

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): Program {
    this.current = 0
    this.errors = []
    const statements = this.parseBlock(TokenType.EOF)
    return { kind: 'Program', statements }
  }

  getErrors(): { message: string; line: number; column: number }[] {
    return this.errors
  }

  private parseBlock(...endTypes: TokenType[]): ASTNode[] {
    const statements: ASTNode[] = []
    while (!this.isAtEnd()) {
      this.skipNewlines()
      if (this.isAtEnd()) break
      if (endTypes.includes(this.peek().type)) break
      try {
        const stmt = this.statement()
        if (stmt) statements.push(stmt)
      } catch (e: unknown) {
        const err = e as { message?: string; line?: number; column?: number }
        this.errors.push({
          message: err.message || 'Parse error',
          line: err.line ?? this.peek().line,
          column: err.column ?? this.peek().column,
        })
        this.synchronize()
      }
      this.skipNewlines()
    }
    return statements
  }

  private statement(): ASTNode | null {
    if (this.match(TokenType.LET)) return this.varDeclaration()
    if (this.match(TokenType.PRINT)) return this.printStatement()
    if (this.match(TokenType.INPUT)) return this.inputStatement()
    if (this.match(TokenType.IF)) return this.ifStatement()
    if (this.match(TokenType.WHILE)) return this.whileLoop()
    if (this.match(TokenType.FOR)) return this.forLoop()
    if (this.match(TokenType.FUNC)) return this.funcDeclaration()

    if (this.peek().type === TokenType.IDENTIFIER && this.checkNext(TokenType.EQ)) {
      return this.assignment()
    }

    if (this.peek().type === TokenType.IDENTIFIER && this.checkNext(TokenType.LPAREN)) {
      return this.funcCallStatement()
    }

    if (this.peek().type === TokenType.NEWLINE) {
      this.advance()
      return null
    }

    if (this.peek().type === TokenType.EOF || this.peek().type === TokenType.END) return null

    const tok = this.peek()
    throw { message: `Unexpected token '${tok.lexeme}'`, line: tok.line, column: tok.column }
  }

  private varDeclaration(): VariableDeclaration {
    const nameTok = this.consume(TokenType.IDENTIFIER, 'Expected variable name after LET')
    this.consume(TokenType.EQ, 'Expected "=" after variable name')
    const initializer = this.expression()
    this.optionalNewline()
    return { kind: 'VariableDeclaration', name: nameTok.lexeme, initializer }
  }

  private assignment(): Assignment {
    const nameTok = this.consume(TokenType.IDENTIFIER, 'Expected variable name')
    this.consume(TokenType.EQ, 'Expected "=" after variable name')
    const value = this.expression()
    this.optionalNewline()
    return { kind: 'Assignment', name: nameTok.lexeme, value }
  }

  private printStatement(): PrintStatement {
    const expr = this.expression()
    this.optionalNewline()
    return { kind: 'PrintStatement', expression: expr }
  }

  private inputStatement(): InputStatement {
    const nameTok = this.consume(TokenType.IDENTIFIER, 'Expected variable name after INPUT')
    this.optionalNewline()
    return { kind: 'InputStatement', name: nameTok.lexeme }
  }

  private ifStatement(): IfStatement {
    const condition = this.expression()
    this.optionalNewline()
    this.skipNewlines()
    const thenBlock = this.parseBlock(TokenType.ELSE, TokenType.END)
    let elseBlock: ASTNode[] | null = null
    if (this.match(TokenType.ELSE)) {
      this.optionalNewline()
      this.skipNewlines()
      elseBlock = this.parseBlock(TokenType.END)
    }
    this.match(TokenType.END)
    this.optionalNewline()
    return { kind: 'IfStatement', condition, thenBlock, elseBlock }
  }

  private whileLoop(): WhileLoop {
    const condition = this.expression()
    this.optionalNewline()
    this.skipNewlines()
    const body = this.parseBlock(TokenType.END)
    this.match(TokenType.END)
    this.optionalNewline()
    return { kind: 'WhileLoop', condition, body }
  }

  private forLoop(): ForLoop {
    const varTok = this.consume(TokenType.IDENTIFIER, 'Expected variable name after FOR')
    this.consume(TokenType.EQ, 'Expected "=" in FOR loop')
    const start = this.expression()
    this.consume(TokenType.TO, 'Expected TO in FOR loop')
    const end = this.expression()
    this.optionalNewline()
    this.skipNewlines()
    const body = this.parseBlock(TokenType.END)
    this.match(TokenType.END)
    this.optionalNewline()
    return { kind: 'ForLoop', variable: varTok.lexeme, start, end, body }
  }

  private funcDeclaration(): FunctionDeclaration {
    const nameTok = this.consume(TokenType.IDENTIFIER, 'Expected function name after FUNC')
    this.consume(TokenType.LPAREN, 'Expected "(" after function name')
    const parameters: string[] = []
    if (!this.check(TokenType.RPAREN)) {
      do {
        const param = this.consume(TokenType.IDENTIFIER, 'Expected parameter name')
        parameters.push(param.lexeme)
      } while (this.match(TokenType.COMMA))
    }
    this.consume(TokenType.RPAREN, 'Expected ")" after parameters')
    this.optionalNewline()
    this.skipNewlines()
    const body = this.parseBlock(TokenType.END)
    this.match(TokenType.END)
    this.optionalNewline()
    return { kind: 'FunctionDeclaration', name: nameTok.lexeme, parameters, body }
  }

  private funcCallStatement(): FunctionCall {
    return this.funcCall()
  }

  private funcCall(): FunctionCall {
    const nameTok = this.consume(TokenType.IDENTIFIER, 'Expected function name')
    this.consume(TokenType.LPAREN, 'Expected "(" after function name')
    const args: ASTNode[] = []
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.expression())
      } while (this.match(TokenType.COMMA))
    }
    this.consume(TokenType.RPAREN, 'Expected ")" after arguments')
    return { kind: 'FunctionCall', callee: nameTok.lexeme, arguments: args }
  }

  expression(): ASTNode {
    return this.logicalOr()
  }

  private logicalOr(): ASTNode {
    let expr = this.logicalAnd()
    while (this.match(TokenType.OR)) {
      const right = this.logicalAnd()
      expr = this.binary(expr, 'OR', right)
    }
    return expr
  }

  private logicalAnd(): ASTNode {
    let expr = this.comparison()
    while (this.match(TokenType.AND)) {
      const right = this.comparison()
      expr = this.binary(expr, 'AND', right)
    }
    return expr
  }

  private comparison(): ASTNode {
    let expr = this.addition()
    while (
      this.match(TokenType.EQ_EQ) ||
      this.match(TokenType.NOT_EQ) ||
      this.match(TokenType.LT) ||
      this.match(TokenType.GT) ||
      this.match(TokenType.LT_EQ) ||
      this.match(TokenType.GT_EQ)
    ) {
      const op = this.previous().lexeme
      const right = this.addition()
      expr = this.binary(expr, op, right)
    }
    return expr
  }

  private addition(): ASTNode {
    let expr = this.term()
    while (this.match(TokenType.PLUS) || this.match(TokenType.MINUS)) {
      const op = this.previous().lexeme
      const right = this.term()
      expr = this.binary(expr, op, right)
    }
    return expr
  }

  private term(): ASTNode {
    let expr = this.unary()
    while (this.match(TokenType.STAR) || this.match(TokenType.SLASH) || this.match(TokenType.PERCENT)) {
      const op = this.previous().lexeme
      const right = this.unary()
      expr = this.binary(expr, op, right)
    }
    return expr
  }

  private unary(): ASTNode {
    if (this.match(TokenType.NOT) || this.match(TokenType.MINUS)) {
      const op = this.previous().lexeme
      const right = this.unary()
      return { kind: 'UnaryExpression', operator: op, operand: right } as UnaryExpression
    }
    return this.primary()
  }

  private primary(): ASTNode {
    if (this.match(TokenType.NUMBER)) {
      return { kind: 'Literal', value: this.previous().literal, type: 'number' } as Literal
    }
    if (this.match(TokenType.STRING)) {
      return { kind: 'Literal', value: this.previous().literal, type: 'string' } as Literal
    }
    if (this.match(TokenType.BOOLEAN)) {
      return { kind: 'Literal', value: this.previous().literal, type: 'boolean' } as Literal
    }
    if (this.match(TokenType.IDENTIFIER)) {
      const name = this.previous().lexeme
      if (this.check(TokenType.LPAREN)) {
        this.current--
        return this.funcCall()
      }
      return { kind: 'Identifier', name } as Identifier
    }
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression()
      this.consume(TokenType.RPAREN, 'Expected ")" after expression')
      return expr
    }
    if (this.match(TokenType.LBRACKET)) {
      const elements: ASTNode[] = []
      if (!this.check(TokenType.RBRACKET)) {
        do {
          elements.push(this.expression())
        } while (this.match(TokenType.COMMA))
      }
      this.consume(TokenType.RBRACKET, 'Expected "]" after array elements')
      return { kind: 'ArrayLiteral', elements } as ArrayLiteral
    }
    const tok = this.peek()
    throw { message: `Unexpected token '${tok.lexeme}'`, line: tok.line, column: tok.column }
  }

  private binary(left: ASTNode, operator: string, right: ASTNode): BinaryExpression {
    return { kind: 'BinaryExpression', left, operator, right }
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance()
      return true
    }
    return false
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private checkNext(type: TokenType): boolean {
    if (this.current + 1 >= this.tokens.length) return false
    return this.tokens[this.current + 1].type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()
    const tok = this.peek()
    throw { message: `${message} at line ${tok.line}, column ${tok.column}`, line: tok.line, column: tok.column }
  }

  private optionalNewline(): void {
    while (this.match(TokenType.NEWLINE)) { }
  }

  private skipNewlines(): void {
    while (this.match(TokenType.NEWLINE)) { }
  }

  private synchronize(): void {
    this.advance()
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.NEWLINE) return
      switch (this.peek().type) {
        case TokenType.LET:
        case TokenType.PRINT:
        case TokenType.INPUT:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.FOR:
        case TokenType.FUNC:
        case TokenType.END:
          return
      }
      this.advance()
    }
  }
}
