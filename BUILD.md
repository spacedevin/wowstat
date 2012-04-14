Building WoW Stat
----------------------

For each OS you will need different tools, but all OS's have a makefile configured for them.

### OSX

#### Tools

- [Titanium Studio Desktop](http://www.appcelerator.com/products/titanium-studio/)
- [TI SDK 1.2.0.RC4](http://developer.appcelerator.com/blog/2011/09/introducing-titanium-desktop-sdk-1-2-release-candidate-4.html)
- [DMG Canvas](http://www.araelium.com/dmgcanvas/) (packaging)

#### Steps

1. In terminal run

	```shell
	make osx
	```
    
2. You will find your build in **build/osx/WoW Stat.app**
	<br>Your package will be found in **dist/osx/WoW Stat.dmg**


### Windows

#### Tools

- [Titanium Studio Desktop](http://www.appcelerator.com/products/titanium-studio/)
- [TI SDK 1.2.0.RC4](http://developer.appcelerator.com/blog/2011/09/introducing-titanium-desktop-sdk-1-2-release-candidate-4.html)
- [Make for windows](http://gnuwin32.sourceforge.net/packages/make.htm)
- [NSIS](http://nsis.sourceforge.net/Main_Page) (installer)

#### Steps

1. You will want to create a link or bat file for your make instalation in **C:\Windows\System32**. It would look something like this.
	<br>`"C:\Program Files (x86)\GnuWin32\bin\make.exe" %1 %2 %3 %4`

2. Open command and dir to your wowstat directory
3. Type

    ```shell
    make
    ~~~
	
4. You will find your build in **build/win32/WoW Stat.exe**
	<br>Your installer will be found in **dist/win32/WoW Stat Setup.exe**