# FizzBuzz in NovaLang
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
