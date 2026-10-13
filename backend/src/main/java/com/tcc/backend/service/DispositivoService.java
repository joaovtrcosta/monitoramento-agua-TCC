package com.tcc.backend.service;

import com.tcc.backend.dto.DispositivoResponseDTO;
import com.tcc.backend.entity.Dispositivo;
import com.tcc.backend.entity.Residencia;
import com.tcc.backend.repository.DispositivoRepository;
import com.tcc.backend.repository.ResidenciaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class DispositivoService {

        private final DispositivoRepository dispositivoRepository;
        private final ResidenciaRepository residenciaRepository;

        private final SecureRandom secureRandom = new SecureRandom();

        public DispositivoService(
                        DispositivoRepository dispositivoRepository,
                        ResidenciaRepository residenciaRepository) {

                this.dispositivoRepository = dispositivoRepository;
                this.residenciaRepository = residenciaRepository;
        }

        @Transactional
        public Dispositivo salvar(Dispositivo dispositivo, UUID residenciaId) {

                validarDispositivo(dispositivo);

                String deviceId = dispositivo.getDeviceId().trim();

                if (dispositivoRepository.existsByDeviceId(deviceId)) {
                        throw new IllegalArgumentException(
                                        "Já existe um dispositivo com este deviceId.");
                }

                Residencia residencia = residenciaRepository.findById(residenciaId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Residência não encontrada."));

                // Gerar uma chave aleatória e segura para o dispositivo
                String deviceKey = gerarDeviceKey();

                dispositivo.setDeviceId(deviceId);
                dispositivo.setDeviceKey(deviceKey);
                dispositivo.setResidencia(residencia);
                dispositivo.setAtivo(true);

                return dispositivoRepository.save(dispositivo);
        }

        // Gerar chave única para autenticação do dispositivo
        private String gerarDeviceKey() {

                byte[] bytes = new byte[32];
                String deviceKey;

                do {
                        secureRandom.nextBytes(bytes);

                        deviceKey = Base64.getUrlEncoder()
                                        .withoutPadding()
                                        .encodeToString(bytes);

                } while (dispositivoRepository.existsByDeviceKey(deviceKey));

                return deviceKey;
        }

        @Transactional(readOnly = true)
        public List<Dispositivo> listarPorResidencia(UUID residenciaId) {

                Residencia residencia = residenciaRepository.findById(residenciaId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Residência não encontrada."));

                return dispositivoRepository.findByResidencia(residencia);
        }

        @Transactional(readOnly = true)
        public Dispositivo buscarPorDeviceId(String deviceId) {

                return dispositivoRepository.findByDeviceId(deviceId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Dispositivo não encontrado."));
        }

        @Transactional
        public Dispositivo atualizar(UUID id, Dispositivo dados) {

                validarDispositivo(dados);

                Dispositivo dispositivo = dispositivoRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Dispositivo não encontrado."));

                String novoDeviceId = dados.getDeviceId().trim();

                if (dispositivoRepository.existsByDeviceId(novoDeviceId)
                                && !dispositivo.getDeviceId().equals(novoDeviceId)) {

                        throw new IllegalArgumentException(
                                        "Já existe um dispositivo com este deviceId.");
                }

                dispositivo.setDeviceId(novoDeviceId);

                return dispositivoRepository.save(dispositivo);
        }

        @Transactional
        public Dispositivo alterarStatus(UUID id, boolean ativo) {

                Dispositivo dispositivo = dispositivoRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Dispositivo não encontrado."));

                dispositivo.setAtivo(ativo);

                return dispositivoRepository.save(dispositivo);
        }

        @Transactional
        public void excluir(UUID id) {

                Dispositivo dispositivo = dispositivoRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Dispositivo não encontrado."));

                dispositivoRepository.delete(dispositivo);
        }

        // Validar dados obrigatórios
        private void validarDispositivo(Dispositivo dispositivo) {

                if (dispositivo == null
                                || dispositivo.getDeviceId() == null
                                || dispositivo.getDeviceId().isBlank()) {

                        throw new IllegalArgumentException(
                                        "O identificador do dispositivo é obrigatório.");
                }
        }

        // Converter entidade para DTO sem expor a deviceKey
        @Transactional(readOnly = true)
        public DispositivoResponseDTO converterParaDTO(Dispositivo dispositivo) {

                return new DispositivoResponseDTO(
                                dispositivo.getId(),
                                dispositivo.getDeviceId(),
                                dispositivo.isAtivo(),
                                dispositivo.getResidencia().getId(),
                                dispositivo.getResidencia().getNome());

        }
}