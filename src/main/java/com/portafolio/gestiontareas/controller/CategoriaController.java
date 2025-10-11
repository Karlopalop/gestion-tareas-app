package com.portafolio.gestiontareas.controller;

import com.portafolio.gestiontareas.entity.Categoria;
import com.portafolio.gestiontareas.service.CategoriaService;
import com.portafolio.gestiontareas.dto.CategoriaDTO;
import com.portafolio.gestiontareas.Exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:4200")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    // Crear nueva categoría
    @PostMapping
    public ResponseEntity<Categoria> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria categoriaCreada = categoriaService.crearCategoria(categoria);
            return ResponseEntity.ok(categoriaCreada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Obtener todas las categorías CON PAGINACIÓN
    @GetMapping
    public ResponseEntity<Page<CategoriaDTO>> obtenerTodasCategorias(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        Page<CategoriaDTO> categoriasPage = categoriaService.obtenerTodasCategorias(pageable);
        return ResponseEntity.ok(categoriasPage);
    }

    // Obtener categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDTO> obtenerCategoriaPorId(@PathVariable Long id) {
        try {
            CategoriaDTO categoriaDTO = categoriaService.obtenerCategoriaDTOPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Categoría", id));
            return ResponseEntity.ok(categoriaDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Actualizar categoría
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoria) {
        try {
            Categoria categoriaActualizada = categoriaService.actualizarCategoria(id, categoria);
            return ResponseEntity.ok(categoriaActualizada);
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Eliminar categoría
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable Long id) {
        try {
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.ok().body("{\"message\": \"Categoría eliminada correctamente\"}");
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Buscar categorías por nombre
    @GetMapping("/buscar")
    public List<CategoriaDTO> buscarCategoriasPorNombre(@RequestParam String nombre) {
        return categoriaService.buscarCategoriasPorNombre(nombre);
    }
}