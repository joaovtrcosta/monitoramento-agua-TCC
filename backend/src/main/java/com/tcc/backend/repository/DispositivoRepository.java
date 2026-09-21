package com.tcc.backend.repository;

import com.tcc.backend.entity.Dispositivo;
import com.tcc.backend.entity.Residencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DispositivoRepository extends JpaRepository<Dispositivo, UUID> {

    Optional<Dispositivo> findByDeviceId(String deviceId);

    List<Dispositivo> findByResidencia(Residencia residencia);

    boolean existsByDeviceId(String deviceId);
}