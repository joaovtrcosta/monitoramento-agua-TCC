
package com.tcc.backend.controller;

import com.tcc.backend.dto.DispositivoResponseDTO;
import com.tcc.backend.entity.Dispositivo;
import com.tcc.backend.service.DispositivoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dispositivos")
@CrossOrigin(origins = "http://localhost:3000")
public class DispositivoController {

    private final DispositivoService dispositivoService;

    public DispositivoController(DispositivoService dispositivoService) {
        this.dispositivoService = dispositivoService;
    }

    @PostMapping("/residencia/{residenciaId}")
    public ResponseEntity<DispositivoResponseDTO> criar(
            @PathVariable UUID residenciaId,
            @RequestBody Dispositivo dispositivo) {

        Dispositivo salvo =
                dispositivoService.salvar(dispositivo, residenciaId);

        return ResponseEntity.ok(
                dispositivoService.converterParaDTO(salvo));
    }

    @GetMapping("/residencia/{residenciaId}")
    public ResponseEntity<List<DispositivoResponseDTO>> listarPorResidencia(
            @PathVariable UUID residenciaId) {

        List<DispositivoResponseDTO> dispositivos =
                dispositivoService.listarPorResidencia(residenciaId)
                        .stream()
                        .map(dispositivoService::converterParaDTO)
                        .toList();

        return ResponseEntity.ok(dispositivos);
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<DispositivoResponseDTO> buscarPorDeviceId(
            @PathVariable String deviceId) {

        Dispositivo dispositivo =
                dispositivoService.buscarPorDeviceId(deviceId);

        return ResponseEntity.ok(
                dispositivoService.converterParaDTO(dispositivo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DispositivoResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody Dispositivo dados) {

        Dispositivo atualizado =
                dispositivoService.atualizar(id, dados);

        return ResponseEntity.ok(
                dispositivoService.converterParaDTO(atualizado));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DispositivoResponseDTO> alterarStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> dados) {

        Boolean ativo = dados.get("ativo");

        if (ativo == null) {
            throw new IllegalArgumentException(
                    "Informe o status do dispositivo.");
        }

        Dispositivo atualizado =
                dispositivoService.alterarStatus(id, ativo);

        return ResponseEntity.ok(
                dispositivoService.converterParaDTO(atualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        dispositivoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
