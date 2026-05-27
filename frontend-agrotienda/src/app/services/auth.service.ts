import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export type Rol = 'ADMIN' | 'CLIENTE';

export interface AuthResponse {
  token: string;
  username: string;
  rol: Rol;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private auth$ = new BehaviorSubject<AuthResponse | null>(this.readFromStorage());

  constructor(private http: HttpClient) {}

  current(): AuthResponse | null {
    return this.auth$.value;
  }

  isLoggedIn(): boolean {
    return !!this.auth$.value?.token;
  }

  rol(): Rol | null {
    return this.auth$.value?.rol ?? null;
  }

  token(): string | null {
    return this.auth$.value?.token ?? null;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((resp) => this.persist(resp))
    );
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, password }).pipe(
      tap((resp) => this.persist(resp))
    );
  }

  logout(): void {
    localStorage.removeItem('auth');
    this.auth$.next(null);
  }

  private persist(auth: AuthResponse): void {
    localStorage.setItem('auth', JSON.stringify(auth));
    this.auth$.next(auth);
  }

  private readFromStorage(): AuthResponse | null {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
