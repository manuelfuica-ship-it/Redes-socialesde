# ✨ Generador de Prompts Profesionales

Una aplicación web gratuita que transforma tus ideas en prompts profesionales y optimizados. Construida con HTML, CSS y JavaScript vanilla, alojada en GitHub Pages.

## 🎯 Características

- ✅ **Generación Inteligente**: Transforma ideas breves en prompts detallados
- ✅ **Múltiples Tonos**: Profesional, casual, técnico, creativo, académico
- ✅ **Historial Local**: Guarda y recupera tus prompts generados
- ✅ **Copiar y Exportar**: Copia al portapapeles o descarga como archivo
- ✅ **100% Gratuito**: Usa la API gratis de Groq
- ✅ **Sin Backend**: Funciona completamente en el navegador
- ✅ **Responsivo**: Optimizado para móvil y escritorio

## 🚀 Quick Start

### 1. Obtener API Key (Gratis)

1. Ve a [https://console.groq.com](https://console.groq.com)
2. Crea una cuenta gratuita (5 minutos)
3. Genera una API Key
4. Copia la clave

### 2. Usar la App

1. Abre [https://tu-usuario.github.io/Redes-socialesde/](https://tu-usuario.github.io/Redes-socialesde/)
2. Pega tu API Key en la sección "Configuración"
3. Escribe tu idea
4. Selecciona el tono deseado
5. Haz clic en "Generar Prompt"
6. ¡Copia, exporta o guarda el resultado!

## 📁 Estructura del Proyecto

```
/
├── index.html          # HTML principal
├── css/
│   └── style.css       # Estilos
├── js/
│   └── app.js          # Lógica de la aplicación
└── README.md           # Este archivo
```

## 🔧 Cómo Desplegar en GitHub Pages

### Opción 1: Automático (Recomendado)

1. Sube los cambios a la rama principal:
   ```bash
   git add .
   git commit -m "feat: agregar generador de prompts"
   git push origin main
   ```

2. Ve a **Settings → Pages** en tu repositorio
3. Selecciona **Branch: main** como fuente
4. GitHub desplegará automáticamente en `https://tu-usuario.github.io/Redes-socialesde/`

### Opción 2: Rama `gh-pages`

1. Crea la rama `gh-pages`:
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   # Copia solo los archivos necesarios
   git add index.html css/ js/
   git commit -m "deploy: app en gh-pages"
   git push origin gh-pages
   ```

2. Ve a **Settings → Pages** y selecciona `gh-pages` como fuente

## 🔒 Seguridad

- Tu API Key se guarda **solo en tu navegador** (localStorage)
- No se envía a servidores externos (excepto a Groq)
- Usa HTTPS para todas las comunicaciones
- Reemplaza la clave si crees que fue comprometida

## 💡 Ejemplos de Uso

### Ejemplo 1: Prompt para copywriting
**Idea:** "Crear un anuncio para vender software de productividad"
**Tono:** Creativo

Resultado: Un prompt optimizado para generar anuncios persuasivos

### Ejemplo 2: Prompt técnico
**Idea:** "Explicar cómo funciona JWT en seguridad web"
**Tono:** Técnico

Resultado: Un prompt para obtener explicaciones técnicas detalladas

## 🤖 API Utilizada

- **Proveedor:** [Groq](https://groq.com)
- **Modelo:** Mixtral 8x7B (rápido y gratuito)
- **Límites:** Gratuito con límites generosos para desarrollo

## 📱 Compatibilidad

- ✅ Chrome/Edge (última versión)
- ✅ Firefox (última versión)
- ✅ Safari (última versión)
- ✅ Mobile (iOS/Android)

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o PR con tus ideas.

## 📄 Licencia

MIT - Libre para usar y modificar

## 🆘 Solución de Problemas

### "Error: Invalid API Key"
- Verifica que copiaste la clave correctamente
- Crea una nueva clave en https://console.groq.com
- Asegúrate de tener créditos disponibles

### "Error: Rate limit exceeded"
- Espera algunos minutos
- La API gratuita de Groq tiene límites de velocidad

### No se guarda el historial
- Verifica que el navegador permite localStorage
- Abre la consola (F12) para ver errores

---

Hecho con ❤️ | Powered by Groq API
