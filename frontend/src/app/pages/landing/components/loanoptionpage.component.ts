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
    selector: 'loanoption-page',
    imports: [RouterModule,FormsModule, CommonModule,StyleClassModule, ButtonModule, RippleModule,DropdownModule],
    template: `<!-- WHY CHOOSE NAKADH -->
    <section class="px-6 md:px-20 py-10 bg-gray-50">
      <div class="text-left mb-6">
        <h2 class="text-2xl font-bold">Why Choose <span class="text-teal-600">Nakadh?</span></h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-700">
        <div class="flex items-start gap-3">
          <i class="pi pi-file-edit text-xl text-teal-600"></i>
          <span>Minimal Documentation</span>
        </div>
        <div class="flex items-start gap-3">
          <i class="pi pi-truck text-xl text-teal-600"></i>
          <span>Doorstep Pick And Drop Of Gold</span>
        </div>
        <div class="flex items-start gap-3">
          <i class="pi pi-percentage text-xl text-teal-600"></i>
          <span>Highest Per Gram Rate/ High LTV</span>
        </div>
        <div class="flex items-start gap-3">
          <i class="pi pi-shield text-xl text-teal-600"></i>
          <span>Your Asset Is Safe With Our Partner Bank</span>
        </div>
      </div>
    </section>

    <!-- LOAN OPTIONS -->
    <section class="px-6 md:px-20 py-10">
      <h2 class="text-xl font-extrabold text-blue-900 mb-8 text-center">Loan Options</h2>

      <!-- Shift Loan -->
      <div class="grid md:grid-cols-2 gap-6 items-center mb-10">
        <div>
          <h3 class="text-lg font-bold mb-2">Shift your loan to Nakadh</h3>
          <ul class="text-gray-800 text-sm mb-4 space-y-1">
            <li>Highest per gram rate</li>
            <li>Minimum KYC</li>
            <li>EMI & Top-up options</li>
            <li>Lowest ROI</li>
            <li>Storage in bank Vault</li>
          </ul>
          <button pButton type="button" label="Get Started" class="p-button-sm p-button-warning text-white font-medium px-4"></button>
        </div>
        <div class="flex justify-center">
          <img src="assets/shift-loan-img.png" alt="Shift Loan" class="rounded-xl w-full max-w-xs shadow-md" />
        </div>
      </div>

      <!-- New Loan -->
      <div class="grid md:grid-cols-2 gap-6 items-center">
        <div class="flex justify-center">
          <img src="assets/new-loan-img.png" alt="New Loan" class="rounded-xl w-full max-w-xs shadow-md" />
        </div>
        <div>
          <h3 class="text-lg font-bold mb-2">Apply for new loan</h3>
          <ul class="text-gray-800 text-sm mb-4 space-y-1">
            <li>Highest per gram rate</li>
            <li>Pick up and drop facility</li>
            <li>Future Financial Assistance</li>
            <li>Lowest ROI</li>
            <li>Storage in bank Vault</li>
          </ul>
          <button pButton type="button" label="Apply Now" class="p-button-sm p-button-warning text-white font-medium px-4"></button>
        </div>
      </div>
    </section>

        `
})
export class loanoptionpage {

constructor(private fb: FormBuilder,public router: Router) {

}

}
