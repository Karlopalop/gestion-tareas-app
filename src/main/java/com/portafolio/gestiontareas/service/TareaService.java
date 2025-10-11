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

    // ✅ NUEVO: Obtener todas las tareas con paginación
    public Page<Tarea> obtenerTodasTareas(Pageable pageable) {
        return tareaRepository.findAll(pageable);
    }

    // Crear nueva tarea
    public Tarea crearTarea(Tarea tarea) {
        return tareaRepository.save(tarea);
    }

    // Obtener todas las tareas (sin paginación - para compatibilidad)
    public List<Tarea> obtenerTodasTareas() {
        return tareaRepository.findAll();
    }

    // Obtener tarea por ID
    public Optional<Tarea> obtenerTareaPorId(Long id) {
        return tareaRepository.findById(id);
    }

    // Obtener tareas por usuario
    public List<Tarea> obtenerTareasPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioId(usuarioId);
    }

    // Obtener tareas pendientes por usuario
    public List<Tarea> obtenerTareasPendientesPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioIdAndCompletada(usuarioId, false);
    }

    // Obtener tareas completadas por usuario
    public List<Tarea> obtenerTareasCompletadasPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioIdAndCompletada(usuarioId, true);
    }

    // Obtener tareas por categoría
    public List<Tarea> obtenerTareasPorCategoria(Long categoriaId) {
        return tareaRepository.findAll().stream()
                .filter(tarea -> tarea.getCategoria() != null && tarea.getCategoria().getId().equals(categoriaId))
                .toList();
    }

    // Obtener tareas por usuario y categoría
    public List<Tarea> obtenerTareasPorUsuarioYCategoria(Long usuarioId, Long categoriaId) {
        return tareaRepository.findByUsuarioId(usuarioId).stream()
                .filter(tarea -> tarea.getCategoria() != null && tarea.getCategoria().getId().equals(categoriaId))
                .toList();
    }

    // Actualizar tarea
    public Tarea actualizarTarea(Long id, Tarea tareaActualizada) {
        return tareaRepository.findById(id)
                .map(tarea -> {
                    tarea.setTitulo(tareaActualizada.getTitulo());
                    tarea.setDescripcion(tareaActualizada.getDescripcion());
                    tarea.setCompletada(tareaActualizada.isCompletada());
                    tarea.setFechaVencimiento(tareaActualizada.getFechaVencimiento());
                    tarea.setPrioridad(tareaActualizada.getPrioridad());
                    tarea.setUsuarioId(tareaActualizada.getUsuarioId());
                    tarea.setCategoria(tareaActualizada.getCategoria());
                    return tareaRepository.save(tarea);
                })
                .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
    }

    // Marcar tarea como completada
    public Tarea marcarComoCompletada(Long id) {
        return tareaRepository.findById(id)
                .map(tarea -> {
                    tarea.setCompletada(true);
                    return tareaRepository.save(tarea);
                })
                .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
    }

    // Marcar tarea como pendiente
    public Tarea marcarComoPendiente(Long id) {
        return tareaRepository.findById(id)
                .map(tarea -> {
                    tarea.setCompletada(false);
                    return tareaRepository.save(tarea);
                })
                .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
    }

    // Eliminar tarea
    public void eliminarTarea(Long id) {
        if (tareaRepository.existsById(id)) {
            tareaRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("Tarea", id);
        }
    }

    // Contar tareas pendientes por usuario
    public long contarTareasPendientesPorUsuario(Long usuarioId) {
        return tareaRepository.findByUsuarioId(usuarioId).stream()
                .filter(tarea -> !tarea.isCompletada())
                .count();
    }

    // Obtener tareas por prioridad y usuario
    public List<Tarea> obtenerTareasPorPrioridadYUsuario(Long usuarioId, Tarea.Prioridad prioridad) {
        return tareaRepository.findByUsuarioId(usuarioId).stream()
                .filter(tarea -> tarea.getPrioridad() == prioridad)
                .toList();
    }

    // Buscar tareas por título
    public List<Tarea> buscarTareasPorTitulo(String titulo) {
        return tareaRepository.findAll().stream()
                .filter(tarea -> tarea.getTitulo().toLowerCase().contains(titulo.toLowerCase()))
                .toList();
    }

    // Obtener tareas próximas a vencer
    public List<Tarea> obtenerTareasProximasAVencer(Long usuarioId) {
        return tareaRepository.findByUsuarioId(usuarioId).stream()
                .filter(tarea -> tarea.getFechaVencimiento() != null && !tarea.isCompletada())
                .sorted((t1, t2) -> t1.getFechaVencimiento().compareTo(t2.getFechaVencimiento()))
                .toList();
    }
}