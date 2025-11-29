@echo off
set ANDROID_HOME=C:\Users\capit\AppData\Local\Android\sdk
set PATH=%PATH%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools

echo Starting Pixel 9 emulator...
start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_9

echo Waiting for emulator to boot...
timeout /t 30 /nobreak

echo Checking for devices...
adb devices

echo.
echo Once you see the emulator device listed above, you can run:
echo flutter run
pause
