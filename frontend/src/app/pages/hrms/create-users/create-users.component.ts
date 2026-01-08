import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { UserService } from '../services/user/user.service';
import { AccessService } from '../services/access/access.service';
import { PayloadComponent } from "../payload/payload.component";
import { StepperModule } from 'primeng/stepper';

type RoleOption = { _id: string; role: string };
type PolicyOption = { label: string; value: string };

type PrevCompany = {
  companyName: string;
  relieving?: File;
  experience?: File;
  payslips: File[];
};

@Component({
  selector: 'app-create-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    FloatLabelModule,
    CalendarModule,
    FileUploadModule,
    CheckboxModule,
    PayloadComponent,
    StepperModule
],
  templateUrl: './create-users.component.html',
  styleUrls: ['./create-users.component.scss'],
  providers: [MessageService]
})
export class CreateUsersComponent implements OnInit {
  userForm!: FormGroup;
  payloadForm!: FormGroup;

  roles: RoleOption[] = [];
  leavePolicies: PolicyOption[] = [];
  selectedRoleName = '';
  currentUser: any;
  empId: string | null = null;

  isSubmittingUser = false;
  isSubmittingUploads = false;
  activeStep = 1; // Stepper value

  // Document list
  documents = [
    { name: 'photo', label: 'Photo', accept: 'image/*' },
    { name: 'marksheet10', label: '10th Marksheet', accept: '.pdf' },
    { name: 'marksheet12', label: '12th Marksheet', accept: '.pdf' },
    { name: 'transferCertificate', label: 'Transfer Certificate', accept: '.pdf' }
  ];

  // File storage
  files: Record<string, File | null> = {};

  // Previous employment
  prevCompanies: PrevCompany[] = [{ companyName: '', payslips: [] }];

  // UG/PG certificate + marksheet
  pgCertificates: { certificate?: File | null; marksheet?: File | null }[] = [
    { certificate: null, marksheet: null }
  ];
  ugCertificates: { certificate?: File | null; marksheet?: File | null }[] = [
    { certificate: null, marksheet: null }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private userService: UserService,
    private accessService: AccessService
  ) {}

  ngOnInit(): void {
    this.currentUser = localStorage.getItem('userId');
    this.initUserForm();
    this.fetchRoles();
    this.fetchLeavePolicies();
  }

  // ✅ Initialize User Form
  private initUserForm() {
    this.userForm = this.fb.group({
      user_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      mobile_no: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [null, Validators.required],
      position: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      designation: [''],
      department: ['', [Validators.pattern(/^[A-Za-z ]*$/)]],
      policyName: [null, Validators.required],
      doj: ['', Validators.required],
    });

    this.userForm.get('role')?.valueChanges.subscribe(val => {
      this.selectedRoleName = this.resolveRoleName(val);
      const desigCtrl = this.userForm.get('designation');
      if (this.selectedRoleName === 'Admin') {
        desigCtrl?.addValidators([Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]);
      } else {
        desigCtrl?.clearValidators();
      }
      desigCtrl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private resolveRoleName(val: any): string {
    return this.roles.find(r => r._id === val)?.role ?? '';
  }

  // ✅ Fetch roles & leave policies
  fetchRoles() {
    this.roles = [
      { _id: 'Admin', role: 'Admin' },
      { _id: 'Employee', role: 'Employee' },
      { _id: 'Intern', role: 'Intern' }
    ];
    this.userForm.patchValue({ role: this.roles[0]._id });
    this.selectedRoleName = this.roles[0].role;
  }

  fetchLeavePolicies() {
    this.accessService.getLeavePoliciesByRolesStrings().subscribe({
      next: (res: string[]) => {
        this.leavePolicies = (res ?? []).map(p => ({ label: this.toTitle(p), value: p }));
      },
      error: () => {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Could not load leave policies' });
      }
    });
  }

  private toTitle(s: string): string {
    return (s || '').replace(/(^|\s)\w/g, m => m.toUpperCase());
  }

  // ✅ Pick file handler
  pickFile(field: string, event: any) {
    const file = event.files?.[0];
    if (file) this.files[field] = file;
  }

  // ✅ Add/Remove company & certificates
  addCompany() {
    this.prevCompanies.push({ companyName: '', payslips: [] });
  }
  removeCompany(i: number) {
    this.prevCompanies.splice(i, 1);
  }
  addPgCertificate() {
    this.pgCertificates.push({ certificate: null, marksheet: null });
  }
  removePgCertificate(i: number) {
    this.pgCertificates.splice(i, 1);
  }
  addUgCertificate() {
    this.ugCertificates.push({ certificate: null, marksheet: null });
  }
  removeUgCertificate(i: number) {
    this.ugCertificates.splice(i, 1);
  }

  // ===============================
  // ✅ Submit User Info (Form 1)
  // ===============================
  onSubmitUser(nextStep: Function){
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmittingUser = true;
    const userPayload = this.userForm.value;
    this.userForm.value.createdby = this.currentUser
    this.userService.createUser(userPayload, this.currentUser).subscribe({
      next: (res: any) => {
        this.isSubmittingUser = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully!' });
        this.empId = res?.data?._id; // Store returned ID
         nextStep(2);
      },
      error: (err) => {
        this.isSubmittingUser = false;
        console.error('Create User Error:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user' });
      }
    });
  }

  // ===============================
  // ✅ Submit Uploads (Form 2)
  // ===============================
  onSubmitUploads(nextStep: Function) {
  if (!this.empId) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Create user first before uploading documents!'
    });
    return;
  }

  this.isSubmittingUploads = true;

  try {
    const fd = new FormData();
    fd.append("user_id", this.empId);

    // ✅ Attach simple files (photo, aadhar front/back, pan front/back)
    for (const key of Object.keys(this.files)) {
      if (this.files[key]) {
        fd.append(key, this.files[key]!);
      }
    }

    // ✅ Previous Companies
    this.prevCompanies.forEach((c, i) => {
      if (c.companyName) fd.append(`prev[${i}][companyName]`, c.companyName);
      if (c.relieving) fd.append(`prev[${i}][relieving]`, c.relieving);
      if (c.experience) fd.append(`prev[${i}][experience]`, c.experience);
      (c.payslips || []).forEach((p) => fd.append(`prev[${i}][payslips]`, p));
    });

    // ✅ PG Certificates
    this.pgCertificates.forEach((pg, i) => {
      if (pg.certificate) fd.append(`pg[${i}][certificate]`, pg.certificate);
      if (pg.marksheet) fd.append(`pg[${i}][marksheet]`, pg.marksheet);
    });

    // ✅ UG Certificates
    this.ugCertificates.forEach((ug, i) => {
      if (ug.certificate) fd.append(`ug[${i}][certificate]`, ug.certificate);
      if (ug.marksheet) fd.append(`ug[${i}][marksheet]`, ug.marksheet);
    });
// ✅ Others Certificates
this.others.forEach((o, i) => {
  if (o.certificatename) fd.append(`others[${i}][certificatename]`, o.certificatename);
  if (o.certificate) fd.append(`others[${i}][certificate]`, o.certificate);
  if (o.marksheet) fd.append(`others[${i}][marksheet]`, o.marksheet);
});

    console.log("Uploading FormData...");

    this.userService.uploadUserDocs(fd).subscribe({
      next: () => {
        this.isSubmittingUploads = false;
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Documents uploaded successfully!"
        });
        nextStep(3);

      },
      error: (err) => {
        this.isSubmittingUploads = false;
        console.error("Upload Error:", err);
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to upload documents"
        });
      }
    });
  } catch (err) {
    this.isSubmittingUploads = false;
    console.error("FormData processing failed:", err);
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to process files before upload"
    });
  }
}

addOther() {
  this.others.push({ certificatename: '', certificate: null, marksheet: null });
}

removeOther(i: number) {
  this.others.splice(i, 1);
}
// Others Certificates
others: { certificatename?: string; certificate?: File | null; marksheet?: File | null }[] = [
  { certificatename: '', certificate: null, marksheet: null }
];


}
