import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ActivatedRoute } from '@angular/router';
import JsBarcode from 'jsbarcode';
import { UserService } from '../services/user/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-id-card',
  standalone: true,
  imports:[CommonModule,DatePipe,FormsModule],
  templateUrl: './id-card.component.html',
  styleUrl: './id-card.component.scss'
})
export class IdCardComponent implements OnInit, AfterViewInit {

  @ViewChild('certificate') certificateRef!: ElementRef;
  @ViewChild('certificateBack') certificateBackRef!: ElementRef;
  @ViewChild('barcodeSvg', { static: false }) barcodeSvgRef!: ElementRef<SVGElement>;
environment = environment
  user: any = {};
  userId!: string;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.userId = String(localStorage.getItem('userId'));
  }

  ngOnInit(): void {
    if (this.userId) {
      this.loadUserData(this.userId);
      this.loadUserDocs(this.userId);
    }
  }

  ngAfterViewInit(): void {
    // Barcode generated only after user loads
    if (this.user?.mobile_no && this.barcodeSvgRef) {
      this.generateBarcode(this.user.mobile_no);
    }
  }

  // --------------------------------------------
  // 🔵 LOAD USER BASIC PROFILE
  // --------------------------------------------
  loadUserData(id: string) {
    this.userService.getUserById(id).subscribe({
      next: (res) => {
        this.user = {
          ...res,
          profilepic: this.user?.profilepic || "assets/images/default-user.png"
        };

        // Generate barcode after data arrives
        if (this.barcodeSvgRef) {
          this.generateBarcode(this.user.mobile_no);
        }
      },
      error: (err) => {
        console.error("Error loading user:", err);
      }
    });
  }

  // --------------------------------------------
  // 🔵 LOAD PROFILE PIC FROM USER DOCS
  // --------------------------------------------
  loadUserDocs(userId: string) {
    this.userService.getUserDocsByUserId(userId).subscribe({
      next: (docs) => {
          this.user.profilepic = environment.apiUrl + docs.data.photo;

        const profile = docs?.find((d: any) => d.type === 'profilepic');

        if (profile?.file_url) {
          this.user.profilepic = environment.apiUrl + docs.photo;
        }
      },
      error: (err) => console.log("Error loading docs:", err)
    });
  }

  // --------------------------------------------
  // 🔵 GENERATE BARCODE
  // --------------------------------------------
  generateBarcode(value: string) {
    try {
      JsBarcode(this.barcodeSvgRef.nativeElement, value, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true
      });
    } catch (e) {
      console.error("Barcode error:", e);
    }
  }

  // --------------------------------------------
  // 🔵 DOWNLOAD PDF
  // --------------------------------------------
  downloadPDF() {
    const frontElement = this.certificateRef.nativeElement;
    const backElement = this.certificateBackRef.nativeElement;
    const pdf = new jsPDF();

    html2canvas(frontElement).then(frontCanvas => {
      const frontImg = frontCanvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (frontCanvas.height * imgWidth) / frontCanvas.width;
      pdf.addImage(frontImg, 'PNG', 10, 10, imgWidth, imgHeight);

      html2canvas(backElement).then(backCanvas => {
        const backImg = backCanvas.toDataURL('image/png');
        pdf.addPage();
        pdf.addImage(backImg, 'PNG', 10, 10, imgWidth, (backCanvas.height * imgWidth) / backCanvas.width);
        pdf.save('id-card.pdf');
      });
    });
  }
}
