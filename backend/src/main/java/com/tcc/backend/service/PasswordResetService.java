
package com.tcc.backend.service;

import com.tcc.backend.entity.PasswordResetToken;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.repository.PasswordResetTokenRepository;
import com.tcc.backend.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetService {

        private final UsuarioRepository usuarioRepository;
        private final PasswordResetTokenRepository tokenRepository;
        private final EmailService emailService;
        private final PasswordEncoder passwordEncoder;

        private final SecureRandom secureRandom = new SecureRandom();

        @Value("${app.frontend-url:http://localhost:3000}")
        private String frontendUrl;

        public PasswordResetService(
                        UsuarioRepository usuarioRepository,
                        PasswordResetTokenRepository tokenRepository,
                        EmailService emailService,
                        PasswordEncoder passwordEncoder) {

                this.usuarioRepository = usuarioRepository;
                this.tokenRepository = tokenRepository;
                this.emailService = emailService;
                this.passwordEncoder = passwordEncoder;
        }

        public void solicitarRecuperacao(String email) {

                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException(
                                        "O e-mail é obrigatório.");
                }

                usuarioRepository.findByEmail(email.trim())
                                .ifPresent(usuario -> {

                                        byte[] bytes = new byte[32];
                                        secureRandom.nextBytes(bytes);

                                        String token = Base64.getUrlEncoder()
                                                        .withoutPadding()
                                                        .encodeToString(bytes);

                                        PasswordResetToken resetToken = new PasswordResetToken();

                                        resetToken.setTokenHash(gerarHash(token));
                                        resetToken.setUsuario(usuario);
                                        resetToken.setDataExpiracao(
                                                        LocalDateTime.now().plusMinutes(15));

                                        tokenRepository.save(resetToken);

                                        String link = frontendUrl
                                                        + "/reset-password?token="
                                                        + token;
                                        emailService.enviarEmailRecuperacao(
                                                        usuario.getEmail(), link);
                                });
        }

        @Transactional
        public void redefinirSenha(String token, String novaSenha) {

                if (token == null || token.isBlank()) {
                        throw new IllegalArgumentException(
                                        "Token obrigatório.");
                }

                if (novaSenha == null || novaSenha.length() < 6) {
                        throw new IllegalArgumentException(
                                        "A senha deve ter pelo menos 6 caracteres.");
                }

                PasswordResetToken resetToken = tokenRepository
                                .findByTokenHash(gerarHash(token))
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Token inválido ou expirado."));

                if (!resetToken.getDataExpiracao()
                                .isAfter(LocalDateTime.now())) {

                        throw new IllegalArgumentException(
                                        "Token inválido ou expirado.");
                }

                Usuario usuario = resetToken.getUsuario();

                usuario.setSenha(passwordEncoder.encode(novaSenha));
                usuarioRepository.save(usuario);

                tokenRepository.deleteByUsuario(usuario);
        }

        private String gerarHash(String token) {
                try {
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");

                        byte[] hash = digest.digest(
                                        token.getBytes(StandardCharsets.UTF_8));

                        return HexFormat.of().formatHex(hash);

                } catch (Exception e) {
                        throw new IllegalStateException(
                                        "Erro ao processar token.", e);
                }
        }
}
