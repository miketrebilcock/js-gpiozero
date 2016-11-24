#js.gpiozero

[![Build Tests](https://travis-ci.org/i-am-digital/js-gpiozero.svg?branch=master)](https://travis-ci.org/i-am-digital/js-gpiozero) [![Code Coverage](https://codecov.io/gh/i-am-digital/js-gpiozero/branch/master/graph/badge.svg)](https://codecov.io/gh/i-am-digital/js-gpiozero) [![npm version](https://badge.fury.io/js/js-gpiozero.svg)](https://badge.fury.io/js/js-gpiozero)   

A port of the fanastic [python gpiozero](https://github.com/RPi-Distro/python-gpiozero) to javascript creating simple interface to everyday GPIO components used with Raspberry Pi on node.js.

It's early days and a work in progress!

##Using
First of all we need to be running the latest version of nodejs. The following command updates the Debian apt package repository to include the NodeSource packages

''''bash
$curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
''''
 
Now that we have added the NodeSource package repository, we can move on and install Node.js!

''''bash
$ sudo apt install nodejs
''''

We can then test and see what version of Node we are running

''''bash
$ node -v
v7.2.0

''''


