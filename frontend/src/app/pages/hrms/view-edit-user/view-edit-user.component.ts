import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { environment } from '../../../../environments/environment';
import { UserService } from '../services/user/user.service';
import { PayloadService } from '../services/payload/payload.service';
import { TabsModule } from 'primeng/tabs';
import { DeletedUserComponent } from "../deleted-user/deleted-user.component";
import { PayloadComponent } from "../payload/payload.component";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AccessService } from '../services/access/access.service';

@Component({
    selector: 'app-view-edit-user',
    standalone: true,
    imports: [
        CommonModule,
        TabsModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        DialogModule,
        StepperModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        CalendarModule,
        FileUploadModule,
        DeletedUserComponent,
        PayloadComponent,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './view-edit-user.component.html',
    styleUrls: ['./view-edit-user.component.scss']
})
export class ViewEditUserComponent implements OnInit {
    // Table state
    userList: any[] = [];
    total = 0;
    limit = 10;
    loading = false;
    environment = environment;

    // Filters (optional top bar)
    filterOptions = [
        { label: 'User Name', value: 'user_name' },
        { label: 'Mobile No', value: 'mobile_no' },
        { label: 'Email', value: 'email' }
    ];
    selectedField = this.filterOptions[0];
    searchText = '';

    showDocsDialog = false;
    userDocs: any = null;


    // Dialog + Stepper state
    showDialog = false;
    activeStep = 1;

    // Edit form
    editForm!: FormGroup;
    selectedUser: any = null;

    // Dropdowns
    roles = [
        { label: 'Admin', value: 'Admin' },
        { label: 'Employee', value: 'Employee' },
        { label: 'Intern', value: 'Intern' }
    ];
    policies: { label: string; value: string }[] = [];

    // Default documents
    documents = [
        { name: 'photo', label: 'Photo', accept: 'image/*' },
        { name: 'marksheet10', label: '10th Marksheet', accept: '.pdf' },
        { name: 'marksheet12', label: '12th Marksheet', accept: '.pdf' },
        { name: 'transferCertificate', label: 'Transfer Certificate', accept: '.pdf' }
    ];
    files: Record<string, File | null> = {};

    // Dynamic sections
    prevCompanies: { companyName: string; relieving?: File; experience?: File; payslips: File[] }[] = [
        { companyName: '', payslips: [] }
    ];
    pgCertificates: { certificate?: File | null; marksheet?: File | null }[] = [
        { certificate: null, marksheet: null }
    ];
    ugCertificates: { certificate?: File | null; marksheet?: File | null }[] = [
        { certificate: null, marksheet: null }
    ];

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private fb: FormBuilder,
        private payloadService: PayloadService,
        private messageService: MessageService,
        private accessService: AccessService
    ) { }
    tabs: { title: string; value: number; content: string }[] = [];

    ngOnInit(): void {
        this.tabs = [
            { title: 'Tab 1', value: 0, content: 'Tab 1 Content' },
            { title: 'Tab 2', value: 1, content: 'Tab 2 Content' },
            { title: 'Tab 3', value: 2, content: 'Tab 3 Content' },
        ];
        this.initForm();
        this.fetchLeavePolicies();
        this.loadUsers({ first: 0, rows: this.limit, page: 0 });
    }

    private initForm() {
        this.editForm = this.fb.group({
            user_name: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
            mobile_no: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
            email: ['', [Validators.required, Validators.email]],
            position: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
            role: ['', Validators.required],
            designation: [''],
            department: ['', [Validators.pattern(/^[A-Za-z ]*$/)]],
            policyName: ['', Validators.required],
            doj: ['', Validators.required],
        });

        // Dynamic validator for designation when role is Admin
        this.editForm.get('role')?.valueChanges.subscribe(role => {
            const desig = this.editForm.get('designation');
            if (role === 'Admin') {
                desig?.addValidators([Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]);
            } else {
                desig?.clearValidators();
            }
            desig?.updateValueAndValidity({ emitEvent: false });
        });
    }

    fetchLeavePolicies() {
        this.accessService.getLeavePoliciesByRolesStrings().subscribe({
            next: (res: string[]) => {
                this.policies = (res ?? []).map(p => ({ label: this.toTitle(p), value: p }));
            },
            error: () => {
                this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Could not load leave policies' });
            }
        });
    }

    private toTitle(s: string): string {
        return (s || '').replace(/(^|\s)\w/g, m => m.toUpperCase());
    }

    lastTableEvent: any = null;

    // ====== TABLE ======
    loadUsers(event: any) {
        this.lastTableEvent = event;
        this.loading = true;

        const page = (event?.page ?? 0) + 1;
        const limit = event?.rows ?? this.limit;

        let params = new HttpParams().set('page', page).set('limit', limit);

        if (this.searchText?.trim() && this.selectedField?.value) {
            params = params.set(this.selectedField.value, this.searchText.trim());
        }

        // Add timestamp to prevent caching
        params = params.set('_t', Date.now().toString());

        this.http.get<any>(`${environment.apiUrl}/api/user`, { params }).subscribe({
            next: (res) => {
                this.userList = res.data ?? [];
                this.total = res.total ?? this.userList.length;
                this.limit = res.limit ?? limit;
                this.loading = false;
            },
            error: () => (this.loading = false)
        });
    }

    onSearch() {
        this.loadUsers({ first: 0, rows: this.limit, page: 0 });
    }

    // ====== EDIT POPUP ======
    openEditDialog(user: any) {
        this.selectedUser = user;
        this.showDialog = true;
        this.activeStep = 1;

        // Patch form
        this.editForm.patchValue({
            user_name: user?.user_name ?? '',
            mobile_no: user?.mobile_no ?? '',
            email: user?.email ?? '',
            position: user?.position ?? '',
            role: user?.role?.role ?? user?.role ?? '', // Handle populated object or string ID
            designation: user?.designation ?? '',
            department: user?.department ?? '',
            policyName: user?.policyName ?? '',
            doj: user?.doj ? new Date(user.doj) : null
        });

        // Prefill dynamic arrays if your API returns them; else keep one blank block
        this.prevCompanies = Array.isArray(user?.prevCompanies) && user.prevCompanies.length
            ? user.prevCompanies.map((c: any) => ({ companyName: c?.companyName ?? '', payslips: [] }))
            : [{ companyName: '', payslips: [] }];

        this.pgCertificates = Array.isArray(user?.pgCertificates) && user.pgCertificates.length
            ? user.pgCertificates.map(() => ({ certificate: null, marksheet: null }))
            : [{ certificate: null, marksheet: null }];

        this.ugCertificates = Array.isArray(user?.ugCertificates) && user.ugCertificates.length
            ? user.ugCertificates.map(() => ({ certificate: null, marksheet: null }))
            : [{ certificate: null, marksheet: null }];

        this.files = {};

        // Fetch Payload Data
        this.selectedPayload = null;
        this.payloadService.getPayloadByUserId(user._id).subscribe({
            next: (res) => {
                if (res && res.length > 0) {
                    this.selectedPayload = res[0]; // Assuming one payload per user
                }
            },
            error: (err) => console.error('Failed to fetch payload:', err)
        });
    }

    selectedPayload: any = null;

    // File handlers
    pickFile(field: string, event: any) {
        const file = event?.files?.[0];
        if (file) this.files[field] = file;
    }

    // Dynamic add/remove
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

    // Save
    saveEditedUser() {
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }

        const userId = this.selectedUser._id;
        const userPayload = this.editForm.value;

        // 1. Update User Info (JSON)
        this.userService.updateUser(userId, userPayload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User info updated' });

                // 2. Upload Documents (FormData) - Only if files exist
                if (this.hasFilesToUpload()) {
                    this.uploadDocuments(userId);
                } else {
                    this.showDialog = false;
                    this.loadUsers({ first: 0, rows: this.limit, page: 0 });
                }
            },
            error: (err) => {
                console.error('Update User Failed:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user info' });
            }
        });
    }

    // Check if any files are selected
    hasFilesToUpload(): boolean {
        // Simple checks
        if (Object.keys(this.files).length > 0) return true;
        if (this.prevCompanies.some(c => c.relieving || c.experience || (c.payslips && c.payslips.length > 0))) return true;
        if (this.pgCertificates.some(pg => pg.certificate || pg.marksheet)) return true;
        if (this.ugCertificates.some(ug => ug.certificate || ug.marksheet)) return true;
        return false;
    }

    uploadDocuments(userId: string, onSuccess?: () => void) {
        const fd = new FormData();
        fd.append("user_id", userId);

        // Simple docs
        for (const key of Object.keys(this.files)) {
            const f = this.files[key];
            if (f) fd.append(key, f);
        }

        // Previous employment
        this.prevCompanies.forEach((c, i) => {
            if (c.companyName) fd.append(`prev[${i}][companyName]`, c.companyName);
            if (c.relieving) fd.append(`prev[${i}][relieving]`, c.relieving);
            if (c.experience) fd.append(`prev[${i}][experience]`, c.experience);
            (c.payslips || []).forEach(p => fd.append(`prev[${i}][payslips]`, p));
        });

        // PG
        this.pgCertificates.forEach((pg, i) => {
            if (pg.certificate) fd.append(`pg[${i}][certificate]`, pg.certificate);
            if (pg.marksheet) fd.append(`pg[${i}][marksheet]`, pg.marksheet);
        });

        // UG
        this.ugCertificates.forEach((ug, i) => {
            if (ug.certificate) fd.append(`ug[${i}][certificate]`, ug.certificate);
            if (ug.marksheet) fd.append(`ug[${i}][marksheet]`, ug.marksheet);
        });

        this.userService.uploadUserDocs(fd).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Documents updated' });
                // this.showDialog = false; // Don't close dialog on partial save

                if (this.lastTableEvent) {
                    this.loadUsers(this.lastTableEvent);
                } else {
                    this.loadUsers({ first: 0, rows: this.limit, page: 0 });
                }

                if (onSuccess) onSuccess();
            },
            error: (err) => {
                console.error('Update failed:', err);
            }
        });
    }

    saveUserData(onSuccess?: () => void) {
        // console.log('Attempting to save user data...');
        if (this.editForm.invalid) {
            console.warn('Edit form is invalid:', this.editForm.errors);
            console.log('Form controls status:', this.editForm.controls);
            this.editForm.markAllAsTouched();
            this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' });
            return;
        }

        const userId = this.selectedUser?._id;
        if (!userId) {
            console.error('No selected user ID found');
            return;
        }

        const userPayload = this.editForm.value;

        this.userService.updateUser(userId, userPayload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User info updated' });

                // Update local object immediately to reflect changes in UI
                if (this.selectedUser) {
                    Object.assign(this.selectedUser, this.editForm.value);
                }

                // Refresh table keeping current page
                if (this.lastTableEvent) {
                    this.loadUsers(this.lastTableEvent);
                } else {
                    this.loadUsers({ first: 0, rows: this.limit, page: 0 });
                }

                if (onSuccess) onSuccess();
            },
            error: (err) => {
                console.error('Update User Failed:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user info' });
            }
        });
    }

    saveUserDocs(onSuccess?: () => void) {
        if (!this.hasFilesToUpload()) {
            this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No documents to upload' });
            if (onSuccess) onSuccess(); // Proceed anyway even if no docs
            return;
        }

        const userId = this.selectedUser?._id;
        if (!userId) return;

        const userPayload = this.editForm.value;

        // Save User Info First
        this.userService.updateUser(userId, userPayload).subscribe({
            next: () => {
                // Then Upload Docs
                this.uploadDocuments(userId, onSuccess);
            },
            error: (err) => {
                console.error('Update User Failed:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user info before uploading docs' });
            }
        });
    }

    onNextStep1() {
        this.saveUserData(() => {
            this.activeStep = 2;
        });
    }

    onNextStep2() {
        this.saveUserDocs(() => {
            this.activeStep = 3;
        });
    }

    activateCallback(index: number) {
        this.activeStep = index;
    }

    confirmDelete(user: any) {
        const deletedBy = localStorage.getItem('userId') || 'system';
        const reason = prompt(`Enter reason for deleting user "${user.user_name}":`);
        if (!reason) return;

        if (confirm(`Are you sure you want to delete user "${user.user_name}"?`)) {
            this.userService.deleteUser(user._id, deletedBy, reason).subscribe({
                next: () => {
                    alert('User deleted successfully!');
                    this.loadUsers({ first: 0, rows: this.limit, page: 0 });
                },
                error: (err) => {
                    console.error('Delete failed:', err);
                    alert('Failed to delete user.');
                }
            });
        }
    }

    viewUserDocs(user: any) {
        if (!user?._id) return;
        this.userService.getUserDocsByUserId(user._id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.userDocs = res.data;
                    this.showDocsDialog = true;
                } else {
                    alert('No documents found for this user.');
                }
            },
            error: (err) => {
                console.error('Failed to load user docs:', err);
                alert('Failed to load user documents.');
            }
        });
    }


}
