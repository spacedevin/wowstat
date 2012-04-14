PROJECT_ROOT=$(shell pwd)
PROJECT_NAME="wowstat"
APP_NAME="WoW Stat"

all: osx

osx:
	@echo "Building with Titanium..."
	@rm -Rf ${PROJECT_ROOT}/build/osx/
	@rm -Rf ${PROJECT_ROOT}/dist/osx/
	@mkdir -p ${PROJECT_ROOT}/build/osx/
	@mkdir -p ${PROJECT_ROOT}/dist/osx/
	@PROJECT_NAME=${PROJECT_NAME} PROJECT_ROOT=${PROJECT_ROOT} DEVICE_TYPE=osx bash ${PROJECT_ROOT}/build/osx.sh
	@mv ${PROJECT_ROOT}/build/osx/${APP_NAME}.dmg ${PROJECT_ROOT}/dist/osx/${APP_NAME}.dmg
