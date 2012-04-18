@echo off

SET CURRENT_PATH=%1
SET PROJECT_ROOT=%2
SET APP_NAME=%3
SET TI_SDK_VERSION=%4

SET TI_DIR=C:\Users\mic.000\AppData\Roaming\Titanium\sdk\win32\%TI_SDK_VERSION%
SET PYTHON_PATH=C:\Users\mic.000\AppData\Local\Titanium Studio\plugins\com.appcelerator.titanium.python.win32_1.0.0.1313011725\python\python.exe

mkdir "%PROJECT_ROOT%\..\build\win32"
copy /Y %CURRENT_PATH%\components\tiapp-win32.xml %PROJECT_ROOT%\tiapp.xml
"%PYTHON_PATH%" "%TI_DIR%\tibuild.py" -t bundle -v -o win32 -a "%TI_DIR%" -d "%PROJECT_ROOT%\..\build\win32" "%PROJECT_ROOT%"
