
package com.tcc.backend.dto;

import java.math.BigDecimal;

public record RelatorioMensalDTO(
        int ano,
        int mes,
        BigDecimal consumoLitros,
        BigDecimal consumoM3,
        BigDecimal valorAgua,
        BigDecimal valorEsgoto,
        BigDecimal valorEstimado
) {
}
