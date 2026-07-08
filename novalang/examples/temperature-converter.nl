# Temperature Converter in NovaLang
PRINT "=== Temperature Converter ==="

LET celsius = 100
LET fahrenheit = celsius * 9 / 5 + 32

PRINT celsius
PRINT "C = "
PRINT fahrenheit
PRINT "F"

LET c = 0
WHILE c <= 100
  LET f = c * 9 / 5 + 32
  PRINT c
  PRINT "C -> "
  PRINT f
  PRINT "F"
  c = c + 20
END
