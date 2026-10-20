
package com.tcc.backend.controller;

import com.tcc.backend.service.PasswordResetService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

        private final PasswordResetService passwordResetService;

        public PasswordResetController(
                        PasswordResetService passwordResetService) {
                this.passwordResetService = passwordResetService;
        }

        public record EsqueciSenhaRequest(String email) {
        }

        public record RedefinirSenhaRequest(
                        String token,
                        String novaSenha) {
        }

        @PostMapping("/esqueci-senha")
        public ResponseEntity<Map<String, String>> esqueciSenha(
                        @RequestBody EsqueciSenhaRequest request) {

                passwordResetService.solicitarRecuperacao(
                                request.email());

                return ResponseEntity.ok(Map.of(
                                "mensagem",
                                "Se o e-mail estiver cadastrado, "
                                                + "você receberá um link de recuperação."));
        }

        @PostMapping("/redefinir-senha")
        public ResponseEntity<Map<String, String>> redefinirSenha(
                        @RequestBody RedefinirSenhaRequest request) {

                passwordResetService.redefinirSenha(
                                request.token(),
                                request.novaSenha());

                return ResponseEntity.ok(Map.of(
                                "mensagem",
                                "Senha redefinida com sucesso."));
        }
}
