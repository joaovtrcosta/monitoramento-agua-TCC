
package com.tcc.backend.service;

import com.tcc.backend.entity.Residencia;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.repository.ResidenciaRepository;
import com.tcc.backend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Residencia salvar(Residencia residencia, UUID usuarioId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado."));

        validarResidencia(residencia);

        residencia.setUsuario(usuario);

        return residenciaRepository.save(residencia);
    }

    public List<Residencia> listarPorUsuario(UUID usuarioId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado."));

        return residenciaRepository.findByUsuario(usuario);
    }

    @Transactional
    public Residencia atualizar(UUID id, Residencia dados) {

        Residencia residencia = buscarPorId(id);

        validarResidencia(dados);

        residencia.setNome(dados.getNome().trim());
        residencia.setEndereco(dados.getEndereco().trim());

        return residenciaRepository.save(residencia);
    }

    @Transactional
    public void excluir(UUID id) {

        Residencia residencia = buscarPorId(id);

        residenciaRepository.delete(residencia);
    }

    public Residencia buscarPorId(UUID id) {

        return residenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Residência não encontrada."));
    }

    private void validarResidencia(Residencia residencia) {

        if (residencia.getNome() == null
                || residencia.getNome().isBlank()) {
            throw new IllegalArgumentException(
                    "O nome da residência é obrigatório.");
        }

        if (residencia.getEndereco() == null
                || residencia.getEndereco().isBlank()) {
            throw new IllegalArgumentException(
                    "O endereço da residência é obrigatório.");
        }
    }
}
