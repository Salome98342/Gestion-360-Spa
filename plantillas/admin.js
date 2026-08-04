const API_CITAS = '/api/citas';
const API_SERVICIOS = '/api/servicios';

let adminServices = [];
let allCitas = [];
let currentFilter = 'future';

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await cargarServicios(); 
    await cargarCitas();     
    setInterval(cargarCitas, 5000); 
});

// ==========================================
// FILTROS Y UI
// ==========================================
function setFilter(filterType) {
    currentFilter = filterType;
    
    const btnFuture = document.getElementById('btn-tab-future');
    const btnPast = document.getElementById('btn-tab-past');
    
    if (filterType === 'future') {
        btnFuture.className = "px-4 py-1.5 text-sm font-semibold bg-white shadow-sm rounded-md text-gray-800 transition-all";
        btnPast.className = "px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-md transition-all";
    } else {
        btnPast.className = "px-4 py-1.5 text-sm font-semibold bg-white shadow-sm rounded-md text-gray-800 transition-all";
        btnFuture.className = "px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-md transition-all";
    }
    
    renderizarCitas(allCitas);
}

// ==========================================
// MÓDULO DE CITAS (CON WHATSAPP MEJORADO)
// ==========================================
async function cargarCitas() {
    try {
        const res = await fetch(API_CITAS);
        if (res.status === 401) return;
        allCitas = await res.json();
        renderizarCitas(allCitas);
    } catch (err) {
        console.error("Error cargando citas:", err);
    }
}

function renderizarCitas(citas) {
    const tbody = document.getElementById('citas-tbody');
    const now = new Date();
    
    const citasFiltradas = citas.filter(cita => {
        const citaDate = new Date(`${cita.date}T${cita.time}`);
        return currentFilter === 'future' ? citaDate >= now : citaDate < now;
    });
    
    citasFiltradas.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return currentFilter === 'future' ? dateA - dateB : dateB - dateA;
    });

    if (citasFiltradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-400 font-medium">No hay citas en esta categoría.</td></tr>`;
        return;
    }

    tbody.innerHTML = citasFiltradas.map(cita => {
        const srv = adminServices.find(s => s.id === cita.serviceId);
        const srvName = srv ? srv.name : 'Servicio Desconocido';
        const notasHTML = cita.notes ? `<div class="text-xs text-gray-400 mt-1 italic w-48 truncate" title="${cita.notes}">"${cita.notes}"</div>` : '';
        const opacityClass = currentFilter === 'past' ? 'opacity-70' : '';

        // Construcción dinámica del mensaje de WhatsApp
        const phone = cita.clientPhone.replace(/\D/g,'');
        const mensajePredefinido = `¡Hola ${cita.clientName}! ❀ Te escribimos de Glow Spa para confirmar tu cita.\n\n★ Fecha: ${cita.date}\n★ Hora: ${cita.time}\n★ Servicio: ${srvName}\n\n¡Te esperamos para consentirte!`;
        const waLink = `https://wa.me/57${phone}?text=${encodeURIComponent(mensajePredefinido)}`;

        return `
        <tr class="hover:bg-pink-50/50 transition-colors group ${opacityClass}">
            <td class="p-4">
                <div class="font-bold text-gray-800">${cita.date}</div>
                <div class="text-xs text-pink-600 font-semibold bg-pink-100 inline-block px-2 py-0.5 rounded mt-1">${cita.time}</div>
            </td>
            <td class="p-4">
                <div class="font-medium text-gray-700">${cita.clientName}</div>
                ${notasHTML}
            </td>
            <td class="p-4">
                <a href="${waLink}" target="_blank" class="text-green-600 hover:text-green-700 hover:underline inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md transition-colors" title="Confirmar por WhatsApp">
                    <i class="fab fa-whatsapp text-lg"></i> Confirmar
                </a>
            </td>
            <td class="p-4 text-gray-600 font-medium">${srvName}</td>
            <td class="p-4 text-center">
                <button onclick="eliminarCita('${cita.id}')" class="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Eliminar Cita">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `}).join('');
}

async function eliminarCita(id) {
    if(!confirm('⚠️ ¿Confirmas que deseas cancelar y eliminar esta cita del sistema?')) return;
    try {
        await fetch(`${API_CITAS}/${id}`, { method: 'DELETE' });
        cargarCitas();
    } catch (err) {
        alert("Error al eliminar la cita");
    }
}

// ==========================================
// MÓDULO DE SERVICIOS (CON EDICIÓN)
// ==========================================
async function cargarServicios() {
    try {
        const res = await fetch(API_SERVICIOS);
        adminServices = await res.json();
        
        const lista = document.getElementById('servicios-lista');
        lista.innerHTML = adminServices.map(s => `
            <li class="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow transition-shadow">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                        <i class="fas ${s.icon}"></i>
                    </div>
                    <div>
                        <div class="font-medium text-gray-800">${s.name}</div>
                        <div class="text-xs text-gray-400 font-mono mt-0.5">$${s.price.toLocaleString()} • ${s.duration}min</div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="editarServicio('${s.id}')" class="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded hover:bg-blue-50" title="Editar Servicio">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarServicio('${s.id}')" class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-50" title="Eliminar Servicio">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </li>
        `).join('');
    } catch (err) {
        console.error("Error cargando servicios:", err);
    }
}

function editarServicio(id) {
    const srv = adminServices.find(s => s.id === id);
    if (!srv) return;
    
    // Poblar el formulario
    document.getElementById('srv-id').value = srv.id;
    document.getElementById('srv-name').value = srv.name;
    document.getElementById('srv-duration').value = srv.duration;
    document.getElementById('srv-price').value = srv.price;
    document.getElementById('srv-icon').value = srv.icon;
    document.getElementById('srv-desc').value = srv.desc || '';
    
    // Cambiar apariencia a "Modo Edición"
    const btnSubmit = document.getElementById('btn-submit-srv');
    btnSubmit.innerText = 'Actualizar Servicio';
    btnSubmit.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md';
    document.getElementById('btn-cancel-srv').classList.remove('hidden');
    
    // Scroll hacia el formulario
    document.getElementById('form-servicio').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicion() {
    document.getElementById('form-servicio').reset();
    document.getElementById('srv-id').value = '';
    
    // Restaurar apariencia a "Modo Creación"
    const btnSubmit = document.getElementById('btn-submit-srv');
    btnSubmit.innerText = 'Guardar Servicio';
    btnSubmit.className = 'w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md';
    document.getElementById('btn-cancel-srv').classList.add('hidden');
}

document.getElementById('form-servicio').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const idEdicion = document.getElementById('srv-id').value;
    const datosSrv = {
        name: document.getElementById('srv-name').value,
        duration: parseInt(document.getElementById('srv-duration').value),
        price: parseInt(document.getElementById('srv-price').value),
        icon: document.getElementById('srv-icon').value,
        desc: document.getElementById('srv-desc').value
    };

    try {
        let res;
        if (idEdicion) {
            // Modo Edición: usar PUT
            res = await fetch(`${API_SERVICIOS}/${idEdicion}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosSrv)
            });
        } else {
            // Modo Creación: usar POST
            res = await fetch(API_SERVICIOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosSrv)
            });
        }

        if (res.ok) {
            cancelarEdicion();
            cargarServicios(); 
        }
    } catch (err) {
        alert('Error al guardar el servicio. Revisa tu conexión.');
    }
});

async function eliminarServicio(id) {
    if(!confirm('⚠️ ¿Estás seguro de eliminar este servicio del catálogo público?')) return;
    try {
        await fetch(`${API_SERVICIOS}/${id}`, { method: 'DELETE' });
        cargarServicios();
    } catch (err) {
        alert("Error al eliminar el servicio");
    }
}