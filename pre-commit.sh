#!/usr/bin/env bash
# We only want to test the commited files
# so get rid of everything else
git stash -q --keep-index

npm test
RESULT=$?

documentation build gpiozero/** -f html -o docs
git add ./docs/**

## Restore the stashed files so the directory
## is as it was at the start
git stash pop -q

[ $RESULT -ne 0 ] && exit 1
exit 0