// Tarea (id, título, prioridad, completada, fecha)
//Molde de Tarea
import { StorageService } from "../services/StorageService.js";
// Fecha local con estructura YYYY-MM-DD
export function obtenerFechaLocalISO(fecha = new Date()) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
/** Días entre hoy y la fecha límite: negativo = ya venció, 0 = hoy, 1 = mañana. */
export function diasHastaFecha(fechaLimite) {
    if (!fechaLimite)
        return null;
    const hoy = new Date(obtenerFechaLocalISO() + 'T00:00:00');
    const limite = new Date(fechaLimite + 'T00:00:00');
    if (Number.isNaN(limite.getTime()))
        return null;
    return Math.round((limite.getTime() - hoy.getTime()) / 86400000);
}
export class TareaModel {
    constructor() {
        this.tareas = [];
        this.currentId = 1;
        //Cuando se inicia el modelo, se cargan las tareas guardadas en localStorage
        this.tareas = StorageService.obtenerTareas();
        this.currentId = this.tareas.length > 0 ? Math.max(...this.tareas.map(t => t.id)) + 1 : 1;
    }
    //Regla de negocio: Agregar tarea
    agregarTarea(titulo, prioridad, categoria, fechaLimite) {
        const nuevaTarea = {
            id: this.currentId++,
            titulo,
            prioridad,
            categoria,
            fechaLimite,
            completada: false,
            fecha: new Date().toLocaleDateString(),
            subtareas: []
        };
        this.tareas.push(nuevaTarea);
        this.sincronizarStorage();
        return nuevaTarea;
    }
    // Regla de negocio: Obtener todas las tareas
    obtenerTodasLasTareas() {
        return this.tareas;
    }
    // Regla de negocio: Editar tareas existentes(RF-02)
    updateTarea(id, datosActualizados) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            Object.assign(tarea, datosActualizados);
            this.sincronizarStorage();
            return tarea;
        }
        return null;
    }
    // Regla de negocio: Eliminar tarea(RF-03)
    deleteTarea(id) {
        this.tareas = this.tareas.filter(t => t.id !== id);
        this.sincronizarStorage();
    }
    //Regla de negocio: Cambiar estado completada | pendiente
    cambiarEstadoTarea(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = !tarea.completada;
            this.sincronizarStorage();
        }
    }
    // Regla de negocios: Tareas vencidas(RF-09)
    getTareasVencidas() {
        return this.tareas.filter(t => {
            const dias = diasHastaFecha(t.fechaLimite);
            return !t.completada && dias !== null && dias < 0;
        });
    }
    // Tareas que vencen hoy o en los próximos `diasMax` días (pendientes)
    getTareasProximas(diasMax = 2) {
        return this.tareas.filter(t => {
            const dias = diasHastaFecha(t.fechaLimite);
            return !t.completada && dias !== null && dias >= 0 && dias <= diasMax;
        });
    }
    //Regla de negocio: Contador por prioridad(RF-07)
    getContadorPorPrioridad() {
        return this.tareas.reduce((acc, t) => {
            if (!t.completada) {
                acc[t.prioridad]++;
            }
            return acc;
        }, { alta: 0, media: 0, baja: 0 });
    }
    // Regla de negocio: Ordenar tareas por prioridad, fecha límite o titulo(RF-05)
    ordenarTareas(criterio, lista) {
        const tareasCopia = [...(lista ?? this.tareas)];
        if (criterio === 'fecha') {
            return tareasCopia.sort((a, b) => {
                if (!a.fechaLimite)
                    return 1;
                if (!b.fechaLimite)
                    return -1;
                return a.fechaLimite.localeCompare(b.fechaLimite);
            });
        }
        if (criterio === 'prioridad') {
            const valorPrioridad = { alta: 3, media: 2, baja: 1 };
            return tareasCopia.sort((a, b) => valorPrioridad[b.prioridad] - valorPrioridad[a.prioridad]);
        }
        if (criterio === 'titulo') {
            return tareasCopia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));
        }
        return tareasCopia;
    }
    // Evita registrar dos veces el mismo título (sin importar mayúsculas)
    tituloDuplicado(titulo, idIgnorar) {
        const normalizado = titulo.trim().toLowerCase();
        return this.tareas.some(t => t.id !== idIgnorar && t.titulo.trim().toLowerCase() === normalizado);
    }
    //Regla de negocio: Filtrar por texto, prioridad, categoria y estado
    filtrarTareas(filtroPrioridad, filtroCategoria, filtroEstado, busqueda) {
        const texto = (busqueda ?? '').trim().toLowerCase();
        return this.tareas.filter(tarea => {
            const esPorTexto = !texto || tarea.titulo.toLowerCase().includes(texto);
            const esPorPrioridad = !filtroPrioridad || filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad;
            const esPorCategoria = !filtroCategoria || filtroCategoria === 'todas' || tarea.categoria === filtroCategoria;
            let esPorEstado = true;
            if (filtroEstado === 'completadas') {
                esPorEstado = tarea.completada === true;
            }
            else if (filtroEstado === 'pendientes') {
                esPorEstado = tarea.completada === false;
            }
            return esPorTexto && esPorPrioridad && esPorCategoria && esPorEstado;
        });
    }
    // Regla de negocio: Agregar Sub-tareas(RF-08)
    agregarSubTarea(tareaId, titulo) {
        const tarea = this.tareas.find(t => t.id === tareaId);
        const texto = titulo.trim();
        if (!tarea || !texto)
            return;
        if (!tarea.subtareas)
            tarea.subtareas = [];
        const nextId = tarea.subtareas.length > 0 ? Math.max(...tarea.subtareas.map(s => s.id)) + 1 : 1;
        tarea.subtareas.push({ id: nextId, titulo: texto, completada: false });
        this.sincronizarStorage();
    }
    toggleSubTarea(tareaId, subId) {
        const tarea = this.tareas.find(t => t.id === tareaId);
        const sub = tarea?.subtareas?.find(s => s.id === subId);
        if (sub) {
            sub.completada = !sub.completada;
            this.sincronizarStorage();
        }
    }
    sincronizarStorage() {
        StorageService.guardarTareas(this.tareas);
    }
}
