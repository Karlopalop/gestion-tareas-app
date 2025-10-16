package com.portafolio.gestiontareas.repository;

import com.portafolio.gestiontareas.entity.Tarea;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {

    // ✅ TODOS LOS MÉTODOS CORREGIDOS: Usan "usuario.id" en lugar de "usuarioId"

    // Buscar tareas por usuario con paginación
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId")
    Page<Tarea> findByUsuarioId(@Param("usuarioId") Long usuarioId, Pageable pageable);

    // Buscar tareas por usuario
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId")
    List<Tarea> findByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Buscar tareas por usuario y estado
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId AND t.completada = :completada")
    List<Tarea> findByUsuarioIdAndCompletada(@Param("usuarioId") Long usuarioId, @Param("completada") boolean completada);

    // Contar tareas pendientes por usuario
    @Query("SELECT COUNT(t) FROM Tarea t WHERE t.usuario.id = :usuarioId AND t.completada = false")
    long countByUsuarioIdAndCompletadaFalse(@Param("usuarioId") Long usuarioId);

    // Buscar por prioridad y usuario
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId AND t.prioridad = :prioridad")
    List<Tarea> findByUsuarioIdAndPrioridad(@Param("usuarioId") Long usuarioId, @Param("prioridad") Tarea.Prioridad prioridad);

    // Buscar tarea por ID y usuario (para seguridad)
    @Query("SELECT t FROM Tarea t WHERE t.id = :id AND t.usuario.id = :usuarioId")
    Optional<Tarea> findByIdAndUsuarioId(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

    // Buscar tareas por usuario y categoría
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId AND t.categoria.id = :categoriaId")
    List<Tarea> findByUsuarioIdAndCategoriaId(@Param("usuarioId") Long usuarioId, @Param("categoriaId") Long categoriaId);

    // Buscar tareas próximas a vencer por usuario
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId AND t.fechaVencimiento IS NOT NULL AND t.completada = false ORDER BY t.fechaVencimiento ASC")
    List<Tarea> findTareasProximasAVencerByUsuario(@Param("usuarioId") Long usuarioId);

    // Buscar tareas por título y usuario
    @Query("SELECT t FROM Tarea t WHERE t.usuario.id = :usuarioId AND LOWER(t.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))")
    List<Tarea> findByUsuarioIdAndTituloContaining(@Param("usuarioId") Long usuarioId, @Param("titulo") String titulo);
}