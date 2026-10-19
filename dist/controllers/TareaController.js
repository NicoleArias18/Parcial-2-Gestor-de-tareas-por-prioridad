//CRUD DE TAREA, ORDENAR por ingreso, FILTRAR
import { diasHastaFecha } from '../models/Tarea.js';
export class TareaController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.criterioOrden = 'fecha';
        this.init();
    }
    init() {
        this.view.bindFormularioSubmit(this.handleSubmitForm.bind(this));
        this.view.bindAccionesTarea(this.handleCompletarTarea.bind(this), this.handleEditarTarea.bind(this), this.handleDelete.bind(this));
        this.view.bindFiltrosYOrden(this.handleFiltrar.bind(this), this.handleSort.bind(this));
        this.view.bindBusqueda(this.handleFiltrar.bind(this));
        this.view.bindSubtareas(this.handleToggleSubTarea.bind(this), this.handleAgregarSubTarea.bind(this));
        this.view.bindActivarAvisos(this.handleActivarAvisos.bind(this));
        this.refreshView();
        if ("Notification" in window && Notification.permission === "granted") {
            this.enviarNotificacionesNavegador();
        }
    }
    handleSubmitForm(idStr, titulo, prioridad, categoria, fechaLimite) {
        this.view.limpiarMensaje();
        if (!titulo) {
            this.view.mostrarMensaje('El título no puede quedar vacío.');
            return;
        }
        if (!fechaLimite) {
            this.view.mostrarMensaje('Debes elegir una fecha límite.');
            return;
        }
        const idEdicion = idStr ? parseInt(idStr, 10) : undefined;
        if (this.model.tituloDuplicado(titulo, idEdicion)) {
            this.view.mostrarMensaje('Ya existe una tarea con ese título. Escribe uno diferente.');
            return;
        }
        if (idStr && idEdicion !== undefined) {
            this.handleUpdate(idEdicion, { titulo, prioridad, categoria, fechaLimite });
            this.view.clearForm();
            this.view.mostrarMensaje('La tarea se actualizó correctamente.', 'ok');
        }
        else {
            this.model.agregarTarea(titulo, prioridad, categoria, fechaLimite);
            this.refreshView();
            this.view.clearForm();
            this.view.mostrarMensaje('La tarea se registró correctamente.', 'ok');
        }
        if ("Notification" in window && Notification.permission === "granted") {
            this.enviarNotificacionesNavegador();
        }
    }
    handleUpdate(id, datos) {
        this.model.updateTarea(id, datos);
        this.refreshView();
    }
    handleDelete(id) {
        this.model.deleteTarea(id);
        this.refreshView();
    }
    handleSort(criterio) {
        this.criterioOrden = criterio;
        this.refreshView();
    }
    handleEditarTarea(id) {
        const tareas = this.model.obtenerTodasLasTareas();
        const tarea = tareas.find(t => t.id === id);
        if (tarea) {
            this.view.cargarDatosEnFormulario(tarea);
        }
    }
    handleCompletarTarea(id) {
        this.model.cambiarEstadoTarea(id);
        this.refreshView();
    }
    handleFiltrar() {
        this.refreshView();
    }
    handleAgregarSubTarea(tareaId, titulo) {
        this.model.agregarSubTarea(tareaId, titulo);
        this.refreshView();
    }
    handleToggleSubTarea(tareaId, subId) {
        this.model.toggleSubTarea(tareaId, subId);
        this.refreshView();
    }
    refreshView() {
        const { prioridad, categoria, estado, busqueda } = this.view.getFiltrosValues();
        const filtradas = this.model.filtrarTareas(prioridad, categoria, estado, busqueda);
        const tareas = this.model.ordenarTareas(this.criterioOrden, filtradas);
        this.view.rederizarTareas(tareas);
        this.view.renderContadores(this.model.getContadorPorPrioridad());
        this.view.renderAvisosVencimiento(this.model.getTareasProximas(2), this.model.getTareasVencidas());
        this.view.actualizarBotonAvisos();
    }
    handleActivarAvisos() {
        if (!("Notification" in window)) {
            alert('Este navegador no soporta notificaciones.');
            return;
        }
        if (Notification.permission === "denied") {
            alert('Chrome bloqueó los avisos para esta página. En la barra de dirección, da clic al candado (o al icono de información), entra a Permisos / Notificaciones y elige Permitir. Luego recarga.');
            this.view.actualizarBotonAvisos();
            return;
        }
        Notification.requestPermission().then(permission => {
            this.view.actualizarBotonAvisos();
            if (permission === "granted") {
                this.enviarNotificacionesNavegador();
            }
        });
    }
    enviarNotificacionesNavegador() {
        if (!("Notification" in window) || Notification.permission !== "granted")
            return;
        const proximas = this.model.getTareasProximas(2);
        const vencidas = this.model.getTareasVencidas();
        const avisos = [...proximas, ...vencidas].slice(0, 5);
        avisos.forEach(t => {
            const dias = diasHastaFecha(t.fechaLimite);
            let cuando = `el ${t.fechaLimite}`;
            if (dias === 0)
                cuando = "hoy";
            else if (dias === 1)
                cuando = "mañana";
            else if (dias !== null && dias > 1)
                cuando = `en ${dias} días`;
            else if (dias !== null && dias < 0)
                cuando = "y ya está vencida";
            new Notification("Aviso de tarea", {
                body: `La tarea "${t.titulo}" vence ${cuando}.`,
                tag: `tarea-${t.id}`
            });
        });
    }
}
