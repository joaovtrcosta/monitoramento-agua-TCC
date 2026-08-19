package com.tcc.backend.controller;

import com.tcc.backend.dto.MedicaoDTO;
import com.tcc.backend.entity.Medicao;
import com.tcc.backend.service.MedicaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;

@RestController
@RequestMapping("/api/medicoes")
public class MedicaoController {

    private final MedicaoService medicaoService;

    public MedicaoController(MedicaoService medicaoService) {
        this.medicaoService = medicaoService;
    }

    @PostMapping
    public ResponseEntity<Medicao> salvar(@RequestBody MedicaoDTO dto) {
        Medicao novaMedicao = medicaoService.salvar(dto);
        return ResponseEntity.ok(novaMedicao);
    }

    @GetMapping
    public ResponseEntity<List<Medicao>> listarTodas() {
        return ResponseEntity.ok(medicaoService.listarTodas());
    }

    @GetMapping("/hoje")
public ResponseEntity<BigDecimal> consumoHoje() {

    LocalDate hoje = LocalDate.now();

    LocalDateTime inicio = hoje.atStartOfDay();
    LocalDateTime fim = hoje.plusDays(1).atStartOfDay();

    BigDecimal consumo = medicaoService.somarVolumeEntre(inicio, fim);

    return ResponseEntity.ok(consumo);
}
}