package com.tcc.backend.service;

import com.tcc.backend.entity.Dispositivo;
import com.tcc.backend.entity.Residencia;
import com.tcc.backend.repository.DispositivoRepository;
import com.tcc.backend.repository.ResidenciaRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DispositivoService {

    private final DispositivoRepository dispositivoRepository;
    private final ResidenciaRepository residenciaRepository;

    public DispositivoService(
            DispositivoRepository dispositivoRepository,
            ResidenciaRepository residenciaRepository) {

        this.dispositivoRepository = dispositivoRepository;
        this.residenciaRepository = residenciaRepository;
    }

    public Dispositivo salvar(
            Dispositivo dispositivo,
            UUID residenciaId) {

        if (dispositivoRepository.existsByDeviceId(
                dispositivo.getDeviceId())) {

            throw new IllegalArgumentException(
                    "Já existe um dispositivo com este deviceId.");
        }

        Residencia residencia = residenciaRepository
                .findById(residenciaId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Residência não encontrada."));

        dispositivo.setResidencia(residencia);

        return dispositivoRepository.save(dispositivo);
    }

    public List<Dispositivo> listarPorResidencia(
            UUID residenciaId) {

        Residencia residencia = residenciaRepository
                .findById(residenciaId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Residência não encontrada."));

        return dispositivoRepository.findByResidencia(
                residencia);
    }

    public Dispositivo buscarPorDeviceId(String deviceId) {

        return dispositivoRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Dispositivo não encontrado."));
    }
}