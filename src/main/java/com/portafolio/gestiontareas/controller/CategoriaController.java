package com.portafolio.gestiontareas.controller;

import com.portafolio.gestiontareas.entity.Categoria;
import com.portafolio.gestiontareas.service.CategoriaService;
import com.portafolio.gestiontareas.dto.CategoriaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:4200")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    // Crear nueva categoría (sigue usando Entity para crear)
    @PostMapping
    public ResponseEntity<Categoria> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria categoriaCreada = categoriaService.crearCategoria(categoria);
            return ResponseEntity.ok(categoriaCreada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ CAMBIA: Devuelve DTOs
    @GetMapping
    public List<CategoriaDTO> obtenerTodasCategorias() {
        return categoriaService.obtenerTodasCategorias();
    }

    // ✅ CAMBIA: Devuelve DTO
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDTO> obtenerCategoriaPorId(@PathVariable Long id) {
        return categoriaService.obtenerCategoriaDTOPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Actualizar categoría (sigue usando Entity para actualizar)
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoria) {
        try {
            Categoria categoriaActualizada = categoriaService.actualizarCategoria(id, categoria);
            return ResponseEntity.ok(categoriaActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Eliminar categoría
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable Long id) {
        try {
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.ok().body("{\"message\": \"Categoría eliminada correctamente\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ CAMBIA: Devuelve DTOs
    @GetMapping("/buscar")
    public List<CategoriaDTO> buscarCategoriasPorNombre(@RequestParam String nombre) {
        return categoriaService.buscarCategoriasPorNombre(nombre);
    }
}