require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'glow_spa_citas.json');
const SERVICES_FILE = path.join(DATA_DIR, 'glow_spa_servicios.json');

app.use(express.json());

// =============================================
// 1. INICIALIZACIÓN DE DATOS
// =============================================
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
if (!fs.existsSync(SERVICES_FILE)) {
    const defaultServices = [{ id: 's1', name: 'Manicura Tradicional', duration: 30, price: 25000, icon: 'fa-hand-sparkles', desc: 'Limpieza básica.' }];
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(defaultServices, null, 2), 'utf-8');
}

// =============================================
// 2. MUTEX (Evitar Condiciones de Carrera)
// =============================================
let isWriting = false;
const writeQueue = [];

const safeWriteFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
        writeQueue.push(async () => {
            try {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                resolve();
            } catch (e) {
                reject(e);
            }
        });
        processQueue();
    });
};

const processQueue = async () => {
    if (isWriting || writeQueue.length === 0) return;
    isWriting = true;
    const task = writeQueue.shift();
    await task();
    isWriting = false;
    processQueue();
};

// =============================================
// 3. SEGURIDAD: Sanitización y Lista Blanca
// =============================================
const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
};

const validateBooking = (data) => {
    const allowedKeys = ['serviceId', 'date', 'time', 'clientName', 'clientPhone', 'notes', 'id'];
    const cleanData = {};
    for (let key of allowedKeys) {
        if (data[key] !== undefined && data[key] !== null) {
            cleanData[key] = escapeHTML(String(data[key]).trim());
        }
    }
    return cleanData;
};

const validateService = (data) => {
    const allowedKeys = ['name', 'duration', 'price', 'icon', 'desc', 'id'];
    const cleanData = {};
    for (let key of allowedKeys) {
        if (data[key] !== undefined && data[key] !== null) {
            cleanData[key] = key === 'duration' || key === 'price' ? Number(data[key]) : escapeHTML(String(data[key]).trim());
        }
    }
    return cleanData;
};

// =============================================
// 4. SEGURIDAD: Rate Limiter Básico en Memoria
// =============================================
const ipRequests = new Map();
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 60000; // 1 minuto
    
    if (!ipRequests.has(ip)) {
        ipRequests.set(ip, { count: 1, firstTime: now });
        return next();
    }
    
    const record = ipRequests.get(ip);
    if (now - record.firstTime > windowMs) {
        record.count = 1;
        record.firstTime = now;
        return next();
    }
    
    record.count++;
    if (record.count > 15) { // Máximo 15 peticiones por minuto por IP
        return res.status(429).json({ error: 'Demasiadas peticiones. Intenta en un minuto.' });
    }
    next();
};

// =============================================
// 5. SEGURIDAD: Middlewares de Rutas
// =============================================
// Bloquear acceso a archivos sensibles y dotfiles (.env, .git, etc)
app.use((req, res, next) => {
    const normalizedPath = path.normalize(req.path);
    if (normalizedPath.includes('/data/') || normalizedPath.includes('.js') && normalizedPath === '/server.js' || normalizedPath.match(/\/\./)) {
        return res.status(403).send('Acceso denegado a recursos internos.');
    }
    next();
});

const authMiddleware = (req, res, next) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;

    if (!envUser || !envPass) {
        console.error("ADVERTENCIA: Credenciales de admin no configuradas en el .env");
        return res.status(500).send('Error interno del servidor.');
    }

    if (login === envUser && password === envPass) {
        return next();
    }
    
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Autenticación requerida.');
};

app.use('/admin', authMiddleware, express.static(path.join(__dirname, 'admin')));
app.use(express.static(__dirname));

// =============================================
// ENDPOINTS DE CITAS
// =============================================
app.get('/api/citas', (req, res) => {
    try {
        res.json(JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')));
    } catch (err) {
        res.status(500).json({ error: 'Error de lectura' });
    }
});

// Aplicamos Rate Limiter al POST para evitar ataques de spam de reservas
app.post('/api/citas', rateLimiter, async (req, res) => {
    try {
        const nuevaCita = validateBooking(req.body);
        
        // Validación básica de campos requeridos
        if (!nuevaCita.serviceId || !nuevaCita.date || !nuevaCita.time || !nuevaCita.clientName) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        
        if (!nuevaCita.id) nuevaCita.id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

        const citas = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        
        // Prevenir doble reserva en el mismo horario (Validación Backend)
        const isOccupied = citas.some(c => c.date === nuevaCita.date && c.time === nuevaCita.time && c.serviceId === nuevaCita.serviceId);
        if (isOccupied) return res.status(409).json({ error: 'El horario ya fue reservado.' });

        citas.push(nuevaCita);
        await safeWriteFile(DB_FILE, citas);
        res.json(nuevaCita);
    } catch (err) {
        res.status(500).json({ error: 'Error guardando cita' });
    }
});

app.put('/api/citas/:id', authMiddleware, async (req, res) => {
    try {
        const datosActualizados = validateBooking(req.body);
        const citas = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        const index = citas.findIndex(c => c.id === req.params.id);
        
        if (index === -1) return res.status(404).json({ error: 'Cita no encontrada' });
        
        citas[index] = { ...citas[index], ...datosActualizados };
        await safeWriteFile(DB_FILE, citas);
        res.json(citas[index]);
    } catch (err) {
        res.status(500).json({ error: 'Error actualizando cita' });
    }
});

app.delete('/api/citas/:id', authMiddleware, async (req, res) => {
    try {
        const citas = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        const citasFiltradas = citas.filter(c => c.id !== req.params.id);
        
        await safeWriteFile(DB_FILE, citasFiltradas);
        res.json({ message: 'Eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error eliminando' });
    }
});

// =============================================
// ENDPOINTS DE SERVICIOS
// =============================================
app.get('/api/servicios', (req, res) => {
    try {
        res.json(JSON.parse(fs.readFileSync(SERVICES_FILE, 'utf-8')));
    } catch (err) {
        res.status(500).json({ error: 'Error de lectura' });
    }
});

// =============================================
// CREAR SERVICIO (PUT)
// =============================================

app.post('/api/servicios', authMiddleware, async (req, res) => {
    try {
        const nuevoServicio = validateService(req.body);
        if (!nuevoServicio.name || !nuevoServicio.price) return res.status(400).json({ error: 'Datos incompletos' });

        nuevoServicio.id = 's' + Date.now(); 
        
        const servicios = JSON.parse(fs.readFileSync(SERVICES_FILE, 'utf-8'));
        servicios.push(nuevoServicio);
        
        await safeWriteFile(SERVICES_FILE, servicios);
        res.json(nuevoServicio);
    } catch (err) {
        res.status(500).json({ error: 'Error guardando servicio' });
    }
});

// =============================================
// ELIMINAR SERVICIO (PUT)
// =============================================

app.delete('/api/servicios/:id', authMiddleware, async (req, res) => {
    try {
        const servicios = JSON.parse(fs.readFileSync(SERVICES_FILE, 'utf-8'));
        const serviciosFiltrados = servicios.filter(s => s.id !== req.params.id);
        
        await safeWriteFile(SERVICES_FILE, serviciosFiltrados);
        res.json({ message: 'Servicio eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error eliminando servicio' });
    }
});

// =============================================
// ACTUALIZAR SERVICIO (PUT)
// =============================================
app.put('/api/servicios/:id', authMiddleware, async (req, res) => {
    try {
        const datosActualizados = validateService(req.body);
        if (!datosActualizados.name || !datosActualizados.price) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        const servicios = JSON.parse(fs.readFileSync(SERVICES_FILE, 'utf-8'));
        const index = servicios.findIndex(s => s.id === req.params.id);
        
        if (index === -1) return res.status(404).json({ error: 'Servicio no encontrado' });
        
        // Mantenemos el ID original y actualizamos los demás campos
        servicios[index] = { ...servicios[index], ...datosActualizados, id: req.params.id };
        
        await safeWriteFile(SERVICES_FILE, servicios);
        res.json(servicios[index]);
    } catch (err) {
        res.status(500).json({ error: 'Error actualizando servicio' });
    }
});

// app.listen(PORT, () => console.log(`Servidor seguro activo en puerto ${PORT}`));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║     🌸 Glow Spa - Servidor Activo       ║
║──────────────────────────────────────────║
║  📁 Datos: data/glow_spa_citas.json      ║
║  🌐 URL:  http://localhost:${PORT}          ║
║  📄 Home: http://localhost:${PORT}/index.html ║
║  📅 Citas: http://localhost:${PORT}/agenda.html ║
╚══════════════════════════════════════════╝
    `);
});

