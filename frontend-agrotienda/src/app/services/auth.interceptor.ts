import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  // 1. Si no hay token, o si es una petición GET a productos (que es pública), no alteramos la petición
  if (!token || (req.method === 'GET' && req.url.includes('/api/productos'))) {
    return next(req);
  }

  // 2. Nos aseguramos de limpiar cualquier comilla extra o espacio del token
  const cleanToken = token.replace(/"/g, '').trim();

  // 3. Clonamos agregando la cabecera Authorization de forma correcta
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${cleanToken}`
    }
  });

  return next(clonedReq);
};

