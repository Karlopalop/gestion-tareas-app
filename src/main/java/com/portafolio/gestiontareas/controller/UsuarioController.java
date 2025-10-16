package com.portafolio.gestiontareas.controller;

import com.portafolio.gestiontareas.dto.LoginRequest;
import com.portafolio.gestiontareas.dto.UsuarioDTO;
import com.portafolio.gestiontareas.entity.Usuario;
import com.portafolio.gestiontareas.security.JwtUtil;
import com.portafolio.gestiontareas.service.UsuarioService;
import com.portafolio.gestiontareas.Exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ CORREGIDO: Login de usuario que devuelve token + datos del usuario
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        boolean credencialesValidas = usuarioService.verificarCredenciales(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        if (credencialesValidas) {
            // ✅ OBTENER EL USUARIO COMPLETO
            Optional<Usuario> usuarioOpt = usuarioService.obtenerUsuarioPorUsername(loginRequest.getUsername());

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                String token = jwtUtil.generateToken(loginRequest.getUsername());

                // ✅ CREAR RESPUESTA CON TOKEN Y DATOS DEL USUARIO
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("message", "Login exitoso");
                response.put("usuario", new UsuarioDTO(
                        usuario.getId(),
                        usuario.getUsername(),
                        usuario.getEmail()
                ));

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("{\"error\": \"Usuario no encontrado\"}");
            }
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

    // Obtener todos los usuarios CON PAGINACIÓN
    @GetMapping
    public ResponseEntity<Page<UsuarioDTO>> obtenerTodosUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        Page<Usuario> usuariosPage = usuarioService.obtenerTodosUsuarios(pageable);
        Page<UsuarioDTO> usuariosDTOPage = usuariosPage.map(usuario ->
                new UsuarioDTO(usuario.getId(), usuario.getUsername(), usuario.getEmail()));
        return ResponseEntity.ok(usuariosDTOPage);
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerUsuarioPorId(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.obtenerUsuarioPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Usuario", id));
            UsuarioDTO usuarioDTO = new UsuarioDTO(usuario.getId(), usuario.getUsername(), usuario.getEmail());
            return ResponseEntity.ok(usuarioDTO);
        } catch (EntityNotFoundException e) {
            throw e;
        }
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
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok().body("{\"message\": \"Usuario eliminado correctamente\"}");
        } catch (EntityNotFoundException e) {
            throw e;
        }
    }
}