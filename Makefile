PROJECT_ROOT=$(shell pwd)
PROJECT_NAME="wowstat"
APP_NAME="WoW Stat"
UNAME := $(shell uname)

ifeq ($(UNAME), Win)

all: win32

win32:
	
run:
	@${PROJECT_ROOT}build/win32/${APP_NAME}/${APP_NAME}.exe

endif

# OSX
ifeq ($(UNAME), Darwin)

all: osx ios android

osx:
	@echo "Building for OSX..."
	@rm -Rf ${PROJECT_ROOT}/${PROJECT_NAME}/dist
	@rm -Rf ${PROJECT_ROOT}/build/osx/
	@rm -Rf ${PROJECT_ROOT}/dist/osx/
	@mkdir -p ${PROJECT_ROOT}/build/osx/
	@mkdir -p ${PROJECT_ROOT}/dist/osx/
	@PROJECT_NAME=${PROJECT_NAME} PROJECT_ROOT=${PROJECT_ROOT} DEVICE_TYPE=osx bash ${PROJECT_ROOT}/build/osx.sh
	@rm -Rf ${PROJECT_ROOT}build/osx/${APP_NAME}.app/Contents/Resources/English.lproj/MainMenu.nib \
	@cp -R ${PROJECT_ROOT}assets/MainMenu.nib ${PROJECT_ROOT}build/osx/${APP_NAME}.app/Contents/Resources/English.lproj/MainMenu.nib 
	@dmgcanvas ${PROJECT_ROOT}/assets/dmg-canvas.dmgCanvas ${PROJECT_ROOT}/dist/osx/${APP_NAME}.dmg -v WoW\ Stat
	
run:
	@open ${PROJECT_ROOT}build/osx/${APP_NAME}.app

endif

ios:
	@echo "Building for iOS..."

android:
	@echo "Building for Android..."
	