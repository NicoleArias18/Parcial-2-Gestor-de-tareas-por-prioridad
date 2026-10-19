//mandar a llamar al gestor de tareas completo
import { TareaModel } from "./models/Tarea.js";
import { TareasView } from "./views/TareasView.js";
import { TareaController } from "./controllers/TareaController.js";

// Esperar a que el DOM este listo
document.addEventListener('DOMContentLoaded', () => {
    // 1. Crear el modelo(datos y logica de negocio)
    const model = new TareaModel();
    // 2. Crear la vista(interfaz de usuario y DOM)
    const view = new TareasView();
    // 3. Crear el controlador (conecta modelo y vista mediante inyeccion)
    const controller = new TareaController(model, view);

    console.log("Gestor de tareas iniciada correctamente");
});
