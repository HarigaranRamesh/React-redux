
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { LoginService } from '../services/login/login.service';
import { LoaderService } from '../services/loader/loader.service';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-login',
      imports: [CommonModule, InputIconModule, IconFieldModule, FormsModule, ToastModule, InputTextModule, PasswordModule, ButtonModule,CardModule],

  standalone:  true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
    loadSpin = false;
    showPassword = false;
  username: string = '';
  password: string = '';
    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    constructor(
        public loginService: LoginService,
        public router: Router,
        public loaderService: LoaderService,
        private messageService: MessageService
    ) { }


    ngOnInit(): void { }

 login(form: NgForm) {
  if (form.invalid) {
    form.control.markAllAsTouched();
    return;
  }

  this.loadSpin = true;

  const { username, password } = this.loginService;

  this.loginService.loginUser(username, password).subscribe({
    next: (res) => {
      this.loadSpin = false;
      if (res.token) {
        this.loginService.saveToken(res.token);
        this.messageService.add({
          severity: 'success',
          summary: 'Login Success',
          detail: 'Welcome!'
        });
        this.router.navigate(['/']); // ✅ adjust route
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: res.message
        });
      }
    },
    error: (err) => {
      this.loadSpin = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: err.error?.message || 'Invalid credentials'
      });
    }
  });
}




}

