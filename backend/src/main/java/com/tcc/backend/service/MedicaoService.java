package com.tcc.backend.service;

import com.tcc.backend.dto.ConsumoDiarioDTO;
import com.tcc.backend.dto.MedicaoDTO;
import com.tcc.backend.dto.ResumoMensalDTO;
import com.tcc.backend.entity.Dispositivo;
import com.tcc.backend.entity.Medicao;
import com.tcc.backend.repository.DispositivoRepository;
import com.tcc.backend.repository.MedicaoRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MedicaoService {

    private final MedicaoRepository medicaoRepository;
    private final DispositivoRepository dispositivoRepository;
    private final TarifaService tarifaService;

    public MedicaoService(
            MedicaoRepository medicaoRepository,
            DispositivoRepository dispositivoRepository,
            TarifaService tarifaService) {

        this.medicaoRepository = medicaoRepository;
        this.dispositivoRepository = dispositivoRepository;
        this.tarifaService = tarifaService;
    }

    public Medicao salvar(MedicaoDTO dto) {

        Optional<Medicao> medicaoExistente =
                medicaoRepository.findByMedicaoId(
                        dto.getMedicaoId()
                );

        if (medicaoExistente.isPresent()) {
            return medicaoExistente.get();
        }

        Dispositivo dispositivo = dispositivoRepository
                .findByDeviceId(dto.getDeviceId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Dispositivo não encontrado: "
                                        + dto.getDeviceId()
                        )
                );

        if (!dispositivo.isAtivo()) {
            throw new IllegalArgumentException(
                    "Dispositivo está inativo."
            );
        }

        Medicao medicao = new Medicao();

        medicao.setMedicaoId(dto.getMedicaoId());
        medicao.setDataHora(dto.getDataHora());
        medicao.setVazao(dto.getVazao());
        medicao.setVolumeLitros(dto.getVolumeLitros());
        medicao.setDispositivo(dispositivo);

        return medicaoRepository.save(medicao);
    }

    public List<Medicao> listarPorUsuario(String email) {

        return medicaoRepository
                .findByDispositivo_Residencia_Usuario_Email(email);
    }

    public BigDecimal somarVolumeEntre(
            LocalDateTime inicio,
            LocalDateTime fim,
            String email) {

        return medicaoRepository.somarVolumeEntreUsuario(
                inicio,
                fim,
                email
        );
    }

    public ResumoMensalDTO obterResumoMensal(
            int ano,
            int mes,
            String email) {

        YearMonth yearMonth =
                YearMonth.of(ano, mes);

        LocalDateTime inicio =
                yearMonth.atDay(1).atStartOfDay();

        LocalDateTime fim =
                yearMonth.plusMonths(1)
                        .atDay(1)
                        .atStartOfDay();

        BigDecimal consumoLitros =
                medicaoRepository.somarVolumeEntreUsuario(
                        inicio,
                        fim,
                        email
                );

        if (consumoLitros == null) {
            consumoLitros = BigDecimal.ZERO;
        }

        BigDecimal consumoM3 =
                consumoLitros.divide(
                        new BigDecimal("1000"),
                        6,
                        RoundingMode.HALF_UP
                );

        BigDecimal valorAgua =
                tarifaService.calcularValorAgua(
                        consumoM3
                );

        BigDecimal valorEsgoto =
                tarifaService.calcularValorEsgoto(
                        valorAgua
                );

        BigDecimal valorEstimado =
                valorAgua
                        .add(valorEsgoto)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        return new ResumoMensalDTO(
                consumoLitros,
                consumoM3,
                valorAgua,
                valorEsgoto,
                valorEstimado
        );
    }

    public List<ConsumoDiarioDTO> obterConsumoDiario(
            int ano,
            int mes,
            String email) {

        YearMonth yearMonth =
                YearMonth.of(ano, mes);

        LocalDateTime inicio =
                yearMonth.atDay(1).atStartOfDay();

        LocalDateTime fim =
                yearMonth.plusMonths(1)
                        .atDay(1)
                        .atStartOfDay();

        List<Medicao> medicoes =
                medicaoRepository
                        .findByDispositivo_Residencia_Usuario_EmailAndDataHoraGreaterThanEqualAndDataHoraLessThan(
                                email,
                                inicio,
                                fim
                        );

        Map<LocalDate, BigDecimal> consumoPorDia =
                medicoes.stream()
                        .collect(
                                Collectors.groupingBy(
                                        medicao ->
                                                medicao
                                                        .getDataHora()
                                                        .toLocalDate(),

                                        Collectors.mapping(
                                                medicao ->
                                                        medicao.getVolumeLitros(),

                                                Collectors.reducing(
                                                        BigDecimal.ZERO,

                                                        (valor1, valor2) ->
                                                                valor1.add(valor2)
                                                )
                                        )
                                )
                        );

        return consumoPorDia.entrySet()
                .stream()
                .map(entry ->
                        new ConsumoDiarioDTO(
                                entry.getKey(),
                                entry.getValue()
                        )
                )
                .sorted(
                        Comparator.comparing(
                                dto -> dto.getData()
                        )
                )
                .toList();
    }
}