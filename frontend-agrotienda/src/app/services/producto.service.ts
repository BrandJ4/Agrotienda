import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService { 
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) { }

  // Método para obtener los productos de tu base de datos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  comprarProducto(id: number, cantidad: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}/comprar?cantidad=${cantidad}`, {});
  }

  registrarVenta(items: any) {
  return this.http.post(
    'http://localhost:8080/api/ventas',
    items
  );
}
}