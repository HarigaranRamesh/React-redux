import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FloatLabelModule } from 'primeng/floatlabel';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-active-members',
   imports: [
          FormsModule,
          CommonModule,
          ReactiveFormsModule,
          InputTextModule,
          DropdownModule,
          CheckboxModule,
          ButtonModule,
          ToastModule,
          FloatLabelModule
      ],
  templateUrl: './active-members.component.html',
  styleUrl: './active-members.component.scss',
    providers: [MessageService]

})
export class ActiveMembersComponent {

}
