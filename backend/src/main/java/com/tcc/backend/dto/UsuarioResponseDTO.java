
package com.tcc.backend.dto;

import com.tcc.backend.entity.Role;
import com.tcc.backend.entity.Usuario;

import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nome,
        String email,
        Role role
) {
    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole()
        );
    }
}
