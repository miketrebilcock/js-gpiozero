test:
	istanbul cover node_modules/mocha/bin/_mocha --report lcovonly && codecov

.PHONY:	test