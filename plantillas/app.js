// ============================
// CONFIGURACIÓN Y ESTADO
// ============================
const DB_KEY = 'glowSpaBookings';

let services = [];

// ============================
// CARGA DE DATOS
// ============================
async function loadServices() {
    try {
        const response = await fetch('/api/servicios');
        if (response.ok) {
            services = await response.json();
            console.log('Servicios sincronizados desde la API:', services.length);
        } else {
            console.error('Error al cargar servicios desde el servidor');
        }
    } catch (err) {
        console.error('Error de red al consultar la API de servicios:', err);
    }
}

let state = {
    serviceId: null,
    date: null,
    time: null,
    monthOffset: 0
};

let cachedBookings = [];

// ============================
// SERIALIZADOR - PERSISTENCIA EN SERVIDOR (archivo JSON en disco)
// ============================

// ============================
// CARGA Y CACHÉ
// ============================
async function loadGlobalBookings() {
    try {
        const bookings = await Serializador.leer(DB_KEY);
        // Eliminada la inyección de datos "mock" (defaultBookings) que interfería
        cachedBookings = bookings || [];
        console.log('Citas sincronizadas desde el servidor:', cachedBookings.length);
    } catch (err) {
        console.error('Error al cargar citas:', err);
        cachedBookings = [];
    }
}

function getGlobalBookings() {
    return cachedBookings;
}

async function saveBooking(booking) {
    const saved = await Serializador.crear(DB_KEY, booking);
    if (saved) {
        cachedBookings.push(saved);
        console.log('Cita guardada correctamente en data/glow_spa_citas.json');
    }
}

// ============================
// INICIALIZACIÓN
// ============================
document.addEventListener('DOMContentLoaded', async () => {
    Serializador.inicializar(DB_KEY, []);
    await loadGlobalBookings(); 
    await loadServices();

    if (document.getElementById('services-container')) {
        renderServices(); // Ahora inyectará los datos que llegaron del JSON
        renderCalendar();
        
        const btnBack = document.getElementById('btn-back');
        if (btnBack) btnBack.addEventListener('click', goBackToForm);
    }


    // Menú móvil (index.html)
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Sombra en navbar al hacer scroll (index.html)
    const nav = document.getElementById('navbar');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('shadow-md', window.scrollY > 20);
        });
    }

    // IntersectionObserver para animaciones fade-in-up (index.html)
    if (document.querySelector('.fade-in-up')) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.15 });

        document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
    }

    // Cerrar lightbox al hacer clic fuera de la imagen (index.html)
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
});

// ============================
// RENDERIZADO DE UI
// ============================

function renderServices() {
    const container = document.getElementById('services-container');
    if (!container) return;

    container.innerHTML = services.map(srv => `
        <div class="service-card border-2 border-gray-100 rounded-xl p-4 cursor-pointer hover:border-pink-300 hover:bg-pink-50 transition-all flex gap-4"
             onclick="selectService('${srv.id}')" id="card-${srv.id}">
            <div class="w-12 h-12 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                <i class="fas ${srv.icon} text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-800">${srv.name}</h4>
                <p class="text-xs text-gray-500 mt-1 line-clamp-2">${srv.desc}</p>
                <div class="flex flex-wrap gap-3 mt-2 text-sm font-medium">
                    <span class="text-pink-600 whitespace-nowrap"><i class="far fa-clock mr-1"></i>${srv.duration} min</span>
                    <span class="text-green-600 whitespace-nowrap"><i class="fas fa-tag mr-1"></i>$${srv.price.toLocaleString('es-CO')}</span>
                </div>
            </div>
        </div> <!-- ¡Este es el div que faltaba por cerrar! -->
    `).join('');
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month-year');
    if (!grid || !monthLabel) return;

    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + state.monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let html = '';
    for (let i = 0; i < firstDayIndex; i++) {
        html += `<div></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        let isPast = currentDate < todayDateOnly;
        let isSunday = currentDate.getDay() === 0;
        let classes = "calendar-day w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm transition-colors";

        if (isPast || isSunday) {
            classes += " disabled text-gray-400";
            html += `<div class="${classes}">${i}</div>`;
        } else {
            let isSelected = state.date === dateString;
            let clickClass = isSelected ? " selected" : " cursor-pointer hover:bg-pink-100 hover:text-pink-600";
            html += `<div class="${classes}${clickClass}" onclick="selectDate('${dateString}')">${i}</div>`;
        }
    }

    grid.innerHTML = html;
}

// ============================
// RENDERIZADO DE HORARIOS (Mejorado)
// ============================
// Se hace async para asegurar que tengamos los datos más recientes antes de pintar
async function renderTimeSlots() {
    const container = document.getElementById('time-slots-container');
    const errorMsg = document.getElementById('error-time');
    if (!container) return;
    if (errorMsg) errorMsg.classList.add('hidden');

    if (!state.date || !state.serviceId) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center p-4">
                <i class="far fa-clock text-3xl mb-2 opacity-50"></i>
                <p>Selecciona ${!state.serviceId ? 'un servicio y ' : ''}una fecha para ver los horarios disponibles.</p>
            </div>`;
        return;
    }
    
    container.innerHTML = '<div class="p-4 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Verificando disponibilidad...</div>';
    await loadGlobalBookings(); 

    const service = services.find(s => s.id === state.serviceId);
    const durationMins = service.duration;
    const openHour = 9;
    const closeHour = 18;
    const stepMins = 30;

    let availableSlotsHtml = '';
    let slotsFound = false;

    // Lógica de cálculo de ocupación utilizando la caché recién actualizada
    for (let h = openHour; h < closeHour; h++) {
        for (let m = 0; m < 60; m += stepMins) {
            let endH = h + Math.floor((m + durationMins) / 60);
            let endM = (m + durationMins) % 60;

            if (endH > closeHour || (endH === closeHour && endM > 0)) continue;

            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

            if (!isTimeSlotOccupied(state.date, timeStr, durationMins)) {
                slotsFound = true;
                let isSelected = state.time === timeStr;
                let btnClass = isSelected
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-400 hover:text-pink-600';

                const displayTime = formatAmPm(h, m);

                availableSlotsHtml += `
                    <button type="button" onclick="selectTime('${timeStr}')"
                        class="w-full mb-2 py-2 px-4 rounded-lg font-medium transition-all text-left flex justify-between items-center ${btnClass}">
                        <span><i class="far fa-clock mr-2 opacity-70"></i>${displayTime}</span>
                        ${isSelected ? '<i class="fas fa-check-circle"></i>' : ''}
                    </button>
                `;
            }
        }
    }

    if (!slotsFound) {
        container.innerHTML = `
            <div class="p-4 text-center bg-red-50 text-red-600 rounded-xl">
                <i class="fas fa-calendar-times mb-2 text-2xl"></i>
                <p class="text-sm">No hay disponibilidad para este servicio en la fecha seleccionada. Intenta otro día.</p>
            </div>`;
    } else {
        container.innerHTML = availableSlotsHtml;
    }
}

// ============================
// LÓGICA DE NEGOCIO
// ============================

function isTimeSlotOccupied(dateStr, timeStr, durationMins) {
    const bookings = getGlobalBookings();
    const startMins = timeToMinutes(timeStr);
    const endMins = startMins + durationMins;

    const bookingsOnDate = bookings.filter(b => b.date === dateStr);
    for (let b of bookingsOnDate) {
        let bStart = timeToMinutes(b.time);
        // Obtener la duración real desde el catálogo de servicios (no está en la cita)
        const bookingService = services.find(s => s.id === b.serviceId);
        const bookingDuration = bookingService ? bookingService.duration : 0;
        let bEnd = bStart + bookingDuration;
        if (startMins < bEnd && endMins > bStart) return true;
    }
    return false;
}

// ============================
// INTERACCIONES (Modificadas por renderTimeSlots async)
// ============================
function selectService(id) {
    state.serviceId = id;
    state.time = null;

    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('border-pink-500', 'bg-pink-50', 'ring-2', 'ring-pink-200');
        card.classList.add('border-gray-100');
    });
    const selectedCard = document.getElementById(`card-${id}`);
    if (selectedCard) {
        selectedCard.classList.remove('border-gray-100');
        selectedCard.classList.add('border-pink-500', 'bg-pink-50', 'ring-2', 'ring-pink-200');
    }

    const errEl = document.getElementById('error-service');
    if (errEl) errEl.classList.add('hidden');
    renderTimeSlots(); // Ahora es async, pero no importa si no la 'await'amos aquí porque actualiza el DOM
}

function selectDate(dateStr) {
    state.date = dateStr;
    state.time = null;
    const errEl = document.getElementById('error-date');
    if (errEl) errEl.classList.add('hidden');
    renderCalendar();
    renderTimeSlots(); // Refresca horarios desde el servidor
}

function selectTime(timeStr) {
    state.time = timeStr;
    const errEl = document.getElementById('error-time');
    if (errEl) errEl.classList.add('hidden');
    renderTimeSlots();
}

// ============================
// UTILIDADES
// ============================

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function formatAmPm(hours, minutes) {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m} ${ampm}`;
}

function formatDateToDisplay(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ============================
// FLUJO DE NAVEGACIÓN Y PAGOS
// ============================

function showReceipt() {
    let valid = true;
    if (!state.serviceId) {
        const el = document.getElementById('error-service');
        if (el) el.classList.remove('hidden');
        valid = false;
    }
    if (!state.date) {
        const el = document.getElementById('error-date');
        if (el) el.classList.remove('hidden');
        valid = false;
    }
    if (!state.time) {
        const el = document.getElementById('error-time');
        if (el) el.classList.remove('hidden');
        valid = false;
    }

    const name = document.getElementById('client-name')?.value.trim();
    const phone = document.getElementById('client-phone')?.value.trim();

    if (!valid || !name || !phone) {
        if (valid) alert("Por favor completa tus datos personales.");
        return;
    }

    const service = services.find(s => s.id === state.serviceId);
    const now = new Date();

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    setText('receipt-date-gen', `Emitido: ${now.toLocaleString('es-CO')}`);
    setText('r-name', name);
    setText('r-phone', phone);
    setText('r-service-name', service.name);
    setText('r-price', `$${service.price.toLocaleString('es-CO')}`);
    setText('r-duration', String(service.duration));
    setText('r-appointment-date', formatDateToDisplay(state.date).toUpperCase());

    const [h, m] = state.time.split(':').map(Number);
    setText('r-appointment-time', formatAmPm(h, m));
    setText('r-total', `$${service.price.toLocaleString('es-CO')}`);

    switchView('view-receipt');
    const btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.classList.remove('hidden');
}



// === NUEVA FUNCIÓN processPayment() (Frontend) ===
async function processPayment() {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');

    try {
        // Solo enviamos IDs y datos del formulario. El servidor calcula precios y duraciones.
        const newBookingData = {
            serviceId: state.serviceId,
            date: state.date,
            time: state.time,
            clientName: document.getElementById('client-name')?.value.trim() || '',
            clientPhone: document.getElementById('client-phone')?.value.trim() || '',
            notes: document.getElementById('client-notes')?.value.trim() || ''
        };

        // Delegar directamente al serializador y capturar la respuesta
        const response = await Serializador.crear(DB_KEY, newBookingData);

        overlay.classList.add('hidden');
        overlay.classList.remove('flex');

        // Manejo de errores de validación del servidor (Ej: horario ocupado)
        if (response && response.error) {
            alert("No se pudo confirmar la cita: " + response.error);
            // Recargar citas desde el servidor para actualizar disponibilidad visual
            await loadGlobalBookings();
            renderTimeSlots(); 
            return; // Detener flujo, no ir a 'éxito'
        }

        // Si fue exitoso, agregamos a la caché local el objeto completo devuelto por el backend
        if (response && response.id) {
            cachedBookings.push(response);
        }

        switchView('view-success');
        const btnBack = document.getElementById('btn-back');
        if (btnBack) btnBack.classList.add('hidden');

    } catch (error) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        alert("Ocurrió un error inesperado al conectar con el servidor.");
        console.error(error);
    }
}

function goBackToForm() {
    switchView('view-booking');
    const btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.classList.add('hidden');
}

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
}

function resetApp() {
    state.serviceId = null;
    state.date = null;
    state.time = null;

    const form = document.getElementById('booking-form');
    if (form) form.reset();
    renderServices();
    renderCalendar();
    renderTimeSlots();
    switchView('view-booking');
}

// ============================
// LIGHTBOX (Galería - index.html)
// ============================

function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightbox || !lightboxImg) return;

    const img = element.querySelector('img');
    if (!img) return;
    lightboxImg.src = img.src.replace('&w=500', '&w=1200');

    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');

    setTimeout(() => {
        lightbox.classList.remove('opacity-0');
        lightbox.classList.add('opacity-100');
    }, 10);

    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('opacity-100');
    lightbox.classList.add('opacity-0');

    setTimeout(() => {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }, 300);
}
