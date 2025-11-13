@echo off
echo ========================================
echo   Ruleta Scrum - Iniciando servidor
echo ========================================
echo.
echo Buscando Python...

python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python encontrado. Iniciando servidor...
    echo.
    echo Abre tu navegador en: http://localhost:3000
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo.
    start http://localhost:3000
    python -m http.server 3000
    goto :end
)

python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python 3 encontrado. Iniciando servidor...
    echo.
    echo Abre tu navegador en: http://localhost:3000
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo.
    start http://localhost:3000
    python3 -m http.server 3000
    goto :end
)

echo.
echo ERROR: No se encontro Python instalado.
echo.
echo Por favor instala Python desde: https://www.python.org/downloads/
echo O usa una de las siguientes alternativas:
echo.
echo 1. Abre index.html directamente en tu navegador
echo 2. Instala Node.js y ejecuta: npx serve .
echo.
pause

:end

