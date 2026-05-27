import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductoService } from './services/producto.service';
import { AuthService } from './services/auth.service';
import { VentaService, VentaResponse } from './services/venta.service';
import { Producto } from './producto.model';
import { ItemCarrito } from './item-carrito.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {

  listaProductos: Producto[] = [];

  productosFiltrados: Producto[] = [];
  productosOferta: Producto[] = [];

  terminoBusqueda: string = '';

  // NUEVO CARRITO
  carrito: ItemCarrito[] = [];

  total: number = 0;

  authUsername: string = '';
  authPassword: string = '';
  metodoPago: string = 'EFECTIVO';
  referenciaPago: string = '';

  misPedidos: VentaResponse[] = [];
  pedidosAdmin: VentaResponse[] = [];

  adminProducto: Producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    oferta: false,
    descuentoPorcentaje: null
  };

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {

    this.cargarProductos();

  }

  cargarProductos() {

    this.productoService.getProductos().subscribe({

      next: (data) => {

        this.listaProductos = data;

        this.productosFiltrados = data;
        this.productosOferta = data.filter(p => !!p.oferta).slice(0, 8);

      }

    });

  }

  // FILTRAR
  filtrar() {

    this.productosFiltrados = this.listaProductos.filter(p =>

      p.nombre.toLowerCase().includes(
        this.terminoBusqueda.toLowerCase()
      )

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

      }

      else {

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

      else {

        alert('Producto agotado');

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

    if (!this.authService.isLoggedIn()) {
      alert('Inicia sesión para comprar');
      return;
    }

    if (this.carrito.length === 0) return;

    const itemsVenta = this.carrito.map(item => ({

      productoId: item.producto.id,

      cantidad: item.cantidad

    }));

    const payload = {
      items: itemsVenta,
      metodoPago: this.metodoPago,
      referenciaPago: this.referenciaPago || null
    };

    this.productoService.registrarVenta(payload).subscribe({

      next: () => {

        alert('¡Compra procesada con éxito!');

        this.carrito = [];

        this.total = 0;
        this.referenciaPago = '';

        this.cargarProductos();
        this.cargarMisPedidos();

      },

      error: (err) => {

        console.error(err);

        alert('Error al procesar compra');

      }

    });

  }

  login() {
    this.authService.login(this.authUsername, this.authPassword).subscribe({
      next: () => {
        this.authPassword = '';
        this.cargarMisPedidos();
        this.cargarPedidosAdmin();
      },
      error: () => alert('Credenciales inválidas')
    });
  }

  register() {
    this.authService.register(this.authUsername, this.authPassword).subscribe({
      next: () => {
        this.authPassword = '';
        this.cargarMisPedidos();
      },
      error: () => alert('No se pudo registrar')
    });
  }

  logout() {
    this.authService.logout();
    this.carrito = [];
    this.total = 0;
    this.misPedidos = [];
    this.pedidosAdmin = [];
  }

  cargarMisPedidos() {
    if (!this.authService.isLoggedIn()) return;
    this.ventaService.misVentas().subscribe({
      next: (data) => (this.misPedidos = data),
      error: () => (this.misPedidos = [])
    });
  }

  cargarPedidosAdmin() {
    if (this.authService.rol() !== 'ADMIN') return;
    this.ventaService.listarTodas().subscribe({
      next: (data) => (this.pedidosAdmin = data),
      error: () => (this.pedidosAdmin = [])
    });
  }

  crearProductoAdmin() {
    if (this.authService.rol() !== 'ADMIN') return;
    this.productoService.crearProducto(this.adminProducto).subscribe({
      next: () => {
        this.adminProducto = {
          nombre: '',
          descripcion: '',
          precio: 0,
          stock: 0,
          oferta: false,
          descuentoPorcentaje: null
        };
        this.cargarProductos();
      },
      error: () => alert('No se pudo crear el producto')
    });
  }

  eliminarProductoAdmin(id: number) {
    if (this.authService.rol() !== 'ADMIN') return;
    this.productoService.eliminarProducto(id).subscribe({
      next: () => this.cargarProductos(),
      error: () => alert('No se pudo eliminar el producto')
    });
  }
}
