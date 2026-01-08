// idle.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
@Injectable({ providedIn: 'root' })
export class IdleService {
  private timeoutInMs = 30 * 60 * 1000; // 30 minutes
  private timeoutId: any;

  constructor(private loginService: LoginService, private router: Router, private zone: NgZone) {
    this.startWatching();
  }

  private startWatching() {
    this.zone.runOutsideAngular(() => {
      ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event =>
        window.addEventListener(event, () => this.resetTimer())
      );
    });

    this.resetTimer();
  }

  private resetTimer() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.zone.run(() => this.logout());
    }, this.timeoutInMs);
  }

  private logout() {
    this.loginService.logout();
    this.router.navigate(['auth//login']);
    alert('Logged out due to 30 minutes of inactivity.');
  }
}
