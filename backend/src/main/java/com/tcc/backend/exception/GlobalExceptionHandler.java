
package com.tcc.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarErro(
            IllegalArgumentException ex) {

        String mensagem = ex.getMessage();

        HttpStatus status = HttpStatus.BAD_REQUEST;

        if ("Este e-mail já está cadastrado.".equals(mensagem)) {
            status = HttpStatus.CONFLICT;
        }

        return ResponseEntity
                .status(status)
                .body(Map.of("mensagem", mensagem));
    }
}
