@echo off
echo Starting Focus Mode Local Server...
start http://localhost:8000
py -m http.server 8000
pause
