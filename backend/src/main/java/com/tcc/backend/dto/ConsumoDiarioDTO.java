package com.tcc.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ConsumoDiarioDTO {

    private LocalDate data;
    private BigDecimal consumoLitros;

    public ConsumoDiarioDTO() {
    }

    public ConsumoDiarioDTO(
            LocalDate data,
            BigDecimal consumoLitros) {

        this.data = data;
        this.consumoLitros = consumoLitros;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public BigDecimal getConsumoLitros() {
        return consumoLitros;
    }

    public void setConsumoLitros(BigDecimal consumoLitros) {
        this.consumoLitros = consumoLitros;
    }
}