import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


export interface InternshipCertificate {
companyName: string;
companyLogoUrl?: string;
companyAddress?: string;
companyPhone?: string;
companyWebsite?: string;


internName: string;
internId?: string;
department?: string;
role?: string;
startDate?: string;
endDate?: string;
totalDuration?: string;
responsibilities?: string[];
issueDate?: string;


authorizedName?: string;
authorizedDesignation?: string;
}


@Component({
selector: 'app-internship-certificate-card',
standalone: true,
imports: [CommonModule, CardModule, ButtonModule],
templateUrl: './internship-certificate-card.component.html',
styleUrls: ['./internship-certificate-card.component.scss']
})
export class InternshipCertificateCardComponent implements OnInit {
@Input() certificate!: InternshipCertificate;
@Input() compact = false;
@Output() download = new EventEmitter<void>();


ngOnInit() {
if (!this.certificate) {
this.certificate = {
companyName: 'Unison Technologies',
companyLogoUrl: 'assets/logo.png',
companyAddress: '123 Tech Park, Chennai',
companyPhone: '+91 98765 43210',
companyWebsite: 'www.unison.com',


internName: 'John Doe',
internId: 'INT-2025-001',
department: 'Software Development',
role: 'Angular Intern',
startDate: '2025-01-01',
endDate: '2025-03-31',
totalDuration: '3 Months',
responsibilities: [
'Worked on UI components using Angular',
'Integrated REST APIs',
'Participated in daily scrum meetings'
],
issueDate: '2025-04-01',


authorizedName: 'Balakumar S',
authorizedDesignation: 'HR Manager'
};
}
}


onDownload() {
this.download.emit();
}
}
