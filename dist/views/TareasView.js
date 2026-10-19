import { obtenerFechaLocalISO } from "../models/Tarea.js";
export class TareasView {
    constructor() {
        this.formTarea = document.getElementById('form-tarea');
        this.inputId = document.getElementById('tarea-id');
        this.titulo = document.getElementById('titulo');
        this.seleccionarPrioridad = document.getElementById('seleccionar-prioridad');
        this.seleccionarCategoria = document.getElementById('seleccionar-categoria');
        this.fechaLimite = document.getElementById('fecha-limite');
        this.btnSubmit = document.getElementById('btn-submit');
        this.mensajeFormulario = document.getElementById('mensaje-formulario');
        this.contenedorTareas = document.getElementById('contenedor-tareas');
        this.inputBusqueda = document.getElementById('buscar-tarea');
        this.seleccionarFiltroPrioridad = document.getElementById('filtrar-prioridad');
        this.seleccionarFiltroCategoria = document.getElementById('filtrar-categoria');
        this.seleccionarFiltroEstado = document.getElementById('filtrar-estado');
        this.seleccionarOrden = document.getElementById('ordenar-por');
        this.contadorAlta = document.getElementById('cnt-alta');
        this.contadorMedia = document.getElementById('cnt-media');
        this.contadorBaja = document.getElementById('cnt-baja');
        this.btnActivarAvisos = document.getElementById('btn-activar-avisos');
        this.panelAvisos = document.getElementById('panel-avisos');
    }
    clearForm() {
        this.formTarea.reset();
        if (this.inputId)
            this.inputId.value = '';
        if (this.btnSubmit)
            this.btnSubmit.textContent = 'Registrar Tarea';
    }
    cargarDatosEnFormulario(tarea) {
        if (this.inputId)
            this.inputId.value = tarea.id.toString();
        this.titulo.value = tarea.titulo;
        this.seleccionarPrioridad.value = tarea.prioridad;
        if (this.seleccionarCategoria)
            this.seleccionarCategoria.value = tarea.categoria;
        if (this.fechaLimite)
            this.fechaLimite.value = tarea.fechaLimite;
        if (this.btnSubmit)
            this.btnSubmit.textContent = 'Actualizar';
        this.limpiarMensaje();
    }
    mostrarMensaje(texto, tipo = 'error') {
        if (!this.mensajeFormulario)
            return;
        this.mensajeFormulario.textContent = texto;
        this.mensajeFormulario.className = `mensaje-formulario mensaje-${tipo}`;
    }
    limpiarMensaje() {
        if (!this.mensajeFormulario)
            return;
        this.mensajeFormulario.textContent = '';
        this.mensajeFormulario.className = 'mensaje-formulario';
    }
    bindActivarAvisos(handler) {
        if (this.btnActivarAvisos) {
            this.btnActivarAvisos.addEventListener('click', () => handler());
        }
    }
    actualizarBotonAvisos() {
        if (!this.btnActivarAvisos || !("Notification" in window)) {
            if (this.btnActivarAvisos)
                this.btnActivarAvisos.classList.add('oculto');
            return;
        }
        if (Notification.permission === "granted") {
            this.btnActivarAvisos.classList.add('oculto');
        }
        else if (Notification.permission === "denied") {
            this.btnActivarAvisos.classList.remove('oculto');
            this.btnActivarAvisos.textContent = 'Avisos bloqueados. Clic para ver cómo activarlos';
        }
        else {
            this.btnActivarAvisos.classList.remove('oculto');
            this.btnActivarAvisos.textContent = 'Activar avisos del navegador';
        }
    }
    renderAvisosVencimiento(proximas, vencidas) {
        if (!this.panelAvisos)
            return;
        const partes = [];
        if (proximas.length > 0) {
            const nombres = proximas.map(t => `${t.titulo} (${t.fechaLimite})`).join(', ');
            partes.push(`<div class="aviso-caja aviso-proxima">Tareas próximas a vencer: ${nombres}</div>`);
        }
        if (vencidas.length > 0) {
            const nombres = vencidas.map(t => `${t.titulo} (${t.fechaLimite})`).join(', ');
            partes.push(`<div class="aviso-caja aviso-vencida">Tareas vencidas: ${nombres}</div>`);
        }
        this.panelAvisos.innerHTML = partes.join('');
    }
    renderContadores(contadores) {
        if (this.contadorAlta)
            this.contadorAlta.textContent = contadores.alta.toString();
        if (this.contadorMedia)
            this.contadorMedia.textContent = contadores.media.toString();
        if (this.contadorBaja)
            this.contadorBaja.textContent = contadores.baja.toString();
    }
    renderBadgePrioridad(prioridad) {
        return `<span class="badge-prioridad badge-${prioridad}">${prioridad.toUpperCase()}</span>`;
    }
    renderAlertaVencida(esVencida) {
        return esVencida ? `<span class="alerta-vencida">VENCIDA</span>` : '';
    }
    rederizarTareas(tareas) {
        this.contenedorTareas.innerHTML = '';
        const hoy = obtenerFechaLocalISO();
        if (tareas.length === 0) {
            this.contenedorTareas.innerHTML = `<p class="mensaje-vacio">No hay tareas registradas.</p>`;
            return;
        }
        tareas.forEach(tarea => {
            const tarjeta = document.createElement('div');
            const esVencida = !tarea.completada && tarea.fechaLimite !== '' && tarea.fechaLimite < hoy;
            let prioridadClase = `prioridad-${tarea.prioridad}`;
            let vencidaClase = esVencida ? 'tarea-vencida' : '';
            tarjeta.className = `tarea-tarjeta ${prioridadClase} ${vencidaClase} ${tarea.completada ? 'completada' : ''}`;
            const listaSubtareas = (tarea.subtareas ?? []).map(sub => `
                <li class="${sub.completada ? 'subtarea-hecha' : ''}">
                  <label>
                    <input type="checkbox" class="chk-subtarea" data-id="${tarea.id}" data-sub-id="${sub.id}" ${sub.completada ? 'checked' : ''}>
                    ${sub.titulo}
                  </label>
                </li>
            `).join('');
            tarjeta.innerHTML = `
            <div class="tarea-info">
              <h3>${tarea.titulo} ${this.renderAlertaVencida(esVencida)}</h3>
              <p>
                Prioridad: ${this.renderBadgePrioridad(tarea.prioridad)} | 
                Categoría: <strong>${tarea.categoria || 'Sin Cat.'}</strong> | 
                Fecha Límite: <strong>${tarea.fechaLimite || 'Sin fecha'}</strong>
              </p>
              <div class="subtareas-bloque">
                <p class="subtareas-titulo">Sub-tareas</p>
                <ul class="lista-subtareas">${listaSubtareas || '<li class="sin-sub">Sin sub-tareas</li>'}</ul>
                <div class="subtarea-nueva">
                  <input type="text" class="input-subtarea" data-id="${tarea.id}" placeholder="Nueva sub-tarea...">
                  <button type="button" data-id="${tarea.id}" class="btn-add-subtarea">+</button>
                </div>
              </div>
            </div>

            <div class="tarea-acciones">
              <button data-id="${tarea.id}" class="btn-completar">
                ${tarea.completada ? 'Marcar Pendiente' : 'Completar'}
              </button>
              <button data-id="${tarea.id}" class="btn-editar">Editar</button>
              <button data-id="${tarea.id}" class="btn-eliminar">Eliminar</button>
            </div>
            `;
            this.contenedorTareas.appendChild(tarjeta);
        });
    }
    bindFormularioSubmit(handler) {
        this.formTarea.addEventListener('submit', event => {
            event.preventDefault();
            const id = this.inputId ? this.inputId.value : '';
            const titulo = this.titulo.value.trim();
            const prioridad = this.seleccionarPrioridad.value;
            const categoria = (this.seleccionarCategoria ? this.seleccionarCategoria.value : 'Otro');
            const fechaLimite = this.fechaLimite ? this.fechaLimite.value : '';
            handler(id, titulo, prioridad, categoria, fechaLimite);
        });
    }
    bindAccionesTarea(handlerCompletar, handlerEditar, handlerEliminar) {
        this.contenedorTareas.addEventListener('click', event => {
            const elemento = event.target;
            const idStr = elemento.getAttribute('data-id');
            if (!idStr)
                return;
            const id = parseInt(idStr, 10);
            if (elemento.classList.contains('btn-completar')) {
                handlerCompletar(id);
            }
            else if (elemento.classList.contains('btn-editar')) {
                handlerEditar(id);
            }
            else if (elemento.classList.contains('btn-eliminar')) {
                if (confirm('¿Estás segura de que deseas eliminar esta tarea?')) {
                    handlerEliminar(id);
                }
            }
        });
    }
    bindSubtareas(handlerToggle, handlerAgregar) {
        this.contenedorTareas.addEventListener('change', event => {
            const elemento = event.target;
            if (!elemento.classList.contains('chk-subtarea'))
                return;
            const tareaId = parseInt(elemento.getAttribute('data-id') || '', 10);
            const subId = parseInt(elemento.getAttribute('data-sub-id') || '', 10);
            if (!Number.isNaN(tareaId) && !Number.isNaN(subId)) {
                handlerToggle(tareaId, subId);
            }
        });
        this.contenedorTareas.addEventListener('click', event => {
            const elemento = event.target;
            if (!elemento.classList.contains('btn-add-subtarea'))
                return;
            const tareaId = parseInt(elemento.getAttribute('data-id') || '', 10);
            const input = this.contenedorTareas.querySelector(`.input-subtarea[data-id="${tareaId}"]`);
            const titulo = input?.value.trim() ?? '';
            if (!Number.isNaN(tareaId) && titulo) {
                handlerAgregar(tareaId, titulo);
            }
        });
        this.contenedorTareas.addEventListener('keydown', event => {
            const elemento = event.target;
            if (!(elemento instanceof HTMLInputElement) || !elemento.classList.contains('input-subtarea'))
                return;
            if (event.key !== 'Enter')
                return;
            event.preventDefault();
            const tareaId = parseInt(elemento.getAttribute('data-id') || '', 10);
            const titulo = elemento.value.trim();
            if (!Number.isNaN(tareaId) && titulo) {
                handlerAgregar(tareaId, titulo);
            }
        });
    }
    bindBusqueda(handler) {
        if (this.inputBusqueda) {
            this.inputBusqueda.addEventListener('input', () => handler());
        }
    }
    bindFiltrosYOrden(handlerFiltrar, handlerOrdenar) {
        const eventosFiltro = [this.seleccionarFiltroPrioridad, this.seleccionarFiltroCategoria, this.seleccionarFiltroEstado];
        eventosFiltro.forEach(select => {
            if (select) {
                select.addEventListener('change', () => handlerFiltrar());
            }
        });
        if (this.seleccionarOrden) {
            this.seleccionarOrden.addEventListener('change', () => {
                handlerOrdenar(this.seleccionarOrden.value);
            });
        }
    }
    getFiltrosValues() {
        return {
            prioridad: this.seleccionarFiltroPrioridad ? this.seleccionarFiltroPrioridad.value : 'todas',
            categoria: this.seleccionarFiltroCategoria ? this.seleccionarFiltroCategoria.value : 'todas',
            estado: this.seleccionarFiltroEstado ? this.seleccionarFiltroEstado.value : 'todos',
            busqueda: this.inputBusqueda ? this.inputBusqueda.value : ''
        };
    }
}
