# Checklist de despliegue — Picks Pro AI

> Estado actual: proyecto preparado y revisado. No se ha creado el repositorio remoto, no se ha desplegado y no se ha modificado Cloudflare.

## 1. Revisión previa

- [x] Dependencias y build de Next.js verificados.
- [x] `package-lock.json` incluido para instalaciones reproducibles.
- [x] `node_modules`, `.next`, entornos y metadatos locales excluidos mediante `.gitignore`.
- [x] Revisión local sin claves, tokens, contraseñas, certificados ni cadenas de conexión.
- [x] `public/data/public_picks.json` contiene únicamente los 6 picks públicos exportados.
- [x] La web no se conecta a Flask, PostgreSQL ni otros servicios externos.
- [ ] Ejecutar `python scripts/update_public_data.py` justo antes de publicar si existe un export más reciente.
- [ ] Ejecutar `npm run build` justo antes del push definitivo.

## 2. Crear el repositorio local

Ejecutar desde la raíz de `picksproai-public`:

```bash
git init
git add .
git status
git commit -m "Initial public Picks Pro AI site"
```

Antes del commit, comprobar en `git status` que no aparezcan `.env`, `node_modules`, `.next`, `.vercel` ni archivos ajenos al proyecto.

## 3. Crear y conectar el repositorio de GitHub

- [ ] Crear un repositorio vacío en GitHub, por ejemplo `picksproai-public`.
- [ ] No añadir README, licencia ni `.gitignore` desde GitHub, ya existen localmente.
- [ ] Conectar y publicar la rama principal:

```bash
git branch -M main
git remote add origin https://github.com/USUARIO/picksproai-public.git
git push -u origin main
```

Sustituir `USUARIO` por la cuenta u organización real de GitHub.

## 4. Importar en Vercel

- [ ] En Vercel, seleccionar **Add New > Project**.
- [ ] Importar el repositorio `picksproai-public` desde GitHub.
- [ ] Revisar la configuración detectada antes de pulsar **Deploy**:

| Ajuste | Valor correcto |
| --- | --- |
| Framework Preset | `Next.js` |
| Root Directory | `./` (raíz del repositorio) |
| Install Command | `npm install` (valor predeterminado) |
| Build Command | `npm run build` |
| Output Directory | `.next` (gestionado automáticamente por Next.js/Vercel) |

- [ ] No activar la opción para sobrescribir `Output Directory`; dejar que la integración de Next.js gestione `.next`.
- [ ] No crear variables de entorno: esta web no las necesita.
- [ ] Lanzar el primer despliegue y verificar la URL temporal de Vercel.
- [ ] Confirmar que aparecen los 6 picks y que la vista funciona en móvil y escritorio.

## 5. Dominio `picksproai.com`

- [ ] Añadir `picksproai.com` en **Project Settings > Domains** de Vercel.
- [ ] Añadir también `www.picksproai.com` y elegir cuál redirige al dominio principal.
- [ ] Anotar los registros DNS solicitados por Vercel.
- [ ] No modificar todavía los registros en Cloudflare.
- [ ] En una fase autorizada posterior, aplicar los DNS en Cloudflare y verificar dominio y HTTPS.

## Checklist final antes de desplegar

- [ ] El repositorio de GitHub se llama `picksproai-public`.
- [ ] La rama `main` contiene el commit `Initial public Picks Pro AI site`.
- [ ] GitHub muestra `public/data/public_picks.json` con 6 picks y caracteres UTF-8 correctos.
- [ ] No aparecen archivos `.env`, claves, tokens, contraseñas, certificados, `node_modules`, `.next` ni `.vercel`.
- [ ] `npm install` termina correctamente.
- [ ] `npm run build` termina correctamente.
- [ ] Los ajustes de Vercel coinciden con la tabla anterior.
- [ ] No se han configurado todavía dominios personalizados ni cambios DNS en Cloudflare.
