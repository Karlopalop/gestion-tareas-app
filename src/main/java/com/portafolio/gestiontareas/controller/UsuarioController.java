package com.portafolio.gestiontareas.controller;

import com.portafolio.gestiontareas.dto.LoginRequest;
import com.portafolio.gestiontareas.dto.UsuarioDTO;
import com.portafolio.gestiontareas.entity.Usuario;
import com.portafolio.gestiontareas.security.JwtUtil;
import com.portafolio.gestiontareas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;  // ← INYECTAR JwtUtil

    // Login de usuario CON JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        boolean credencialesValidas = usuarioService.verificarCredenciales(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        if (credencialesValidas) {
            String token = jwtUtil.generateToken(loginRequest.getUsername());
            return ResponseEntity.ok().body("{\"token\": \"" + token + "\", \"message\": \"Login exitoso\"}");
        } else {
            return ResponseEntity.badRequest().body("{\"error\": \"Credenciales inválidas\"}");
        }
    }

    // Registrar nuevo usuario
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario usuarioCreado = usuarioService.crearUsuario(usuario);
            UsuarioDTO usuarioDTO = new UsuarioDTO(
                    usuarioCreado.getId(),
                    usuarioCreado.getUsername(),
                    usuarioCreado.getEmail()
            );
            return ResponseEntity.ok(usuarioDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // Obtener todos los usuarios
    @GetMapping
    public List<UsuarioDTO> obtenerTodosUsuarios() {
        return usuarioService.obtenerTodosUsuarios().stream()
                .map(usuario -> new UsuarioDTO(usuario.getId(), usuario.getUsername(), usuario.getEmail()))
                .collect(Collectors.toList());
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerUsuarioPorId(@PathVariable Long id) {
        return usuarioService.obtenerUsuarioPorId(id)
                .map(usuario -> ResponseEntity.ok(new UsuarioDTO(usuario.getId(), usuario.getUsername(), usuario.getEmail())))
                .orElse(ResponseEntity.notFound().build());
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, usuario);
            UsuarioDTO usuarioDTO = new UsuarioDTO(
                    usuarioActualizado.getId(),
                    usuarioActualizado.getUsername(),
                    usuarioActualizado.getEmail()
            );
            return ResponseEntity.ok(usuarioDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok().body("{\"message\": \"Usuario eliminado correctamente\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}