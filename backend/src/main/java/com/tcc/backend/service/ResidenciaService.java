package com.tcc.backend.service;

import com.tcc.backend.entity.Residencia;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.repository.ResidenciaRepository;
import com.tcc.backend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ResidenciaService {

    private final ResidenciaRepository residenciaRepository;
    private final UsuarioRepository usuarioRepository;

    public ResidenciaService(
            ResidenciaRepository residenciaRepository,
            UsuarioRepository usuarioRepository) {

        this.residenciaRepository = residenciaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Residencia salvar(
            Residencia residencia,
            UUID usuarioId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado."));

        residencia.setUsuario(usuario);

        return residenciaRepository.save(residencia);
    }

    public List<Residencia> listarPorUsuario(UUID usuarioId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado."));

        return residenciaRepository.findByUsuario(usuario);
    }
}