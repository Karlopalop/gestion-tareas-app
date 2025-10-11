package com.portafolio.gestiontareas.repository;

import com.portafolio.gestiontareas.entity.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    // Buscar tareas por usuario
    List<Tarea> findByUsuarioId(Long usuarioId);

    List<Tarea> findByUsuarioIdAndCompletada(Long usuarioId, boolean completada);

    long countByUsuarioIdAndCompletadaFalse(Long usuarioId);

    // ✅ NUEVO: Buscar por prioridad (si quieres mantenerlo)
    List<Tarea> findByUsuarioIdAndPrioridad(Long usuarioId, Tarea.Prioridad prioridad);

    // ✅ NUEVO: Buscar tareas que tengan categoría (opcional)
    List<Tarea> findByCategoriaIsNotNull();

    // ✅ NUEVO: Buscar tareas sin categoría (opcional)
    List<Tarea> findByCategoriaIsNull();
}