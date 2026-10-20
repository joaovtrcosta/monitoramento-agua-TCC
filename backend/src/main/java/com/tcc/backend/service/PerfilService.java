package com.tcc.backend.service;

import com.tcc.backend.dto.AtualizarPerfilDTO;
import com.tcc.backend.dto.AlterarSenhaDTO;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public PerfilService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorEmail(String emailAutenticado) {
        return usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Usuário não encontrado."));
    }

    @Transactional
    public Usuario atualizarPerfil(
            String emailAutenticado,
            AtualizarPerfilDTO dto) {

        Usuario usuario = buscarPorEmail(emailAutenticado);

        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new IllegalArgumentException(
                    "O nome é obrigatório.");
        }

        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "O e-mail é obrigatório.");
        }

        String novoNome = dto.getNome().trim();
        String novoEmail = dto.getEmail().trim().toLowerCase();

        if (!novoEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException(
                    "Informe um e-mail válido.");
        }

        if (!novoEmail.equalsIgnoreCase(usuario.getEmail())
                && usuarioRepository.existsByEmail(novoEmail)) {
            throw new IllegalArgumentException(
                    "Este e-mail já está cadastrado.");
        }

        usuario.setNome(novoNome);
        usuario.setEmail(novoEmail);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void alterarSenha(
            String emailAutenticado,
            AlterarSenhaDTO dto) {

        Usuario usuario = buscarPorEmail(emailAutenticado);

        if (dto.getSenhaAtual() == null
                || dto.getSenhaAtual().isBlank()) {
            throw new IllegalArgumentException(
                    "Informe a senha atual.");
        }

        if (dto.getNovaSenha() == null
                || dto.getNovaSenha().length() < 8) {
            throw new IllegalArgumentException(
                    "A nova senha deve ter pelo menos 8 caracteres.");
        }

        if (!passwordEncoder.matches(
                dto.getSenhaAtual(),
                usuario.getSenha())) {
            throw new IllegalArgumentException(
                    "A senha atual está incorreta.");
        }

        if (passwordEncoder.matches(
                dto.getNovaSenha(),
                usuario.getSenha())) {
            throw new IllegalArgumentException(
                    "A nova senha deve ser diferente da atual.");
        }

        usuario.setSenha(
                passwordEncoder.encode(dto.getNovaSenha()));

        usuarioRepository.save(usuario);
    }
}