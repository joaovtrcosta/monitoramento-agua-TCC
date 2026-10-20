package com.tcc.backend.controller;

import com.tcc.backend.dto.UsuarioResponseDTO;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.service.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(
            @RequestBody Usuario usuario) {

        Usuario usuarioSalvo = usuarioService.salvar(usuario);

        return ResponseEntity.ok(
                UsuarioResponseDTO.fromEntity(usuarioSalvo));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarTodos()
                .stream()
                .map(UsuarioResponseDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(
            @PathVariable UUID id) {

        Usuario usuario = usuarioService.buscarPorId(id);

        return ResponseEntity.ok(
                UsuarioResponseDTO.fromEntity(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody Usuario dados) {

        Usuario usuarioAtualizado = usuarioService.atualizar(id, dados);

        return ResponseEntity.ok(
                UsuarioResponseDTO.fromEntity(usuarioAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        usuarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
