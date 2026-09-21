package com.tcc.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY = "chave-secreta-do-tcc-monitoramento-agua-2026";

    private static final long EXPIRATION_TIME = 1000L * 60 * 60 * 24; // 24 horas

    private final SecretKey key;

    public JwtService() {
        this.key = Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public String extrairRole(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
    }

    public String gerarToken(String email, String role) {

        Date agora = new Date();
        Date expiracao = new Date(
                agora.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(key)
                .compact();
    }

    public String extrairEmail(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean tokenValido(String token) {

        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {
            return false;
        }
    }
}