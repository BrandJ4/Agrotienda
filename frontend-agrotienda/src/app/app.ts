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

  categorias: string[] = ['Todo', 'Fertilizantes', 'Semillas', 'Pesticidas', 'Herramientas', 'Riego', 'Empaques', 'Ofertas'];
  categoriaActiva: string = 'Todo';
  soloEnStock: boolean = false;

  vistaCatalogoCompleto: boolean = false;

  metodoPago: string = 'EFECTIVO';
  referenciaPago: string = ''; // Código de aprobación (Yape/Plin)
  numeroTarjeta: string = '';  // Número de tarjeta (solo método Tarjeta)

  misPedidos: VentaResponse[] = [];
  pedidosAdmin: VentaResponse[] = [];

  showAuthModal: boolean = false;

  // ── Dark mode ──
  darkMode: boolean = false;

  // ── Toast carrito ──
  toastVisible: boolean = false;
  toastMensaje: string = '';
  private toastTimeout: any;

  // ── Comprobante de compra ──
  mostrarComprobante: boolean = false;
  ultimaVenta: VentaResponse | null = null;

  adminProducto: Producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    oferta: false,
    descuentoPorcentaje: null,
    categoria: 'Fertilizantes',
    imagenUrl: ''
  };

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Restaurar preferencia de tema guardada
    const savedTheme = localStorage.getItem('agro-theme');
    if (savedTheme === 'dark') {
      this.darkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    this.cargarProductos();
    if (this.authService.isLoggedIn()) {
      this.cargarMisPedidos();
      if (this.authService.rol() === 'ADMIN') {
        this.cargarPedidosAdmin();
      }
    }
  }

  // ── Toggle Dark / Light Mode ──
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('agro-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('agro-theme', 'light');
    }
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.listaProductos = data;
        this.productosOferta = data.filter(p => !!p.oferta).slice(0, 8);
        this.filtrar();
      }
    });
  }

  irACatalogoCompleto() {
    this.vistaCatalogoCompleto = true;
    this.categoriaActiva = 'Todo';
    this.soloEnStock = false;
    this.terminoBusqueda = '';
    this.filtrar();
    setTimeout(() => {
      document.getElementById('seccion-productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  volverAVistaConCarrito() {
    this.vistaCatalogoCompleto = false;
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
    this.filtrar();
  }

  toggleEnStock() {
    this.soloEnStock = !this.soloEnStock;
    this.filtrar();
  }

  filtrar() {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    this.productosFiltrados = this.listaProductos.filter(p => {
      const coincideTexto = !termino
        || p.nombre.toLowerCase().includes(termino)
        || p.precio.toString().includes(termino);
      const coincideCategoria =
        this.categoriaActiva === 'Todo' ? true
        : this.categoriaActiva === 'Ofertas' ? !!p.oferta
        : p.categoria === this.categoriaActiva;
      const coincideStock = !this.soloEnStock || p.stock > 0;
      return coincideTexto && coincideCategoria && coincideStock;
    });
  }

  mostrarToast(mensaje: string) {
    this.toastMensaje = mensaje;
    this.toastVisible = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
    }, 2800);
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
        this.mostrarToast(`✅ ${producto.nombre} actualizado en el carrito`);
      } else {
        this.mostrarToast('⚠️ No hay más stock disponible');
      }
    } else {
      if (producto.stock > 0) {
        this.carrito.push({ producto, cantidad: 1 });
        this.mostrarToast(`🛒 ${producto.nombre} añadido al carrito`);
      } else {
        this.mostrarToast('❌ Producto agotado');
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

    // Validar el dato requerido según el método de pago elegido
    if (this.metodoPago === 'TARJETA' && !this.numeroTarjeta.trim()) {
      this.mostrarToast('⚠️ Ingresa el número de tarjeta');
      return;
    }
    if ((this.metodoPago === 'YAPE' || this.metodoPago === 'PLIN') && !this.referenciaPago.trim()) {
      this.mostrarToast('⚠️ Ingresa el código de aprobación');
      return;
    }

    const itemsVenta = this.carrito.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad
    }));

    // Tarjeta: solo se guardan los últimos 4 dígitos, nunca el número completo
    const referencia = this.metodoPago === 'TARJETA'
      ? `Tarjeta **** ${this.numeroTarjeta.trim().slice(-4)}`
      : (this.referenciaPago || null);

    const payload = {
      items: itemsVenta,
      metodoPago: this.metodoPago.toUpperCase(),
      referenciaPago: referencia
    };
    this.ventaService.registrarVenta(payload).subscribe({
      next: (venta: VentaResponse) => {
        // Construir comprobante con datos de la respuesta o del carrito local
        this.ultimaVenta = venta?.id ? venta : {
          id: Math.floor(Math.random() * 90000) + 10000,
          fecha: new Date().toISOString(),
          total: this.total,
          metodoPago: this.metodoPago,
          estadoPago: 'PENDIENTE',
          referenciaPago: referencia,
          detalles: this.carrito.map(item => ({
            productoId: item.producto.id!,
            productoNombre: item.producto.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precio,
            subtotal: item.producto.precio * item.cantidad
          }))
        };
        this.mostrarComprobante = true;
        this.carrito = [];
        this.total = 0;
        this.referenciaPago = '';
        this.numeroTarjeta = '';
        this.cargarProductos();
        this.cargarMisPedidos();
      },
      error: (err) => {
        console.error(err);
        alert('Error al procesar compra');
      }
    });
  }

  // Reabre el modal de comprobante para un pedido ya realizado
  verBoleta(venta: VentaResponse) {
    this.ultimaVenta = venta;
    this.mostrarComprobante = true;
  }


verBoletaModal() {
  if (!this.ultimaVenta) return;
  const v = this.ultimaVenta;
  const filas = v.detalles?.map(d => `
    <tr>
      <td>${d.productoNombre}</td>
      <td style="text-align:center">${d.cantidad}</td>
      <td style="text-align:right">S/. ${d.precioUnitario.toFixed(2)}</td>
      <td style="text-align:right">S/. ${d.subtotal.toFixed(2)}</td>
    </tr>
  `).join('') ?? '';

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <title>Boleta #${v.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #e8f0e8;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 16px;
          font-family: 'Courier New', monospace;
        }
        .ticket-wrapper {
          position: relative;
        }
        /* Borde dentado superior */
        .ticket-wrapper::before {
          content: '';
          display: block;
          height: 20px;
          background:
            radial-gradient(circle at 10px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 30px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 50px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 70px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 90px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 110px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 130px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 150px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 170px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 190px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 210px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 230px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 250px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 270px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 290px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 310px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 330px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 350px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 370px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 390px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 410px 20px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 430px 20px, #e8f0e8 10px, transparent 10px);
          background-color: #fff;
          background-size: 20px 20px;
          border-left: 2px dashed #c8dbc8;
          border-right: 2px dashed #c8dbc8;
        }
        /* Borde dentado inferior */
        .ticket-wrapper::after {
          content: '';
          display: block;
          height: 20px;
          background:
            radial-gradient(circle at 10px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 30px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 50px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 70px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 90px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 110px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 130px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 150px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 170px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 190px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 210px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 230px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 250px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 270px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 290px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 310px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 330px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 350px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 370px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 390px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 410px 0px, #e8f0e8 10px, transparent 10px),
            radial-gradient(circle at 430px 0px, #e8f0e8 10px, transparent 10px);
          background-color: #fff;
          background-size: 20px 20px;
          border-left: 2px dashed #c8dbc8;
          border-right: 2px dashed #c8dbc8;
        }
        .ticket {
          background: #fff;
          width: 440px;
          padding: 28px 32px;
          border-left: 2px dashed #c8dbc8;
          border-right: 2px dashed #c8dbc8;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .logo {
          text-align: center;
          font-size: 1.4rem;
          font-weight: 900;
          margin-bottom: 4px;
          color: #1b5e20;
        }
        .logo span { color: #f9a825; }
        .subtitulo {
          text-align: center;
          font-size: 0.72rem;
          letter-spacing: 2.5px;
          color: #888;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .linea-doble {
          border: none;
          border-top: 3px double #c8dbc8;
          margin: 14px 0;
        }
        .linea {
          border: none;
          border-top: 1px dashed #c8dbc8;
          margin: 14px 0;
        }
        .fila {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin: 5px 0;
          color: #333;
        }
        .fila strong { font-weight: 700; color: #1b5e20; }
        table { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin: 8px 0; }
        th {
          text-align: left;
          color: #2e7d32;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 5px 4px;
          border-bottom: 2px solid #c8dbc8;
        }
        td { padding: 7px 4px; border-bottom: 1px dotted #e0e0e0; color: #333; vertical-align: top; }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 900;
          font-size: 1.15rem;
          color: #1b5e20;
          margin-top: 6px;
          padding: 8px 0;
        }
        .total-monto { font-size: 1.35rem; color: #2e7d32; }
        .estado-badge {
          display: block;
          text-align: center;
          margin: 14px auto;
          background: #fff8e1;
          border: 1px solid #ffe082;
          color: #f57f17;
          border-radius: 20px;
          padding: 5px 18px;
          font-size: 0.78rem;
          font-weight: 700;
          width: fit-content;
        }
        .nota {
          background: #e8f5e9;
          border-left: 3px solid #4caf50;
          border-radius: 0 8px 8px 0;
          padding: 10px 14px;
          font-size: 0.77rem;
          color: #2e7d32;
          margin-top: 14px;
          line-height: 1.6;
        }
        .barcode {
          text-align: center;
          margin: 18px 0 6px;
          font-size: 2.2rem;
          letter-spacing: 4px;
          color: #1b5e20;
          font-family: 'Courier New', monospace;
        }
        .pie {
          text-align: center;
          font-size: 0.7rem;
          color: #aaa;
          margin-top: 14px;
          line-height: 1.7;
        }
        .pie strong { color: #888; }
        @media print {
          body { background: #fff; padding: 0; }
          .ticket-wrapper::before,
          .ticket-wrapper::after { display: none; }
          .ticket { box-shadow: none; border: 1px dashed #ccc; width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="ticket-wrapper">
        <div class="ticket">
          <div class="logo">🌱 Mi <span>Agro</span>Tienda</div>
          <div class="subtitulo">Boleta de Venta Electrónica</div>

          <hr class="linea-doble">

          <div class="fila"><span>N° Pedido:</span><strong>#${v.id}</strong></div>
          <div class="fila"><span>Fecha:</span><strong>${new Date(v.fecha).toLocaleString('es-PE')}</strong></div>
          <div class="fila"><span>Cliente:</span><strong>${this.authService.current()?.username ?? ''}</strong></div>
          <div class="fila"><span>Método de pago:</span><strong>${v.metodoPago}</strong></div>
          ${v.referenciaPago ? `<div class="fila"><span>Referencia:</span><strong>${v.referenciaPago}</strong></div>` : ''}

          <hr class="linea">

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align:center">Cant.</th>
                <th style="text-align:right">P.Unit.</th>
                <th style="text-align:right">Sub.</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>

          <hr class="linea-doble">

          <div class="total-row">
            <span>TOTAL:</span>
            <span class="total-monto">S/. ${v.total.toFixed(2)}</span>
          </div>

          <span class="estado-badge">⏱ Estado: ${v.estadoPago ?? 'PENDIENTE'}</span>

          <div class="nota">
            🚚 Nos comunicaremos para coordinar la entrega.<br>
            <strong>WhatsApp:</strong> +51 941 240 184
          </div>

          <div class="barcode">||||| |||| ||||| ||||</div>

          <div class="pie">
            Gracias por tu compra · Mi AgroTienda<br>
            <strong>Lima, Perú</strong> · RUC: 20123456789
          </div>
        </div>
      </div>
      <script>window.onload = () => window.print();<\/script>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank');
  ventana?.document.write(html);
  ventana?.document.close();
}
cerrarComprobante() {
  this.mostrarComprobante = false;
  this.ultimaVenta = null;
}




  scrollTo(sectionId: string) {
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
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
          oferta: false, descuentoPorcentaje: null,
          categoria: 'Fertilizantes', imagenUrl: ''
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

  getPrecioFinal(p: Producto): number {
    if (p.oferta && p.descuentoPorcentaje != null) {
      return p.precio * (1 - p.descuentoPorcentaje / 100);
    }
    return p.precio;
  }

  // Imágenes de Unsplash (hotlinking libre, funciona en cualquier PC)
  getImagenFallback(p: Producto): string {
    const nombre = (p.nombre || '').toLowerCase();
    const cat = (p.categoria || '').toLowerCase();

    // Por nombre específico
    if (nombre.includes('urea') || nombre.includes('nitrato') || nombre.includes('nitro'))
      return 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&q=80';
    if (nombre.includes('fosfato') || nombre.includes('fosfo') || nombre.includes('superfosfato'))
      return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
    if (nombre.includes('potasio') || nombre.includes('potasic') || nombre.includes('sulfato'))
      return 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80';
    if (nombre.includes('maiz') || nombre.includes('maíz'))
      return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80';
    if (nombre.includes('arroz'))
      return 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80';
    if (nombre.includes('papa') || nombre.includes('patata'))
      return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80';
    if (nombre.includes('tomate'))
      return 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80';
    if (nombre.includes('cebolla'))
      return 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80';
    if (nombre.includes('lechuga') || nombre.includes('espinaca') || nombre.includes('hortali'))
      return 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400&q=80';
    if (nombre.includes('ajo'))
      return 'https://images.unsplash.com/photo-1501200291289-c5a76c232e5f?w=400&q=80';
    if (nombre.includes('pimiento') || nombre.includes('paprika') || nombre.includes('páprika'))
      return 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80';
    if (nombre.includes('palta') || nombre.includes('aguacate'))
      return 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80';
    if (nombre.includes('mango'))
      return 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=400&q=80';
    if (nombre.includes('goteo') || nombre.includes('aspersor') || nombre.includes('manguera') || nombre.includes('riego'))
      return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
    if (nombre.includes('fumigador') || nombre.includes('mochila') || nombre.includes('pulverizador'))
      return 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80';
    if (nombre.includes('pala') || nombre.includes('azadon') || nombre.includes('azadón') || nombre.includes('rastrillo'))
      return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
    if (nombre.includes('tijera') || nombre.includes('podadora'))
      return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
    if (nombre.includes('glifosato') || nombre.includes('herbicida'))
      return 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80';
    if (nombre.includes('fungicida') || nombre.includes('mancozeb'))
      return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
    if (nombre.includes('insecticida') || nombre.includes('cipermetrina') || nombre.includes('pesticida'))
      return 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80';
    if (nombre.includes('saco') || nombre.includes('bolsa') || nombre.includes('empaque') || nombre.includes('costal'))
      return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80';
    if (nombre.includes('abono') || nombre.includes('humus') || nombre.includes('compost'))
      return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';

    // Por categoría como fallback
    switch (cat) {
      case 'fertilizantes':
        return 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&q=80';
      case 'semillas':
        return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
      case 'pesticidas':
        return 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&q=80';
      case 'herramientas':
        return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
      case 'riego':
        return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';
      case 'empaques':
        return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80';
      default:
        return 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80';
    }
  }

  getCategoriaEmoji(categoria: string): string {
    const map: { [key: string]: string } = {
      'Fertilizantes': '🌿',
      'Semillas':      '🌱',
      'Pesticidas':    '🛡️',
      'Herramientas':  '🔧',
      'Riego':         '💧',
      'Empaques':      '📦',
    };
    return map[categoria] || '🌾';
  }
}