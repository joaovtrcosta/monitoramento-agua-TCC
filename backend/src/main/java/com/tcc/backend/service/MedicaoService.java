package com.tcc.backend.service;

import com.tcc.backend.dto.MedicaoDTO;
import com.tcc.backend.entity.Medicao;
import com.tcc.backend.repository.MedicaoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicaoService {

    private final MedicaoRepository medicaoRepository;

    public MedicaoService(MedicaoRepository medicaoRepository) {
        this.medicaoRepository = medicaoRepository;
    }

    public Medicao salvar(MedicaoDTO dto) {

        Medicao medicao = new Medicao();

        medicao.setDataHora(dto.getDataHora());
        medicao.setVazao(dto.getVazao());
        medicao.setVolumeLitros(dto.getVolumeLitros());
        BigDecimal tarifaPorLitro = new BigDecimal("0.50");

        BigDecimal valorEstimado = dto.getVolumeLitros().multiply(tarifaPorLitro);

        medicao.setValorEstimado(valorEstimado);

        return medicaoRepository.save(medicao);
    }

    public List<Medicao> listarTodas() {
        return medicaoRepository.findAll();
    }

    public BigDecimal somarVolumeEntre(LocalDateTime inicio, LocalDateTime fim) {
        return medicaoRepository.somarVolumeEntre(inicio, fim);
    }
}