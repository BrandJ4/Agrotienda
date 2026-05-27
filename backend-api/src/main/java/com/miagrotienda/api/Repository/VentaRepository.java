package com.miagrotienda.api.Repository;

import com.miagrotienda.api.Model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    List<Venta> findByUsuarioUsernameOrderByFechaDesc(String username);

    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    Optional<Venta> findByIdAndUsuarioUsername(Long id, String username);

    @Override
    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    Optional<Venta> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    List<Venta> findAll();
}
