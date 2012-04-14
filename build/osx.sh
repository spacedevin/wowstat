#!/bin/bash

PROJECT_NAME=${PROJECT_NAME}
PROJECT_ROOT=${PROJECT_ROOT:-../}
APP_DEVICE="desktop"
TI_SDK_VERSION="1.2.0.RC4"
TI_DIR="/Library/Application\ Support/Titanium"
TI_OSX_DIR="${TI_DIR}/sdk/osx/${TI_SDK_VERSION}"
TI_BUILD="${TI_OSX_DIR}/tibuild.py"

if [ "PROJECT_NAME" == "" ]; then
	echo "[ERROR] Please inform PROJECT_NAME."
	exit 1
fi

# Get APP parameters from current tiapp.xml
APP_ID=`cat ${PROJECT_NAME}/tiapp.xml | grep "<id>" | sed -e "s/<\/*id>//g"`
APP_NAME=`cat ${PROJECT_NAME}/tiapp.xml | grep "<name>" | sed -e "s/<\/*name>//g"`

if [ "APP_ID" == "" ] || [ "APP_NAME" == "" ]; then
	echo "[ERROR] Could not obtain APP parameters from tiapp.xml file (does the file exist?)."
	exit 1
fi

bash -c "${TI_BUILD} -n -d ${PROJECT_ROOT}/build/osx/ -p ./ ${PROJECT_ROOT}/${PROJECT_NAME}/"
#  ${TI_SDK_VERSION} ${APP_ID} ${APP_NAME} ${APP_DEVICE}