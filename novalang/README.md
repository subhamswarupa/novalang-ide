# NovaLang

**A Tiny Programming Language with a Beautiful Web-Based IDE**

NovaLang is a modern, minimal programming language designed for learning and experimentation. It features a clean syntax inspired by Python and JavaScript, with a powerful web-based IDE powered by Monaco Editor.

## Features

### Language
- **Variables**: `LET name = "Nova"`
- **Data Types**: Numbers, Strings, Booleans, Arrays
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`
- **Comparison**: `==`, `!=`, `<`, `>`, `<=`, `>=`
- **Logical**: `AND`, `OR`, `NOT`
- **Print**: `PRINT "Hello"`
- **Input**: `INPUT name`
- **Conditionals**: `IF` / `ELSE` / `END`
- **Loops**: `WHILE`, `FOR` / `TO` / `END`
- **Functions**: `FUNC name(params)` / `END`
- **Arrays**: `LET nums = [1, 2, 3]`
- **Comments**: `# comment`

### IDE
- Monaco Editor with syntax highlighting
- Line numbers, bracket matching, auto-indentation
- Dark mode
- File explorer with examples
- Output console with error highlighting
- Variable inspector
- Execution time tracking
- Documentation panel
- Keyboard shortcut: `Ctrl+Enter` to run

## Architecture

```
novalang/
├── src/
│   ├── engine/
│   │   ├── types.ts        # Token and error types
│   │   ├── lexer.ts        # Lexical analyzer
│   │   ├── ast.ts          # AST node definitions
│   │   ├── parser.ts       # Recursive descent parser
│   │   ├── environment.ts  # Variable scope management
│   │   ├── interpreter.ts  # Tree-walk interpreter
│   │   ├── error.ts        # Error formatting utilities
│   │   └── index.ts        # Public API
│   ├── components/
│   │   ├── IDE.tsx         # Main IDE layout
│   │   ├── Editor.tsx      # Monaco Editor wrapper
│   │   ├── Output.tsx      # Output console panel
│   │   └── Docs.tsx        # Documentation panel
│   ├── data/
│   │   └── examples.ts     # Example programs
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   └── src/
│       └── index.ts        # Express API server
├── examples/               # Example .nl files
├── screenshots/            # IDE screenshots
└── package.json
```

## Grammar

```
program        → statement*
statement      → varDecl | assignment | printStmt | inputStmt
               | ifStmt | whileStmt | forStmt | funcDecl | funcCall
varDecl        → "LET" IDENTIFIER "=" expression
assignment     → IDENTIFIER "=" expression
printStmt      → "PRINT" expression
inputStmt      → "INPUT" IDENTIFIER
ifStmt         → "IF" expression block ("ELSE" block)? "END"
whileStmt      → "WHILE" expression block "END"
forStmt        → "FOR" IDENTIFIER "=" expression "TO" expression block "END"
funcDecl       → "FUNC" IDENTIFIER "(" parameters? ")" block "END"
funcCall       → IDENTIFIER "(" arguments? ")"
block          → statement*
expression     → logicalOr
logicalOr      → logicalAnd ("OR" logicalAnd)*
logicalAnd     → comparison ("AND" comparison)*
comparison     → addition (("==" | "!=" | "<" | ">" | "<=" | ">=") addition)*
addition       → term (("+" | "-") term)*
term           → unary (("*" | "/" | "%") unary)*
unary          → ("NOT" | "-")? primary
primary        → NUMBER | STRING | BOOLEAN | IDENTIFIER
               | "(" expression ")" | "[" elements? "]"
elements       → expression ("," expression)*
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd novalang

# Install frontend dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Install backend dependencies
cd backend
npm install

# Start backend server
npm run dev
```

## Usage

1. Open the IDE in your browser (default: http://localhost:5173)
2. Write NovaLang code in the editor
3. Click "Run" or press `Ctrl+Enter` to execute
4. View output in the console panel
5. Toggle the variable inspector to see program state
6. Load examples from the explorer sidebar
7. Open documentation for language reference

## Examples

### Hello World
```
PRINT "Hello, World!"
```

### FizzBuzz
```
FOR i = 1 TO 20
  IF i % 15 == 0
    PRINT "FizzBuzz"
  ELSE
    IF i % 3 == 0
      PRINT "Fizz"
    ELSE
      IF i % 5 == 0
        PRINT "Buzz"
      ELSE
        PRINT i
      END
    END
  END
END
```

### Factorial
```
LET n = 7
LET result = 1
LET i = 1

WHILE i <= n
  result = result * i
  i = i + 1
END

PRINT result
```

## Screenshots

### FizzBuzz Output
*[Screenshot: FizzBuzz execution in the NovaLang IDE]*

### Factorial Output
*[Screenshot: Factorial execution showing result 5040]*

### Prime Numbers Output
*[Screenshot: Prime numbers up to 50]*

## Future Improvements

- **Arrays with Index Access**: `nums[0]` syntax
- **String Operations**: Concatenation, interpolation
- **Built-in Functions**: `LEN()`, `STR()`, `NUM()`
- **Type Checking**: Runtime type validation
- **Debugger**: Step-through execution debugger
- **AST Viewer**: Visual AST explorer
- **Token Viewer**: Token stream inspector
- **Export/Import**: Save and load programs
- **Multi-file Support**: Import statements

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Monaco Editor, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Engine**: Custom recursive descent parser, tree-walk interpreter

## License

MIT
