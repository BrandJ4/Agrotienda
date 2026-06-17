import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService { 
  private apiUrl = 'http://localhost:8080/api/productos';
  private ventasUrl = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) { }

  // Método para obtener los productos de tu base de datos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  buscarPorPrecio(precioMax: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/buscar?precioMax=${precioMax}`);
  }

  comprarProducto(id: number, cantidad: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}/comprar?cantidad=${cantidad}`, {});
  }
}
