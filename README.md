# Picks Pro AI — web pública

Web pública creada con Next.js, React y TypeScript. Muestra picks deportivos a partir de un único archivo JSON local y está completamente separada de Flask, PostgreSQL y cualquier base de datos.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` en el navegador.

## Datos públicos

Los picks se encuentran en `public/data/public_picks.json`. La página importa exclusivamente este archivo en tiempo de compilación y no realiza llamadas a servicios externos.

Cada elemento debe incluir:

`id`, `fecha`, `liga`, `local`, `visitante`, `mercado`, `seleccion`, `cuota`, `probabilidad`, `ev`, `categoria` y `estado`.

Todos los picks publicados en el JSON aparecen en la web y se usan en las estadísticas.

Para copiar el export real de Picks Pro al archivo público local:

```bash
python scripts/update_public_data.py
```

El script valida el origen y el formato JSON, conserva UTF-8 e informa del total de picks y de las rutas utilizadas.

## Build de producción

```bash
npm run build
npm start
```

El proyecto no incluye login, panel de administración, rutas privadas ni conexión a backend.

La preparación del repositorio, Vercel y el dominio está documentada en [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md).
