# catch any make calls and send them back to the php script like it should be

UNAME := $(shell uname)

# OSX
ifeq ($(UNAME), Darwin)

all:
	@./make.php

else

# WINDOWS
CURRENT_PATH=$(shell cd)

all:
	@php make.php

endif
