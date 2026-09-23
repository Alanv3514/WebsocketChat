# 🗺️ Roadmap – WebSocket Chat

Plan de trabajo ordenado por valor y riesgo. Cada fase se implementa en commits pequeños y verificables. Lo tachado ya está hecho.

---

## ✅ Fase 0 – Higiene (completada)

- [x] Parche de vulnerabilidades npm (`npm audit fix` + override de `qs`)
- [x] CORS reconstruido (estaba roto: `http://[object Object]`) y configurable por `FRONTEND_URL`
- [x] Puerto del backend, host/puerto de Redis y URL del socket por variables de entorno
- [x] Tipado de mensajes/usuarios en el frontend (lint limpio)
- [x] Docker: `npm ci`, `.dockerignore`, `nodemon` como devDependency, compose simplificado
- [x] README actualizado con guía selfhosted y troubleshooting
- [x] Verificación manual: build + flujo socket end-to-end (login, alias, broadcast, desconexión)

---

## 🔜 Fase 1 – Redis opcional y robustez del backend

El backend hoy crashea de forma fea si Redis no está (retry infinito de conexión). Objetivo: modo local sin Redis funcione degradado, y con Redis sea sólido.

- [ ] Manejo de conexión Redis: log claro, reintento con backoff y continuar sin historial si no hay Redis (chat in-memory)
- [ ] Podar el historial: `lTrim('messages', 0, 199)` tras cada push (evita crecimiento infinito en Redis)
- [ ] Validación de mensajes: longitud máxima (p. ej. 500 chars), rechazar payload no string en `user:send` y `user:login`
- [ ] Quiter dependencias sin usar: `jsonwebtoken` y `ws` del `package.json` del backend (o implementar lo que prometen)

**Verificación:** backend sin Redis → chat funciona sin historial; con Redis → historial capado a 200; mensajes >500 chars rechazados con evento `error`.

---

## 🔜 Fase 2 – Tests automatizados y CI

Hoy no hay tests. Objetivo: que los bugs de CORS/puertos no vuelvan a aparecer sin que nadie se entere.

- [ ] Tests de integración del backend con `socket.io-client` + Redis efímero (`testcontainers` o Redis en memoria): login, alias único, broadcast, historial, desconexión
- [ ] Tests del frontend con `vitest`: Login guarda alias y navega; WebSocketComponent procesa eventos (`message:public`, `chat:history`, `user:list`)
- [ ] Lint + build + tests en CI (GitHub Actions: job backend, job frontend)
- [ ] Badge de CI en el README

**Verificación:** `docker compose` abajo → `npm test` verde en ambos proyectos; push rojo si algo se rompe.

---

## 🔜 Fase 3 – Producción real en Docker

El frontend hoy corre el dev server de Vite en producción. Objetivo: imágenes livianas y seguras listas para selfhost serio.

- [ ] Frontend: Dockerfile multi-stage (build de Vite → nginx) con fallback SPA (`try_files ... /index.html`) para la ruta `/chat`
- [ ] Backend: multi-stage con usuario no-root (`node`)
- [ ] `HEALTHCHECK` en ambos Dockerfiles (frontend: `wget /`; backend: endpoint `GET /health` nuevo)
- [ ] Volumen persistente para Redis (`redis-data:/data`)
- [ ] Revisar `jenkinsfile`: apuntar a `docker compose` (v2) y agregar stage de tests

**Verificación:** `docker compose up -d --build` → recargar en `/chat` no da 404; contenedores corren con usuario no-root; Redis conserva mensajes tras `down` + `up`.

---

## 🔜 Fase 4 – Seguridad del chat

Chat público sin ningún control. Objetivo: frenar abuso básico sin complicar el onboarding.

- [ ] Rate limiting por socket (p. ej. máx. 10 mensajes/10s por conexión)
- [ ] Sanitización/escape de mensajes en render (React ya escapa, pero validar entradas raras: solo texto plano)
- [ ] Alias reservados y longitud máxima del nombre de login
- [ ] Reconexión con identidad: al reconectar por AFK, reusar el alias guardado en lugar de generar otro `#ID` (bug conocido del README)

**Verificación:** flood de mensajes → throttling; reconexión automática conserva el alias.

---

## 🔜 Fase 5 – Features de chat

- [ ] AutScroll al recibir mensajes (hoy solo al enviar)
- [ ] Hipervínculos clicables en los mensajes
- [ ] Emojis e imágenes
- [ ] Indicador "está escribiendo..."
- [ ] Mensajes privados por usuario

**Verificación:** cada feature con su test o verificación manual documentada.

---

## 🔜 Fase 6 – Observabilidad y despliegue

- [ ] Logging estructurado (reemplazar `console.log` por `pino`)
- [ ] Métricas básicas (conexiones activas, mensajes/min)
- [ ] Guía de despliegue en VPS (reverse proxy nginx + TLS con certbot) en el README

---

## Reglas de trabajo

1. Una fase a la vez; no mezclar fases en un commit.
2. Cada commit es una unidad de trabajo verificable con su check de verificación.
3. Commits en español, formato conventional commits (`fix:`, `feat:`, `chore:`, `docs:`, `test:`).
4. Si algo de una fase se vuelve grande, se subdivide antes de crecer el diff.
