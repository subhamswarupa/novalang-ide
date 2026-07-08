# Number Guessing Game in NovaLang
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
PRINT secret
