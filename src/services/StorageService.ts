//Almacenamiento de guardado
import { Tarea } from '../models/Tarea.js'

export class StorageService{
    // Definida como estática para que los métodos estáticos puedan acceder a ella
    private static STORAGE_KEY = 'tareas_prioridad' //constante para definir la clave con la se que guardaran los datos en localStorage

    //Guardar el arreglo de tareas en el localStore
    public static guardarTareas(tareas: Tarea[]): void{ //<= tareas es el arreglo de objetos tipo Tarea a persistir
        try {
            const tareasJson = JSON.stringify(tareas) //<= convertir el arreglo a una cadena de texto JSON
            localStorage.setItem(this.STORAGE_KEY, tareasJson); //localStorage es una funcion de api que nos permitira guardar las tareas en el navegador aunque se recargue la pagina
        } catch (error) {
            console.error('Error al guardar las tareas en el localStorage')
        }
    }

    //Recupera y deserializa las tareas almacenadas en el localStorage.
    public static obtenerTareas(): Tarea[] {
        try {
            const tareasJson = localStorage.getItem(this.STORAGE_KEY);
            if (!tareasJson){
               
                return [];
            }

            const parsed = JSON.parse(tareasJson) as Tarea[];
            // Normaliza tareas viejas que no tenían categoría, fecha límite o sub-tareas
            return parsed.map(t => ({
                ...t,
                categoria: t.categoria ?? 'Otro',
                fechaLimite: t.fechaLimite ?? '',
                subtareas: t.subtareas ?? []
            }));

        }catch (error) {
            console.error('Error al leer las tareas del localStorage:', error);
            return [];

        }
    }
}