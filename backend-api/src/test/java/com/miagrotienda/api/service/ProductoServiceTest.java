package com.miagrotienda.api.service;

import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Repository.ProductoRepository;
import com.miagrotienda.api.Service.ProductoService;

// El import de ProductoService no será necesario si están en el mismo paquete
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductoServiceTest {

    @Mock private ProductoRepository productoRepository;
    @InjectMocks private ProductoService productoService;

    public ProductoServiceTest() { 
        MockitoAnnotations.openMocks(this); 
    }

    @Test
    void testComprarSinStockLanzaExcepcion() {
        // ARRANGE: Simulamos que solo hay 2 unidades en MySQL
        Producto p = new Producto(1L, "Fertilizante","Bidón de 1L", 50.0, 2);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(p));

        // ACT & ASSERT: El test espera una falla (RuntimeException)
        assertThrows(RuntimeException.class, () -> {
            productoService.actualizarStock(1L, 5); 
        });
    }
}
