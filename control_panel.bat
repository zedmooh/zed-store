@echo off
setlocal enabledelayedexpansion
title ZED StOrE - Centre de Controle et Gestion des Serveurs

set "LANDING_DIR=d:\PROJET BOUTIQUE"
set "ERP_DIR=d:\ERP-ZED-STORE"
set "LOGS_DIR=d:\PROJET BOUTIQUE\logs"

if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

:MENU
cls
echo ===============================================================================
echo                ZED StOrE - CENTRE DE CONTROLE SERVEURS
echo ===============================================================================
echo  Landing Page : http://localhost:3000
echo  ERP Dashboard: http://localhost:4000
echo ===============================================================================
echo.
echo  [1] Demarrer les Serveurs (Landing Page + ERP)
echo  [2] Arreter les Serveurs (Port 3000 et Port 4000)
echo  [3] Redemarrer les Serveurs
echo  [4] Voir les Logs et Diagnostic (Debug)
echo  [5] Ouvrir les sites dans le Navigateur
echo  [0] Quitter
echo.
echo ===============================================================================
set /p choice=Choisissez une option [0-5] puis appuyez sur Entree : 

if "%choice%"=="1" goto START_SERVERS
if "%choice%"=="2" goto STOP_SERVERS
if "%choice%"=="3" goto RESTART_SERVERS
if "%choice%"=="4" goto VIEW_LOGS
if "%choice%"=="5" goto OPEN_BROWSER
if "%choice%"=="0" goto EXIT_SCRIPT
goto MENU

:START_SERVERS
cls
echo ===============================================================================
echo DEMARRAGE DES SERVEURS...
echo ===============================================================================
echo.
echo [1/2] Lancement de la Landing Page (Port 3000)...
start "ZED StOrE - Landing Page (3000)" /D "%LANDING_DIR%" cmd /c "npm run dev > "%LOGS_DIR%\landing.log" 2>&1"

echo [2/2] Lancement de l'ERP Dashboard (Port 4000)...
start "ZED StOrE - ERP Dashboard (4000)" /D "%ERP_DIR%" cmd /c "node server.js > "%LOGS_DIR%\erp.log" 2>&1"

timeout /t 3 /nobreak >nul
echo.
echo [OK] Serveurs demarres avec succes!
echo.
echo Ouverture du navigateur...
timeout /t 2 /nobreak >nul
start http://localhost:3000
start http://localhost:4000
echo.
pause
goto MENU

:STOP_SERVERS
cls
echo ===============================================================================
echo ARRET DES SERVEURS...
echo ===============================================================================
echo.
echo Fermeture du serveur Landing Page (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Fermeture du serveur ERP (Port 4000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [OK] Tous les serveurs ont ete arretes!
echo.
pause
goto MENU

:RESTART_SERVERS
cls
echo ===============================================================================
echo REDEMARRAGE DES SERVEURS...
echo ===============================================================================
echo.
echo Arret des serveurs en cours...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo Lancement de la Landing Page (Port 3000)...
start "ZED StOrE - Landing Page (3000)" /D "%LANDING_DIR%" cmd /c "npm run dev > "%LOGS_DIR%\landing.log" 2>&1"

echo Lancement du Serveur ERP (Port 4000)...
start "ZED StOrE - ERP Dashboard (4000)" /D "%ERP_DIR%" cmd /c "node server.js > "%LOGS_DIR%\erp.log" 2>&1"

echo.
echo [OK] Redemarrage termine avec succes!
echo.
pause
goto MENU

:VIEW_LOGS
cls
echo ===============================================================================
echo LOGS ET DIAGNOSTIC DES ERREURS
echo ===============================================================================
echo.
echo [1] Voir les logs Landing Page (landing.log)
echo [2] Voir les logs ERP (erp.log)
echo [3] Verifier l'etat des ports (netstat)
echo [4] Vider les fichiers de logs
echo [0] Retour au menu principal
echo.
set /p log_choice=Choisissez une option [0-4] : 

if "%log_choice%"=="1" (
    cls
    echo === LOGS LANDING PAGE (landing.log) ===
    echo.
    if exist "%LOGS_DIR%\landing.log" (
        type "%LOGS_DIR%\landing.log"
    ) else (
        echo Aucun fichier de log trouve pour la Landing Page.
    )
    echo.
    pause
    goto VIEW_LOGS
)

if "%log_choice%"=="2" (
    cls
    echo === LOGS ERP (erp.log) ===
    echo.
    if exist "%LOGS_DIR%\erp.log" (
        type "%LOGS_DIR%\erp.log"
    ) else (
        echo Aucun fichier de log trouve pour l'ERP.
    )
    echo.
    pause
    goto VIEW_LOGS
)

if "%log_choice%"=="3" (
    cls
    echo === ETAT DES PORTS EN ECOUTE ===
    echo.
    echo Port 3000 (Landing Page) :
    netstat -aon | findstr :3000
    echo.
    echo Port 4000 (ERP Dashboard) :
    netstat -aon | findstr :4000
    echo.
    pause
    goto VIEW_LOGS
)

if "%log_choice%"=="4" (
    cls
    if exist "%LOGS_DIR%\landing.log" break > "%LOGS_DIR%\landing.log"
    if exist "%LOGS_DIR%\erp.log" break > "%LOGS_DIR%\erp.log"
    echo [OK] Fichiers de logs reinitialises!
    echo.
    pause
    goto VIEW_LOGS
)

goto MENU

:OPEN_BROWSER
cls
echo Ouverture des pages dans le navigateur...
start http://localhost:3000
start http://localhost:4000
timeout /t 2 /nobreak >nul
goto MENU

:EXIT_SCRIPT
exit
