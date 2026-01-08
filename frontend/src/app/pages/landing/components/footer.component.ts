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
    selector: 'footerpage',
    imports: [AccordionModule,SliderModule,RouterModule,FormsModule, CommonModule,StyleClassModule, ButtonModule, RippleModule,DropdownModule],
    template: `<footer class="bg-yellow-100 text-sm px-6 md:px-20 py-10 border-t border-gray-300">
    <div class="grid md:grid-cols-4 gap-8 mb-8">

      <!-- Left Brand Info -->
      <div>
        <div class="bg-green-900 text-white font-bold px-3 py-1 inline-block rounded mb-4">NAKADH</div>
        <p class="text-gray-800 mb-3">
          Nakadh is a customer-centric gold loan provider committed to offering maximum value with minimum effort. We understand the financial needs of our customers and offer transparent, safe, and quick loan services tailored to suit every individual's requirement.
        </p>
        <div class="flex items-center gap-2 text-gray-700">
          <i class="pi pi-phone"></i> +91 95974 31719
        </div>
        <div class="flex items-center gap-2 text-gray-700 mt-1">
          <i class="pi pi-envelope"></i> info.nakadh.com
        </div>

        <!-- Social Media Icons -->
        <div class="flex gap-3 mt-4">
          <a href="#"><i class="pi pi-facebook text-xl text-blue-600"></i></a>
          <a href="#"><i class="pi pi-instagram text-xl text-pink-500"></i></a>
          <a href="#"><i class="pi pi-twitter text-xl text-sky-500"></i></a>
          <a href="#"><i class="pi pi-youtube text-xl text-red-600"></i></a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h4 class="text-green-900 font-semibold mb-3">Quick Links</h4>
        <ul class="space-y-2 text-gray-800">
          <li><a href="#">Home</a></li>
          <li><a href="#">Shift Loan</a></li>
          <li><a href="#">Apply Loan</a></li>
          <li><a href="#">Schemes</a></li>
          <li><a href="#">Faqs</a></li>
          <li><a href="#">Contacts</a></li>
        </ul>
      </div>

      <!-- Branch Address -->
      <div class="md:col-span-2">
        <h4 class="text-green-900 font-semibold mb-3">Our Branches</h4>
        <div class="flex flex-col md:flex-row items-start gap-4">
          <div>
            <p class="text-green-800 font-medium mb-1"><i class="pi pi-map-marker text-green-700"></i> Coimbatore</p>
            <p class="text-gray-800">
              Nakadh, 553 NVN Layout, Tatabad, Gandhipuram, Tamil Nadu 641012<br>
              Coimbatore, Tamil Nadu.
            </p>
          </div>
          <img src="assets/map-nakadh.png" alt="Branch Map" class="w-48 h-32 object-cover rounded-md shadow">
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="text-center text-gray-700 text-sm border-t pt-4">
      Copyright © 2025 Nakadh. All Rights Reserved.
    </div>
  </footer>

        `
})
export class footerpage {
    borrowAmount: number = 200000;
    interestRate: number = 11.4;

constructor(private fb: FormBuilder,public router: Router) {

}

}
