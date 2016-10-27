test:
	istanbul cover ./node_modules/mocha/bin/_mocha && codecov

.PHONY:	test