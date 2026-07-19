import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DetalleVentaResponse {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  id: number;
  fecha: string;
  total: number;
  metodoPago: string | null;
  estadoPago: string | null;
  referenciaPago: string | null;
  detalles: DetalleVentaResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  registrarVenta(payload: any): Observable<any> {
  return this.http.post(this.apiUrl, payload);
}

  misVentas(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/mis`);
  }

  miVenta(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.apiUrl}/mis/${id}`);
  }

  listarTodas(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.apiUrl);
  }

  obtener(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.apiUrl}/${id}`);
  }
}
