package com.miagrotienda.api.Service;

import com.miagrotienda.api.DTO.ItemCarritoDTO;
import com.miagrotienda.api.Model.DetalleVenta;
import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Model.Venta;
import com.miagrotienda.api.Repository.ProductoRepository;
import com.miagrotienda.api.Repository.VentaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;

    private final ProductoRepository productoRepository;

    public VentaService(
            VentaRepository ventaRepository,
            ProductoRepository productoRepository
    ) {

        this.ventaRepository = ventaRepository;

        this.productoRepository = productoRepository;
    }

    @Transactional
    public Venta registrarVenta(List<ItemCarritoDTO> items) {

        Venta venta = new Venta();

        List<DetalleVenta> detalles = new ArrayList<>();

        double total = 0;

        for (ItemCarritoDTO item : items) {

            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() ->
                            new RuntimeException("Producto no encontrado"));

            // VALIDAR STOCK
            if (producto.getStock() < item.getCantidad()) {

                throw new RuntimeException(
                        "Stock insuficiente para: " + producto.getNombre()
                );
            }

            // DESCONTAR STOCK
            producto.setStock(
                    producto.getStock() - item.getCantidad()
            );

            // CALCULAR SUBTOTAL
            double subtotal =
                    producto.getPrecio() * item.getCantidad();

            // CREAR DETALLE
            DetalleVenta detalle = new DetalleVenta();

            detalle.setProducto(producto);

            detalle.setCantidad(item.getCantidad());

            detalle.setPrecioUnitario(producto.getPrecio());

            detalle.setSubtotal(subtotal);

            detalle.setVenta(venta);

            detalles.add(detalle);

            total += subtotal;
        }

        venta.setDetalles(detalles);

        venta.setTotal(total);

        return ventaRepository.save(venta);
    }
}