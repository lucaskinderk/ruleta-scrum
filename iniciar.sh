#!/bin/bash

echo "========================================"
echo "  Ruleta Scrum - Iniciando servidor"
echo "========================================"
echo ""

# Verificar si Python está instalado
if command -v python3 &> /dev/null; then
    echo "Python 3 encontrado. Iniciando servidor..."
    echo ""
    echo "Abre tu navegador en: http://localhost:3000"
    echo ""
    echo "Presiona Ctrl+C para detener el servidor"
    echo ""
    
    # Abrir navegador (solo en macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000
    fi
    
    python3 -m http.server 3000
    
elif command -v python &> /dev/null; then
    echo "Python encontrado. Iniciando servidor..."
    echo ""
    echo "Abre tu navegador en: http://localhost:3000"
    echo ""
    echo "Presiona Ctrl+C para detener el servidor"
    echo ""
    
    # Abrir navegador (solo en macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000
    fi
    
    python -m http.server 3000
    
else
    echo "ERROR: No se encontró Python instalado."
    echo ""
    echo "Por favor instala Python desde: https://www.python.org/downloads/"
    echo "O usa una de las siguientes alternativas:"
    echo ""
    echo "1. Abre index.html directamente en tu navegador"
    echo "2. Instala Node.js y ejecuta: npx serve ."
    echo ""
    exit 1
fi

