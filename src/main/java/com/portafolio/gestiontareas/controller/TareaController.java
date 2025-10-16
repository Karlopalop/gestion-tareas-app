package com.portafolio.gestiontareas.controller;

import com.portafolio.gestiontareas.Exception.EntityNotFoundException;
import com.portafolio.gestiontareas.dto.TareaDTO;
import com.portafolio.gestiontareas.entity.Tarea;
import com.portafolio.gestiontareas.entity.Usuario;
import com.portafolio.gestiontareas.service.TareaService;
import com.portafolio.gestiontareas.service.UsuarioService;
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

    @Autowired
    private UsuarioService usuarioService;

    // ✅ CORREGIDO: Crear nueva tarea
    @PostMapping
    public ResponseEntity<TareaDTO> crearTarea(@RequestBody Tarea tarea,
                                               @RequestHeader("X-Usuario-Id") Long usuarioId) {
        try {
            // Obtener el usuario y asignarlo a la tarea
            Usuario usuario = usuarioService.obtenerUsuarioPorId(usuarioId)
                    .orElseThrow(() -> new EntityNotFoundException("Usuario", usuarioId));
            tarea.setUsuario(usuario);

            Tarea tareaCreada = tareaService.crearTarea(tarea);
            TareaDTO tareaDTO = convertirATareaDTO(tareaCreada);
            return ResponseEntity.ok(tareaDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ CORREGIDO: Obtener todas las tareas DEL USUARIO con paginación
    @GetMapping
    public ResponseEntity<Page<TareaDTO>> obtenerTareasDelUsuario(
            @RequestHeader("X-Usuario-Id") Long usuarioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        Page<Tarea> tareasPage = tareaService.obtenerTodasTareasPorUsuario(usuarioId, pageable);
        Page<TareaDTO> tareasDTOPage = tareasPage.map(this::convertirATareaDTO);
        return ResponseEntity.ok(tareasDTOPage);
    }

    // ✅ MANTENIDO: Obtener tareas por usuario (endpoint específico)
    @GetMapping("/usuario/{usuarioId}")
    public List<TareaDTO> obtenerTareasPorUsuario(@PathVariable Long usuarioId) {
        return tareaService.obtenerTareasPorUsuario(usuarioId).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // ✅ CORREGIDO: Obtener tarea por ID con verificación de usuario
    @GetMapping("/{id}")
    public ResponseEntity<TareaDTO> obtenerTareaPorId(@PathVariable Long id,
                                                      @RequestHeader("X-Usuario-Id") Long usuarioId) {
        try {
            Tarea tarea = tareaService.obtenerTareaPorIdYUsuario(id, usuarioId)
                    .orElseThrow(() -> new EntityNotFoundException("Tarea", id));
            TareaDTO tareaDTO = convertirATareaDTO(tarea);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // ✅ CORREGIDO: Actualizar tarea con verificación de usuario
    @PutMapping("/{id}")
    public ResponseEntity<TareaDTO> actualizarTarea(@PathVariable Long id,
                                                    @RequestBody Tarea tarea,
                                                    @RequestHeader("X-Usuario-Id") Long usuarioId) {
        try {
            Tarea tareaActualizada = tareaService.actualizarTarea(id, tarea, usuarioId);
            TareaDTO tareaDTO = convertirATareaDTO(tareaActualizada);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // ✅ CORREGIDO: Marcar tarea como completada con verificación de usuario
    @PatchMapping("/{id}/completar")
    public ResponseEntity<TareaDTO> marcarComoCompletada(@PathVariable Long id,
                                                         @RequestHeader("X-Usuario-Id") Long usuarioId) {
        try {
            Tarea tarea = tareaService.marcarComoCompletada(id, usuarioId);
            TareaDTO tareaDTO = convertirATareaDTO(tarea);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // ✅ CORREGIDO: Marcar tarea como pendiente con verificación de usuario
    @PatchMapping("/{id}/pendiente")
    public ResponseEntity<TareaDTO> marcarComoPendiente(@PathVariable Long id,
                                                        @RequestHeader("X-Usuario-Id") Long usuarioId) {
        try {
            Tarea tarea = tareaService.marcarComoPendiente(id, usuarioId);
            TareaDTO tareaDTO = convertirATareaDTO(tarea);
            return ResponseEntity.ok(tareaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // ✅ CORREGIDO: Eliminar tarea con verificación de usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTarea(@PathVariable Long id,
                                           @RequestHeader("X-Usuario-Id") Long usuarioId) {
        try {
            tareaService.eliminarTarea(id, usuarioId);
            return ResponseEntity.ok().body("{\"message\": \"Tarea eliminada correctamente\"}");
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // ✅ MANTENIDO: Obtener tareas pendientes por usuario
    @GetMapping("/usuario/{usuarioId}/pendientes")
    public List<TareaDTO> obtenerTareasPendientesPorUsuario(@PathVariable Long usuarioId) {
        return tareaService.obtenerTareasPendientesPorUsuario(usuarioId).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // ✅ MANTENIDO: Obtener tareas completadas por usuario
    @GetMapping("/usuario/{usuarioId}/completadas")
    public List<TareaDTO> obtenerTareasCompletadasPorUsuario(@PathVariable Long usuarioId) {
        return tareaService.obtenerTareasCompletadasPorUsuario(usuarioId).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // ✅ NUEVO: Obtener tareas por prioridad y usuario
    @GetMapping("/usuario/{usuarioId}/prioridad/{prioridad}")
    public List<TareaDTO> obtenerTareasPorPrioridadYUsuario(@PathVariable Long usuarioId,
                                                            @PathVariable Tarea.Prioridad prioridad) {
        return tareaService.obtenerTareasPorPrioridadYUsuario(usuarioId, prioridad).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // ✅ NUEVO: Buscar tareas por título y usuario
    @GetMapping("/usuario/{usuarioId}/buscar")
    public List<TareaDTO> buscarTareasPorTitulo(@PathVariable Long usuarioId,
                                                @RequestParam String titulo) {
        return tareaService.buscarTareasPorTituloYUsuario(usuarioId, titulo).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // ✅ NUEVO: Obtener tareas próximas a vencer por usuario
    @GetMapping("/usuario/{usuarioId}/proximas-vencer")
    public List<TareaDTO> obtenerTareasProximasAVencer(@PathVariable Long usuarioId) {
        return tareaService.obtenerTareasProximasAVencer(usuarioId).stream()
                .map(this::convertirATareaDTO)
                .collect(Collectors.toList());
    }

    // ✅ CORREGIDO: Método auxiliar para convertir Tarea a TareaDTO
    private TareaDTO convertirATareaDTO(Tarea tarea) {
        TareaDTO dto = new TareaDTO();
        dto.setId(tarea.getId());
        dto.setTitulo(tarea.getTitulo());
        dto.setDescripcion(tarea.getDescripcion());
        dto.setCompletada(tarea.isCompletada());
        dto.setFechaCreacion(tarea.getFechaCreacion());
        dto.setFechaVencimiento(tarea.getFechaVencimiento());
        dto.setPrioridad(tarea.getPrioridad());
        dto.setUsuarioId(tarea.getUsuarioId()); // ✅ Usa el método helper

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