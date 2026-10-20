package com.tcc.backend.controller;

import com.tcc.backend.dto.AtualizarPerfilDTO;
import com.tcc.backend.dto.AlterarSenhaDTO;
import com.tcc.backend.entity.Usuario;
import com.tcc.backend.service.PerfilService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public ResponseEntity<?> buscarPerfil(
            Authentication authentication) {

        Usuario usuario = perfilService.buscarPorEmail(
                authentication.getName());

        return ResponseEntity.ok(Map.of(
                "nome", usuario.getNome(),
                "email", usuario.getEmail(),
                "role", usuario.getRole().name()
        ));
    }

    @PutMapping
    public ResponseEntity<?> atualizarPerfil(
            @RequestBody AtualizarPerfilDTO dto,
            Authentication authentication) {

        Usuario usuario = perfilService.atualizarPerfil(
                authentication.getName(), dto);

        return ResponseEntity.ok(Map.of(
                "mensagem", "Perfil atualizado com sucesso.",
                "nome", usuario.getNome(),
                "email", usuario.getEmail(),
                "role", usuario.getRole().name()
        ));
    }

    @PutMapping("/senha")
    public ResponseEntity<?> alterarSenha(
            @RequestBody AlterarSenhaDTO dto,
            Authentication authentication) {

        perfilService.alterarSenha(
                authentication.getName(), dto);

        return ResponseEntity.ok(Map.of(
                "mensagem", "Senha alterada com sucesso."
        ));
    }
}