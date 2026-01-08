import { DropdownModule } from 'primeng/dropdown';
import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SliderModule } from 'primeng/slider';
@Component({
    selector: 'schemes-page',
    imports: [SliderModule,RouterModule,FormsModule, CommonModule,StyleClassModule, ButtonModule, RippleModule,DropdownModule],
    template: `<!-- NAKADH SCHEMES -->
    <div class="text-center my-10">
      <h2 class="text-2xl font-extrabold text-blue-900">NAKADH SCHEMES</h2>
    </div>

    <div class="grid md:grid-cols-3 gap-6 px-4 md:px-12">
      <!-- Scheme 1 -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex items-center gap-2 text-green-700 font-semibold text-lg mb-4">
          <i class="pi pi-bullseye text-xl"></i> No Tension Scheme
        </div>
        <ul class="text-gray-700 space-y-2 text-sm">
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Loan amount below 1 lakh</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Monthly fixed ROI</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Quick Process</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> More LTV</li>
        </ul>
      </div>

      <!-- Scheme 2 -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex items-center gap-2 text-yellow-800 font-semibold text-lg mb-4">
          <i class="pi pi-percentage text-xl"></i> 1.75% Club
        </div>
        <ul class="text-gray-700 space-y-2 text-sm">
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Loan range from 1 lakh to 5 lakh</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Monthly ROI 1.75%</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Rebate facilities on ROI</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Offers on processing fees</li>
        </ul>
      </div>

      <!-- Scheme 3 -->
      <div class="bg-white p-6 rounded-xl shadow-md">
        <div class="flex items-center gap-2 text-yellow-600 font-semibold text-lg mb-4">
          <i class="pi pi-star text-xl"></i> 1.5% Club
        </div>
        <ul class="text-gray-700 space-y-2 text-sm">
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Loan starts from 2 lakhs</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Monthly ROI 1.5%</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Gold pick and drop facility provided</li>
          <li><i class="pi pi-check-circle text-green-600 mr-2"></i> Unblock top up benefits</li>
        </ul>
      </div>
    </div>

    <!-- GOLD EMI CALCULATOR -->
    <div class="text-center mt-16 mb-8">
      <h2 class="text-2xl font-extrabold text-blue-900">Gold EMI Calculator</h2>
    </div>

    <div class="grid md:grid-cols-2 gap-10 items-center px-6 md:px-24 mb-10">
      <!-- Amount Slider -->
      <div>
        <h4 class="font-bold text-lg mb-2 text-center">Borrow Amount</h4>
        <p-slider [(ngModel)]="borrowAmount" [min]="25000" [max]="1000000" [step]="10000" [style]="{ width: '100%' }"></p-slider>
        <div class="flex justify-between text-sm mt-2 text-gray-600">
          <span>Rs. 25,000</span>
          <span>Rs.10,00,000</span>
        </div>
        <p class="text-xl font-semibold text-center mt-3 text-blue-900">Rs {{ borrowAmount | number:'1.0-2' }}</p>
      </div>

      <!-- Interest Slider -->
      <div>
        <h4 class="font-bold text-lg mb-2 text-center">Interest Rate</h4>
        <p-slider [(ngModel)]="interestRate" [min]="9.3" [max]="16" [step]="0.1" [style]="{ width: '100%' }"></p-slider>
        <div class="flex justify-between text-sm mt-2 text-gray-600">
          <span>9.3%</span>
          <span>16%</span>
        </div>
        <p class="text-xl font-semibold text-center mt-3 text-blue-900">{{ interestRate | number:'1.1-1' }}%</p>
      </div>
    </div>

    <div class="text-center mb-12">
      <button pButton type="button" label="Calculate" class="p-button-rounded p-button-warning text-white px-6 py-2 text-lg font-semibold"></button>
    </div>


        `
})
export class Schemespage {
    borrowAmount: number = 200000;
    interestRate: number = 11.4;

constructor(private fb: FormBuilder,public router: Router) {

}

}
