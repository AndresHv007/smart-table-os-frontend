# Smart Table OS — Frontend

Interfaz React + Vite + TailwindCSS para pantalla central (`/`) y controladores móviles (`/mobile`) de **Smart Table OS**, empaquetada con **Nginx** e inyección de variables en tiempo de ejecución (`env-config.js`) para usar la misma imagen de **Docker Hub** (`andreshu07/smarttable-web`) en **Azure Dev** y **Azure Prod**.

## Uso local
```bash
npm install
npm run dev
```

## Variables de entorno en contenedor
- `API_URL`: URL pública del backend (Dev o Prod)
- `APP_ENV`: `development` o `production`
- `APP_VERSION`: versión o SHA del despliegue
