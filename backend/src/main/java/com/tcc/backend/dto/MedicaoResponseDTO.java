package com.tcc.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MedicaoResponseDTO {

    private String medicaoId;
    private LocalDateTime dataHora;
    private BigDecimal vazao;
    private BigDecimal volumeLitros;

    public MedicaoResponseDTO() {
    }

    public MedicaoResponseDTO(
            String medicaoId,
            LocalDateTime dataHora,
            BigDecimal vazao,
            BigDecimal volumeLitros) {

        this.medicaoId = medicaoId;
        this.dataHora = dataHora;
        this.vazao = vazao;
        this.volumeLitros = volumeLitros;
    }

    public String getMedicaoId() {
        return medicaoId;
    }

    public void setMedicaoId(String medicaoId) {
        this.medicaoId = medicaoId;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public BigDecimal getVazao() {
        return vazao;
    }

    public void setVazao(BigDecimal vazao) {
        this.vazao = vazao;
    }

    public BigDecimal getVolumeLitros() {
        return volumeLitros;
    }

    public void setVolumeLitros(BigDecimal volumeLitros) {
        this.volumeLitros = volumeLitros;
    }
}