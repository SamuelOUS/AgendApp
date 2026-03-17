# AgendApp 🏥

> Plataforma web para el agendamiento, cancelación y gestión de citas médicas en EPS Sura, orquestada por **n8n** como motor de automatización e integración con el portal de la EPS.

---

## ¿Qué es AgendApp?

AgendApp es una aplicación que actúa como intermediario inteligente entre el usuario afiliado y el portal web de EPS Sura. A través de un formulario web, el usuario indica sus datos y preferencias de cita; n8n se encarga de navegar el portal de la EPS, consultar disponibilidad, agendar la cita y notificar al usuario — sin que este tenga que ingresar manualmente al portal.

---

## Funcionalidades principales

### 🔐 Autenticación
- Inicio de sesión en el portal de EPS Sura en nombre del usuario (HU-01)
- Almacenamiento seguro de credenciales con cifrado AES/bcrypt (HU-02)

### 📅 Agendamiento de citas
- Inicio del proceso de solicitud de cita médica general (HU-03)
- Selección de persona: titular o beneficiario del grupo familiar (HU-04)
- Selección de especialidad médica disponible en el portal EPS (HU-05)
- Selección de fecha con consulta de disponibilidad en tiempo real (HU-06)
- Selección de horario y confirmación del agendamiento vía n8n (HU-07)

### 🗂️ Gestión de citas
- Visualización del menú de servicios disponibles (HU-08)
- Inicio del proceso de cancelación o reprogramación (HU-09)
- Listado de citas agendadas con datos completos (HU-10)
- Cancelación de cita con confirmación en el portal EPS (HU-11)

### 📬 Notificaciones automáticas
- Envío de correo de confirmación al agendar una cita (HU-12)
- Creación automática del evento en Google Calendar / Outlook (HU-13)
- Recordatorio automático 24 horas antes de la cita por WhatsApp o correo (HU-14)

---

## Arquitectura del sistema

```
Usuario (Formulario Web)
        │
        ▼
  Frontend (React + Vite)
        │  POST JSON
        ▼
  n8n (Orquestador)
   ├── Autenticación en portal EPS Sura
   ├── Navegación automatizada (agendamiento / cancelación)
   ├── Consulta de disponibilidad
   ├── Registro de cita en base de datos (ORM)
   ├── Envío de correo (Gmail / Outlook)
   ├── Integración con Google Calendar / Outlook Calendar
   └── Recordatorios automáticos (WhatsApp / Correo)
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Orquestador | n8n |
| Base de datos | ORM (por definir: Prisma / TypeORM) |
| Notificaciones | Gmail / Outlook, WhatsApp Business API |
| Calendario | Google Calendar API / Outlook Calendar API |
| Seguridad | Cifrado AES / bcrypt para credenciales |

---

## Instalación y ejecución local

### Requisitos previos
- Node.js v18 o superior
- npm v9 o superior
- n8n (local o instancia en la nube)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/SamuelOUS/AgendApp.git
cd AgendApp

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del webhook de n8n y demás configuraciones

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Variable de entorno principal

```env
VITE_N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/agendar-cita
```

---

## Conexión con n8n

El frontend se comunica con n8n mediante un webhook POST. El payload enviado tiene la siguiente estructura:

```json
{
  "paciente": {
    "tipo_documento": "CC",
    "cedula": "1020304050",
    "nombres": "María",
    "apellidos": "López",
    "email": "maria@correo.com",
    "telefono": "3001234567"
  },
  "cita": {
    "especialidad": "Medicina general",
    "tipo_cita": "primera_vez",
    "fecha": "2025-04-10",
    "hora": "09:00",
    "modalidad": "presencial"
  },
  "timestamp": "2025-03-17T14:30:00.000Z"
}
```

n8n responde con:

```json
{
  "codigo": "CIT-2025-0042",
  "confirmado": true
}
```

---

## Historias de usuario y estimación

El proyecto está compuesto por **14 historias de usuario** distribuidas en 4 épicas:

| Épica | Historias | Story Points | Horas estimadas |
|---|---|---|---|
| Autenticación | HU-01, HU-02 | 13 | 26 |
| Agendamiento de citas | HU-03 a HU-07 | 31 | 63 |
| Gestión de citas | HU-08 a HU-11 | 16 | 40 |
| Confirmación y recordatorios | HU-12 a HU-14 | 15 | 40 |
| **Total** | **14 HU** | **75 pts** | **169 h** |

---

## Estructura del proyecto

```
AgendApp/
├── src/
│   ├── components/       # Componentes React reutilizables
│   ├── pages/            # Vistas principales
│   ├── hooks/            # Custom hooks
│   ├── services/         # Llamadas al webhook de n8n
│   └── types/            # Tipado TypeScript
├── public/
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

---

## Roadmap

- [x] Diseño de historias de usuario y criterios de aceptación
- [x] Estimación de tareas (75 story points / 169 horas)
- [ ] Implementación del formulario wizard (frontend)
- [ ] Configuración de workflows en n8n
- [ ] Integración con portal EPS Sura
- [ ] Módulo de notificaciones (correo + calendario)
- [ ] Recordatorios automáticos 24h
- [ ] Pruebas de integración extremo a extremo

---

## Licencia

Este proyecto es de uso académico y de desarrollo privado. No está afiliado oficialmente a EPS Sura.
