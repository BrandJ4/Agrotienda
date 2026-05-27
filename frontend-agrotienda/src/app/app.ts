import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from './services/producto.service';
import { AuthService } from './services/auth.service';
import { VentaService, VentaResponse } from './services/venta.service';
import { Producto } from './producto.model';
import { ItemCarrito } from './item-carrito.model';
import { AuthComponent } from './auth.component';
 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
 
  listaProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosOferta: Producto[] = [];
  terminoBusqueda: string = '';
  carrito: ItemCarrito[] = [];
  total: number = 0;
 
  metodoPago: string = 'EFECTIVO';
  referenciaPago: string = '';
 
  misPedidos: VentaResponse[] = [];
  pedidosAdmin: VentaResponse[] = [];
 
  // Controla la visibilidad del modal de autenticación
  showAuthModal: boolean = false;
 
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
    if (this.authService.isLoggedIn()) {
      this.cargarMisPedidos();
      if (this.authService.rol() === 'ADMIN') {
        this.cargarPedidosAdmin();
      }
    }
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
 
  filtrar() {
    this.productosFiltrados = this.listaProductos.filter(p =>
      p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      || p.precio.toString().includes(this.terminoBusqueda)
    );
  }
 
  agregarAlCarrito(producto: Producto) {
    if (!this.authService.isLoggedIn()) {
      this.showAuthModal = true;
      return;
    }
 
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        itemExistente.cantidad++;
      } else {
        alert('No hay más stock disponible');
      }
    } else {
      if (producto.stock > 0) {
        this.carrito.push({ producto, cantidad: 1 });
      } else {
        alert('Producto agotado');
      }
    }
    this.calcularTotal();
  }
 
  calcularTotal() {
    this.total = this.carrito.reduce(
      (sum, item) => sum + (item.producto.precio * item.cantidad), 0
    );
  }
 
  finalizarCompra() {
    if (!this.authService.isLoggedIn()) {
      this.showAuthModal = true;
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
          nombre: '', descripcion: '', precio: 0, stock: 0,
          oferta: false, descuentoPorcentaje: null
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