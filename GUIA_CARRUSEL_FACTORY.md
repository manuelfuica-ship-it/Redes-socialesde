# 🎠 Guía de Carrusel Factory

**Carrusel Factory** genera carruseles de Instagram automáticamente. Tú das la idea → Claude escribe el guion → se renderiza a PNG listo para subir.

## ¿Qué necesito?

✅ **Instalado** 
- Python 3.11+
- Dependencias (Playwright, Jinja2, fal-client)
- Chromium para renderizar
- Virtual environment en `.venv/`

## Primeros pasos

### 1. Activa el entorno virtual

```bash
cd carrusel-factory
source .venv/bin/activate  # En Linux/Mac
# O si estás en Windows:
# .venv\Scripts\activate
```

### 2. La primera vez: configura tu marca

Cuando uses la herramienta por primera vez, te pediré:
- **Nombre de marca** (ej: "Mi Marca")
- **Handle** (ej: "@miusuario")
- **Color principal** (ej: "#FF5733")
- **Estilo preferido** (dark-bold, minimal-claro, etc.)

Esto crea `config.json` (no lo subes a git, está en `.gitignore`).

## Cómo usar

### Opción A: Pídele a Claude (recomendado)

Simplemente escribe en el chat:
```
Hazme un carrusel sobre los 3 errores que matan tu alcance en Instagram, 
estilo dark-bold, CTA de lead magnet con la palabra "GUÍA"
```

Claude hará:
1. ✍️ Escribe el guion (titulo + texto por slide)
2. 🔍 Te muestra el texto para aprobarlo
3. 🎨 Genera las imágenes PNG
4. 📁 Las guarda en `carrusel-factory/output/<tema>/`

### Opción B: Comandos manuales

Si necesitas regenerar o revisar:

```bash
cd carrusel-factory

# Ver estilos disponibles
run.bat estilos  # Windows
./scripts/estilos.py  # Linux/Mac

# Generar imágenes del carrusel actual
run.bat generar
./scripts/generar.py

# Ver qué slides están hechas
run.bat estado
./scripts/estado.py
```

## Estilos disponibles (sin créditos de IA)

| Estilo | Descripción | Uso |
|--------|-------------|-----|
| **minimal-claro** | Fondo blanco limpio | Educativo, profesional |
| **dark-bold** | Fondo oscuro, títulos grandes | Engagement, viralidad |
| **editorial-serif** | Serif elegante | Contenido premium |

## Estilos con IA (opcional, requiere créditos)

- **ilustrado-ia**: Fondo generado con IA + texto superpuesto

### Para usar IA: necesitas API Key de fal.ai

1. Regístrate en https://fal.ai/dashboard/keys
2. Copia tu API key
3. Yo la guardo en `config.json` (no se ve en git)
4. Los fondos se cachean → no repites costos

Gratis: `pollinations-flux` (pruebas rápidas)

## Estructura del proyecto

```
carrusel-factory/
├── trabajo/
│   └── carrusel.json          # El guion del carrusel actual
├── estilos/
│   ├── minimal-claro/         # Templates CSS
│   ├── dark-bold/
│   ├── editorial-serif/
│   └── _PLANTILLA-ESTILO/     # Copia esta para crear tu estilo
├── output/
│   └── <tema>/
│       ├── slide-01.png       # Imágenes generadas
│       ├── slide-02.png
│       └── _fondos/           # Fondos IA cacheados
├── marca/                     # Logos y assets
├── cta/                       # Configuración de CTAs
└── scripts/                   # Python: generar, estilos, estado
```

## CTAs (Call-To-Action)

Elige uno cuando crees el carrusel:
- `seguir` → "Sígueme"
- `guardar` → "Guarda este carrusel"
- `lead-magnet` → "Comenta PALABRA para recibir RECURSO"
- `comunidad` → "Únete a mi comunidad"
- `web` → "Visita mi web"
- `comentar-palabra` → "Comenta PALABRA"

## Flujo completo (ejemplo)

**Tú**: "Quiero un carrusel sobre productividad, estilo minimal-claro, CTA de lead magnet"

**Claude**: 
1. Me pregunta tu marca (si no existe config.json)
2. Escribe el guion → slide a slide
3. Te muestra el texto (puedes pedir cambios)
4. Genera los PNGs
5. Te muestra dónde están: `carrusel-factory/output/productividad/`

**Resultado**: 7-9 imágenes listas para subir a Instagram.

## Troubleshooting

### Error: "No se encuentra Chromium"
Chromium está en `/opt/pw-browsers`. Si falla, intenta:
```bash
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
```

### Error: "config.json no encontrado"
Es normal la primera vez. Claude te pedirá tus datos y lo creará.

### Las imágenes salen mal
- Revisa el estilo: ¿existe en `carrulos/estilos/`?
- Prueba con otro estilo para descartar
- Si usas IA, verifica que la clave de fal.ai sea válida

### Quiero un estilo personalizado
Copia `carrusel-factory/estilos/_PLANTILLA-ESTILO/`, nómbralo y edita el CSS.
Aparecerá automáticamente en `run.bat estilos`.

---

**¿Listo para crear?** 🚀

Simplemente cuéntame qué carrusel quieres y el resto lo hacemos juntos.
