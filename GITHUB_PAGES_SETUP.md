# 🚀 Configuración de GitHub Pages

Para que la app de agenda sea accesible en GitHub Pages, sigue estos pasos:

## 📋 Pasos de Configuración

### 1. En GitHub.com

1. Ve a tu repositorio: `https://github.com/tu-usuario/Redes-socialesde`
2. Abre **Settings** (Configuración)
3. En el menú lateral izquierdo, busca **Pages** (bajo "Code and automation")
4. En **Source** (Fuente), selecciona:
   - **Deploy from a branch**
   
5. En **Branch**, selecciona:
   - **Rama**: `claude/agenda-app-duplicates-r12me2` (o `main`)
   - **Carpeta**: `/ (root)`

6. Haz clic en **Save** (Guardar)

7. GitHub mostrará el URL donde está disponible tu site:
   ```
   https://tu-usuario.github.io/Redes-socialesde/
   ```

### 2. Esperar el Deploy

GitHub Pages tardará 1-2 minutos en desplegar. Puedes:
- Actualizar la página de Settings para ver el estado
- Buscar en la pestaña **Actions** para ver el workflow de deployment

### 3. Acceder a la App

Una vez esté lista, accede a:
```
https://tu-usuario.github.io/Redes-socialesde/agenda.html
```

## 🔍 Verificar el Estado

### Ver el workflow de Actions:
1. Ve a **Actions** en tu repositorio
2. Busca "Deploy to GitHub Pages"
3. Deberías ver un workflow exitoso (✅)

### Ver los archivos publicados:
- Visita `https://tu-usuario.github.io/Redes-socialesde/`
- Deberías ver una lista de archivos (si está en raíz)
- O directamente `https://tu-usuario.github.io/Redes-socialesde/agenda.html`

## 🐛 Solución de Problemas

### Sigo viendo 404

**Posibles causas:**
1. ❌ GitHub Pages no está habilitado
   - **Solución**: Sigue el Paso 1 arriba

2. ❌ La rama no tiene los archivos
   - **Solución**: Verifica que el push llegó correctamente:
     ```bash
     git log --oneline -5
     git branch -a
     ```

3. ❌ Caching del navegador
   - **Solución**: 
     - Ctrl+Shift+Delete (borrar caché)
     - O abre en incógnito

4. ❌ Nombre del repositorio incorrecto
   - **Solución**: Verifica que el URL sea:
     ```
     https://TU-USUARIO-GITHUB.github.io/NOMBRE-REPO/
     ```

### El site desaparece después de un tiempo

**Causa**: GitHub Pages puede desactivarse si hay inactividad

**Solución**: 
1. Ve a Settings → Pages
2. Verifica que esté habilitado
3. Re-selecciona la rama y guarda

## 📊 Configuración Recomendada

### Para producción:
```
Source: Deploy from a branch
Branch: main
Folder: / (root)
Enforce HTTPS: ✅ (activado)
```

### Para desarrollo:
```
Source: Deploy from a branch
Branch: claude/agenda-app-duplicates-r12me2
Folder: / (root)
```

## 🔐 Cambios Realizados

He configurado el repositorio con:

1. ✅ **Workflow de GitHub Actions** (`.github/workflows/pages.yml`)
   - Despliega automáticamente en Pages
   - Incluye las ramas: `main`, `claude/agenda-app-duplicates-r12me2`

2. ✅ **URLs Relativas**
   - El `manifest.json` usa `./` (relativo)
   - El `service-worker.js` usa URLs relativas
   - Funciona en cualquier rama de GitHub Pages

3. ✅ **Archivo .nojekyll**
   - Previene que Jekyll procese los archivos

## 🎯 URL Final

Una vez configurado, tu app estará en:

```
https://tu-usuario.github.io/Redes-socialesde/agenda.html
```

Desde ahí puedes:
- Instalar como app en celular
- Crear contactos
- Detectar duplicados
- Importar/exportar

## ✅ Checklist de Setup

- [ ] Entrar a Settings en GitHub
- [ ] Ir a Pages en el menú
- [ ] Seleccionar rama: `claude/agenda-app-duplicates-r12me2`
- [ ] Seleccionar folder: `/ (root)`
- [ ] Guardar cambios
- [ ] Esperar 1-2 minutos
- [ ] Acceder a `https://tu-usuario.github.io/Redes-socialesde/agenda.html`
- [ ] Instalar como app en celular

---

Si tienes problemas, verifica el estado en **Actions** → **Deploy to GitHub Pages** para ver errores específicos.
