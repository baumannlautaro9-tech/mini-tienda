const API_URL = 'http://localhost:3000/api';
let userId = null;

// --- MEJORA: Renderizado de tarjetas de producto ---
async function cargarProductos() {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    const contenedor = document.getElementById('lista-productos');
    contenedor.innerHTML = '';

    productos.forEach(p => {
        contenedor.innerHTML += `
            <article class="product-card">
                <header>${p.nombre.toUpperCase()}</header>
                <div style="text-align: center; padding: 1rem;">
                    <i class="fas fa-box-open fa-3x" style="color: #cbd5e1;"></i>
                    <div class="price-tag">${p.precio}€</div>
                    <small>Vendedor ID: #${p.vendedor_id}</small>
                </div>
                <footer>
                    <button onclick="comprar(${p.id})" class="w-100">
                        <i class="fas fa-cart-plus"></i> Comprar Ahora
                    </button>
                </footer>
            </article>
        `;
    });
}

// --- MEJORA: Interfaz de Login ---
async function login() {
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.id) {
        userId = data.id;
        document.getElementById('user-display').innerHTML = `<i class="fas fa-user"></i> ${data.username}`;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('store-section').style.display = 'block';
        
        cargarProductos();
        cargarMisCompras();
    } else {
        alert("❌ " + data.error);
    }
}

// --- El resto de funciones (register, comprar, cargarMisCompras) se mantienen igual ---
// Solo asegúrate de que cargarMisCompras use el ID 'lista-compras' que ya tienes.

async function register() {
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    alert(data.message || data.error);
}

async function crearProducto() {
    const nombre = document.getElementById('p-nombre').value;
    const precio = document.getElementById('p-precio').value;
    if(!nombre || precio <= 0) return alert("Datos inválidos");

    await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, vendedor_id: userId })
    });
    cargarProductos();
}

async function comprar(productoId) {
    const res = await fetch(`${API_URL}/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comprador_id: userId, producto_id: productoId })
    });
    const data = await res.json();
    alert("🎉 " + data.message);
    cargarMisCompras();
}

async function cargarMisCompras() {
    if (!userId) return;
    const res = await fetch(`${API_URL}/compras/${userId}`);
    const compras = await res.json();
    const contenedor = document.getElementById('lista-compras');
    contenedor.innerHTML = '';

    if (compras.length === 0) {
        contenedor.innerHTML = '<tr><td colspan="3">No has realizado compras aún.</td></tr>';
        return;
    }

    compras.forEach(c => {
        contenedor.innerHTML += `
            <tr>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.precio}€</td>
                <td><small>${new Date(c.fecha).toLocaleString()}</small></td>
            </tr>
        `;
    });
}

function logout() { location.reload(); }