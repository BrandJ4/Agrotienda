package com.miagrotienda.api.Repository;

import com.miagrotienda.api.Model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {
}