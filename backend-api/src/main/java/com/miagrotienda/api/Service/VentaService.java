package com.miagrotienda.api.Service;

import com.miagrotienda.api.DTO.ItemCarritoDTO;
import com.miagrotienda.api.DTO.VentaCreateRequestDTO;
import com.miagrotienda.api.Exception.BadRequestException;
import com.miagrotienda.api.Exception.InsufficientStockException;
import com.miagrotienda.api.Exception.NotFoundException;
import com.miagrotienda.api.Model.EstadoPago;
import com.miagrotienda.api.Model.DetalleVenta;
import com.miagrotienda.api.Model.MetodoPago;
import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Model.Usuario;
import com.miagrotienda.api.Model.Venta;
import com.miagrotienda.api.Repository.ProductoRepository;
import com.miagrotienda.api.Repository.UsuarioRepository;
import com.miagrotienda.api.Repository.VentaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;

    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public VentaService(
            VentaRepository ventaRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository
    ) {

        this.ventaRepository = ventaRepository;

        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Venta registrarVenta(VentaCreateRequestDTO req) {

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new BadRequestException("Items es obligatorio");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setMetodoPago(req.getMetodoPago() == null ? MetodoPago.EFECTIVO : req.getMetodoPago());
        venta.setEstadoPago(EstadoPago.PENDIENTE);
        venta.setReferenciaPago(req.getReferenciaPago());

        double total = 0;

        for (ItemCarritoDTO item : req.getItems()) {
            // NOTA: Si sigue dando error, cambia temporalmente findByIdForUpdate por findById
            Producto producto = productoRepository.findById(item.getProductoId())
              .orElseThrow(() -> new NotFoundException("Producto no encontrado"));

            // VALIDAR STOCK
            if (producto.getStock() < item.getCantidad()) {
                throw new InsufficientStockException(
                        "Stock insuficiente para: " + producto.getNombre()
                );
            }

            // DESCONTAR STOCK
            producto.setStock(producto.getStock() - item.getCantidad());

            // CALCULAR SUBTOTAL
            double subtotal = producto.getPrecio() * item.getCantidad();

            // CREAR DETALLE
            DetalleVenta detalle = new DetalleVenta();
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotal);
            detalle.setVenta(venta); // Enlace bidireccional

            // Añadimos directamente a la lista interna ya inicializada de la venta
            venta.getDetalles().add(detalle);

            total += subtotal;
        }

        venta.setTotal(total);

        // Guardará la venta y por CascadeType.ALL guardará todos los detalles hijos automáticamente
        return ventaRepository.save(venta);
    }

    @Transactional(readOnly = true)
    public List<Venta> misVentas() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ventaRepository.findByUsuarioUsernameOrderByFechaDesc(username);
    }

    @Transactional(readOnly = true)
    public Venta obtenerPorId(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Venta obtenerMiVentaPorId(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ventaRepository.findByIdAndUsuarioUsername(id, username)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));
    }
}
