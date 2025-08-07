# 🧠 Memory Game 2

El clásico juego de memoria llevado a otro nivel. ¡Disfruta de una experiencia interactiva, sonora y personalizable con tecnología moderna en backend y frontend!

---

## 🚀 Requisitos previos

- **Docker** y **Docker Compose** instalados (recomendado)
- Opción manual: **Node.js (>=18.x)** y **npm** en backend y frontend
- Puerto 3000, 27017 y 5173 **libres**

---

## ⚡ Instalación rápida con Docker (recomendado)

1. **Clona el repositorio:**
   ```bash
   ```

git clone [https://github.com/wallshapel/Memory-Game-2.git](https://github.com/wallshapel/Memory-Game-2.git) cd Memory-Game-2

````
2. **Ejecuta todo el sistema:**
   ```bash
docker compose up -d
````

- El backend (Express+TypeScript) quedará en `localhost:3000`
- El frontend (Vue+Vuetify) en `localhost:5173`
- La base de datos MongoDB en el puerto 27017

---

## ⚙️ Instalación manual (desarrolladores)

### 1️⃣ Backend (Express + TypeScript)

- Ingresa al directorio `/express-backend`:

  ```bash
  cd backend
  npm install
  cp .env.example .env # y ajusta valores si es necesario
  npm run dev
  ```

- Requiere Mongo corriendo en `localhost:27017`, usuario `root`, clave `456`, base `memory_game` (se crea al levantar el backend).

### 2️⃣ Frontend (Vue + Vuetify + TypeScript)

- Ingresa al directorio `/vue-frontend`:
  ```bash
  cd frontend
  npm install
  cp .env.example .env # y ajusta valores si es necesario
  npm run dev
  ```

---

## 🧪 Testing y Linting

En **ambos proyectos** (backend y frontend) puedes usar los mismos comandos:

- Ejecutar tests:
  ```bash
  npx vitest
  ```
- Ver reporte de cobertura:
  ```bash
  npx vitest run --coverage
  ```
- Analizar código con ESLint:
  ```bash
  npx eslint src
  ```

---

## 📖 Documentación de la API

1. Levanta el backend en modo dev:
   ```bash
   npm run dev
   ```
2. Visita [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🎮 ¿Cómo se juega?

- Voltea cartas y encuentra las parejas.
- Elige entre **tres temas**: animales, banderas, Rick & Morty.
- Personaliza el número de cartas: de 10 (5 parejas) a 30 (15 parejas).
- Cambia la dificultad: menos tiempo para memorizar = más reto.
- Selecciona cubierta personalizada.
- Juega con mouse o teclado.
- Disfruta el **modo contrarreloj** y guarda tus récords.
- ¡Tu configuración y partidas quedan guardadas en MongoDB!

---

## 🧑‍💻 Buenas prácticas

- Todo el código cumple principios **SOLID**
- Cobertura de tests en backend y frontend
- ESLint en ambos proyectos

---

## 📝 Notas finales

- Ajusta variables en los `.env` según tu entorno
- Si usas MongoDB localmente: crea el usuario `root` con clave `456`
- Docker te facilita todo, pero si prefieres lo manual, tienes la opción
- Reporta bugs y contribuye en [GitHub](https://github.com/wallshapel/Memory-Game-2)

---

¡A disfrutar y memorizar! 🧠✨

