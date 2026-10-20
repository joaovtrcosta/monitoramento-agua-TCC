package com.tcc.backend.controller;

import com.tcc.backend.dto.ConsumoDiarioDTO;
import com.tcc.backend.dto.MedicaoDTO;
import com.tcc.backend.dto.MedicaoResponseDTO;
import com.tcc.backend.dto.ResumoMensalDTO;
import com.tcc.backend.entity.Medicao;
import com.tcc.backend.service.MedicaoService;
import com.tcc.backend.dto.RelatorioMensalDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/medicoes")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicaoController {

        private final MedicaoService medicaoService;

        public MedicaoController(MedicaoService medicaoService) {
                this.medicaoService = medicaoService;
        }

        @PostMapping
        public ResponseEntity<MedicaoResponseDTO> salvar(
                        @RequestBody MedicaoDTO dto) {

                Medicao novaMedicao = medicaoService.salvar(dto);

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

        // NOVO: consulta as medições de uma data específica.
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

        private MedicaoResponseDTO converterParaDTO(Medicao medicao) {

                return new MedicaoResponseDTO(
                                medicao.getMedicaoId(),
                                medicao.getDataHora(),
                                medicao.getVazao(),
                                medicao.getVolumeLitros());
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

}
