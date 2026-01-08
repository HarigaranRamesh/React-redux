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
import { AccordionModule } from 'primeng/accordion';

@Component({
    selector: 'about-us',
    imports: [AccordionModule,SliderModule,RouterModule,FormsModule, CommonModule,StyleClassModule, ButtonModule, RippleModule,DropdownModule],
    template: `<!-- ABOUT US SECTION -->
    <section class="px-6 md:px-20 py-12">
      <h2 class="text-2xl font-extrabold text-center text-blue-900 mb-10">ABOUT US</h2>

      <div class="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h3 class="text-xl font-bold mb-4">Gold Loans. Simplified.</h3>
          <p class="text-gray-800 mb-4">
            Nakadh Is Transforming How India Accesses Gold Loans—<br>
            With Ease, Trust, And Speed.
          </p>
          <p class="text-gray-800 mb-6">
            We Offer The Highest Per Gram Rate, Minimal KYC, And A Secure Process Backed By Bank-Level Gold Storage.
          </p>
          <button pButton label="Know More" class="p-button-sm p-button-warning text-white font-semibold px-5"></button>
        </div>

        <div class="flex justify-center">
          <img src="assets/scale-image.png" alt="Gold Scale" class="w-full max-w-md">
        </div>
      </div>
    </section>

    <!-- FAQ SECTION -->
    <section class="px-6 md:px-20 py-12 bg-gray-50">
      <h2 class="text-xl font-extrabold text-center text-blue-900 mb-10">Frequently asked questions</h2>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- FAQ Accordion -->
        <div class="md:col-span-2">
          <p-accordion [multiple]="true" class="w-full">
            <p-accordionTab header="What is gold loan ?">
              <p>A gold loan is a loan in which the borrower offers a certain amount of gold against a loan amount (called loan-to-value or LTV) for a certain period of time.</p>
            </p-accordionTab>
            <p-accordionTab header="How gold loan works ?" />
            <p-accordionTab header="Why gold loan ?" />
            <p-accordionTab header="Why nakadh ?" />
            <p-accordionTab header="Is it really safe ?" />
          </p-accordion>
        </div>

        <!-- FAQ Contact Card -->
        <div class="bg-white p-6 rounded-xl shadow border text-center">
          <i class="pi pi-envelope text-3xl text-blue-600 mb-4"></i>
          <h4 class="text-md font-bold mb-2">Do you have more questions?</h4>
          <p class="text-sm text-gray-600 mb-4">End-to-end payments and financial management in a single solution. Meet the right platform to help realize.</p>
          <button pButton label="Shoot a Direct Mail" class="p-button-warning text-white px-5 py-2 font-medium"></button>
        </div>
      </div>
    </section>


        `
})
export class Aboutus {
    borrowAmount: number = 200000;
    interestRate: number = 11.4;

constructor(private fb: FormBuilder,public router: Router) {

}

}
