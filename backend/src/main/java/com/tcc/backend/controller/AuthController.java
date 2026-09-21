package com.tcc.backend.controller;

import com.tcc.backend.dto.LoginDTO;
import com.tcc.backend.dto.LoginResponseDTO;
import com.tcc.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginDTO dto) {

        return ResponseEntity.ok(
                authService.login(dto)
        );
    }
}