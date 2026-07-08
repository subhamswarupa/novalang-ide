export interface Example {
  name: string
  description: string
  code: string
}

export const examples: Example[] = [
  {
    name: 'Hello World',
    description: 'Simple hello world program',
    code: `# Hello World in NovaLang
PRINT "Hello, World!"
PRINT "Welcome to NovaLang!"`,
  },
  {
    name: 'Calculator',
    description: 'Basic arithmetic calculator',
    code: `# NovaLang Calculator
PRINT "=== Calculator ==="
PRINT "10 + 5 ="
PRINT 10 + 5
PRINT "10 - 5 ="
PRINT 10 - 5
PRINT "10 * 5 ="
PRINT 10 * 5
PRINT "10 / 5 ="
PRINT 10 / 5
PRINT "10 % 3 ="
PRINT 10 % 3

LET a = 25
LET b = 7
PRINT "25 + 7 ="
PRINT a + b
PRINT "25 * 7 ="
PRINT a * b`,
  },
  {
    name: 'FizzBuzz',
    description: 'Classic FizzBuzz from 1 to 20',
    code: `# FizzBuzz in NovaLang
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
END`,
  },
  {
    name: 'Factorial',
    description: 'Calculate factorial of a number',
    code: `# Factorial in NovaLang
LET n = 7
LET result = 1
LET i = 1

PRINT "Factorial of"
PRINT n

WHILE i <= n
  result = result * i
  i = i + 1
END

PRINT "Result:"
PRINT result`,
  },
  {
    name: 'Prime Numbers',
    description: 'Find prime numbers up to 50',
    code: `# Prime Numbers in NovaLang
PRINT "Prime numbers up to 50:"

LET num = 2
WHILE num <= 50
  LET isPrime = true
  LET i = 2
  WHILE i < num
    IF num % i == 0
      isPrime = false
    END
    i = i + 1
  END
  IF isPrime
    PRINT num
  END
  num = num + 1
END`,
  },
  {
    name: 'Multiplication Table',
    description: 'Generate multiplication table',
    code: `# Multiplication Table in NovaLang
LET n = 7
PRINT "Multiplication Table for"
PRINT n

LET i = 1
WHILE i <= 10
  PRINT n
  PRINT " x "
  PRINT i
  PRINT " = "
  PRINT n * i
  i = i + 1
END`,
  },
  {
    name: 'Temperature Converter',
    description: 'Convert Celsius to Fahrenheit',
    code: `# Temperature Converter in NovaLang
PRINT "=== Temperature Converter ==="
PRINT "Celsius to Fahrenheit"

LET celsius = 100
LET fahrenheit = celsius * 9 / 5 + 32

PRINT celsius
PRINT "C = "
PRINT fahrenheit
PRINT "F"

PRINT "---"

LET c = 0
WHILE c <= 100
  LET f = c * 9 / 5 + 32
  PRINT c
  PRINT "C -> "
  PRINT f
  PRINT "F"
  c = c + 20
END`,
  },
  {
    name: 'Voting Eligibility',
    description: 'Check voting eligibility',
    code: `# Voting Eligibility in NovaLang
LET age = 20

PRINT "Age:"
PRINT age

IF age >= 18
  PRINT "You are eligible to vote!"
ELSE
  PRINT "You are not eligible to vote."
END

LET age2 = 16
PRINT "Age:"
PRINT age2

IF age2 >= 18
  PRINT "You are eligible to vote!"
ELSE
  PRINT "You are not eligible to vote."
END`,
  },
  {
    name: 'Simple Banking',
    description: 'Banking operations simulation',
    code: `# Simple Banking in NovaLang
PRINT "=== Simple Banking ==="

LET balance = 1000
PRINT "Initial balance:"
PRINT balance

LET deposit = 500
balance = balance + deposit
PRINT "After deposit of 500:"
PRINT balance

LET withdrawal = 200
balance = balance - withdrawal
PRINT "After withdrawal of 200:"
PRINT balance

LET interest = balance * 10 / 100
balance = balance + interest
PRINT "After 10% interest:"
PRINT balance`,
  },
  {
    name: 'Guess Number',
    description: 'Number guessing game',
    code: `# Number Guessing Game in NovaLang
PRINT "=== Guess the Number ==="
PRINT "I'm thinking of a number between 1 and 10"

LET secret = 7
LET guess = 5

PRINT "Your guess:"
PRINT guess

IF guess == secret
  PRINT "Correct! You guessed it!"
ELSE
  IF guess < secret
    PRINT "Too low! Try again."
  ELSE
    PRINT "Too high! Try again."
  END
END

PRINT "The secret number was:"
PRINT secret`,
  },
  {
    name: 'Arrays Demo',
    description: 'Working with arrays in NovaLang',
    code: `# Arrays in NovaLang
LET nums = [1, 2, 3, 4, 5]
PRINT "Array:"
PRINT nums`,
  },
]
