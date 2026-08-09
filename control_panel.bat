@echo off
setlocal enabledelayedexpansion
title ZED StOrE - Centre de Controle Global ERP & Boutique

set "LANDING_DIR=d:\PROJET BOUTIQUE"
set "ERP_DIR=d:\ERP-ZED-STORE"
set "LOGS_DIR=d:\ERP-ZED-STORE\logs"
set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"

if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

:MENU
cls
echo ===============================================================================
echo                ZED StOrE - CENTRE DE CONTROLE & GESTION GLOBAL
echo ===============================================================================
echo  ERP Backend Local : http://localhost:4000
echo  Landing Page Local: http://localhost:3000
echo  Boutique En Ligne : https://zedmooh.github.io/zed-store/
echo  Tunnel Cloudflare : https://intelligence-welfare-ceo-song.trycloudflare.com
echo ===============================================================================
echo.
echo  [1] Lancer TOUT (ERP + Tunnel Cloudflare + Landing Page Local)
echo  [2] Lancer / Redemarrer uniquement l'ERP Dashboard (Port 4000)
echo  [3] Lancer / Redemarrer uniquement le Tunnel Cloudflare
echo  [4] Lancer / Redemarrer la Landing Page Locale (Port 3000)
echo  [5] Arreter TOUS les Serveurs et Processus (Port 4000, 3000, Tunnel)
echo  [6] Mettre a jour et Publier sur GitHub Pages (Git Push automatique)
echo  [7] Diagnostics des Ports et Fichiers Logs (Debug)
echo  [8] Ouvrir les Liens & Dashboards dans le Navigateur
echo  [0] Quitter
echo.
echo ===============================================================================
set /p choice=Choisissez une option [0-8] puis appuyez sur Entree : 

if "%choice%"=="1" goto START_ALL
if "%choice%"=="2" goto START_ERP
if "%choice%"=="3" goto START_TUNNEL
if "%choice%"=="4" goto START_LANDING
if "%choice%"=="5" goto STOP_ALL
if "%choice%"=="6" goto GIT_PUBLISH
if "%choice%"=="7" goto DIAGNOSTICS
if "%choice%"=="8" goto OPEN_LINKS
if "%choice%"=="0" goto EXIT_SCRIPT
goto MENU

:START_ALL
cls
echo ===============================================================================
echo LANCEMENT GLOBAL DE L'ECOSYSTEME ZED StOrE...
echo ===============================================================================
echo.
echo [1/3] Arret des processus precedents s'ils tournent...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do ( taskkill /f /pid %%a >nul 2>&1 )
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do ( taskkill /f /pid %%a >nul 2>&1 )
taskkill /f /im cloudflared.exe >nul 2>&1

timeout /t 1 /nobreak >nul

echo [2/3] Démarrage du Serveur ERP (Port 4000)...
start "ZED StOrE - ERP (4000)" /D "%ERP_DIR%" cmd /c "node server.js > "%LOGS_DIR%\erp.log" 2>&1"

echo [3/3] Lancement du Tunnel Cloudflare (HTTP -> HTTPS)...
start "ZED StOrE - Cloudflare Tunnel" /D "%ERP_DIR%" cmd /c "cloudflared tunnel --url http://localhost:4000 > "%LOGS_DIR%\tunnel.log" 2>&1 || npx cloudflared tunnel --url http://localhost:4000 > "%LOGS_DIR%\tunnel.log" 2>&1"

echo.
echo [OK] Ecosysteme demarre avec succes!
echo Ouverture des dashboards...
timeout /t 3 /nobreak >nul
start http://localhost:4000
start https://zedmooh.github.io/zed-store/
echo.
pause
goto MENU

:START_ERP
cls
echo ===============================================================================
echo REDEMARRAGE DU SERVEUR ERP (Port 4000)...
echo ===============================================================================
echo.
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do ( taskkill /f /pid %%a >nul 2>&1 )
timeout /t 1 /nobreak >nul
start "ZED StOrE - ERP (4000)" /D "%ERP_DIR%" cmd /c "node server.js > "%LOGS_DIR%\erp.log" 2>&1"
echo [OK] ERP lance sur http://localhost:4000
echo.
pause
goto MENU

:START_TUNNEL
cls
echo ===============================================================================
echo LANCEMENT DU TUNNEL CLOUDFLARE...
echo ===============================================================================
echo.
taskkill /f /im cloudflared.exe >nul 2>&1
timeout /t 1 /nobreak >nul
start "ZED StOrE - Cloudflare Tunnel" /D "%ERP_DIR%" cmd /c "cloudflared tunnel --url http://localhost:4000 || npx cloudflared tunnel --url http://localhost:4000"
echo [OK] Tunnel Cloudflare lance.
echo.
pause
goto MENU

:START_LANDING
cls
echo ===============================================================================
echo LANCEMENT DE LA LANDING PAGE LOCAL (Port 3000)...
echo ===============================================================================
echo.
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do ( taskkill /f /pid %%a >nul 2>&1 )
timeout /t 1 /nobreak >nul
start "ZED StOrE - Landing Page (3000)" /D "%LANDING_DIR%" cmd /c "npm run dev > "%LOGS_DIR%\landing.log" 2>&1"
echo [OK] Landing Page locale lancee sur http://localhost:3000
start http://localhost:3000
echo.
pause
goto MENU

:STOP_ALL
cls
echo ===============================================================================
echo ARRET DE TOUS LES SERVICES & PROCESSUS
echo ===============================================================================
echo.
echo Arrêt de l'ERP (Port 4000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do ( taskkill /f /pid %%a >nul 2>&1 )

echo Arrêt de la Landing Page (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do ( taskkill /f /pid %%a >nul 2>&1 )

echo Arrêt du Tunnel Cloudflare...
taskkill /f /im cloudflared.exe >nul 2>&1

echo.
echo [OK] Tous les serveurs et tunnels sont arretes!
echo.
pause
goto MENU

:GIT_PUBLISH
cls
echo ===============================================================================
echo PUBLICATION ET MISE A JOUR GITHUB PAGES
echo ===============================================================================
echo.
if not exist "%GIT_CMD%" (
    echo [ERREUR] Git non trouve a l'emplacement %GIT_CMD%
    pause
    goto MENU
)

set /p commit_msg=Entrez le message de mise a jour (ou Entree pour message par defaut) : 
if "%commit_msg%"=="" set "commit_msg=Mise a jour automatique boutique ZED StOrE"

echo.
echo Execution de Git Add, Commit et Push...
"%GIT_CMD%" -C "%LANDING_DIR%" add .
"%GIT_CMD%" -C "%LANDING_DIR%" commit -m "%commit_msg%"
"%GIT_CMD%" -C "%LANDING_DIR%" push origin main

echo.
echo [OK] Code pousse sur GitHub Pages avec succes!
echo Votre boutique sera mise a jour dans 1 minute sur:
echo https://zedmooh.github.io/zed-store/
echo.
pause
goto MENU

:DIAGNOSTICS
cls
echo ===============================================================================
echo DIAGNOSTICS & LOGS SYSTEME
echo ===============================================================================
echo.
echo [1] Voir l'état des ports (Port 4000 ERP / Port 3000 Landing)
echo [2] Voir les logs ERP (erp.log)
echo [3] Voir les logs du Tunnel Cloudflare (tunnel.log)
echo [4] Vider tous les fichiers de logs
echo [0] Retour au menu principal
echo.
set /p diag_choice=Choisissez une option [0-4] : 

if "%diag_choice%"=="1" (
    cls
    echo === ETAT DES PORTS ===
    echo Port 4000 (ERP Backend) :
    netstat -aon | findstr :4000
    echo.
    echo Port 3000 (Landing Page Local) :
    netstat -aon | findstr :3000
    echo.
    pause
    goto DIAGNOSTICS
)

if "%diag_choice%"=="2" (
    cls
    echo === LOGS ERP (erp.log) ===
    if exist "%LOGS_DIR%\erp.log" ( type "%LOGS_DIR%\erp.log" ) else ( echo Aucun log erp trouve. )
    echo.
    pause
    goto DIAGNOSTICS
)

if "%diag_choice%"=="3" (
    cls
    echo === LOGS TUNNEL CLOUDFLARE (tunnel.log) ===
    if exist "%LOGS_DIR%\tunnel.log" ( type "%LOGS_DIR%\tunnel.log" ) else ( echo Aucun log tunnel trouve. )
    echo.
    pause
    goto DIAGNOSTICS
)

if "%diag_choice%"=="4" (
    cls
    if exist "%LOGS_DIR%\erp.log" break > "%LOGS_DIR%\erp.log"
    if exist "%LOGS_DIR%\tunnel.log" break > "%LOGS_DIR%\tunnel.log"
    if exist "%LOGS_DIR%\landing.log" break > "%LOGS_DIR%\landing.log"
    echo [OK] Tous les logs ont ete réinitialisés.
    echo.
    pause
    goto DIAGNOSTICS
)

goto MENU

:OPEN_LINKS
cls
echo Ouverture des URLs dans le navigateur...
start http://localhost:4000
start https://zedmooh.github.io/zed-store/
timeout /t 2 /nobreak >nul
goto MENU

:EXIT_SCRIPT
exit
