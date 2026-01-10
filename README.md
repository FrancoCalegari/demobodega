# VALZOE TOUR - Node.js Application

Sistema de gestión de tours de bodegas con panel de administración.

## 🚀 Instalación y Configuración

### Requisitos

- Node.js 14+
- npm

### Pasos de Instalación

1. **Instalar dependencias**

```bash
npm install
```

2. **Inicializar la base de datos**

```bash
npm run init-db
```

Esto creará:

- La base de datos SQLite (`database/valzoe.db`)
- Un usuario admin por defecto
  - Usuario: `admin`
  - Contraseña: `admin123`
  - ⚠️ **IMPORTANTE:** Cambiar esta contraseña en producción

3. **Migrar datos existentes**

```bash
npm run migrate
```

Esto importará:

- Tours desde `public/assets/data/tours.json`
- Imágenes de la galería (referencias)

4. **Iniciar el servidor**

```bash
npm start
```

O para desarrollo con auto-reload:

```bash
npm run dev
```

El servidor correrá en: `http://localhost:3000`

## 📊 Admin Dashboard

Accede al panel de administración en: `http://localhost:3000/admin`

### Funcionalidades

- **Tours**

  - Crear, editar y eliminar tours
  - Gestionar características del tour
  - Configurar bodegas a visitar
  - Definir menú de 4 pasos
  - **Campo "Duración"**: Indica el tiempo total del recorrido desde el punto de retiro

- **Galería**
  - Subir nuevas imágenes
  - Eliminar imágenes existentes
  - Las imágenes se guardan en `/uploads/gallery/`

## 🗂️ Estructura del Proyecto

```
demobodega/
├── server.js                 # Servidor Express
├── package.json
├── database/
│   ├── schema.sql           # Esquema de base de datos
│   ├── db.js                # Conexión y helpers
│   ├── init.js              # Inicialización de DB
│   ├── migrate.js           # Migración de datos
│   └── valzoe.db            # Base de datos SQLite
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── tours.js             # CRUD de tours
│   └── gallery.js           # CRUD de galería
├── middleware/
│   └── auth.js              # Middleware de autenticación
├── public/
│   ├── index.html           # Sitio público
│   ├── assets/              # CSS, JS, imágenes
│   └── admin/               # Panel de administración
│       ├── index.html
│       ├── css/admin.css
│       └── js/admin.js
└── uploads/                 # Archivos subidos
```

## 📡 API Endpoints

### Public (no requiere autenticación)

- `GET /api/tours` - Lista todos los tours
- `GET /api/tours/:id` - Obtiene un tour específico
- `GET /api/gallery` - Lista todas las imágenes

### Admin (requiere autenticación)

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/check` - Verificar sesión

**Tours:**

- `POST /api/tours` - Crear tour
- `PUT /api/tours/:id` - Actualizar tour
- `DELETE /api/tours/:id` - Eliminar tour

**Galería:**

- `POST /api/gallery` - Subir imagen
- `PUT /api/gallery/:id` - Actualizar metadata
- `DELETE /api/gallery/:id` - Eliminar imagen

## 🔒 Seguridad

- Las sesiones expiran después de 24 horas
- Las contraseñas se hashean con bcrypt
- Solo usuarios autenticados pueden modificar contenido

## 🚢 Despliegue

Para producción:

1. Cambiar la contraseña del admin
2. Configurar `SESSION_SECRET` como variable de entorno
3. Considerar usar PostgreSQL en lugar de SQLite
4. Activar `cookie.secure: true` si usas HTTPS

## 📝 Notas

- El campo "duración" es configurable desde el admin
- Las imágenes de la galería se almacenan en `/uploads/gallery/`
- Los datos originales en `tours.json` se mantienen como respaldo
