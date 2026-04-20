package com.miagrotienda.api.Service;

import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Producto guardar(Producto producto) {
        // Aquí podrías agregar validaciones de negocio en el futuro
        return productoRepository.save(producto);
    }

    // Funcionalidad solicitada: Comparar precios (Filtrar por precio máximo)
    public List<Producto> filtrarPorPrecioMaximo(Double precio) {
        return productoRepository.findAll().stream()
                .filter(p -> p.getPrecio() <= precio)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void actualizarStock(Long id, Integer cantidad) {
    // 1. Buscamos el producto de forma segura
    Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto con ID " + id + " no encontrado"));

    // 2. Usamos un método privado para validar (Esto es Refactor)
    validarDisponibilidad(producto, cantidad);

    // 3. Actualizamos
    producto.setStock(producto.getStock() - cantidad);
    productoRepository.save(producto);
}

private void validarDisponibilidad(Producto p, Integer cantidad) {
    if (p.getStock() < cantidad) {
        throw new RuntimeException("Stock insuficiente para: " + p.getNombre());
    }
}
}