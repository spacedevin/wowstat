!include "MUI.nsh"
  Var STARTMENU_FOLDER
  Var MUI_TEMP

!define DOT_MAJOR "2"
!define DOT_MINOR "0"
!define DOT_MINOR_MINOR "b06"
!define APP_NAME "WoW Stat"
!define APP_URL "http://wow-stat.net/"
!define PROJECT_NAME "wowstat"
!define PROJECT_ROOT "Z:\arzynik\Development\osx\wowstat\wowstat"
!define CURRENT_PATH "Z:\arzynik\Development\osx\wowstat"



!define VERSION "${DOT_MAJOR}.${DOT_MINOR}.${DOT_MINOR_MINOR}"

Name "${APP_NAME} ${VERSION}"
OutFile "../dist/win32/${APP_NAME} Setup ${VERSION}.exe"

InstallDirRegKey HKCU "${APP_NAME}" ""
InstallDir "$PROGRAMFILES\${APP_NAME}"

!include MUI2.nsh

Icon "${CURRENT_PATH}\assets\icon.ico"
UninstallIcon "${NSISDIR}\Contrib\Graphics\Icons\box-uninstall.ico"


!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\win.bmp";
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"

!define MUI_ICON "${CURRENT_PATH}\assets\icon.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\box-uninstall.ico"
!define MUI_HEADER "${NSISDIR}\Contrib\Graphics\Header\win.bmp"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${PROJECT_ROOT}\LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY

!define MUI_STARTMENUPAGE_REGISTRY_ROOT "HKCU" 
!define MUI_STARTMENUPAGE_REGISTRY_KEY "${APP_NAME}" 
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "Start Menu Folder"
!insertmacro MUI_PAGE_STARTMENU Application $STARTMENU_FOLDER
!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_NAME}.exe"
!define MUI_FINISHPAGE_RUN_CHECKED
!insertmacro MUI_PAGE_FINISH


!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"


Section "${APP_NAME}" SecDefault

  SetOutPath $INSTDIR

  File /r "..\build\win32\${APP_NAME}\*"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$INSTDIR\uninstall.exe"

  CreateDirectory "$SMPROGRAMS\$STARTMENU_FOLDER"
  CreateShortCut "$SMPROGRAMS\$STARTMENU_FOLDER\${APP_NAME}.lnk" "$INSTDIR\${APP_NAME}.exe"
  WriteINIStr "$SMPROGRAMS\$STARTMENU_FOLDER\${APP_NAME} Website.url" "InternetShortcut" "URL" "${APP_URL}"
  CreateShortCut "$SMPROGRAMS\$STARTMENU_FOLDER\Uninstall.lnk" "$INSTDIR\Uninstall.exe"

  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Desktop Shortcut" SecDesktop
  CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_NAME}.exe"
SectionEnd

;Language strings
LangString DESC_SecDefault ${LANG_ENGLISH} "${APP_NAME} Application"
LangString DESC_SecDesktop ${LANG_ENGLISH} "Create a shortcut on your desktop"

;Assign language strings to sections
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
!insertmacro MUI_DESCRIPTION_TEXT ${SecDefault} $(DESC_SecDefault)
!insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} $(DESC_SecDesktop)
!insertmacro MUI_FUNCTION_DESCRIPTION_END


Section "Uninstall"
  Delete "$INSTDIR\*"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
  RMDir $INSTDIR

 !insertmacro MUI_STARTMENU_GETFOLDER Application $MUI_TEMP
  Delete "$SMPROGRAMS\$MUI_TEMP\*"
  Delete "$DESKTOP\${APP_NAME}.lnk"

  StrCpy $MUI_TEMP "$SMPROGRAMS\$MUI_TEMP"
   startMenuDeleteLoop:
	ClearErrors
    RMDir $MUI_TEMP
    GetFullPathName $MUI_TEMP "$MUI_TEMP\.."
    IfErrors startMenuDeleteLoopDone
    StrCmp $MUI_TEMP $SMPROGRAMS startMenuDeleteLoopDone startMenuDeleteLoop
  startMenuDeleteLoopDone:
  DeleteRegKey /ifempty HKCU "${APP_NAME}"
SectionEnd