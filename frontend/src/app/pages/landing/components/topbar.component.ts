import { DropdownModule } from 'primeng/dropdown';
import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'topbar',
    imports: [RouterModule,FormsModule, CommonModule,StyleClassModule, ButtonModule, RippleModule,DropdownModule],
    template: `
<!-- TOPBAR -->
<div class="bg-green-900 text-white py-2 px-4 text-sm flex justify-between items-center">
  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2">
      <i class="pi pi-phone"></i>
      <span>+91 9597431719</span>
    </div>
    <div class="flex items-center gap-2">
      <i class="pi pi-map-marker"></i>
      <span>COIMBATORE</span>
    </div>
  </div>
  <div class="flex gap-4 text-yellow-300 font-medium">
    <div>TODAY'S RATE: SILVER 22K/1G Rs:8640</div>
    <div>TODAY'S RATE: GOLD 22K/1G Rs:8640</div>
  </div>
</div>

<!-- NAVBAR -->
<div class="flex justify-between items-center py-4 px-6 shadow-md bg-white">
  <div class="text-3xl font-bold text-yellow-500">NAKADH</div>
  <div class="hidden md:flex gap-6 font-medium text-gray-800">
    <a class="hover:text-green-700 cursor-pointer">HOME</a>
    <a class="hover:text-green-700 cursor-pointer">SHIFT LOAN</a>
    <a class="hover:text-green-700 cursor-pointer">APPLY LOAN</a>
    <a class="hover:text-green-700 cursor-pointer">SCHEMES</a>
    <a class="hover:text-green-700 cursor-pointer">FAQ</a>
    <a class="hover:text-green-700 cursor-pointer">CONTACTS</a>
  </div>
  <div class="flex gap-2">
    <button pButton label="Sign Up" class="p-button-warning p-button-rounded text-sm"></button>
    <button pButton label="Log in" class="p-button-outlined p-button-rounded text-sm"></button>
  </div>
</div>

<!-- HERO SECTION -->
<div class="relative bg-white">
  <div class="grid md:grid-cols-2 gap-6 p-8">
    <!-- Left: Text Content -->
    <div>
      <h4 class="text-sm font-bold text-gray-600 mb-2">MAXIMUM VALUE. MINIMUM EFFORT</h4>
      <h1 class="text-4xl font-extrabold text-blue-900 mb-4 leading-tight">
        Shift your Gold<br>Loan to Nakadh
      </h1>
      <ul class="text-md text-gray-700 mb-6 space-y-2">
        <li class="flex items-center gap-2"><i class="pi pi-check-circle text-green-600"></i> Highest per gram rate</li>
        <li class="flex items-center gap-2"><i class="pi pi-check-circle text-green-600"></i> Minimum KYC</li>
        <li class="flex items-center gap-2"><i class="pi pi-check-circle text-green-600"></i> EMI & Top-up</li>
      </ul>
      <div class="flex gap-4">
        <button pButton label="Shift Now" class="p-button-warning px-6 text-sm"></button>
        <a class="text-black underline font-semibold cursor-pointer self-center">Calculate Now</a>
      </div>
    </div>

    <!-- Right: Image & Caption -->
    <div class="relative flex items-center justify-center">
      <img src="assets/woman-gold-loan.png" alt="Gold Loan" class="w-[300px] z-10">
      <div class="absolute top-4 right-4 font-semibold italic text-black text-lg text-right leading-snug">
        " YOUR ASSET<br>OUR LOAN "
      </div>
      <!-- ₹ Coins -->
      <div class="absolute top-10 left-10 text-2xl text-yellow-500">₹</div>
      <div class="absolute top-[60%] left-[40%] text-2xl text-yellow-500">₹</div>
      <div class="absolute bottom-10 right-10 text-2xl text-yellow-500">₹</div>
    </div>
  </div>
</div>


        `
})
export class Topbar {
    form: FormGroup;
roomTypes = [
  { name: 'Office', value: 'office' },
  { name: 'Lab', value: 'lab' },
  { name: 'Classroom', value: 'classroom' }
];

departments = [
  { name: 'IT', value: 'it' },
  { name: 'HR', value: 'hr' },
  { name: 'Finance', value: 'finance' }
];

constructor(private fb: FormBuilder,public router: Router) {
  this.form = this.fb.group({
    building: [''],
    floor: [''],
    description: [''],
    roomType: [null],
    department: [null]
  });
}

}
