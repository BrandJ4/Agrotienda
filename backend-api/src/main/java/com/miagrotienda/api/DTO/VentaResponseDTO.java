package com.miagrotienda.api.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaResponseDTO {
    private Long id;
    private LocalDateTime fecha;
    private Double total;
    private String metodoPago;
    private String estadoPago;
    private String referenciaPago;
    private List<DetalleVentaResponseDTO> detalles;
}
