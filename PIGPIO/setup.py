#!/usr/bin/env python

from distutils.core import setup

setup(name='pigpio',
      version='1.35',
      author='joan',
      author_email='joan@abyz.me.uk',
      maintainer='joan',
      maintainer_email='joan@abyz.me.uk',
      url='http://abyz.me.uk/rpi/pigpio/python.html/',
      description='Raspberry gpio module',
      long_description='Raspberry Python module to access the pigpio daemon',
      download_url='http://abyz.me.uk/rpi/pigpio/pigpio.zip',
      license='unlicense.org',
      py_modules=['pigpio']
     )
