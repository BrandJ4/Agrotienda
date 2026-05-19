import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductoService } from './services/producto.service';
import { Producto } from './producto.model';
import { ItemCarrito } from './item-carrito.model';

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

  // CARRITO
  carrito: ItemCarrito[] = [];

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

  // BUSCADOR
  filtrar() {

    this.productosFiltrados = this.listaProductos.filter(p =>

      p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())

      ||

      p.precio.toString().includes(this.terminoBusqueda)

    );

  }

  // AGREGAR AL CARRITO
  agregarAlCarrito(producto: Producto) {

    const itemExistente = this.carrito.find(

      item => item.producto.id === producto.id

    );

    // SI YA EXISTE
    if (itemExistente) {

      if (itemExistente.cantidad < producto.stock) {

        itemExistente.cantidad++;

      } else {

        alert('No hay más stock disponible');

      }

    }

    // SI NO EXISTE
    else {

      if (producto.stock > 0) {

        this.carrito.push({

          producto: producto,

          cantidad: 1

        });

      }

    }

    this.calcularTotal();

  }

  // TOTAL
  calcularTotal() {

    this.total = this.carrito.reduce(

      (sum, item) =>

        sum + (item.producto.precio * item.cantidad),

      0

    );

  }

  // FINALIZAR COMPRA
  finalizarCompra() {

    if (this.carrito.length === 0) return;

    const itemsVenta = this.carrito.map(item => ({

      productoId: item.producto.id,

      cantidad: item.cantidad

    }));

    this.productoService.registrarVenta(itemsVenta).subscribe({

      next: () => {

        alert('¡Compra procesada con éxito!');

        this.carrito = [];

        this.total = 0;

        this.cargarProductos();

      },

      error: (err) => {

        console.error(err);

        alert('Error al procesar compra');

      }

    });

  }

}