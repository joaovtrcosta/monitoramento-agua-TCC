package com.tcc.backend.controller;

import com.tcc.backend.entity.Residencia;
import com.tcc.backend.service.ResidenciaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/residencias")
@CrossOrigin(origins = "http://localhost:3000")
public class ResidenciaController {

    private final ResidenciaService residenciaService;

    public ResidenciaController(
            ResidenciaService residenciaService) {

        this.residenciaService = residenciaService;
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<Residencia> criar(
            @PathVariable UUID usuarioId,
            @RequestBody Residencia residencia) {

        return ResponseEntity.ok(
                residenciaService.salvar(
                        residencia,
                        usuarioId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Residencia>> listarPorUsuario(
            @PathVariable UUID usuarioId) {

        return ResponseEntity.ok(
                residenciaService.listarPorUsuario(
                        usuarioId));
    }
}