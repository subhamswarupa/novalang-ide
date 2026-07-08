# Factorial in NovaLang
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
PRINT result
