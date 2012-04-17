


SET PROJECT_NAME=WoW Stat
SET PROJECT_ID=la.devin.wowstat
SET APP_DEVICE=desktop
SET TI_SDK_VERSION=1.2.0.RC4
SET TI_DIR=C:\Users\mic.000\AppData\Roaming\Titanium\sdk\win32\1.2.0.RC4
SET PROJECT_ROOT=%1
SET PYTHON_PATH=C:\Users\mic.000\AppData\Local\Titanium Studio\plugins\com.appcelerator.titanium.python.win32_1.0.0.1313011725\python\python.exe

REM Z:\arzynik\Development\osx\wowstat

mkdir ..\build\win32
"%PYTHON_PATH%" "%TI_DIR%\tibuild.py" -v -o win32 -a "%TI_DIR%" -d "..\build\win32" "%PROJECT_ROOT%"
