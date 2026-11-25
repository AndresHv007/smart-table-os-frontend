# Smart Table OS — Frontend (`andreshu07/smarttable-web`)

Interfaz web React + Vite + TailwindCSS para pantalla central (`/`) y controladores móviles (`/mobile`) de **Smart Table OS**, empaquetada sobre **Nginx** con inyección de configuración en arranque (`env-config.js`) para desplegar la misma imagen en **Azure Dev** y **Azure Prod**.

## Ejecución rápida con Docker
```bash
docker run -d --name smarttable-web \
  -p 5173:80 \
  -e API_URL=http://localhost:3001 \
  -e APP_ENV=development \
  -e APP_VERSION=latest \
  andreshu07/smarttable-web:latest
```

## Variables de entorno en contenedor
| Variable | Default | Descripción |
|---|---|---|
| `API_URL` | *(auto)* | URL pública del backend Socket.IO (Dev o Prod) |
| `APP_ENV` | `development` | Etiqueta de ambiente mostrada en el badge (`DEV` / `PROD`) |
| `APP_VERSION` | `1.0.0` | Versión o SHA del despliegue |

## Healthcheck
- `GET /health` → `200 OK`
- `GET /env-config.js` → configuración inyectada en arranque (sin caché)

## Desarrollo local
```bash
npm install
npm run dev
```
