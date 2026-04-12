# SFICI - Smart Financial Simulation Platform

Plataforma de simulacion financiera integral para instituciones de credito e inversion. Permite a asesores/administradores configurar productos financieros y a clientes generar tablas de amortizacion, simular inversiones y gestionar solicitudes en linea.

## Objetivo Academico

Proyecto desarrollado como parte de la materia de Ingenieria Economica con los siguientes requerimientos:

1. **Simulador de tabla de pagos** con dos sistemas de amortizacion:
   - **Metodo Frances** (cuota fija): cuotas iguales con interes decreciente y capital creciente
   - **Metodo Aleman** (capital constante): capital fijo por periodo con interes decreciente

2. **Rol Administrador / Asesor de credito**:
   - Configurar informacion institucional (logo, nombre, colores, datos de contacto)
   - Gestionar tipos de credito (consumo, hipotecario, educativo, vehicular, microempresa, empresarial) con sus tasas de interes
   - Administrar cobros indirectos al credito (seguros, comisiones, donaciones a fundaciones)

3. **Rol Cliente**:
   - Generar tabla de amortizacion en pantalla con parametros configurados por el administrador
   - Descargar simulacion en formato PDF con informacion institucional completa
   - Comparar metodos de amortizacion en tiempo real

4. **Modulo de Inversiones**:
   - Administrador configura productos de inversion (ahorro programado, plazo fijo, certificados, etc.)
   - Cliente simula rendimientos con interes simple vs compuesto
   - Aportes periodicos y capitalizacion configurable

5. **Proceso de solicitud en linea**:
   - Flujo de 9 pasos para solicitud de credito/inversion
   - Subida de documentacion
   - Validacion biometrica simulada (selfie, verificacion de documento, deteccion de vida)
   - Cola de revision para asesores

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19 + Vite 8 |
| Estilos | TailwindCSS 4.2 |
| Animaciones | Framer Motion 12 |
| Graficas | Recharts 3.8 |
| PDF | jsPDF + jsPDF-AutoTable |
| QR | qrcode.react |
| Routing | React Router 7 |
| Backend | Express 4.21 + Node.js |
| ORM | Prisma 6.19 |
| Base de datos | SQLite (desarrollo) |
| Validacion | Zod 3.24 |

## Arquitectura

```
smart-financial-simulation-platform/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── landing/HeroArt.jsx   # Arte SVG animado del hero
│   │   └── layout/AppShell.jsx   # Layout con sidebar (admin/cliente)
│   ├── context/
│   │   ├── CatalogContext.jsx    # Estado global de productos y cobros
│   │   ├── HistoryContext.jsx    # Historial de simulaciones
│   │   └── InstitutionalContext.jsx  # Perfil institucional
│   ├── data/
│   │   └── catalogs.js           # Datos por defecto (fallback)
│   ├── lib/
│   │   ├── amortization.js       # Motor de calculo: Frances y Aleman
│   │   ├── investment.js         # Calculo interes simple/compuesto
│   │   ├── resolveCharges.js     # Resolucion de cobros indirectos
│   │   ├── periodicity.js        # Frecuencias de pago
│   │   ├── currency.js           # Formato moneda (es-EC, USD)
│   │   ├── api.js                # Cliente HTTP para el backend
│   │   └── pdf/
│   │       └── creditSimulationPdf.js  # Generacion de PDF
│   ├── pages/
│   │   ├── Landing.jsx           # Pagina de inicio con seleccion de rol
│   │   ├── admin/
│   │   │   ├── AdminHome.jsx     # Dashboard administrador
│   │   │   ├── InstitutionalConfig.jsx  # Config institucional
│   │   │   ├── CreditProductsAdmin.jsx  # CRUD productos de credito
│   │   │   ├── ChargesAdmin.jsx  # CRUD cobros indirectos
│   │   │   └── InvestmentProductsAdmin.jsx  # CRUD productos inversion
│   │   └── client/
│   │       ├── ClientHome.jsx    # Dashboard cliente
│   │       ├── CreditSimulation.jsx  # Simulador de credito
│   │       ├── InvestmentSimulation.jsx  # Simulador de inversiones
│   │       ├── History.jsx       # Historial de simulaciones
│   │       └── RequestFlow.jsx   # Flujo de solicitud (9 pasos)
│   ├── App.jsx                   # Rutas principales
│   └── main.jsx                  # Entry point
├── backend/                      # API REST
│   ├── prisma/
│   │   ├── schema.prisma         # Modelos de datos
│   │   └── dev.db                # Base de datos SQLite
│   └── src/
│       ├── server.js             # Entry point del servidor
│       ├── app.js                # Configuracion Express
│       ├── config/env.js         # Variables de entorno
│       ├── db/prisma.js          # Singleton PrismaClient
│       ├── routes/               # Endpoints REST
│       ├── services/             # Logica de negocio
│       ├── schemas/              # Validacion Zod
│       ├── middleware/           # Error handler + validacion
│       └── lib/                  # Utilidades
├── public/                       # Assets estaticos
├── package.json                  # Dependencias frontend
├── vite.config.js                # Config Vite + proxy API
└── index.html                    # HTML base
```

## Instalacion y Ejecucion

### Prerequisitos

- Node.js >= 18
- npm

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd smart-financial-simulation-platform
```

### 2. Instalar dependencias

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Configurar base de datos

```bash
cd backend
cp .env.example .env
npx prisma db push
```

### 4. Iniciar en desarrollo

Abrir dos terminales:

```bash
# Terminal 1 - Backend (puerto 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 5173)
npm run dev
```

El frontend se sirve en `http://localhost:5173` y hace proxy de `/api` al backend en el puerto 3001.

### 5. Build para produccion

```bash
npm run build
```

## Funcionalidades Implementadas

### Administrador

| Funcionalidad | Estado |
|--------------|--------|
| Configuracion institucional (logo, nombre, colores, contacto) | Completo |
| CRUD de productos de credito con tasas y plazos | Completo |
| CRUD de cobros indirectos (seguros, comisiones, donaciones) | Completo |
| CRUD de productos de inversion | Completo |
| Persistencia en base de datos SQLite via API REST | Completo |

### Cliente

| Funcionalidad | Estado |
|--------------|--------|
| Simulacion de credito con metodo Frances y Aleman | Completo |
| Comparacion lado a lado de metodos de amortizacion | Completo |
| Tabla de amortizacion completa en pantalla | Completo |
| Descarga de simulacion en PDF con branding institucional | Completo |
| Graficas de evolucion del saldo y composicion de cuotas | Completo |
| Codigo QR de verificacion por simulacion | Completo |
| Simulacion de inversiones (interes simple vs compuesto) | Completo |
| Historial de simulaciones con gestion de estados | Completo |
| Flujo de solicitud en linea (9 pasos) | Completo |
| Validacion biometrica simulada | Completo (simulado) |
| Subida de documentacion | UI completa (sin persistencia backend) |

## Sistemas de Amortizacion

### Metodo Frances (Cuota Fija)

Calcula una cuota constante durante todo el plazo. El interes disminuye periodo a periodo mientras que la porcion de capital aumenta.

```
Cuota = P * [r(1+r)^n] / [(1+r)^n - 1]
```

Donde: P = monto del prestamo, r = tasa periodica, n = numero de periodos.

### Metodo Aleman (Capital Constante)

El capital se divide en partes iguales por el numero de periodos. El interes se calcula sobre el saldo pendiente, resultando en cuotas decrecientes.

```
Capital por periodo = P / n
Interes periodo k   = Saldo_k * r
Cuota periodo k     = (P / n) + Saldo_k * r
```

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripcion | Default |
|----------|------------|---------|
| `PORT` | Puerto del servidor Express | `3001` |
| `DATABASE_URL` | URL de conexion SQLite | `file:./dev.db` |
| `FRONTEND_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` |

### Frontend

| Variable | Descripcion | Default |
|----------|------------|---------|
| `VITE_API_URL` | URL base del API (solo si no se usa proxy) | _(proxy via Vite)_ |

## Usuarios de Prueba

La base de datos de desarrollo (`backend/prisma/dev.db`) incluye los siguientes usuarios pre-configurados. El usuario admin se crea automaticamente al iniciar el backend por primera vez.

| Rol | Email | Contraseña | Acceso |
|-----|-------|------------|--------|
| **Administrador** | `admin@sfici.com` | `admin123` | Panel completo `/admin` — configuracion institucional, productos, cobros, revision de solicitudes |
| **Cliente (demo)** | `test@client.com` | `test123` | Portal cliente `/cliente` — simulaciones publicas + solicitudes con login |
| **Cliente (demo 2)** | `cliente@test.com` | `test123` | Portal cliente `/cliente` — segunda cuenta de prueba |

> **Nota:** Los clientes nuevos se pueden registrar desde `/registro`. Las simulaciones de credito e inversiones son accesibles sin necesidad de cuenta — solo se requiere login para crear solicitudes de credito y ver solicitudes existentes.

## Endpoints del API

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| `GET` | `/api/health` | — | Health check del servidor |
| `POST` | `/api/auth/register` | — | Registro de clientes |
| `POST` | `/api/auth/login` | — | Login (admin y cliente) |
| `GET` | `/api/auth/me` | ✅ | Obtener usuario actual |
| `GET` | `/api/catalog` | — | Obtener productos y cobros |
| `PUT` | `/api/catalog` | Admin | Reemplazar catalogo completo (transaccional) |
| `GET` | `/api/institution/profile` | — | Obtener perfil institucional |
| `PUT` | `/api/institution/profile` | Admin | Actualizar perfil institucional |
| `GET` | `/api/history` | ✅ | Listar historial de simulaciones |
| `POST` | `/api/history` | ✅ | Crear entrada en historial |
| `PATCH` | `/api/history/:id/status` | ✅ | Actualizar estado de simulacion |
| `POST` | `/api/requests` | ✅ | Crear solicitud de credito |
| `GET` | `/api/requests` | Admin | Listar todas las solicitudes |
| `GET` | `/api/requests/:id` | ✅ | Obtener solicitud por ID |
| `GET` | `/api/requests/by-cedula/:cedula` | ✅ | Solicitudes por cedula |
| `PATCH` | `/api/requests/:id/review` | Admin | Revisar solicitud (aprobar/rechazar) |

## Datos por Defecto

El sistema incluye datos iniciales que se cargan automaticamente:

- **6 productos de credito**: Consumo (15.5%), Hipotecario (9.75%), Educativo (8.5%), Microcredito (18%), Vehicular (12.9%), Empresarial (11.2%)
- **5 cobros indirectos**: Seguro desgravamen (0.09%), Seguro del bien (0.15%), Comision apertura ($25), Gastos operativos ($5/mes), Donacion fundacion ($2/mes)
- **5 productos de inversion**: Ahorro programado (7%), Plazo fijo (8%), Inversion mensual (6.5%), Fondo educativo (7.5%), Certificados (8%)

## Licencia

Proyecto academico - Ingenieria Economica.
