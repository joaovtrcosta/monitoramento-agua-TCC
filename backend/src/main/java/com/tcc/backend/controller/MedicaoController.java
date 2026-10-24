package com.tcc.backend.controller;

import com.tcc.backend.dto.ConsumoDiarioDTO;
import com.tcc.backend.dto.MedicaoDTO;
import com.tcc.backend.dto.MedicaoResponseDTO;
import com.tcc.backend.dto.RelatorioMensalDTO;
import com.tcc.backend.dto.ResumoMensalDTO;
import com.tcc.backend.entity.Medicao;
import com.tcc.backend.service.AnaliseIaService;
import com.tcc.backend.service.MedicaoService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicoes")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicaoController {

        private final MedicaoService medicaoService;
        private final AnaliseIaService analiseIaService;

        public MedicaoController(
                        MedicaoService medicaoService,
                        AnaliseIaService analiseIaService) {

                this.medicaoService = medicaoService;
                this.analiseIaService = analiseIaService;
        }

        @PostMapping
        public ResponseEntity<MedicaoResponseDTO> salvar(
                        @RequestBody MedicaoDTO dto) {

                Medicao novaMedicao = medicaoService.salvar(dto);

                return ResponseEntity.ok(
                                converterParaDTO(novaMedicao));
        }

        @PostMapping("/simulada")
        public ResponseEntity<MedicaoResponseDTO> salvarSimulada(
                        @RequestBody MedicaoDTO dto) {

                Medicao novaMedicao = medicaoService.salvarSimulada(dto);

                return ResponseEntity.ok(
                                converterParaDTO(novaMedicao));
        }

        @GetMapping
        public ResponseEntity<List<MedicaoResponseDTO>> listarTodas(
                        Authentication authentication) {

                String email = authentication.getName();

                List<MedicaoResponseDTO> medicoes = medicaoService.listarPorUsuario(email)
                                .stream()
                                .map(this::converterParaDTO)
                                .toList();

                return ResponseEntity.ok(medicoes);
        }

        @GetMapping("/hoje")
        public ResponseEntity<BigDecimal> consumoHoje(
                        Authentication authentication) {

                String email = authentication.getName();

                LocalDate hoje = LocalDate.now();

                LocalDateTime inicio = hoje.atStartOfDay();
                LocalDateTime fim = hoje.plusDays(1).atStartOfDay();

                BigDecimal consumo = medicaoService.somarVolumeEntre(
                                inicio,
                                fim,
                                email);

                return ResponseEntity.ok(consumo);
        }

        @GetMapping("/por-data")
        public ResponseEntity<List<MedicaoResponseDTO>> listarPorData(
                        @RequestParam LocalDate data,
                        Authentication authentication) {

                String email = authentication.getName();

                List<MedicaoResponseDTO> medicoes = medicaoService.listarPorData(data, email)
                                .stream()
                                .map(this::converterParaDTO)
                                .toList();

                return ResponseEntity.ok(medicoes);
        }

        @GetMapping("/resumo-mensal")
        public ResponseEntity<ResumoMensalDTO> resumoMensal(
                        @RequestParam int ano,
                        @RequestParam int mes,
                        Authentication authentication) {

                String email = authentication.getName();

                ResumoMensalDTO resumo = medicaoService.obterResumoMensal(
                                ano,
                                mes,
                                email);

                return ResponseEntity.ok(resumo);
        }

        @GetMapping("/consumo-diario")
        public ResponseEntity<List<ConsumoDiarioDTO>> consumoDiario(
                        @RequestParam int ano,
                        @RequestParam int mes,
                        Authentication authentication) {

                String email = authentication.getName();

                List<ConsumoDiarioDTO> consumo = medicaoService.obterConsumoDiario(
                                ano,
                                mes,
                                email);

                return ResponseEntity.ok(consumo);
        }

        @GetMapping("/relatorio-mensal")
        public ResponseEntity<List<RelatorioMensalDTO>> relatorioMensal(
                        @RequestParam int anoInicial,
                        @RequestParam int mesInicial,
                        @RequestParam int anoFinal,
                        @RequestParam int mesFinal,
                        Authentication authentication) {

                String email = authentication.getName();

                List<RelatorioMensalDTO> relatorio = medicaoService.gerarRelatorioMensal(
                                anoInicial,
                                mesInicial,
                                anoFinal,
                                mesFinal,
                                email);

                return ResponseEntity.ok(relatorio);
        }

        // Análise histórica realizada pela API Python.
        @PostMapping("/analisar-ia")
        public ResponseEntity<Map<String, Object>> analisarHistorico(
                        Authentication authentication) {

                String email = authentication.getName();

                Map<String, Object> resultado = analiseIaService.analisarHistorico(email);

                System.out.println("Resultado enviado ao Postman:");
                System.out.println(resultado);

                return ResponseEntity.ok(resultado);
        }

        private MedicaoResponseDTO converterParaDTO(Medicao medicao) {

                return new MedicaoResponseDTO(
                                medicao.getMedicaoId(),
                                medicao.getDataHora(),
                                medicao.getVazao(),
                                medicao.getVolumeLitros());
        }

        @PostMapping("/analisar-vazamento")
        public ResponseEntity<Map<String, Object>> analisarVazamento(
                        Authentication authentication) {

                String email = authentication.getName();

                Map<String, Object> resultado = analiseIaService.analisarVazamento(email);

                return ResponseEntity.ok(resultado);
        }

        @PostMapping("/prever-consumo")
        public ResponseEntity<Map<String, Object>> preverConsumo(
                        Authentication authentication) {

                String email = authentication.getName();

                Map<String, Object> resultado = analiseIaService.preverConsumo(email);

                return ResponseEntity.ok(resultado);
        }

        @PostMapping("/analisar-sessoes")
        public ResponseEntity<Map<String, Object>> analisarSessoes(
                        Authentication authentication) {

                String email = authentication.getName();

                Map<String, Object> resultado = analiseIaService.analisarSessoes(email);

                return ResponseEntity.ok(resultado);
        }

}
