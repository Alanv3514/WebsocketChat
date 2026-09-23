# 💬 WebSocket Chat – React + Node + Redis

Chat en tiempo real con WebSockets: frontend React (Vite + MUI), backend Node.js (Express + Socket.IO) y Redis para el historial de mensajes.

## Quick path (selfhosted con Docker)

1. Clonar el repositorio.
2. `docker compose up -d --build`
3. Abrir [http://localhost:5173](http://localhost:5173), elegir un nombre y chatear.

Verificación rápida: abrí dos pestañas del navegador, logueate con dos usuarios distintos y confirmá que los mensajes aparecen en ambas y que la lista de conectados se actualiza.

> ⚠️ Docker no está disponible en todos los entornos de desarrollo. Si es tu caso, usá el modo local de la sección siguiente.

## Modo local (sin Docker)

Requisitos: Node.js ≥ 20 y npm ≥ 10.

1. **Redis**: instalalo local o apuntá a una instancia existente.
2. **Backend**:

   ```bash
   cd BackendChat
   cp .env.example .env   # ajustar REDIS_HOST/REDIS_PORT
   npm install
   npm run dev            # escucha en el puerto 8000
   ```

3. **Frontend**:

   ```bash
   cd FrontendChat
   cp .env.example .env   # ajustar VITE_SOCKET_URL a la URL del backend
   npm install
   npm run dev            # sirve la app en el puerto 5173
   ```

4. Abrir [http://localhost:5173](http://localhost:5173).

## Selfhosted en LAN (otros dispositivos)

Por defecto todo apunta a `localhost`. Para acceder desde otra máquina de la red:

1. En `BackendChat/.env` (o en el `environment` de `docker-compose.yml`): `FRONTEND_URL=http://<ip-del-servidor>:5173`.
2. En `FrontendChat/.env`: `VITE_SOCKET_URL=http://<ip-del-servidor>:8000`.
3. Reconstruir: `docker compose up -d --build`.

Nota: `VITE_SOCKET_URL` se compila dentro del bundle en build time, así que cambiarla exige reconstruir la imagen del frontend.

## Variables de entorno

| Variable | Dónde | Default | Descripción |
|----------|-------|---------|-------------|
| `FRONTEND_URL` | BackendChat | `http://localhost:5173` | Origin del frontend permitido por CORS |
| `PORT` | BackendChat | `8000` | Puerto HTTP/WebSocket del backend |
| `REDIS_HOST` | BackendChat | `redisdb` | Host de Redis (`redisdb` dentro de Docker) |
| `REDIS_PORT` | BackendChat | `6379` | Puerto de Redis |
| `VITE_SOCKET_URL` | FrontendChat | `http://localhost:8000` | URL del backend a la que conecta el socket |

## Estructura del proyecto

```plaintext
.
├── BackendChat/
│   ├── app.js                       # Entry point: Express + Socket.IO + CORS
│   ├── security/authorization.js    # Configuración de CORS
│   ├── websocket/
│   │   ├── config/websocketConfig.js  # Eventos del socket + Redis
│   │   └── utils/generateUniqueAlias.js
│   └── Dockerfile
├── FrontendChat/
│   ├── src/
│   │   ├── App.tsx                  # Rutas: / (login) y /chat
│   │   └── components/
│   │       ├── Login.tsx
│   │       └── WebSocketComponent.tsx
│   └── Dockerfile
├── docker-compose.yml
├── jenkinsfile
└── ROADMAP.md
```

## Funcionamiento

1. El usuario elige un alias en `/` y pasa a `/chat`.
2. El frontend emite `user:login`; el backend genera un alias único (`alias#1234`), lo agrega a la lista de conectados y emite `user:validate` + `user:list` + `chat:history` (últimos 20 mensajes desde Redis).
3. Cada mensaje se emite como `message:public` a todos y se persiste en la lista `messages` de Redis.
4. Al desconectarse, el backend remueve el alias y actualiza `user:list`.

### Eventos del socket

| Evento | Dirección | Payload | Descripción |
|--------|-----------|---------|-------------|
| `user:login` | Cliente → Servidor | `{ message: string }` | Solicita login con el alias base |
| `user:send` | Cliente → Servidor | `{ message: string }` | Envía un mensaje público |
| `user:validate` | Servidor → Todos | `{ type, alias }` | Confirma el alias único asignado |
| `user:list` | Servidor → Todos | `{ type, users: string[] }` | Lista de usuarios conectados |
| `chat:history` | Servidor → Todos | `{ type, messages }` | Últimos 20 mensajes |
| `message:public` | Servidor → Todos | `{ type, fromUser, message }` | Mensaje público |
| `error` | Servidor → Todos | `{ type, alias, message }` | Error de operación |

## Solución de problemas

| Síntoma | Causa probable | Fix |
|---------|---------------|-----|
| `xhr poll error` al conectar | El backend no está corriendo o `VITE_SOCKET_URL` mal configurada | Verificar backend y la variable de entorno |
| `Redis error: ENOTFOUND redisdb` | Redis no accesible en el host configurado | En modo local, setear `REDIS_HOST=localhost` |
| Los mensajes no aparecen en otra pestaña | CORS bloqueando el socket | Revisar `FRONTEND_URL` en el backend |
| Sin historial al recargar | Redis sin datos (modo local sin Redis) | Levantar Redis o usar Docker |

## Requisitos (modo Docker)

- 🐳 Docker con compose
- 🟩 Node.js ≥ 20 y npm ≥ 10 (solo para modo local)

## Estado y próximos pasos

El estado actual, los problemas conocidos y el plan de trabajo están documentados en [ROADMAP.md](ROADMAP.md).

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la [Licencia MIT](LICENSE).
📍 Paraná, 2025.
