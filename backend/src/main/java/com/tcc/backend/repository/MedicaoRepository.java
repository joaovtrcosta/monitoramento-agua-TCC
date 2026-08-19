package com.tcc.backend.repository;

import com.tcc.backend.entity.Medicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface MedicaoRepository extends JpaRepository<Medicao, UUID> {

    Optional<Medicao> findByMedicaoId(String medicaoId);

    @Query("""
        SELECT COALESCE(SUM(m.volumeLitros), 0)
        FROM Medicao m
        WHERE m.dataHora >= :inicio
        AND m.dataHora < :fim
    """)
    BigDecimal somarVolumeEntre(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}