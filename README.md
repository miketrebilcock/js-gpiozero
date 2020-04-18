# js-gpiozero

[![Build Tests](https://travis-ci.org/miketrebilcock/js-gpiozero.svg?branch=master)](https://travis-ci.org/miketrebilcock/js-gpiozero) [![Code Coverage](https://codecov.io/gh/miketrebilcock/js-gpiozero/branch/master/graph/badge.svg)](https://codecov.io/gh/miketrebilcock/js-gpiozero) [![npm version](https://badge.fury.io/js/js-gpiozero.svg)](https://badge.fury.io/js/js-gpiozero) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A port of the fanastic [python gpiozero](https://github.com/RPi-Distro/python-gpiozero) to javascript creating simple interface to everyday GPIO components used with Raspberry Pi on node.js.

It's early days and a work in progress!

## Documentation
The API Documentation is available at the repos [github-pages](https://miketrebilcock.github.io/js-gpiozero/).

## Using
First of all we need to be running the latest version of nodejs (at least v6). The following command updates the Debian apt package repository to include the NodeSource packages

```bash
$curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
```
 
Now that we have added the NodeSource package repository, we can move on and install Node.js!

```bash
$ sudo apt install nodejs
```

We can then test and see what version of Node we are running

```bash
$ node -v
v7.3.0

```

## Contributing [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/miketrebilcock/js-gpiozero/issues) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

The project is very much a work in progress. Some far the output part of gpiozero has been followed through, completing a near direct translation from the original Python. This means the operating model hasn't really taken advantage of the nodejs programming paradigm.  That's next! It's mostly written in EMCAScript 5 with a splash of 6, the intention is to written everything in 6, then use babel to create an output that nodejs can use. The projects tab shows current work, planned and in progress, feel free to pick up a task and have a go.

The documentation is produced by [jsdoc](https://www.npmjs.com/package/jsdoc), enabling the api documentation to be written within the source code.  Upon committing to git, a pre-commit task will run, this runs all tests and updates the documentation. Checkout [Git Hooks](https://www.atlassian.com/git/tutorials/git-hooks/local-hooks) for more info.

To enable this the follow line needs to be executed:

```bash
$ln -s ../../pre-commit.sh .git/hooks/pre-commit
```

or you can simply run the following command:

```bash
$npm run docs
```

More info about contributing can be found [here](https://github.com/miketrebilcock/js-gpiozero/blob/master/CONTRIBUTING.md) 

[![NPM](https://nodei.co/npm/js-gpiozero.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/js-gpiozero/)

