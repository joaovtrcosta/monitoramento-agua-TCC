package com.tcc.backend.service;

import com.tcc.backend.dto.MedicaoDTO;
import com.tcc.backend.dto.ResumoMensalDTO;
import com.tcc.backend.entity.Medicao;
import com.tcc.backend.repository.MedicaoRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.time.LocalDateTime;
import java.time.YearMonth;

import java.util.List;
import java.util.Optional;

@Service
public class MedicaoService {

    private final MedicaoRepository medicaoRepository;
    private final TarifaService tarifaService;

    public MedicaoService(
            MedicaoRepository medicaoRepository,
            TarifaService tarifaService) {
        this.medicaoRepository = medicaoRepository;
        this.tarifaService = tarifaService;
    }

    public Medicao salvar(MedicaoDTO dto) {

        Optional<Medicao> medicaoExistente = medicaoRepository.findByMedicaoId(dto.getMedicaoId());

        if (medicaoExistente.isPresent()) {
            return medicaoExistente.get();
        }

        Medicao medicao = new Medicao();

        medicao.setMedicaoId(dto.getMedicaoId());
        medicao.setDataHora(dto.getDataHora());
        medicao.setVazao(dto.getVazao());
        medicao.setVolumeLitros(dto.getVolumeLitros());

        return medicaoRepository.save(medicao);
    }

    public List<Medicao> listarTodas() {
        return medicaoRepository.findAll();
    }

    public BigDecimal somarVolumeEntre(
            LocalDateTime inicio,
            LocalDateTime fim) {
        return medicaoRepository.somarVolumeEntre(
                inicio,
                fim);
    }

    public ResumoMensalDTO obterResumoMensal(
            int ano,
            int mes) {

        YearMonth yearMonth = YearMonth.of(
                ano,
                mes);

        LocalDateTime inicio = yearMonth
                .atDay(1)
                .atStartOfDay();

        LocalDateTime fim = yearMonth
                .plusMonths(1)
                .atDay(1)
                .atStartOfDay();

        BigDecimal consumoLitros = medicaoRepository.somarVolumeEntre(
                inicio,
                fim);

        if (consumoLitros == null) {
            consumoLitros = BigDecimal.ZERO;
        }

        BigDecimal consumoM3 = consumoLitros.divide(
                new BigDecimal("1000"),
                6,
                RoundingMode.HALF_UP);

        BigDecimal valorAgua = tarifaService.calcularValorAgua(
                consumoM3);

        BigDecimal valorEsgoto = tarifaService.calcularValorEsgoto(
                valorAgua);

        BigDecimal valorEstimado = valorAgua
                .add(valorEsgoto)
                .setScale(
                        2,
                        RoundingMode.HALF_UP);

        return new ResumoMensalDTO(
                consumoLitros,
                consumoM3,
                valorAgua,
                valorEsgoto,
                valorEstimado);
    }
}