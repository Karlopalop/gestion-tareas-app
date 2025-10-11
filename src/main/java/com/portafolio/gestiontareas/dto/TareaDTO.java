package com.portafolio.gestiontareas.dto;

import com.portafolio.gestiontareas.entity.Tarea;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TareaDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private boolean completada;
    private LocalDateTime fechaCreacion;
    private LocalDate fechaVencimiento;
    private Tarea.Prioridad prioridad;
    private Long usuarioId;
    private Long categoriaId;
    private String categoriaNombre; // ✅ IMPORTANTE: Este campo debe existir

    // Constructores
    public TareaDTO() {}

    public TareaDTO(Long id, String titulo, String descripcion, boolean completada,
                    LocalDateTime fechaCreacion, LocalDate fechaVencimiento,
                    Tarea.Prioridad prioridad, Long usuarioId, Long categoriaId) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.completada = completada;
        this.fechaCreacion = fechaCreacion;
        this.fechaVencimiento = fechaVencimiento;
        this.prioridad = prioridad;
        this.usuarioId = usuarioId;
        this.categoriaId = categoriaId;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public boolean isCompletada() { return completada; }
    public void setCompletada(boolean completada) { this.completada = completada; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public Tarea.Prioridad getPrioridad() { return prioridad; }
    public void setPrioridad(Tarea.Prioridad prioridad) { this.prioridad = prioridad; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public String getCategoriaNombre() { return categoriaNombre; }
    public void setCategoriaNombre(String categoriaNombre) { this.categoriaNombre = categoriaNombre; }
}