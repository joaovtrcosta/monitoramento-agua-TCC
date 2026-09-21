package com.tcc.backend.config;

import com.tcc.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Login público
                .requestMatchers("/api/auth/**").permitAll()

                // Cadastro de usuário - temporário
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()

                // Criação de residência - temporário
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/residencias/**"
                ).permitAll()

                // Criação de dispositivo - temporário
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/dispositivos/**"
                ).permitAll()

                // Recebimento de medições do ESP32 - temporário
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/medicoes"
                ).permitAll()

                // Todo o restante exige JWT
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}