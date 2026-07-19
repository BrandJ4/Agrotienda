package com.miagrotienda.api.Repository;

import com.miagrotienda.api.Model.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;


import java.util.Optional;


public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Aquí ya tenemos métodos como save(), findAll(), delete(), etc.

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> findByIdForUpdate(Long id);
}
