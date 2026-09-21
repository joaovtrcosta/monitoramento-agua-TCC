package com.tcc.backend.service;

import com.tcc.backend.dto.LoginDTO;
import com.tcc.backend.dto.LoginResponseDTO;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.repository.UsuarioRepository;
import com.tcc.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponseDTO login(LoginDTO dto) {

        Usuario usuario = usuarioRepository
                .findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "E-mail ou senha inválidos."
                        )
                );

        boolean senhaCorreta = passwordEncoder.matches(
                dto.getSenha(),
                usuario.getSenha()
        );

        if (!senhaCorreta) {
            throw new IllegalArgumentException(
                    "E-mail ou senha inválidos."
            );
        }

        String token = jwtService.gerarToken(
                usuario.getEmail(),
                usuario.getRole().name()
        );

        return new LoginResponseDTO(
                token,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole()
        );
    }
}