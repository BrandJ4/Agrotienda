package com.miagrotienda.api.DTO;

import com.miagrotienda.api.Model.MetodoPago;
import lombok.Data;

import java.util.List;

@Data
public class VentaCreateRequestDTO {
    private List<ItemCarritoDTO> items;
    private MetodoPago metodoPago;
    private String referenciaPago;
}
