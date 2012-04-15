@echo off
SET PROJECT_NAME="Example Project"
SET PROJECT_ID="com.example.automatedbuild"

SET APP_DEVICE="desktop"
SET TI_SDK_VERSION="1.2.0.RC4"
TI_DIR="/Library/Application\ Support/Titanium"
TI_OSX_DIR="${TI_DIR}/sdk/osx/${TI_SDK_VERSION}"
TI_BUILD="${TI_OSX_DIR}/tibuild.py"


SET TITANIUM_SDK=C:\Users\All Users\Titanium\mobilesdk\win32\1.6.0
SET ANDROID_SDK=C:\android-sdk-windows
"%TITANIUM_SDK%\android\builder.py" "build" %PROJECT_NAME% "%ANDROID_SDK%" . %PROJECT_ID%