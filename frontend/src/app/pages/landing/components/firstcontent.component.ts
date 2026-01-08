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
    selector: 'first-content',
    imports: [RouterModule,FormsModule, CommonModule,StyleClassModule, ButtonModule, RippleModule,DropdownModule],
    template: `

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
export class Firstcontent {

constructor(private fb: FormBuilder,public router: Router) {

}

}
