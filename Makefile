test:
	tman
	bin/tman
	bin/tman test/cli/gc -gc
	bin/tman test/cli/gc --expose-gc
	bin/tman test/cli/global --globals suite,it,before,after
	bin/tman --no-timeout test/cli/no-timeout
	bin/tman -r test/cli/require-a test/cli/require-b
	!(bin/tman -t 650 test/cli/timeout)
	bin/tman test/cli/test-in-src
	node test/cli/test-in-src --test
	TEST=* node test/cli/test-in-src
	bin/tman -r coffee-script/register test/coffee
	bin/tman -r ts-node/register test/ts
	open test/browser/index-error.html
	sleep 2s
	open test/browser/index.html
	sleep 2s
	open test/browser/index-async.html -a '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'

.PHONY: test
