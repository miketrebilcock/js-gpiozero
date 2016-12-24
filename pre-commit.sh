#!/usr/bin/env bash
npm test
documentation build gpiozero/** -f html -o docs
git add ./docs/**