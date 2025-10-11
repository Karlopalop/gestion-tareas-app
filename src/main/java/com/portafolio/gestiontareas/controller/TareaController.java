package com.portafolio.gestiontareas.controller;

import com.portafolio.gestiontareas.Exception.EntityNotFoundException;
import com.portafolio.gestiontareas.dto.TareaDTO;
import com.portafolio.gestiontareas.entity.Tarea;
import com.portafolio.gestiontareas.service.TareaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "http://localhost:4200")
public class TareaController {

    @Autowired
    private TareaService tareaService;

    // Crear nueva tarea
    @PostMapping
    public ResponseEntity<TareaDTO> crearTarea(@RequestBody Tarea tarea) {
        try {
            Tarea tareaCreada = tareaService.crearTarea(tarea);
            TareaDTO tareaDTO = convertirATareaDTO(tareaCreada);
            return ResponseEntity.ok(tareaDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Obtener todas las tareas CON PAGINACIÓN
    @GetMapping
    public ResponseEntity<Page<TareaDTO>> obtenerTodasTareas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        Page<Tarea> tareasPage = tareaService.obtenerTodasTareas(pageable);
        Page<TareaDTO> tareasDTOPage = tareasPage.map(this::convertirATareaDTO);
        return ResponseEntity.ok(tareasDTOPage);
    }

    // Obtener tareas por usuario
    @GetMapping("/usuario/{usuarioId}")
    public List<TareaDTO> obtenerTareasPorUsuario(@PathVariable Long usuarioId) {
        return tareaService.obtenerTareasPorUsuario(usuarioId).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // Obtener tarea por ID
    @GetMapping("/{id}")
    public ResponseEntity<TareaDTO> obtenerTareaPorId(@PathVariable Long id) {
        try {
            Tarea tarea = tareaService.obtenerTareaPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
            TareaDTO tareaDTO = convertirATareaDTO(tarea);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e; // Será manejado por el GlobalExceptionHandler
        }
    }

    // Actualizar tarea
    @PutMapping("/{id}")
    public ResponseEntity<TareaDTO> actualizarTarea(@PathVariable Long id, @RequestBody Tarea tarea) {
        try {
            Tarea tareaActualizada = tareaService.actualizarTarea(id, tarea);
            TareaDTO tareaDTO = convertirATareaDTO(tareaActualizada);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Marcar tarea como completada
    @PatchMapping("/{id}/completar")
    public ResponseEntity<TareaDTO> marcarComoCompletada(@PathVariable Long id) {
        try {
            Tarea tarea = tareaService.marcarComoCompletada(id);
            TareaDTO tareaDTO = convertirATareaDTO(tarea);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Marcar tarea como pendiente
    @PatchMapping("/{id}/pendiente")
    public ResponseEntity<TareaDTO> marcarComoPendiente(@PathVariable Long id) {
        try {
            Tarea tarea = tareaService.marcarComoPendiente(id);
            TareaDTO tareaDTO = convertirATareaDTO(tarea);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Eliminar tarea
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTarea(@PathVariable Long id) {
        try {
            tareaService.eliminarTarea(id);
            return ResponseEntity.ok().body("{\"message\": \"Tarea eliminada correctamente\"}");
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Obtener tareas pendientes por usuario
    @GetMapping("/usuario/{usuarioId}/pendientes")
    public List<TareaDTO> obtenerTareasPendientesPorUsuario(@PathVariable Long usuarioId) {
        return tareaService.obtenerTareasPendientesPorUsuario(usuarioId).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // Obtener tareas completadas por usuario
    @GetMapping("/usuario/{usuarioId}/completadas")
    public List<TareaDTO> obtenerTareasCompletadasPorUsuario(@PathVariable Long usuarioId) {
        return tareaService.obtenerTareasCompletadasPorUsuario(usuarioId).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // Método auxiliar para convertir Tarea a TareaDTO
    private TareaDTO convertirATareaDTO(Tarea tarea) {
        TareaDTO dto = new TareaDTO();
        dto.setId(tarea.getId());
        dto.setTitulo(tarea.getTitulo());
        dto.setDescripcion(tarea.getDescripcion());
        dto.setCompletada(tarea.isCompletada());
        dto.setFechaCreacion(tarea.getFechaCreacion());
        dto.setFechaVencimiento(tarea.getFechaVencimiento());
        dto.setPrioridad(tarea.getPrioridad());
        dto.setUsuarioId(tarea.getUsuarioId());

        if (tarea.getCategoria() != null) {
            dto.setCategoriaId(tarea.getCategoria().getId());
            dto.setCategoriaNombre(tarea.getCategoria().getNombre());
        } else {
            dto.setCategoriaId(null);
            dto.setCategoriaNombre(null);
        }

        return dto;
    }
}