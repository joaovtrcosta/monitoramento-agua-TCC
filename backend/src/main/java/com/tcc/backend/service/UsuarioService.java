package com.tcc.backend.service;

import com.tcc.backend.entity.Role;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario salvar(Usuario usuario) {

        if (usuario.getNome() == null || usuario.getNome().isBlank()) {
            throw new IllegalArgumentException(
                    "O nome é obrigatório.");
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "O e-mail é obrigatório.");
        }

        if (usuario.getSenha() == null || usuario.getSenha().length() < 6) {
            throw new IllegalArgumentException(
                    "A senha deve possuir pelo menos 6 caracteres.");
        }

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException(
                    "Já existe um usuário cadastrado com este e-mail.");
        }

        usuario.setRole(Role.USUARIO);

        
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado."));
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado."));
    }
}