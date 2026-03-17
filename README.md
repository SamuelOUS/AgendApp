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
| Base de datos | PostgreSQL |
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

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`


---

## Licencia

Este proyecto es de uso académico y de desarrollo privado. No está afiliado oficialmente a EPS Sura.
