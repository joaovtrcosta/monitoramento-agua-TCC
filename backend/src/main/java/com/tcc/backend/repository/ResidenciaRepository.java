package com.tcc.backend.repository;

import com.tcc.backend.entity.Residencia;
import com.tcc.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResidenciaRepository extends JpaRepository<Residencia, UUID> {

    List<Residencia> findByUsuario(Usuario usuario);
}