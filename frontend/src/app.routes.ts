import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/pages/hrms/services/auth/auth.guard';
import { AdminpanelComponent } from './app/pages/hrms/adminpanel/adminpanel.component';
import { CreateUsersComponent } from './app/pages/hrms/create-users/create-users.component';
import { ViewUsersComponent } from './app/pages/hrms/view-users/view-users.component';
import { DailyreportComponent } from './app/pages/hrms/dailyreport/dailyreport.component';
import { LeaveRequestComponent } from './app/pages/hrms/leave-request/leave-request.component';
import { AttendanceManagemntComponent } from './app/pages/hrms/attendance-managemnt/attendance-managemnt.component';
import { MonthlyreportComponent } from './app/pages/hrms/monthlyreport/monthlyreport.component';
import { PetrolReimbursmentComponent } from './app/pages/hrms/petrolreimbursment/petrolreimbursment.component';
import { AttendanceReportComponent } from './app/pages/hrms/attendance-report/attendance-report.component';
import { EmployeeleaveApprovalComponent } from './app/pages/hrms/employeeleave-approval/employeeleave-approval.component';
import { PetrolApprovalComponent } from './app/pages/hrms/petrol-approval/petrol-approval.component';
import { AccessComponent } from './app/pages/hrms/access/access.component';
import { AccessdefineComponent } from './app/pages/hrms/accessdefine/accessdefine.component';
import { LeavePolicyAdminComponent } from './app/pages/hrms/leave-policy-admin/leave-policy-admin.component';
import { HolidayPlannerComponent } from './app/pages/hrms/holiday-planner/holiday-planner.component';
import { DailyAttendanceReportComponent } from './app/pages/hrms/daily-attendance-report/daily-attendance-report.component';
import { MonthlyAttendanceReportComponent } from './app/monthly-attendance-report/monthly-attendance-report.component';
import { ViewEditUserComponent } from './app/pages/hrms/view-edit-user/view-edit-user.component';
import { LoaComponent } from './app/pages/hrms/loa/loa.component';
import { PayslipComponent } from './app/pages/hrms/payslip/payslip.component';
import { DeletedUserComponent } from './app/pages/hrms/deleted-user/deleted-user.component';
import { FeedComponent } from './app/pages/hrms/feed/feed.component';
import { IdCardComponent } from './app/pages/hrms/id-card/id-card.component';
import { InternshipCertificateCardComponent } from './app/pages/hrms/internshipletter/internship-certificate-card/internship-certificate-card.component';
import { LeaveBucketEditorComponent } from './app/pages/hrms/leave-bucket-editor/leave-bucket-editor.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminpanelComponent, canActivate: [AuthGuard], data: { permission: 'Dashboard' } },
      { path: 'home/adduser', component: CreateUsersComponent, canActivate: [AuthGuard], data: { permission: 'Add User' } },
      { path: 'home/viewuser', component: ViewUsersComponent, canActivate: [AuthGuard], data: { permission: 'View Users' } },
      { path: 'home/petrolreimbursment', component: PetrolReimbursmentComponent, canActivate: [AuthGuard], data: { permission: 'Petrol Reimbursment' } },
      { path: 'home/dailyreport', component: DailyAttendanceReportComponent, canActivate: [AuthGuard], data: { permission: 'Daily Report' } },
      { path: 'home/monthlyreport', component: MonthlyreportComponent, canActivate: [AuthGuard], data: { permission: 'Monthly Report' } },
      { path: 'home/attendance', component: AttendanceReportComponent, canActivate: [AuthGuard], data: { permission: 'Attendance' } },
      { path: 'home/leaverequest', component: AttendanceManagemntComponent, canActivate: [AuthGuard], data: { permission: 'Leave Request' } },
      { path: 'home/leaveapproval', component: EmployeeleaveApprovalComponent, canActivate: [AuthGuard], data: { permission: 'Employee Leave Approval' } },
      { path: 'home/petrolapproval', component: PetrolApprovalComponent, canActivate: [AuthGuard], data: { permission: 'Employee Petrol Approval' } },
      { path: 'home/access', component: AccessComponent, canActivate: [AuthGuard], data: { permission: 'Access' } },
      { path: 'home/access2', component: AccessComponent, canActivate: [AuthGuard], data: { permission: 'Access2' } },
      { path: 'home/accessdefine', component: AccessdefineComponent, canActivate: [AuthGuard], data: { permission: 'Access Define' } },
      { path: 'home/yearlyleavyplocy', component: LeavePolicyAdminComponent, canActivate: [AuthGuard], data: { permission: 'Yearly Leave Policy' } },
      { path: 'home/holidayplanning', component: HolidayPlannerComponent, canActivate: [AuthGuard], data: { permission: 'Holiday Planning' } },
      { path: 'home/viewedituser', component: ViewEditUserComponent, canActivate: [AuthGuard], data: { permission: 'ViewEdit Users' } },
      { path: 'home/loa', component: LoaComponent, canActivate: [AuthGuard], data: { permission: 'Letter of Appointment' } },
      { path: 'home/loas', component: LoaComponent, canActivate: [AuthGuard], data: { permission: 'Letters of Appointment' } },
      { path: 'home/payslip', component: PayslipComponent, canActivate: [AuthGuard], data: { permission: 'Payslip' } },
      { path: 'home/idcard', component: IdCardComponent, canActivate: [AuthGuard], data: { permission: 'Id-card' } },
      { path: 'notfound', component: Notfound },
      { path: 'intern', component: InternshipCertificateCardComponent },
      { path: 'home/feed', component: FeedComponent,  canActivate: [AuthGuard], data: { permission: 'Feed' }  },
       { path: 'home/userleaveedit', component: LeaveBucketEditorComponent,  canActivate: [AuthGuard], data: { permission: 'Users Leave Policy Edit' }  }
    ]
  },
  { path: 'login', loadChildren: () => import('./app/pages/hrms/login/login-routing.module') },
];

