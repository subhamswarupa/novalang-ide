export type ASTNode =
  | Program
  | VariableDeclaration
  | Assignment
  | PrintStatement
  | InputStatement
  | IfStatement
  | WhileLoop
  | ForLoop
  | FunctionDeclaration
  | FunctionCall
  | Block
  | BinaryExpression
  | UnaryExpression
  | Literal
  | Identifier
  | ArrayLiteral

export interface Program {
  kind: 'Program'
  statements: ASTNode[]
}

export interface VariableDeclaration {
  kind: 'VariableDeclaration'
  name: string
  initializer: ASTNode
}

export interface Assignment {
  kind: 'Assignment'
  name: string
  value: ASTNode
}

export interface PrintStatement {
  kind: 'PrintStatement'
  expression: ASTNode
}

export interface InputStatement {
  kind: 'InputStatement'
  name: string
}

export interface IfStatement {
  kind: 'IfStatement'
  condition: ASTNode
  thenBlock: ASTNode[]
  elseBlock: ASTNode[] | null
}

export interface WhileLoop {
  kind: 'WhileLoop'
  condition: ASTNode
  body: ASTNode[]
}

export interface ForLoop {
  kind: 'ForLoop'
  variable: string
  start: ASTNode
  end: ASTNode
  body: ASTNode[]
}

export interface FunctionDeclaration {
  kind: 'FunctionDeclaration'
  name: string
  parameters: string[]
  body: ASTNode[]
}

export interface FunctionCall {
  kind: 'FunctionCall'
  callee: string
  arguments: ASTNode[]
}

export interface Block {
  kind: 'Block'
  statements: ASTNode[]
}

export interface BinaryExpression {
  kind: 'BinaryExpression'
  left: ASTNode
  operator: string
  right: ASTNode
}

export interface UnaryExpression {
  kind: 'UnaryExpression'
  operator: string
  operand: ASTNode
}

export interface Literal {
  kind: 'Literal'
  value: string | number | boolean | null
  type: 'string' | 'number' | 'boolean' | 'null'
}

export interface Identifier {
  kind: 'Identifier'
  name: string
}

export interface ArrayLiteral {
  kind: 'ArrayLiteral'
  elements: ASTNode[]
}
