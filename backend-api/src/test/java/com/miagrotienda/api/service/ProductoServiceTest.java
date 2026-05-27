package com.miagrotienda.api.service;

import com.miagrotienda.api.Exception.InsufficientStockException;
import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Repository.ProductoRepository;
import com.miagrotienda.api.Service.ProductoService;

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
        Producto p = new Producto();
        p.setId(1L);
        p.setNombre("Fertilizante");
        p.setDescripcion("Bidón de 1L");
        p.setPrecio(50.0);
        p.setStock(2);
        p.setOferta(false);
        p.setDescuentoPorcentaje(null);

        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(p));

        assertThrows(InsufficientStockException.class, () -> productoService.actualizarStock(1L, 5));
    }
}
