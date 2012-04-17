PROJECT_NAME="wowstat"
APP_NAME="WoW Stat"

UNAME := $(shell uname)

# OSX
ifeq ($(UNAME), Darwin)

CURRENT_PATH=$(shell pwd)
PROJECT_ROOT=${CURRENT_PATH}/${PROJECT_NAME}

all: osx osxpackage ios android

package: osxpackage

osx:
	@echo "Building for OSX..."
	@rm -Rf ${PROJECT_ROOT}/dist
	@rm -Rf ${CURRENT_PATH}/build/osx/
	@rm -Rf ${CURRENT_PATH}/dist/osx/
	@mkdir -p ${CURRENT_PATH}/build/osx/
	@mkdir -p ${CURRENT_PATH}/dist/osx/
	@CURRENT_PATH=${CURRENT_PATH} PROJECT_NAME=${PROJECT_NAME} PROJECT_ROOT=${PROJECT_ROOT} DEVICE_TYPE=osx bash ${CURRENT_PATH}/build/osx.sh
	@rm -Rf ${CURRENT_PATH}build/osx/${APP_NAME}.app/Contents/Resources/English.lproj/MainMenu.nib \
	@cp -R ${CURRENT_PATH}assets/MainMenu.nib ${CURRENT_PATH}build/osx/${APP_NAME}.app/Contents/Resources/English.lproj/MainMenu.nib 

osxpackage:
	@echo "Packaging for OSX..."
	@dmgcanvas ${CURRENT_PATH}/assets/dmg-canvas.dmgCanvas ${CURRENT_PATH}/dist/osx/${APP_NAME}.dmg -v WoW\ Stat
	
run:
	@open ${CURRENT_PATH}build/osx/${APP_NAME}.app
	

ios:
	#@echo "Building for iOS..."

android:
	#@echo "Building for Android..."
	
else








CURRENT_PATH=$(shell cd)
PROJECT_ROOT=${CURRENT_PATH}\wowstat

all: win32 win32package

package: win32package

win32:
	@${CURRENT_PATH}/build/win32.bat ${PROJECT_ROOT}
	
win32package:
	
run:
	@${PROJECT_ROOT}build/win32/${APP_NAME}/${APP_NAME}.exe


endif
