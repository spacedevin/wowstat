!include "MUI.nsh"
  Var STARTMENU_FOLDER
  Var MUI_TEMP

!ifndef VERSION
  !define VERSION "2.0.b04"
!endif


!define DOT_MAJOR "2"
!define DOT_MINOR "0"
!define DOT_MINOR_MINOR "b04"


Name "WoW Stat ${VERSION}"
OutFile "../dist/win32/WoW Stat Setup.exe"

InstallDirRegKey HKCU "WoW Stat" ""
InstallDir "$PROGRAMFILES\WoW Stat"

!include MUI2.nsh

Icon "${NSISDIR}\Contrib\Graphics\Icons\box-install.ico"
UninstallIcon "${NSISDIR}\Contrib\Graphics\Icons\box-uninstall.ico"


!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\win.bmp";
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"

!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\box-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\box-uninstall.ico"
!define MUI_HEADER "${NSISDIR}\Contrib\Graphics\Header\win.bmp"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\wowstat\LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY

!define MUI_STARTMENUPAGE_REGISTRY_ROOT "HKCU" 
!define MUI_STARTMENUPAGE_REGISTRY_KEY "WoW Stat" 
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "Start Menu Folder"
!insertmacro MUI_PAGE_STARTMENU Application $STARTMENU_FOLDER
!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$INSTDIR\WoW Stat.exe"
!define MUI_FINISHPAGE_RUN_CHECKED
!define MUI_FINISHPAGE_SHOWREADME "license.txt"
!define MUI_FINISHPAGE_SHOWREADME_CHECKED
!insertmacro MUI_PAGE_FINISH


!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"


Section "WoW Stat" SecDefault

  SetOutPath $INSTDIR

  File /r "..\build\win32\WoW Stat\*"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\WoW Stat" "UninstallString" "$INSTDIR\uninstall.exe"

  CreateDirectory "$SMPROGRAMS\$STARTMENU_FOLDER"
  CreateShortCut "$SMPROGRAMS\$STARTMENU_FOLDER\WoW Stat.lnk" "$INSTDIR\WoW Stat.exe"
  WriteINIStr "$SMPROGRAMS\$STARTMENU_FOLDER\WoW Stat Website.url" "InternetShortcut" "URL" "http://wow-stat.net/"
  CreateShortCut "$SMPROGRAMS\$STARTMENU_FOLDER\Uninstall.lnk" "$INSTDIR\Uninstall.exe"

  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Desktop Shortcut" SecDesktop
  CreateShortCut "$DESKTOP\WoW Stat.lnk" "$INSTDIR\WoW Stat.exe"
SectionEnd

;Language strings
LangString DESC_SecDefault ${LANG_ENGLISH} "WoW Stat Application"
LangString DESC_SecDesktop ${LANG_ENGLISH} "Create a shortcut on your desktop"

;Assign language strings to sections
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
!insertmacro MUI_DESCRIPTION_TEXT ${SecDefault} $(DESC_SecDefault)
!insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} $(DESC_SecDesktop)
!insertmacro MUI_FUNCTION_DESCRIPTION_END


Section "Uninstall"
  Delete "$INSTDIR\*"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\WoW Stat"
  RMDir $INSTDIR

 !insertmacro MUI_STARTMENU_GETFOLDER Application $MUI_TEMP
  Delete "$SMPROGRAMS\$MUI_TEMP\*"
  Delete "$DESKTOP\WoW Stat.lnk"

  StrCpy $MUI_TEMP "$SMPROGRAMS\$MUI_TEMP"
   startMenuDeleteLoop:
	ClearErrors
    RMDir $MUI_TEMP
    GetFullPathName $MUI_TEMP "$MUI_TEMP\.."
    IfErrors startMenuDeleteLoopDone
    StrCmp $MUI_TEMP $SMPROGRAMS startMenuDeleteLoopDone startMenuDeleteLoop
  startMenuDeleteLoopDone:
  DeleteRegKey /ifempty HKCU "WoW Stat"
SectionEnd