package com.portafolio.gestiontareas.repository;

import com.portafolio.gestiontareas.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Buscar usuario por username
    Optional<Usuario> findByUsername(String username);

    // Buscar usuario por email
    Optional<Usuario> findByEmail(String email);

    // Verificar si existe un usuario con ese username
    boolean existsByUsername(String username);

    // Verificar si existe un usuario con ese email
    boolean existsByEmail(String email);
}