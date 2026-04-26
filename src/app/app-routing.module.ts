import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { IndexComponent } from './pages/index/index.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { ModerateurLayoutComponent } from './pages/moderateur-layout/moderateur-layout.component';
import { PostesMComponent } from './pages/postes-m/postes-m.component';
import { SuppensionComponent } from './suppension/suppension.component';

const routes: Routes = [
  { path: '', component: IndexComponent }, // page publique
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ]
  },
  { path: 'suppension', component: SuppensionComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'profil', component: ProfilComponent }
    ]
  },
  {
    path: 'moderateur',
    component: ModerateurLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'postes', component: PostesMComponent },
    
      { path: 'profil', component: ProfilComponent }
    ]
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }