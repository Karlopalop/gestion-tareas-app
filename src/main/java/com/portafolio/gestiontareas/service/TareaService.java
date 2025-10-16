package com.portafolio.gestiontareas.service;

import com.portafolio.gestiontareas.entity.Tarea;
import com.portafolio.gestiontareas.Exception.EntityNotFoundException;
import com.portafolio.gestiontareas.repository.TareaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TareaService {

    @Autowired
    private TareaRepository tareaRepository;

    // ✅ MODIFICADO: Obtener todas las tareas del usuario con paginación
    public Page<Tarea> obtenerTodasTareasPorUsuario(Long usuarioId, Pageable pageable) {
        return tareaRepository.findByUsuarioId(usuarioId, pageable);
    }

    // ✅ MODIFICADO: Obtener todas las tareas del usuario (sin paginación)
    public List<Tarea> obtenerTodasTareasPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioId(usuarioId);
    }

    // ✅ ELIMINADO: Método que devuelve todas las tareas sin filtrar
    // public Page<Tarea> obtenerTodasTareas(Pageable pageable) {
    //     return tareaRepository.findAll(pageable);
    // }

    // ✅ ELIMINADO: Método que devuelve todas las tareas sin filtrar
    // public List<Tarea> obtenerTodasTareas() {
    //     return tareaRepository.findAll();
    // }

    // ✅ MODIFICADO: Crear tarea - ahora asigna automáticamente el usuario
    public Tarea crearTarea(Tarea tarea) {
        // Validar que la tarea tenga un usuario asignado
        if (tarea.getUsuario() == null) {
            throw new IllegalArgumentException("La tarea debe tener un usuario asignado");
        }
        return tareaRepository.save(tarea);
    }

    // ✅ MODIFICADO: Obtener tarea por ID y usuario (para seguridad)
    public Optional<Tarea> obtenerTareaPorIdYUsuario(Long id, Long usuarioId) {
        return tareaRepository.findByIdAndUsuarioId(id, usuarioId);
    }

    // ✅ MANTENIDO: Obtener tarea por ID (solo para uso interno)
    public Optional<Tarea> obtenerTareaPorId(Long id) {
        return tareaRepository.findById(id);
    }

    // ✅ MODIFICADO: Obtener tareas por usuario
    public List<Tarea> obtenerTareasPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioId(usuarioId);
    }

    // ✅ MODIFICADO: Obtener tareas pendientes por usuario
    public List<Tarea> obtenerTareasPendientesPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioIdAndCompletada(usuarioId, false);
    }

    // ✅ MODIFICADO: Obtener tareas completadas por usuario
    public List<Tarea> obtenerTareasCompletadasPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioIdAndCompletada(usuarioId, true);
    }

    // ✅ MODIFICADO: Obtener tareas por usuario y categoría
    public List<Tarea> obtenerTareasPorUsuarioYCategoria(Long usuarioId, Long categoriaId) {
        return tareaRepository.findByUsuarioIdAndCategoriaId(usuarioId, categoriaId);
    }

    // ✅ MODIFICADO: Actualizar tarea con verificación de usuario
    public Tarea actualizarTarea(Long id, Tarea tareaActualizada, Long usuarioId) {
        return tareaRepository.findByIdAndUsuarioId(id, usuarioId)
                .map(tarea -> {
                    tarea.setTitulo(tareaActualizada.getTitulo());
                    tarea.setDescripcion(tareaActualizada.getDescripcion());
                    tarea.setCompletada(tareaActualizada.isCompletada());
                    tarea.setFechaVencimiento(tareaActualizada.getFechaVencimiento());
                    tarea.setPrioridad(tareaActualizada.getPrioridad());
                    tarea.setCategoria(tareaActualizada.getCategoria());
                    // No permitimos cambiar el usuario de la tarea
                    return tareaRepository.save(tarea);
                })
                .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
    }

    // ✅ MODIFICADO: Marcar tarea como completada con verificación de usuario
    public Tarea marcarComoCompletada(Long id, Long usuarioId) {
        return tareaRepository.findByIdAndUsuarioId(id, usuarioId)
                .map(tarea -> {
                    tarea.setCompletada(true);
                    return tareaRepository.save(tarea);
                })
                .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
    }

    // ✅ MODIFICADO: Marcar tarea como pendiente con verificación de usuario
    public Tarea marcarComoPendiente(Long id, Long usuarioId) {
        return tareaRepository.findByIdAndUsuarioId(id, usuarioId)
                .map(tarea -> {
                    tarea.setCompletada(false);
                    return tareaRepository.save(tarea);
                })
                .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
    }

    // ✅ MODIFICADO: Eliminar tarea con verificación de usuario
    public void eliminarTarea(Long id, Long usuarioId) {
        Tarea tarea = tareaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
        tareaRepository.delete(tarea);
    }

    // ✅ MODIFICADO: Contar tareas pendientes por usuario
    public long contarTareasPendientesPorUsuario(Long usuarioId) {
        return tareaRepository.countByUsuarioIdAndCompletadaFalse(usuarioId);
    }

    // ✅ MODIFICADO: Obtener tareas por prioridad y usuario
    public List<Tarea> obtenerTareasPorPrioridadYUsuario(Long usuarioId, Tarea.Prioridad prioridad) {
        return tareaRepository.findByUsuarioIdAndPrioridad(usuarioId, prioridad);
    }

    // ✅ MODIFICADO: Buscar tareas por título y usuario
    public List<Tarea> buscarTareasPorTituloYUsuario(Long usuarioId, String titulo) {
        return tareaRepository.findByUsuarioIdAndTituloContaining(usuarioId, titulo);
    }

    // ✅ MODIFICADO: Obtener tareas próximas a vencer por usuario
    public List<Tarea> obtenerTareasProximasAVencer(Long usuarioId) {
        return tareaRepository.findTareasProximasAVencerByUsuario(usuarioId);
    }
}