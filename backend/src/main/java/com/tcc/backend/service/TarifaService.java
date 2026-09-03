package com.tcc.backend.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TarifaService {

    /*
     * Até 0,050 m³ (50 litros):
     * cobrança mínima de R$ 2,00 pela água.
     */
    private static final BigDecimal LIMITE_MINIMO_M3 =
            new BigDecimal("0.050");

    private static final BigDecimal VALOR_MINIMO_AGUA =
            new BigDecimal("2.00");

    /*
     * Acima de 0,050 m³:
     * acrescenta R$ 10,00 por m³ consumido.
     */
    private static final BigDecimal TARIFA_POR_M3 =
            new BigDecimal("10.00");

    private static final BigDecimal PERCENTUAL_ESGOTO =
            new BigDecimal("0.80");


            public BigDecimal calcularValorAgua(
            BigDecimal consumoM3
    ) {

        if (
                consumoM3 == null ||
                consumoM3.compareTo(BigDecimal.ZERO) < 0
        ) {

            throw new IllegalArgumentException(
                    "Consumo inválido."
            );
        }

        // Até 0,050 m³ mantém o valor mínimo.
        if (
                consumoM3.compareTo(
                        LIMITE_MINIMO_M3
                ) <= 0
        ) {

            return VALOR_MINIMO_AGUA
                    .setScale(
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        // Calcula somente o consumo acima de 0,050 m³.
        BigDecimal excedente =
                consumoM3.subtract(
                        LIMITE_MINIMO_M3
                );

        BigDecimal valorExcedente =
                excedente.multiply(
                        TARIFA_POR_M3
                );

        BigDecimal valorAgua =
                VALOR_MINIMO_AGUA.add(
                        valorExcedente
                );

        return valorAgua.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    public BigDecimal calcularValorEsgoto(
            BigDecimal valorAgua
    ) {

        if (
                valorAgua == null ||
                valorAgua.compareTo(BigDecimal.ZERO) < 0
        ) {

            throw new IllegalArgumentException(
                    "Valor da água inválido."
            );
        }

        return valorAgua
                .multiply(
                        PERCENTUAL_ESGOTO
                )
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    public BigDecimal calcularValorTotal(
            BigDecimal consumoM3
    ) {

        BigDecimal valorAgua =
                calcularValorAgua(
                        consumoM3
                );

        BigDecimal valorEsgoto =
                calcularValorEsgoto(
                        valorAgua
                );

        return valorAgua
                .add(
                        valorEsgoto
                )
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }
}