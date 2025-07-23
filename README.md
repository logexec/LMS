# 📚 LMS - Sistema de Gestión Logística

Monorepo completo para la gestión de operaciones logísticas internas, con frontend en Next.js 15 y backend en Laravel 12. Optimizado para entornos empresariales con soporte para SQL Server, Redis (por implementar), y Google Cloud Storage.

---

## 🧱 Tecnologías principales

### 🔙 Backend (Laravel 12)

- PHP 8.2
- Laravel Sanctum (auth vía cookies seguras)
- Redis para caché _(por implementar)_
- SQLSRV (conexión a bases de datos SQL Server para Latinium)
- SOAP & XML parsing para facturas
- Docker-ready
- WireGuard VPN

### 🔜 Frontend (Next.js 15)

- Next.js App Router
- TypeScript estricto
- Zustand (estado global)
- Shadcn/UI + TanStack Table
- TailwindCSS + variables personalizadas
- Motion.dev para animaciones
- Upload drag-and-drop de XML/ZIP
- Charts, toasts y UI reactiva

---

## 📦 Estructura del monorepo

```bash
lms/
├── backend/                # Laravel 12
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── docker/             # Dockerfile + setup
├── frontend/               # Next.js 15
│   ├── app/                # App Router
│   ├── components/
│   ├── lib/                # Servicios compartidos
│   ├── store/              # Zustand
│   ├── styles/             # Tailwind config
│   └── utils/
├── docker-compose.yml
├── .env
└── README.md
```

---

## ⚙️ Setup local rápido

```bash
# Clona el monorepo
git clone https://github.com/usuario/lms.git && cd lms

# Inicia los servicios
docker compose up -d --build

# Laravel: instalar dependencias, migrar y generar key
cd backend
composer install
cp .env.example .env
php artisan migrate
php artisan key:generate

# Frontend
cd ../frontend
npm install
npm run dev
```

---

## 🚀 Funcionalidades destacadas

- ✅ Autenticación con Laravel Sanctum vía cookies
- ✅ Subida y validación de XML, carpetas o ZIP
- ✅ Upload automático a Google Cloud Storage
- ✅ Tablas dinámicas con TanStack Table + filtros
- ✅ Filtros por empresa, estado, fecha, tipo de documento
- ✅ Auditoría con Spatie para múltiples entidades
- ✅ Módulo de órdenes de compra vinculadas a facturas
- 🛠️ Dashboard administrativo (en progreso)

---

## 🧪 Tests

**Backend**

```bash
cd backend
php artisan test
```

**Frontend**

```bash
cd frontend
npm run test
```

---

## 🔐 Variables de entorno

### Backend (`.env`)

```env
APP_KEY=
DB_CONNECTION=sqlsrv
DB_HOST=
REDIS_HOST=redis
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_KEY_BASE64=
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GCS_BUCKET=...
APP_KEY=la_misma_del_backend
```

---

## 📈 Estado actual

| Módulo          | Estado           | Observaciones                       |
| --------------- | ---------------- | ----------------------------------- |
| Login           | ✅ Completado    | Vía Laravel Sanctum + cookies       |
| Importación XML | ✅ Completado    | Upload a GCS + parsing y validación |
| Tabla UI        | ✅ Completado    | Con TanStack Table                  |
| Auditoría       | ✅ Completado    | Spatie Laravel Activity Log         |
| Dashboard       | 🛠️ En desarrollo | Charts e indicadores comparativos   |
| Reportes PDF    | 🔜 Próximamente  | Integración con Snappy / DomPDF     |

---

## 📋 To-Do / Backlog / Posibles bugs

- [ ] Exportación PDF de reportes administrativos
- [ ] Permisos por rol (admin / usuario)
- [ ] Dashboard con filtros mensuales y KPIs
- [ ] Integración con notificaciones (recordatorios, alertas)

---

## 📄 Licencia

MIT © LogeX
