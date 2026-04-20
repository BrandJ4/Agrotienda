import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductoService } from './services/producto.service';
import { Producto } from './producto.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  listaProductos: Producto[] = [];
  productosFiltrados: Producto[] = []; // Esta lista es la que veremos en pantalla
  terminoBusqueda: string = '';

  // NUEVO: Lista para el carrito
  carrito: Producto[] = [];
  total: number = 0;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.listaProductos = data;
        this.productosFiltrados = data;
      }
    });
  }

  // Lógica de búsqueda por nombre o precio
  filtrar() {
    this.productosFiltrados = this.listaProductos.filter(p => 
      p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      p.precio.toString().includes(this.terminoBusqueda)
    );
  }

  // NUEVA FUNCIÓN: Añadir al carrito
  agregarAlCarrito(producto: Producto) {
    if (producto.stock > 0) {
      this.carrito.push(producto);
      this.calcularTotal();
      // Opcional: restar stock visualmente (momentáneo)
      producto.stock--; 
    } else {
      alert('¡Lo sentimos! Este insumo se ha agotado.');
    }
  }

  calcularTotal() {
    this.total = this.carrito.reduce((sum, item) => sum + item.precio, 0);
  }

  finalizarCompra() {
  if (this.carrito.length === 0) return;

  // Recorremos el carrito y avisamos al backend por cada producto
  this.carrito.forEach(item => {
    this.productoService.comprarProducto(item.id!, 1).subscribe({
      next: () => console.log(`Stock actualizado para ${item.nombre}`),
      error: (err) => alert("Error al actualizar: " + err.message)
    });
  });

  alert(`¡Compra procesada con éxito!`);
  this.carrito = [];
  this.total = 0;
  this.cargarProductos(); // Refrescamos la lista con el stock real de la DB
}
}