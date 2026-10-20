
package com.tcc.backend.repository;

import com.tcc.backend.entity.PasswordResetToken;
import com.tcc.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteByUsuario(Usuario usuario);
}
