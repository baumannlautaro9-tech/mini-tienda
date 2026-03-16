const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json()); // Para que el servidor entienda JSON
app.use(cors());         // Para que el frontend pueda comunicarse con el backend

// --- 1. CONFIGURACIÓN DE LA BASE DE DATOS ---
const db = new sqlite3.Database('./tienda.db', (err) => {
    if (err) console.error("Error al abrir BD:", err.message);
    else console.log("Conectado a SQLite: tienda.db");
});

// Crear las tablas si no existen
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendedor_id INTEGER,
        nombre TEXT,
        precio REAL,
        FOREIGN KEY(vendedor_id) REFERENCES usuarios(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comprador_id INTEGER,
    producto_id INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(comprador_id) REFERENCES usuarios(id),
    FOREIGN KEY(producto_id) REFERENCES productos(id)
    )`);
});
// Servir archivos estáticos de la carpeta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para servir el index.html cuando entres a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- 2. RUTAS DE AUTENTICACIÓN ---

// Registro
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO usuarios (username, password) VALUES (?, ?)`;
        
        db.run(sql, [username, hashedPassword], function(err) {
            if (err) return res.status(400).json({ error: "El usuario ya existe" });
            res.json({ message: "Usuario registrado con éxito", id: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = `SELECT * FROM usuarios WHERE username = ?`;
    db.get(sql, [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Usuario no encontrado" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

        // Devolvemos el ID y el nombre (en producción usaríamos un Token JWT)
        res.json({ id: user.id, username: user.username, message: "Login correcto" });
    });
});

// --- 3. RUTAS DE LA TIENDA ---

// Listar todos los productos
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Crear un producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, vendedor_id } = req.body;

    // VALIDACIÓN BÁSICA (Seguridad)
    if (!nombre || precio <= 0) {
        return res.status(400).json({ error: "Datos de producto inválidos" });
    }

    const sql = `INSERT INTO productos (nombre, precio, vendedor_id) VALUES (?, ?, ?)`;
    db.run(sql, [nombre, precio, vendedor_id], function(err) {
        if (err) return res.status(500).json({ error: "Error al publicar producto" });
        res.json({ message: "Producto publicado", id: this.lastID });
    });
});

// ---  Comprar un producto ---
app.post('/api/comprar', (req, res) => {
    const { comprador_id, producto_id } = req.body;

    // Validación básica de seguridad
    if (!comprador_id || !producto_id) {
        return res.status(400).json({ error: "Faltan datos para la compra" });
    }

    const sql = `INSERT INTO ventas (comprador_id, producto_id) VALUES (?, ?)`;
    db.run(sql, [comprador_id, producto_id], function(err) {
        if (err) return res.status(500).json({ error: "Error al procesar la compra" });
        res.json({ message: "¡Compra realizada con éxito!", id: this.lastID });
    });
});
// Listar compras de un usuario específico
app.get('/api/compras/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // Usamos JOIN para traer el nombre y precio del producto desde la tabla productos
    const sql = `
        SELECT productos.nombre, productos.precio, ventas.fecha 
        FROM ventas 
        JOIN productos ON ventas.producto_id = productos.id 
        WHERE ventas.comprador_id = ?
        ORDER BY ventas.fecha DESC`;

    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- 4. ARRANCAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor funcionando en http://localhost:${PORT}`);
});