package com.tcc.backend.service;

import com.tcc.backend.dto.MedicaoDTO;
import com.tcc.backend.entity.Medicao;
import com.tcc.backend.repository.MedicaoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MedicaoService {

    private final MedicaoRepository medicaoRepository;

    public MedicaoService(MedicaoRepository medicaoRepository) {
        this.medicaoRepository = medicaoRepository;
    }

    public Medicao salvar(MedicaoDTO dto) {

        Optional<Medicao> medicaoExistente =
                medicaoRepository.findByMedicaoId(dto.getMedicaoId());

        if (medicaoExistente.isPresent()) {
            return medicaoExistente.get();
        }

        Medicao medicao = new Medicao();

        medicao.setMedicaoId(dto.getMedicaoId());
        medicao.setDataHora(dto.getDataHora());
        medicao.setVazao(dto.getVazao());
        medicao.setVolumeLitros(dto.getVolumeLitros());

        BigDecimal tarifaPorLitro = new BigDecimal("0.50");

        BigDecimal valorEstimado =
                dto.getVolumeLitros().multiply(tarifaPorLitro);

        medicao.setValorEstimado(valorEstimado);

        return medicaoRepository.save(medicao);
    }

    public List<Medicao> listarTodas() {
        return medicaoRepository.findAll();
    }

    public BigDecimal somarVolumeEntre(
            LocalDateTime inicio,
            LocalDateTime fim
    ) {
        return medicaoRepository.somarVolumeEntre(inicio, fim);
    }
}