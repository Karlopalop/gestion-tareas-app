package com.portafolio.gestiontareas.service;

import com.portafolio.gestiontareas.entity.Usuario;
import com.portafolio.gestiontareas.repository.UsuarioRepository;
import com.portafolio.gestiontareas.Exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.portafolio.gestiontareas.security.JwtUtil;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ✅ NUEVO: Obtener todos los usuarios con paginación
    public Page<Usuario> obtenerTodosUsuarios(Pageable pageable) {
        return usuarioRepository.findAll(pageable);
    }

    // Crear un nuevo usuario
    public Usuario crearUsuario(Usuario usuario) {
        // Verificar si el username ya existe
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new RuntimeException("El username ya está en uso");
        }

        // Verificar si el email ya existe
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya está en uso");
        }

        return usuarioRepository.save(usuario);
    }

    // Obtener todos los usuarios (sin paginación - para compatibilidad)
    public List<Usuario> obtenerTodosUsuarios() {
        return usuarioRepository.findAll();
    }

    // Obtener usuario por ID
    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // Obtener usuario por username
    public Optional<Usuario> obtenerUsuarioPorUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }

    // Actualizar usuario
    public Usuario actualizarUsuario(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setUsername(usuarioActualizado.getUsername());
                    usuario.setEmail(usuarioActualizado.getEmail());
                    usuario.setPassword(usuarioActualizado.getPassword());
                    return usuarioRepository.save(usuario);
                })
                .orElseThrow(() -> new EntityNotFoundException("Usuario", id));
    }

    // Eliminar usuario
    public void eliminarUsuario(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("Usuario", id);
        }
    }

    // Verificar credenciales de login
    public boolean verificarCredenciales(String username, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByUsername(username);
        return usuario.isPresent() && usuario.get().getPassword().equals(password);
    }
}