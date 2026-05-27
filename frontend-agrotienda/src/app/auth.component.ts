import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
 
type AuthView = 'login' | 'register' | 'success';
 
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-overlay" (click)="onOverlayClick($event)">
      <div class="auth-container" #modal>
 
        <!-- LOGIN VIEW -->
        <div class="auth-card" *ngIf="view === 'login'">
          <button class="close-btn" (click)="close.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
 
          <div class="brand-mark">
            <span class="leaf">🌱</span>
          </div>
          <h1 class="auth-title">Bienvenido</h1>
          <p class="auth-subtitle">Ingresa a tu cuenta AgroTienda</p>
 
          <div class="error-banner" *ngIf="errorMsg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errorMsg }}
          </div>
 
          <form (ngSubmit)="doLogin()" #loginForm="ngForm">
            <div class="field-group">
              <label class="field-label">Usuario</label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  class="auth-input"
                  placeholder="tu_usuario"
                  [(ngModel)]="username"
                  name="username"
                  required
                  autocomplete="username"
                />
              </div>
            </div>
 
            <div class="field-group">
              <label class="field-label">Contraseña</label>
              <div class="input-wrap">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  [type]="showPass ? 'text' : 'password'"
                  class="auth-input"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="current-password"
                />
                <button type="button" class="toggle-pass" (click)="showPass = !showPass">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path *ngIf="!showPass" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle *ngIf="!showPass" cx="12" cy="12" r="3"/>
                    <path *ngIf="showPass" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line *ngIf="showPass" x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
 
            <button type="submit" class="btn-primary" [class.loading]="loading" [disabled]="loading">
              <span *ngIf="!loading">Ingresar</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
          </form>
 
          <div class="divider"><span>¿No tienes cuenta?</span></div>
 
          <button class="btn-secondary" (click)="view = 'register'; errorMsg = ''">
            Crear cuenta nueva
          </button>
 
          <p class="admin-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Solo hay un administrador registrado
          </p>
        </div>
 
        <!-- REGISTER VIEW -->
        <div class="auth-card register-card" *ngIf="view === 'register'">
          <button class="close-btn" (click)="close.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button class="back-btn" (click)="view = 'login'; errorMsg = ''">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </button>
 
          <div class="register-header">
            <div class="register-icon">🌿</div>
            <h1 class="auth-title">Crear cuenta</h1>
            <p class="auth-subtitle">Únete a la comunidad AgroTienda</p>
          </div>
 
          <div class="error-banner" *ngIf="errorMsg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errorMsg }}
          </div>
 
          <!-- Benefits strip -->
          <div class="benefits-strip">
            <div class="benefit-item">
              <span class="benefit-icon">🛒</span>
              <span>Compra fácil</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📦</span>
              <span>Historial de pedidos</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🎯</span>
              <span>Ofertas exclusivas</span>
            </div>
          </div>
 
          <form (ngSubmit)="doRegister()" #regForm="ngForm">
            <div class="fields-grid">
              <div class="field-group">
                <label class="field-label">
                  Nombre de usuario
                  <span class="field-hint">Sin espacios ni caracteres especiales</span>
                </label>
                <div class="input-wrap">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    class="auth-input"
                    placeholder="agro_usuario_123"
                    [(ngModel)]="regUsername"
                    name="regUsername"
                    required
                    minlength="3"
                    [class.input-error]="regUsername && regUsername.length < 3"
                    autocomplete="username"
                  />
                </div>
                <span class="validation-msg" *ngIf="regUsername && regUsername.length < 3">
                  Mínimo 3 caracteres
                </span>
              </div>
 
              <div class="field-group">
                <label class="field-label">
                  Contraseña
                  <span class="field-hint">Mínimo 6 caracteres</span>
                </label>
                <div class="input-wrap">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    [type]="showRegPass ? 'text' : 'password'"
                    class="auth-input"
                    placeholder="••••••••"
                    [(ngModel)]="regPassword"
                    name="regPassword"
                    required
                    minlength="6"
                    autocomplete="new-password"
                  />
                  <button type="button" class="toggle-pass" (click)="showRegPass = !showRegPass">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path *ngIf="!showRegPass" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle *ngIf="!showRegPass" cx="12" cy="12" r="3"/>
                      <path *ngIf="showRegPass" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line *ngIf="showRegPass" x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
                <!-- Password strength bar -->
                <div class="strength-bar" *ngIf="regPassword">
                  <div class="strength-track">
                    <div class="strength-fill" [style.width]="strengthPct + '%'" [class]="strengthClass"></div>
                  </div>
                  <span class="strength-label" [class]="strengthClass">{{ strengthLabel }}</span>
                </div>
              </div>
 
              <div class="field-group">
                <label class="field-label">Confirmar contraseña</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                  </svg>
                  <input
                    [type]="showRegPass ? 'text' : 'password'"
                    class="auth-input"
                    placeholder="••••••••"
                    [(ngModel)]="regConfirm"
                    name="regConfirm"
                    required
                    [class.input-error]="regConfirm && regConfirm !== regPassword"
                    autocomplete="new-password"
                  />
                </div>
                <span class="validation-msg" *ngIf="regConfirm && regConfirm !== regPassword">
                  Las contraseñas no coinciden
                </span>
                <span class="validation-ok" *ngIf="regConfirm && regConfirm === regPassword && regPassword.length >= 6">
                  ✓ Las contraseñas coinciden
                </span>
              </div>
            </div>
 
            <div class="terms-check">
              <input type="checkbox" id="terms" [(ngModel)]="acceptedTerms" name="acceptedTerms" />
              <label for="terms">
                Acepto los <a href="#" (click)="$event.preventDefault()">términos y condiciones</a>
                y la <a href="#" (click)="$event.preventDefault()">política de privacidad</a>
              </label>
            </div>
 
            <button
              type="submit"
              class="btn-primary"
              [class.loading]="loading"
              [disabled]="loading || !canRegister"
            >
              <span *ngIf="!loading">Crear mi cuenta</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
          </form>
 
          <p class="role-info">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Tu cuenta se creará como <strong>Cliente</strong>. Solo existe una cuenta Admin.
          </p>
        </div>
 
        <!-- SUCCESS VIEW -->
        <div class="auth-card success-card" *ngIf="view === 'success'">
          <div class="success-anim">
            <div class="success-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 class="success-title">¡Cuenta creada!</h2>
            <p class="success-msg">Bienvenido a Mi AgroTienda, <strong>{{ regUsername }}</strong>. Ya puedes explorar y comprar productos.</p>
            <button class="btn-primary" (click)="close.emit()">Empezar a comprar →</button>
          </div>
        </div>
 
      </div>
    </div>
  `,
  styles: [`
    .auth-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 30, 10, 0.72);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
      animation: fadeOverlay 0.2s ease;
    }
    @keyframes fadeOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .auth-container {
      width: 100%;
      max-width: 460px;
    }
    .auth-card {
      background: #fff;
      border-radius: 20px;
      padding: 2.5rem 2.2rem 2rem;
      position: relative;
      box-shadow: 0 30px 80px rgba(0,0,0,0.3);
      animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .register-card { max-height: 90vh; overflow-y: auto; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .close-btn {
      position: absolute;
      top: 1.1rem;
      right: 1.1rem;
      background: #f5f5f5;
      border: none;
      border-radius: 50%;
      width: 34px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: #555;
      transition: background 0.15s, color 0.15s;
    }
    .close-btn:hover { background: #ffe0e0; color: #c00; }
    .back-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #2e7d32;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0;
      margin-bottom: 1.2rem;
      font-family: 'Nunito', sans-serif;
    }
    .back-btn:hover { text-decoration: underline; }
    .brand-mark {
      text-align: center;
      margin-bottom: 1rem;
    }
    .leaf { font-size: 2.8rem; display: block; }
    .auth-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.7rem;
      font-weight: 700;
      color: #1b5e20;
      margin: 0 0 0.3rem;
      text-align: center;
    }
    .auth-subtitle {
      color: #757575;
      font-size: 0.88rem;
      text-align: center;
      margin: 0 0 1.5rem;
    }
    .register-header { text-align: center; margin-bottom: 1rem; }
    .register-icon { font-size: 2.2rem; margin-bottom: 0.5rem; }
 
    /* Benefits strip */
    .benefits-strip {
      display: flex;
      gap: 0;
      background: #e8f5e9;
      border-radius: 10px;
      margin-bottom: 1.3rem;
      overflow: hidden;
    }
    .benefit-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 10px 4px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #2e7d32;
    }
    .benefit-icon { font-size: 1.3rem; }
 
    /* Error */
    .error-banner {
      background: #fff3f3;
      border: 1px solid #ffcdd2;
      color: #c62828;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.84rem;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 1.1rem;
    }
 
    /* Fields */
    .fields-grid { display: flex; flex-direction: column; gap: 0.9rem; }
    .field-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 0.9rem; }
    .field-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #424242;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .field-hint { font-size: 0.72rem; font-weight: 400; color: #9e9e9e; }
    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 12px;
      color: #9e9e9e;
      pointer-events: none;
      flex-shrink: 0;
    }
    .auth-input {
      width: 100%;
      padding: 11px 44px 11px 42px;
      border: 1.5px solid #e0e0e0;
      border-radius: 10px;
      font-size: 0.9rem;
      font-family: 'Nunito', sans-serif;
      color: #212121;
      background: #fafafa;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .auth-input:focus {
      border-color: #4caf50;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.12);
    }
    .auth-input.input-error { border-color: #e53935; }
    .auth-input.input-error:focus { box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.12); }
    .toggle-pass {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #9e9e9e;
      padding: 2px;
      display: flex;
    }
    .toggle-pass:hover { color: #424242; }
    .validation-msg { font-size: 0.75rem; color: #e53935; margin-top: 2px; }
    .validation-ok { font-size: 0.75rem; color: #2e7d32; margin-top: 2px; font-weight: 600; }
 
    /* Strength bar */
    .strength-bar { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
    .strength-track { flex: 1; height: 4px; background: #e0e0e0; border-radius: 4px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 4px; transition: width 0.3s, background 0.3s; }
    .strength-fill.weak { background: #e53935; }
    .strength-fill.medium { background: #f9a825; }
    .strength-fill.strong { background: #4caf50; }
    .strength-label { font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
    .strength-label.weak { color: #e53935; }
    .strength-label.medium { color: #f57f17; }
    .strength-label.strong { color: #2e7d32; }
 
    /* Terms */
    .terms-check {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 1.2rem;
      font-size: 0.82rem;
      color: #616161;
    }
    .terms-check input[type=checkbox] {
      width: 16px; height: 16px;
      margin-top: 1px;
      cursor: pointer;
      accent-color: #4caf50;
      flex-shrink: 0;
    }
    .terms-check a { color: #2e7d32; font-weight: 700; }
 
    /* Buttons */
    .btn-primary {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #1b5e20, #4caf50);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 800;
      font-family: 'Nunito', sans-serif;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    .btn-primary.loading { pointer-events: none; }
 
    .btn-secondary {
      width: 100%;
      padding: 12px;
      background: #fff;
      color: #2e7d32;
      font-size: 0.9rem;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      border: 2px solid #c8e6c9;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .btn-secondary:hover { background: #e8f5e9; border-color: #a5d6a7; }
 
    .divider {
      text-align: center;
      margin: 1.1rem 0;
      position: relative;
    }
    .divider::before, .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 38%;
      height: 1px;
      background: #e0e0e0;
    }
    .divider::before { left: 0; }
    .divider::after { right: 0; }
    .divider span { font-size: 0.78rem; color: #9e9e9e; background: #fff; padding: 0 8px; }
 
    .admin-note, .role-info {
      text-align: center;
      font-size: 0.76rem;
      color: #bdbdbd;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin: 1rem 0 0;
    }
    .role-info strong { color: #2e7d32; }
 
    /* Spinner */
    .spinner {
      width: 22px; height: 22px;
      border: 2.5px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
 
    /* Success */
    .success-card { text-align: center; padding: 3rem 2rem; }
    .success-anim { animation: successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes successPop {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    .success-circle {
      width: 80px; height: 80px;
      background: linear-gradient(135deg, #2e7d32, #66bb6a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.2rem;
      box-shadow: 0 8px 24px rgba(46, 125, 50, 0.35);
    }
    .success-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      color: #1b5e20;
      margin: 0 0 0.6rem;
    }
    .success-msg { color: #616161; font-size: 0.9rem; margin-bottom: 1.6rem; }
    .success-msg strong { color: #2e7d32; }
  `]
})
export class AuthComponent {
  @Output() close = new EventEmitter<void>();
 
  view: AuthView = 'login';
 
  username = '';
  password = '';
  showPass = false;
 
  regUsername = '';
  regPassword = '';
  regConfirm = '';
  showRegPass = false;
  acceptedTerms = false;
 
  loading = false;
  errorMsg = '';
 
  constructor(private authService: AuthService) {}
 
  get strengthPct(): number {
    const p = this.regPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score += 33;
    if (p.length >= 10) score += 17;
    if (/[A-Z]/.test(p)) score += 17;
    if (/[0-9]/.test(p)) score += 17;
    if (/[^A-Za-z0-9]/.test(p)) score += 16;
    return Math.min(score, 100);
  }
 
  get strengthClass(): string {
    const pct = this.strengthPct;
    if (pct < 40) return 'weak';
    if (pct < 75) return 'medium';
    return 'strong';
  }
 
  get strengthLabel(): string {
    const cls = this.strengthClass;
    if (cls === 'weak') return 'Débil';
    if (cls === 'medium') return 'Regular';
    return 'Segura';
  }
 
  get canRegister(): boolean {
    return (
      this.regUsername.length >= 3 &&
      this.regPassword.length >= 6 &&
      this.regPassword === this.regConfirm &&
      this.acceptedTerms
    );
  }
 
  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('auth-overlay')) {
      this.close.emit();
    }
  }
 
  doLogin() {
    this.errorMsg = '';
    if (!this.username || !this.password) {
      this.errorMsg = 'Por favor ingresa usuario y contraseña.';
      return;
    }
    this.loading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.close.emit();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Usuario o contraseña incorrectos.';
      }
    });
  }
 
  doRegister() {
    this.errorMsg = '';
    if (!this.canRegister) return;
    this.loading = true;
    this.authService.register(this.regUsername, this.regPassword).subscribe({
      next: () => {
        this.loading = false;
        this.view = 'success';
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message;
        this.errorMsg = msg?.includes('ya existe')
          ? 'Ese nombre de usuario ya está tomado.'
          : 'No se pudo crear la cuenta. Intenta de nuevo.';
      }
    });
  }
}