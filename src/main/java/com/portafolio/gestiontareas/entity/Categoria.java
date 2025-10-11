package com.portafolio.gestiontareas.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "categorias")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String color;

    // ✅ CORREGIDO: Relación correcta con mappedBy
    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL)
    private List<Tarea> tareas;

    // Constructores
    public Categoria() {}

    public Categoria(String nombre, String color) {
        this.nombre = nombre;
        this.color = color;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public List<Tarea> getTareas() { return tareas; }
    public void setTareas(List<Tarea> tareas) { this.tareas = tareas; }
}