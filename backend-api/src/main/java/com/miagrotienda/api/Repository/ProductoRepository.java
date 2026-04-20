package com.miagrotienda.api.Repository;

import com.miagrotienda.api.Model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Aquí ya tenemos métodos como save(), findAll(), delete(), etc.
}
