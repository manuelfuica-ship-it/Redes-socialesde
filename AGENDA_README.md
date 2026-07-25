# 📱 Mi Agenda - Gestor de Contactos

Una aplicación web progresiva (PWA) para gestionar tu agenda de contactos y eliminar duplicados automáticamente.

## ✨ Características

### 📋 Gestión de Contactos
- ✅ Crear, editar y eliminar contactos
- ✅ Almacenar: nombre, teléfono, email, notas
- ✅ Búsqueda y filtrado rápido
- ✅ Interfaz intuitiva optimizada para celular

### 🔍 Detección de Duplicados
- ✅ Escaneo automático de contactos duplicados
- ✅ Algoritmo inteligente que compara:
  - Similitud de nombres (distancia de Levenshtein)
  - Teléfonos exactos o normalizados
  - Emails idénticos
- ✅ Fusión manual de duplicados
- ✅ Preservación de datos en la fusión

### 💾 Datos y Respaldos
- ✅ Almacenamiento local en el navegador (nunca se sincroniza)
- ✅ Exportar a CSV (Excel, Google Sheets)
- ✅ Exportar a JSON
- ✅ Importar desde archivos (CSV, JSON, VCF)
- ✅ Crear respaldos automáticos

### 📱 PWA (App Instalable)
- ✅ Instalar como app nativa en tu celular
- ✅ Funciona sin conexión a internet
- ✅ Acceso rápido desde pantalla de inicio
- ✅ Sincronización automática cuando regresa la conexión

## 🚀 Cómo Usar

### 1. Acceder a la App

Abre tu navegador en:
```
https://tu-usuario.github.io/Redes-socialesde/agenda.html
```

### 2. Instalar como App (Recomendado)

#### En Android:
1. Abre la app en Chrome
2. Toca el menú (⋮) → "Instalar app" o "Descargar"
3. ¡Listo! Aparecerá en tu pantalla de inicio

#### En iPhone:
1. Abre la app en Safari
2. Toca el ícono de compartir (⬆️)
3. Selecciona "Añadir a la pantalla de inicio"
4. ¡Listo!

### 3. Agregar Contactos

1. Toca el botón **+ Nuevo Contacto**
2. Completa los datos:
   - **Nombre** (requerido)
   - Teléfono
   - Email
   - Notas
3. Toca "Guardar"

### 4. Buscar Contactos

Usa la barra de búsqueda para encontrar rápidamente:
- Por nombre
- Por teléfono
- Por email

### 5. Detectar y Eliminar Duplicados

1. Abre la pestaña **Duplicados**
2. Toca **🔍 Escanear Duplicados**
3. La app encontrará contactos similares
4. Para cada grupo, toca **Fusionar**
5. Elige qué datos conservar
6. Toca **Fusionar** para confirmar

### 6. Exportar/Importar

#### Exportar:
Ve a **Configuración** y elige:
- **📥 Exportar CSV** - Para Excel, Google Sheets
- **💾 Exportar JSON** - Respaldo completo
- **🔄 Crear Respaldo** - Respaldo con fecha

#### Importar:
1. Toca **📥 Importar**
2. Selecciona un archivo:
   - CSV (Excel)
   - JSON (respaldo)
   - VCF (contactos de teléfono)
3. Los contactos se agregarán automáticamente

## 🔐 Privacidad y Seguridad

- **100% Local**: Todos tus datos se guardan en tu dispositivo
- **Sin conexión**: La app funciona completamente sin internet
- **Sin servidor**: No se envía información a ningún servidor
- **Datos privados**: Solo tú tienes acceso a tus contactos

## 📊 Algoritmo de Duplicados

La app detecta duplicados considerando:

```
Similitud = (Nombre × 0.5) + (Teléfono × 0.3) + (Email × 0.2)
```

- **Nombre**: Compara similitud usando distancia de Levenshtein
- **Teléfono**: Busca coincidencias exactas o normalizadas
- **Email**: Requiere coincidencia exacta (case-insensitive)

Un contacto es considerado duplicado si la similitud es ≥ 60%

## 🛠️ Solución de Problemas

### No se guardan los contactos
- Verifica que el navegador permita `localStorage`
- Intenta en modo incógnito
- Abre la consola (F12) para ver errores

### La app es lenta
- Limpia el cache del navegador
- Intenta con menos de 1000 contactos

### No puedo instalar la app
- Asegúrate de usar un navegador moderno (Chrome, Edge, Safari)
- Intenta desde una conexión HTTPS

### Los duplicados no se detectan
- El algoritmo requiere al menos 60% de similitud
- Teléfonos debe haber coincidencia exacta
- Emails debe ser idéntico (case-insensitive)

## 📱 Formatos Soportados

### CSV
```
Nombre,Teléfono,Email,Notas
Juan Pérez,+34 666 777 888,juan@email.com,Mi amigo
Maria García,+34 666 777 889,maria@email.com,Compañera de trabajo
```

### JSON
```json
[
  {
    "id": 1234567890,
    "name": "Juan Pérez",
    "phone": "+34 666 777 888",
    "email": "juan@email.com",
    "notes": "Mi amigo",
    "createdAt": "2026-07-25T21:35:00.000Z"
  }
]
```

### VCF (vCard)
```
BEGIN:VCARD
VERSION:3.0
FN:Juan Pérez
TEL:+34 666 777 888
EMAIL:juan@email.com
END:VCARD
```

## 🔄 Exportar a Excel/Google Sheets

1. Exporta como CSV
2. En Excel: Abre el archivo CSV
3. En Google Sheets:
   - Ve a Google Drive
   - Toca "Crear" → "Subir archivo"
   - Elige el CSV
   - Se abrirá en Sheets automáticamente

## 💡 Consejos

1. **Respaldos regulares**: Exporta tus contactos mensualmente
2. **Nombres consistentes**: Usa siempre el mismo formato (ej: "Juan Pérez" no "juan perez")
3. **Teléfono internacional**: Incluye el código de país (+34 para España)
4. **Limpieza periódica**: Ejecuta el escaneo de duplicados cada mes

## 🐛 Reportar Problemas

Si encuentras un bug:
1. Abre la consola (F12)
2. Copia el error
3. Crea un issue en GitHub

## 📄 Licencia

MIT - Libre para usar y modificar

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Puedes:
- Reportar bugs
- Sugerir nuevas características
- Hacer pull requests

---

Hecho con ❤️ | Versión 1.0.0
