import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authToken = localStorage.getItem('authToken');
    const storedAccess = localStorage.getItem('userAccess');
    let userAccess: any[] = [];

    // Check if user is logged in
    if (!authToken) {
      this.router.navigate(['/login']);
      return false;
    }

    // Parse userAccess safely
    try {
      if (storedAccess) {
        userAccess = JSON.parse(storedAccess);
      }
    } catch (e) {
      console.error('Invalid userAccess in localStorage');
    }

    // Get required permission from route
    const requiredPermission = route.data['permission'];

    // If no specific permission required → allow
    if (!requiredPermission) return true;

    // ✅ Check dynamically if user has this permission
    const hasPermission = userAccess.some(menu =>
      menu.children?.some((child: any) => child.submenuName === requiredPermission)
    );

    if (!hasPermission) {
      this.router.navigate(['/notfound']);
      return false;
    }

    return true;
  }
}
