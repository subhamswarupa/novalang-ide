# Simple Banking in NovaLang
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
PRINT balance
