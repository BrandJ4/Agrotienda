package com.miagrotienda.api.Controller;

import com.miagrotienda.api.DTO.DetalleVentaResponseDTO;
import com.miagrotienda.api.DTO.VentaCreateRequestDTO;
import com.miagrotienda.api.DTO.VentaResponseDTO;
import com.miagrotienda.api.Model.DetalleVenta;
import com.miagrotienda.api.Model.Venta;
import com.miagrotienda.api.Service.VentaService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENTE') or hasAuthority('ADMIN')")
    public VentaResponseDTO registrarVenta(@RequestBody VentaCreateRequestDTO req) {
        return toDto(ventaService.registrarVenta(req));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<VentaResponseDTO> listarTodas() {
        return ventaService.listarTodas().stream().map(this::toDto).toList();
    }

    @GetMapping("/mis")
    @PreAuthorize("hasAuthority('CLIENTE') or hasAuthority('ADMIN')")
    public List<VentaResponseDTO> misVentas() {
        return ventaService.misVentas().stream().map(this::toDto).toList();
    }

    @GetMapping("/mis/{id}")
    @PreAuthorize("hasAuthority('CLIENTE') or hasAuthority('ADMIN')")
    public VentaResponseDTO obtenerMiVenta(@PathVariable Long id) {
        return toDto(ventaService.obtenerMiVentaPorId(id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public VentaResponseDTO obtenerVenta(@PathVariable Long id) {
        return toDto(ventaService.obtenerPorId(id));
    }

    private VentaResponseDTO toDto(Venta venta) {
        VentaResponseDTO dto = new VentaResponseDTO();
        dto.setId(venta.getId());
        dto.setFecha(venta.getFecha());
        dto.setTotal(venta.getTotal());
        dto.setMetodoPago(venta.getMetodoPago() == null ? null : venta.getMetodoPago().name());
        dto.setEstadoPago(venta.getEstadoPago() == null ? null : venta.getEstadoPago().name());
        dto.setReferenciaPago(venta.getReferenciaPago());
        dto.setDetalles(venta.getDetalles().stream().map(this::toDetalleDto).toList());
        return dto;
    }

    private DetalleVentaResponseDTO toDetalleDto(DetalleVenta detalle) {
        DetalleVentaResponseDTO dto = new DetalleVentaResponseDTO();
        dto.setProductoId(detalle.getProducto().getId());
        dto.setProductoNombre(detalle.getProducto().getNombre());
        dto.setCantidad(detalle.getCantidad());
        dto.setPrecioUnitario(detalle.getPrecioUnitario());
        dto.setSubtotal(detalle.getSubtotal());
        return dto;
    }
}