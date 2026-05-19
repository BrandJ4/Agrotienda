package com.miagrotienda.api.Controller;

import com.miagrotienda.api.DTO.ItemCarritoDTO;
import com.miagrotienda.api.Model.Venta;
import com.miagrotienda.api.Service.VentaService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:4200")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {

        this.ventaService = ventaService;
    }

    @PostMapping
    public Venta registrarVenta(
            @RequestBody List<ItemCarritoDTO> items
    ) {

        return ventaService.registrarVenta(items);
    }
}