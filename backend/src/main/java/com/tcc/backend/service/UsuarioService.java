
package com.tcc.backend.service;

import com.tcc.backend.entity.Role;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.repository.ResidenciaRepository;
import com.tcc.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ResidenciaRepository residenciaRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ResidenciaRepository residenciaRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.residenciaRepository = residenciaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario salvar(Usuario usuario) {
        if (usuario.getNome() == null || usuario.getNome().isBlank()) {
            throw new IllegalArgumentException("O nome é obrigatório.");
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new IllegalArgumentException("O e-mail é obrigatório.");
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

    @Transactional
    public Usuario atualizar(UUID id, Usuario dados) {
        Usuario usuario = buscarPorId(id);

        if (usuario.getRole() != Role.USUARIO) {
            throw new IllegalArgumentException(
                    "Somente clientes podem ser editados por esta operação.");
        }

        if (dados.getNome() == null || dados.getNome().isBlank()) {
            throw new IllegalArgumentException("O nome é obrigatório.");
        }

        if (dados.getEmail() == null || dados.getEmail().isBlank()) {
            throw new IllegalArgumentException("O e-mail é obrigatório.");
        }

        String email = dados.getEmail().trim();

        if (usuarioRepository.findByEmail(email)
                .filter(outro -> !outro.getId().equals(id))
                .isPresent()) {
            throw new IllegalArgumentException(
                    "Já existe um usuário cadastrado com este e-mail.");
        }

        usuario.setNome(dados.getNome().trim());
        usuario.setEmail(email);

        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            if (dados.getSenha().length() < 6) {
                throw new IllegalArgumentException(
                        "A nova senha deve possuir pelo menos 6 caracteres.");
            }

            usuario.setSenha(passwordEncoder.encode(dados.getSenha()));
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void excluir(UUID id) {
        Usuario usuario = buscarPorId(id);

        if (usuario.getRole() != Role.USUARIO) {
            throw new IllegalArgumentException(
                    "Esta operação permite excluir somente clientes.");
        }

        if (!residenciaRepository.findByUsuario(usuario).isEmpty()) {
            throw new IllegalArgumentException(
                    "Não é possível excluir este cliente porque ele possui "
                    + "residências vinculadas.");
        }

        usuarioRepository.delete(usuario);
    }
}
