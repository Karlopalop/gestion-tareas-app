package com.portafolio.gestiontareas.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/categorias-simple")
    public String getCategoriasSimple() {
        return "[\"Trabajo\", \"Personal\", \"Estudio\"]";
    }

    @GetMapping("/categorias-json")
    public String getCategoriasJson() {
        return """
               [
                 {"id": 1, "nombre": "Trabajo", "color": "#ff0000"},
                 {"id": 2, "nombre": "Personal", "color": "#00ff00"},
                 {"id": 3, "nombre": "Estudio", "color": "#0000ff"}
               ]
               """;
    }

    @GetMapping("/status")
    public String getStatus() {
        return "{\"status\": \"OK\", \"message\": \"Test controller funcionando\"}";
    }
}