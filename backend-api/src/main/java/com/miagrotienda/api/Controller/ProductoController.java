package com.miagrotienda.api.Controller;

import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Service.ProductoService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> listar() {
        return productoService.obtenerTodos();
    }

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoService.guardar(producto);
    }

    // Nuevo endpoint para cumplir con "comparar precios"
    @GetMapping("/buscar")
    public List<Producto> buscarPorPrecio(@RequestParam Double precioMax) {
        return productoService.filtrarPorPrecioMaximo(precioMax);
    }
    
    @PutMapping("/{id}/comprar")
    public void comprarProducto(@PathVariable Long id, @RequestParam Integer cantidad) {
    productoService.actualizarStock(id, cantidad);
    }
}