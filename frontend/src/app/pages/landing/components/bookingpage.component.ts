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
    selector: 'booking-page',
    imports: [RouterModule,FormsModule, CommonModule,StyleClassModule, ButtonModule, RippleModule,DropdownModule],
    template: `<!-- OFFER BANNER -->
    <div class="bg-yellow-100 rounded-full flex items-center justify-center p-6 my-6 mx-4">
      <img src="assets/woman-offer.png" alt="Gold Offer" class="w-24 md:w-32 mr-4">
      <div class="text-xl font-semibold text-gray-800 text-center md:text-left">
        Nakadh offers lowest ROI<br>
        and highest per gram rate
      </div>
    </div>

    <!-- MAIN TITLE -->
    <div class="text-center my-8 px-4">
      <h2 class="text-2xl md:text-3xl font-extrabold text-blue-900">
        Your Gold, Your Loan – In Just a<br class="hidden md:block"> Few Easy Steps!
      </h2>
    </div>

    <!-- STEPS SECTION -->
    <div class="grid md:grid-cols-2 gap-8 px-6 items-center">
      <!-- LEFT: Steps Text -->
      <div>
        <h5 class="text-gray-500 text-sm mb-2">Easy and Fast</h5>
        <h3 class="text-2xl font-bold text-blue-900 mb-6">Book Appointment<br>In 3 Easy Steps</h3>

        <div class="space-y-6">
          <!-- Step 1 -->
          <div class="flex items-start gap-4">
            <div class="bg-yellow-400 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">1</div>
            <div>
              <div class="font-semibold text-gray-800">Step 1</div>
              <div class="text-gray-600 text-sm">Meet loan manager & get gold appraised</div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex items-start gap-4">
            <div class="bg-emerald-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">2</div>
            <div>
              <div class="font-semibold text-gray-800">Step 2</div>
              <div class="text-gray-600 text-sm">Get loan approved instantly</div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex items-start gap-4">
            <div class="bg-yellow-400 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">3</div>
            <div>
              <div class="font-semibold text-gray-800">Step 3</div>
              <div class="text-gray-600 text-sm">Gold is safely stored in our partner bank’s vault.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Visual Panel -->
      <div class="bg-[#004d40] rounded-3xl overflow-hidden relative p-4">
        <img src="assets/woman-book-loan.png" alt="Book Loan" class="absolute bottom-0 right-0 w-36 md:w-44 z-10">
        <img src="assets/gold-pile.png" alt="Gold Pile" class="absolute bottom-4 left-8 w-16 md:w-20 z-10">
        <div class="text-white font-bold text-xl md:text-2xl leading-snug z-20 relative mt-8 ml-4">
          BOOK YOUR LOAN<br>TO <span class="text-yellow-400">NAKADH</span>
        </div>
      </div>
    </div>

        `
})
export class Bookingpage {

constructor(private fb: FormBuilder,public router: Router) {

}

}
