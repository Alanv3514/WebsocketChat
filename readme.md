# 💬 WebSocket Chat – React + Node + Redis

## 📘 Descripción

Este proyecto implementa una aplicación de chat en tiempo real utilizando:
- **Frontend**: React
- **Backend**: Node.js con WebSocket (`socket.io`)
- **Base de Datos**: Redis (para persistencia temporal de mensajes)



---
## 🎯 Objetivos

- Establecer comunicación bidireccional entre el backend y frontend mediante WebSockets.
- Generar y mantener un identificador único pseudoaleatorio por sesión del usuario.
- Almacenar mensajes en una lista Redis.
- Recuperar automáticamente los últimos 20 mensajes al iniciar sesión (historial).
- Levantar todos los servicios localmente utilizando Docker Compose.

---
## 🧱 Estructura del Proyecto

```plaintext
.
├── backend/
│   ├── index.js
│   ├── security/
│   ├── websocket/
│   └── utils/
├── frontend/
│   ├── src/
│   │   └── components/
│   └── public/
├── docker-compose.yml
└── README.md
```
---
## 🚀 Detalles de Ejecución

### 📍 Puertos Utilizados

- `Redis`: `6379`
- `Backend`: `8000`
- `Frontend`: `5173`

---
## Características del Sistema

### 🎨 Frontend: 
#### **Página de Login** (`'/'`):  
  Formulario simple que incluye:
  - Campo de entrada: **Nombre de usuario**
  - Botón: **Iniciar**

#### **Página de Chat** (`'/chat'`):  
  Componentes principales:
  - Área de texto para visualizar el **historial de mensajes**
  - Panel lateral o listado de **usuarios conectados**
  - Campo de entrada: **Mensaje** (para escribir un nuevo mensaje)
  - Botón: **Send Message** (para enviar el mensaje)
  
---
### 🔧 Backend:

#### 🟢 Eventos `on` (escucha)

#### **`user:login`**

- **Origen**: Cliente  
- **Parámetros**: `data` (JSON.stringify({ message: string }))  
- **Función**: Genera un alias único, guarda al usuario en el set de conectados, y emite:
  - `user:validate`: para informar del alias validado.
  - `user:list`: lista actual de usuarios conectados.
  - `chat:history`: historial de últimos 20 mensajes (usando Redis).
- **Errores**: Emite `error` si no se puede parsear o manejar `data`.


####  `user:send`

- **Origen**: Cliente  
- **Parámetros**: `data` (JSON.stringify({ message: string }))  
- **Función**: Emite un mensaje público (`message:public`) con el contenido y alias del usuario. Guarda el mensaje en Redis.
- **Errores**: Emite `error` si falla el parseo o guardado.


####  `disconnect`

- **Origen**: Automático (desconexión)  
- **Función**: Remueve el alias del conjunto de usuarios conectados y actualiza con `user:list`.

---
#### 🟣 Eventos `emit` (salida)


#### `user:validate`

- **Destino**: Todos los clientes  
- **Contenido**: JSON con `{ type: "info", alias: string }`  
- **Función**: Confirma el alias generado para el usuario.


#### `user:list`

- **Destino**: Todos los clientes  
- **Contenido**: JSON con `{ type: "info", users: string[] }`  
- **Función**: Lista completa de usuarios conectados.

#### `chat:history`

- **Destino**: Todos los clientes  
- **Contenido**: JSON con `{ type: "history", messages: Mensaje[] }`  
- **Función**: Envía los últimos 20 mensajes guardados en Redis.


#### `message:public`

- **Destino**: Todos los clientes  
- **Contenido**: JSON con `{ type: "public", fromUser: string, message: string }`  
- **Función**: Mensaje público enviado a todos los usuarios.


#### `error`

- **Destino**: Todos los clientes  
- **Contenido**: JSON con `{ type: "error", alias: string, message: string }`  
- **Función**: Indica un error en la operación (parseo, conexión, etc.).

### ▶️ Ejecución

Para compilar y ejecutar el proyecto completo usando Docker:

```bash
> docker-compose up -d
```

Accedé a la app en: [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Requisitos

- 🐳 Docker: ✅
- 🟩 Node.js 22.15.0: ✅
- 🔴 npm 10.8.2: ✅

---
## 🐞 Problemas Conocidos

- ⚠️ Aunque está implementado un archivo para manejar el **CORS**, actualmente **no está siendo utilizado**.
- ⚠️ Las **IP y puertos** están codificados en el código; deberían manejarse mediante **variables de entorno**.
- 🔄 Luego de un tiempo **AFK (inactividad)**, la conexión se renueva automáticamente y el usuario recibe un nuevo **#ID**, perdiendo continuidad.
- 🔗 Los **hipervínculos enviados** al chat no se visualizan correctamente ni como enlaces clicables.
- 📷 No existe la funcionalidad para enviar **gifs**, **imágenes** o **emojis** integrados al chat por el momento.

"""

## 📄 Licencia y Autoría

Este proyecto está licenciado bajo los términos de la [Licencia MIT](LICENSE).
📍 Paraná, 2025.
