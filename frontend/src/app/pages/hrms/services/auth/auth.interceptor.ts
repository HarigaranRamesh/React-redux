import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import {jwtDecode }from 'jwt-decode';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const token = localStorage.getItem('authToken');
  const router = inject(Router);

  if (token) {
    const isExpired = checkTokenExpired(token);

    if (isExpired) {
      localStorage.removeItem('authToken');
      router.navigate(['/']);
      return throwError(() => new Error('Token expired'));
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};

function checkTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return decoded.exp < now;
  } catch (err) {
    return true; // if decode fails, treat as expired
  }
}
