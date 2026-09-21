package com.tcc.backend.repository;

import com.tcc.backend.entity.Medicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicaoRepository extends JpaRepository<Medicao, UUID> {

    Optional<Medicao> findByMedicaoId(String medicaoId);

    List<Medicao> findByDispositivo_Residencia_Usuario_Email(
            String email
    );

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

    List<Medicao>
    findByDispositivo_Residencia_Usuario_EmailAndDataHoraGreaterThanEqualAndDataHoraLessThan(
            String email,
            LocalDateTime inicio,
            LocalDateTime fim
    );

    @Query("""
            SELECT COALESCE(SUM(m.volumeLitros), 0)
            FROM Medicao m
            WHERE m.dataHora >= :inicio
            AND m.dataHora < :fim
            AND m.dispositivo.residencia.usuario.email = :email
            """)
    BigDecimal somarVolumeEntreUsuario(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("email") String email
    );
}