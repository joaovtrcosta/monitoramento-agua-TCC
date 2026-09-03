package com.tcc.backend.dto;

import java.math.BigDecimal;

public class ResumoMensalDTO {

    private BigDecimal consumoLitros;
    private BigDecimal consumoM3;

    private BigDecimal valorAgua;
    private BigDecimal valorEsgoto;

    private BigDecimal valorEstimado;

    public ResumoMensalDTO(
            BigDecimal consumoLitros,
            BigDecimal consumoM3,
            BigDecimal valorAgua,
            BigDecimal valorEsgoto,
            BigDecimal valorEstimado) {

        this.consumoLitros = consumoLitros;

        this.consumoM3 = consumoM3;

        this.valorAgua = valorAgua;

        this.valorEsgoto = valorEsgoto;

        this.valorEstimado = valorEstimado;
    }

    public BigDecimal getConsumoLitros() {
        return consumoLitros;
    }

    public BigDecimal getConsumoM3() {
        return consumoM3;
    }

    public BigDecimal getValorAgua() {
        return valorAgua;
    }

    public BigDecimal getValorEsgoto() {
        return valorEsgoto;
    }

    public BigDecimal getValorEstimado() {
        return valorEstimado;
    }
}