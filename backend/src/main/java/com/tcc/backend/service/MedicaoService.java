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
import com.tcc.backend.dto.RelatorioMensalDTO;
import java.util.ArrayList;

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
                return salvarComOrigem(dto, "REAL");
        }

        public Medicao salvarSimulada(MedicaoDTO dto) {
                return salvarComOrigem(dto, "SIMULADO");
        }

        private Medicao salvarComOrigem(MedicaoDTO dto, String origem) {

                if (dto == null
                                || dto.getDeviceId() == null
                                || dto.getDeviceId().isBlank()
                                || dto.getDeviceKey() == null
                                || dto.getDeviceKey().isBlank()) {

                        throw new IllegalArgumentException(
                                        "O identificador e a chave do dispositivo são obrigatórios.");
                }

                Dispositivo dispositivo = dispositivoRepository
                                .findByDeviceIdAndDeviceKey(
                                                dto.getDeviceId().trim(),
                                                dto.getDeviceKey().trim())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Identificador ou chave do dispositivo inválidos."));

                if (!dispositivo.isAtivo()) {
                        throw new IllegalArgumentException(
                                        "Dispositivo está inativo. O envio de medições foi bloqueado.");
                }

                if (dto.getMedicaoId() == null || dto.getMedicaoId().isBlank()) {
                        throw new IllegalArgumentException(
                                        "O identificador da medição é obrigatório.");
                }

                Optional<Medicao> medicaoExistente = medicaoRepository.findByMedicaoId(dto.getMedicaoId());

                if (medicaoExistente.isPresent()) {

                        Medicao existente = medicaoExistente.get();

                        if (!existente.getDispositivo().getId()
                                        .equals(dispositivo.getId())) {
                                throw new IllegalArgumentException(
                                                "Identificador de medição já utilizado por outro dispositivo.");
                        }

                        return existente;
                }

                Medicao medicao = new Medicao();

                medicao.setMedicaoId(dto.getMedicaoId());
                medicao.setDataHora(dto.getDataHora());
                medicao.setVazao(dto.getVazao());
                medicao.setVolumeLitros(dto.getVolumeLitros());
                medicao.setDispositivo(dispositivo);

                // Define a origem da medição
                medicao.setOrigem(origem);

                return medicaoRepository.save(medicao);
        }

        public List<Medicao> listarPorUsuario(String email) {

                return medicaoRepository
                                .findByDispositivo_Residencia_Usuario_EmailAndOrigem(
                                                email,
                                                "REAL");
        }

        public List<Medicao> listarMedicoesReais(String email) {

                return medicaoRepository
                                .findByDispositivo_Residencia_Usuario_EmailAndOrigem(
                                                email,
                                                "REAL");
        }

        public List<Medicao> listarMedicoesRecentes(
                        String email,
                        LocalDateTime inicio) {

                return medicaoRepository
                                .findTop100ByDispositivo_Residencia_Usuario_EmailAndDataHoraGreaterThanEqualOrderByDataHoraAsc(
                                                email,
                                                inicio);
        }

        // Lista as medições de um dia específico para o usuário.
        public List<Medicao> listarPorData(
                        LocalDate data,
                        String email) {

                if (data == null) {
                        throw new IllegalArgumentException(
                                        "A data para consulta é obrigatória.");
                }

                LocalDateTime inicio = data.atStartOfDay();
                LocalDateTime fim = data.plusDays(1).atStartOfDay();

                return medicaoRepository
                                .findByDispositivo_Residencia_Usuario_EmailAndDataHoraGreaterThanEqualAndDataHoraLessThanAndOrigem(
                                                email,
                                                inicio,
                                                fim,
                                                "REAL");
        }

        public BigDecimal somarVolumeEntre(
                        LocalDateTime inicio,
                        LocalDateTime fim,
                        String email) {

                return medicaoRepository.somarVolumeRealEntreUsuario(
                                inicio,
                                fim,
                                email);
        }

        public ResumoMensalDTO obterResumoMensal(
                        int ano,
                        int mes,
                        String email) {

                YearMonth yearMonth = YearMonth.of(ano, mes);

                LocalDateTime inicio = yearMonth.atDay(1).atStartOfDay();

                LocalDateTime fim = yearMonth.plusMonths(1)
                                .atDay(1)
                                .atStartOfDay();

                boolean possuiMedicoes = medicaoRepository
                                .existeMedicaoRealNoPeriodo(
                                                inicio,
                                                fim,
                                                email);

                BigDecimal consumoLitros = medicaoRepository.somarVolumeRealEntreUsuario(
                                inicio,
                                fim,
                                email);

                if (consumoLitros == null) {
                        consumoLitros = BigDecimal.ZERO;
                }

                BigDecimal consumoM3 = consumoLitros.divide(
                                new BigDecimal("1000"),
                                6,
                                RoundingMode.HALF_UP);

                // Sem medições, não apresenta uma estimativa de cobrança.
                if (!possuiMedicoes) {
                        return new ResumoMensalDTO(
                                        consumoLitros,
                                        consumoM3,
                                        BigDecimal.ZERO.setScale(2),
                                        BigDecimal.ZERO.setScale(2),
                                        BigDecimal.ZERO.setScale(2));
                }

                // Com medições, aplica as regras tarifárias normalmente.
                BigDecimal valorAgua = tarifaService.calcularValorAgua(
                                consumoM3);

                BigDecimal valorEsgoto = tarifaService.calcularValorEsgoto(
                                valorAgua);

                BigDecimal valorEstimado = valorAgua
                                .add(valorEsgoto)
                                .setScale(2, RoundingMode.HALF_UP);

                return new ResumoMensalDTO(
                                consumoLitros,
                                consumoM3,
                                valorAgua,
                                valorEsgoto,
                                valorEstimado);
        }

        public List<ConsumoDiarioDTO> obterConsumoDiario(
                        int ano,
                        int mes,
                        String email) {

                YearMonth yearMonth = YearMonth.of(ano, mes);

                LocalDateTime inicio = yearMonth.atDay(1).atStartOfDay();

                LocalDateTime fim = yearMonth.plusMonths(1)
                                .atDay(1)
                                .atStartOfDay();

                List<Medicao> medicoes = medicaoRepository
                                .findByDispositivo_Residencia_Usuario_EmailAndDataHoraGreaterThanEqualAndDataHoraLessThanAndOrigem(
                                                email,
                                                inicio,
                                                fim,
                                                "REAL");

                Map<LocalDate, BigDecimal> consumoPorDia = medicoes.stream()
                                .collect(
                                                Collectors.groupingBy(
                                                                medicao -> medicao.getDataHora().toLocalDate(),
                                                                Collectors.mapping(
                                                                                Medicao::getVolumeLitros,
                                                                                Collectors.reducing(
                                                                                                BigDecimal.ZERO,
                                                                                                BigDecimal::add))));

                return consumoPorDia.entrySet()
                                .stream()
                                .map(entry -> new ConsumoDiarioDTO(
                                                entry.getKey(),
                                                entry.getValue()))
                                .sorted(Comparator.comparing(
                                                ConsumoDiarioDTO::getData))
                                .toList();
        }

        public List<RelatorioMensalDTO> gerarRelatorioMensal(
                        int anoInicial,
                        int mesInicial,
                        int anoFinal,
                        int mesFinal,
                        String email) {

                YearMonth inicio = YearMonth.of(anoInicial, mesInicial);
                YearMonth fim = YearMonth.of(anoFinal, mesFinal);

                if (fim.isBefore(inicio)) {
                        throw new IllegalArgumentException(
                                        "O período final não pode ser anterior ao inicial.");
                }

                List<RelatorioMensalDTO> relatorio = new ArrayList<>();

                for (YearMonth periodo = inicio; !periodo.isAfter(fim); periodo = periodo.plusMonths(1)) {

                        ResumoMensalDTO resumo = obterResumoMensal(
                                        periodo.getYear(),
                                        periodo.getMonthValue(),
                                        email);

                        relatorio.add(new RelatorioMensalDTO(
                                        periodo.getYear(),
                                        periodo.getMonthValue(),
                                        resumo.getConsumoLitros(),
                                        resumo.getConsumoM3(),
                                        resumo.getValorAgua(),
                                        resumo.getValorEsgoto(),
                                        resumo.getValorEstimado()));
                }

                return relatorio;
        }
}
