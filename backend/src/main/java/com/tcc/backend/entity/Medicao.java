package com.tcc.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medicoes")
public class Medicao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String medicaoId;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal vazao;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal volumeLitros;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorEstimado;

    public Medicao() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public BigDecimal getValorEstimado() {
        return valorEstimado;
    }

    public void setValorEstimado(BigDecimal valorEstimado) {
        this.valorEstimado = valorEstimado;
    }
}