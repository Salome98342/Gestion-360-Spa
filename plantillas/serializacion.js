/**
 * serializacion.js
 * Serializador para Glow Spa - Guarda los datos en el servidor (archivo JSON en disco).
 * Las citas se almacenan automáticamente en data/glow_spa_citas.json mediante API REST.
 * NO requiere que el cliente descargue nada.
 */

const API_BASE = '/api/citas';

const Serializador = {
    /**
     * Inicializa la "base de datos" en el servidor.
     * El servidor maneja la inicialización del archivo JSON automáticamente.
     */
    inicializar: function(clave, datosIniciales = []) {
        console.log('Serializador listo. Usando servidor API en:', API_BASE);
    },

    /**
     * READ: Obtiene todas las citas desde el servidor.
     * @param {string} clave - Se ignora (el servidor usa un solo archivo)
     * @returns {Promise<Array>} Las citas guardadas
     */
    leer: async function(clave) {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) throw new Error('Error al obtener citas');
            return await response.json();
        } catch (err) {
            console.error('Error al leer citas del servidor:', err);
            return [];
        }
    },

    /**
     * CREATE: Envía una nueva cita al servidor para guardarla en disco.
     * @param {string} clave - Se ignora
     * @param {Object} nuevoDato - La cita a guardar
     * @returns {Promise<Object>} La cita guardada con su ID
     */
    crear: async function(clave, nuevoDato) {
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoDato)
            });

            if (!response.ok) {
                let errorMsg = 'Error al procesar la cita';
                try {
                    const errorData = await response.json();
                    if (errorData.error) errorMsg = errorData.error;
                } catch (e) { }
                
                console.warn('Rechazo del servidor:', errorMsg, 'Status:', response.status);
                // Retornar error estructurado
                return { error: errorMsg, status: response.status }; 
            }

            const saved = await response.json();
            return saved;
        } catch (err) {
            console.error('Error de red al crear cita:', err);
            return { error: 'No se pudo conectar con el servidor, revisa tu conexión.' };
        }
    },
    

    /**
     * UPDATE: Actualiza una cita existente en el servidor.
     * @param {string} clave - Se ignora
     * @param {string|number} id - ID de la cita
     * @param {Object} datosNuevos - Campos a actualizar
     * @returns {Promise<Object|null>} La cita actualizada o null
     */
    actualizar: async function(clave, id, datosNuevos) {
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosNuevos)
            });

            if (!response.ok) throw new Error('Error al actualizar cita');
            return await response.json();
        } catch (err) {
            console.error('Error al actualizar cita en servidor:', err);
            return null;
        }
    },

    /**
     * DELETE: Elimina una cita del servidor.
     * @param {string} clave - Se ignora
     * @param {string|number} id - ID de la cita a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    borrar: async function(clave, id) {
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar cita');
            console.log('Cita eliminada:', id);
            return true;
        } catch (err) {
            console.error('Error al borrar cita en servidor:', err);
            return false;
        }
    },

    /**
     * EXPORT: Descarga un archivo JSON con todas las citas (solo para administradores).
     * Esta función NO se llama automáticamente durante el proceso de reserva.
     * @param {string} clave - Se ignora
     * @param {string} nombreArchivo - Nombre sugerido para la descarga
     */
    exportarJSON: async function(clave, nombreArchivo = "citas_backup.json") {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) throw new Error('Error al obtener datos');

            const datos = await response.json();
            if (!datos || datos.length === 0) {
                alert("No hay citas para exportar.");
                return;
            }

            const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const enlace = document.createElement("a");
            enlace.href = url;
            enlace.download = nombreArchivo;
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error al exportar:', err);
            alert("Error al exportar los datos.");
        }
    }
};
