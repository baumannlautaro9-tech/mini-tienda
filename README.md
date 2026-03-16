# 🛒 TechStore - Mini-Tienda Fullstack

Proyecto desarrollado para el **Hackathon de 12 horas** (2º DAM/DAW). Una aplicación web completa para la compra y venta de productos con enfoque en seguridad y despliegue rápido.

---

## 🚀 Tecnologías
- **Backend:** Node.js + Express.js
- **Base de Datos:** SQLite3 (Persistencia en archivo local)
- **Seguridad:** Bcrypt.js (Cifrado de contraseñas)
- **Frontend:** HTML5, JavaScript Vanilla y Pico.css (UI Moderna)
- **Infraestructura:** Docker & Docker Compose

---

## 🛠️ Instalación y Ejecución

### Opción A: Con Docker (Recomendado)
Levanta todo el entorno con un solo comando:
```bash
docker-compose up --build

### Opción B: Ejecución Local
Entra en la carpeta backend/ y ejecuta: npm install
Inicia el servidor: node app.js
Abre http://localhost:3000 en tu navegador.
📋 Funcionalidades

Usuarios: Registro y Login seguro con contraseñas hasheadas.
Ventas: Formulario para publicar productos con validación de precio.
Compras: Sistema de adquisición de productos en tiempo real.
Historial: Sección "Mis Compras" con detalles de fecha y precio.
Diseño: Interfaz profesional, responsive y minimalista.
🛡️ Seguridad (Survival Checklist)

Este proyecto ha sido blindado contra ataques comunes para la auditoría:
SQL Injection: Uso de Prepared Statements (?) en todas las consultas.
Password Hashing: Uso de Bcrypt (10 salt rounds) para proteger credenciales.
XSS Protection: Sanitización de entradas de usuario antes de renderizar en el DOM.
Validación: Control de precios negativos y campos vacíos en el Backend.
📂 Estructura
/backend: Servidor API, lógica de negocio y base de datos.
/frontend: Interfaz de usuario (HTML, CSS, JS).
docker-compose.yml: Configuración para despliegue en contenedores.
