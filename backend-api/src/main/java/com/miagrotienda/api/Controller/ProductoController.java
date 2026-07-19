package com.miagrotienda.api.Controller;

import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Service.ProductoService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
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

    @GetMapping("/{id}")
    public Producto obtenerPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id);
    }

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoService.guardar(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return productoService.actualizar(id, producto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
    }

    @GetMapping("/buscar")
    public List<Producto> buscarPorPrecio(@RequestParam Double precioMax) {
        return productoService.filtrarPorPrecioMaximo(precioMax);
    }

    @PutMapping("/{id}/comprar")
    public void comprarProducto(@PathVariable Long id, @RequestParam Integer cantidad) {
        productoService.actualizarStock(id, cantidad);
    }
}