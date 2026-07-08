# Prime Numbers in NovaLang
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
END
