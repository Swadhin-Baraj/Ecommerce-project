@echo off
setlocal enabledelayedexpansion
REM Add PowerShell to PATH
set PATH=C:\Windows\System32\WindowsPowerShell\v1.0;%PATH%
REM Run mvnw
call mvnw.cmd %*
