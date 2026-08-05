# Ruleta Scrum

Aplicación web para gestionar turnos de habla en reuniones Scrum mediante una ruleta interactiva.

## 📦 Instalación y Uso

### Opción 1: Servidor Local Simple (Recomendado)

#### Windows:
1. Doble clic en `iniciar.bat`
2. Se abrirá automáticamente en tu navegador en `http://localhost:3000`

#### Mac/Linux:
1. Abre una terminal en esta carpeta
2. Ejecuta: `python3 -m http.server 3000`
3. Abre tu navegador en `http://localhost:3000`

### Opción 2: Sin Servidor (Limitado)

Puedes abrir `index.html` directamente en el navegador, pero algunas funciones pueden no funcionar correctamente debido a las políticas de seguridad del navegador (CORS).

### Opción 3: Servidor con Node.js

Si tienes Node.js instalado:
```bash
npx serve .
```

## 🌐 Desplegar en Internet

### GitHub Pages (Gratis)
**📖 Ver guía completa en [GITHUB_PAGES.md](GITHUB_PAGES.md)**

Resumen rápido:
1. Crea un repositorio público en GitHub
2. Sube todos los archivos de esta carpeta
3. Ve a Settings > Pages
4. Selecciona la rama `main` y la carpeta `/ (root)`
5. Tu app estará disponible en `https://tu-usuario.github.io/ruleta-scrum`

### Netlify (Gratis)
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra y suelta la carpeta completa
3. ¡Listo! Tendrás una URL pública

### Vercel (Gratis)
1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel` en esta carpeta
3. Sigue las instrucciones

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para los sonidos desde CDN)

## 🎯 Características

- ✅ Ruleta interactiva con animaciones
- ✅ Cronómetro automático por participante
- ✅ Alerta visual cuando se supera 1:30 min
- ✅ Resumen de tiempos al finalizar
- ✅ Sonidos de feedback
- ✅ Diseño responsive

## 📝 Notas

- Los sonidos se cargan desde CDN externo (requiere internet)
- Los datos se mantienen solo durante la sesión (no se guardan permanentemente)
- Compatible con todos los navegadores modernos

## 👤 Autor

**Lucas Kinderknech**

Desarrollado desde Argentina

