package com.portafolio.gestiontareas.service;

import com.portafolio.gestiontareas.entity.Categoria;
import com.portafolio.gestiontareas.repository.CategoriaRepository;
import com.portafolio.gestiontareas.dto.CategoriaDTO;
import com.portafolio.gestiontareas.Exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Método para convertir Entity a DTO
    private CategoriaDTO convertirADTO(Categoria categoria) {
        return new CategoriaDTO(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getColor()
        );
    }

    public Categoria crearCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    // ✅ NUEVO: Obtener todas las categorías con paginación
    public Page<CategoriaDTO> obtenerTodasCategorias(Pageable pageable) {
        return categoriaRepository.findAll(pageable)
                .map(this::convertirADTO);
    }

    // ✅ Mantener para compatibilidad
    public List<CategoriaDTO> obtenerTodasCategorias() {
        return categoriaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public Optional<Categoria> obtenerCategoriaPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    // ✅ Para usar en endpoints que necesitan el DTO
    public Optional<CategoriaDTO> obtenerCategoriaDTOPorId(Long id) {
        return categoriaRepository.findById(id)
                .map(this::convertirADTO);
    }

    public Categoria actualizarCategoria(Long id, Categoria categoriaActualizada) {
        return categoriaRepository.findById(id)
                .map(categoria -> {
                    categoria.setNombre(categoriaActualizada.getNombre());
                    categoria.setColor(categoriaActualizada.getColor());
                    return categoriaRepository.save(categoria);
                })
                .orElseThrow(() -> new EntityNotFoundException("Categoría", id));
    }

    public void eliminarCategoria(Long id) {
        if (categoriaRepository.existsById(id)) {
            categoriaRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("Categoría", id);
        }
    }

    // ✅ CAMBIA: Devuelve DTOs
    public List<CategoriaDTO> buscarCategoriasPorNombre(String nombre) {
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
}