package com.miagrotienda.api.DTO;

import lombok.Data;

@Data
public class DetalleVentaResponseDTO {
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;
}
