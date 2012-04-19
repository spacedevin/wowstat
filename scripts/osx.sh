#!/bin/bash

PROJECT_NAME=${PROJECT_NAME}
CURRENT_PATH=${CURRENT_PATH}
# PROJECT_ROOT=${PROJECT_ROOT:-../}
PROJECT_ROOT=${PROJECT_ROOT}
TI_SDK_VERSION=${TI_SDK_VERSION}

TI_DIR="/Library/Application\ Support/Titanium"
TI_OSX_DIR="${TI_DIR}/sdk/osx/${TI_SDK_VERSION}"
TI_BUILD="${TI_OSX_DIR}/tibuild.py"

# Get APP parameters from current tiapp.xml
APP_ID=`cat ${PROJECT_NAME}/tiapp.xml | grep "<id>" | sed -e "s/<\/*id>//g"`
APP_NAME=`cat ${PROJECT_NAME}/tiapp.xml | grep "<name>" | sed -e "s/<\/*name>//g"`

if [ "APP_ID" == "" ] || [ "APP_NAME" == "" ]; then
	echo "[ERROR] Could not obtain APP parameters from tiapp.xml file (does the file exist?)."
	exit 1
fi


# clean build and disk dirs
rm -Rf ${CURRENT_PATH}/build/osx/
mkdir -p ${CURRENT_PATH}/build/osx/
cp -f ${CURRENT_PATH}/components/tiapp-osx.xml ${PROJECT_ROOT}/tiapp.xml

bash -c "${TI_BUILD} -t bundle -n -d ${CURRENT_PATH}/build/osx/ ${PROJECT_ROOT}"

rm -Rf ${CURRENT_PATH}build/osx/${APP_NAME}.app/Contents/Resources/English.lproj/MainMenu.nib \
cp -R ${CURRENT_PATH}assets/MainMenu.nib ${CURRENT_PATH}build/osx/${APP_NAME}.app/Contents/Resources/English.lproj/MainMenu.nib 
