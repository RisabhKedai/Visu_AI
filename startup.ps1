@echo off
set PYTHON_DIR=./AI_Server
set NODE_DIR=./ChromeExtensionNode
set REACT_DIR=./threed-render


echo Starting all servers...
echo.

echo [1/3] Starting Python server...
cd "%PYTHON_DIR%"
start "Python API" cmd /k "python3 app.py"

echo Waiting 1 second...
timeout /t 1 /nobreak >nul

echo [2/3] Starting Node app...
cd "%NODE_DIR%"
start "Node App" cmd /k "npm i && npm start"

echo [3/3] Starting React App...
cd "%REACT_DIR%"
start "React App" cmd /k "npm i && npm start"

echo All servers started!
pause
