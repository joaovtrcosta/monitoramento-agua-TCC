package com.tcc.backend.controller;

import com.tcc.backend.entity.Dispositivo;
import com.tcc.backend.service.DispositivoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dispositivos")
@CrossOrigin(origins = "http://localhost:3000")
public class DispositivoController {

    private final DispositivoService dispositivoService;

    public DispositivoController(
            DispositivoService dispositivoService) {

        this.dispositivoService = dispositivoService;
    }

    @PostMapping("/residencia/{residenciaId}")
    public ResponseEntity<Dispositivo> criar(
            @PathVariable UUID residenciaId,
            @RequestBody Dispositivo dispositivo) {

        return ResponseEntity.ok(
                dispositivoService.salvar(
                        dispositivo,
                        residenciaId));
    }

    @GetMapping("/residencia/{residenciaId}")
    public ResponseEntity<List<Dispositivo>> listarPorResidencia(
            @PathVariable UUID residenciaId) {

        return ResponseEntity.ok(
                dispositivoService.listarPorResidencia(
                        residenciaId));
    }

    @GetMapping("/{deviceId}")
    public ResponseEntity<Dispositivo> buscarPorDeviceId(
            @PathVariable String deviceId) {

        return ResponseEntity.ok(
                dispositivoService.buscarPorDeviceId(
                        deviceId));
    }
}