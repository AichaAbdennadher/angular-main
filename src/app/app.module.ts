import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ProfilComponent } from './pages/profil/profil.component';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { IndexComponent } from './pages/index/index.component';
import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { PaginationComponent } from './pages/pagination/pagination.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { PostFormComponent } from './components/post-form/post-form.component';
import { CategoryBarComponent } from './components/CategoryBar/CategoryBarComponent';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FooterComponent } from './pages/footer/footer.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { LucideAngularModule, Users, Newspaper, FolderTree, MessageSquare, MessageSquareLock, Shield, File, Calendar, Coins, XCircle, Search, SearchX, Filter, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Eye, EyeOff, Lock, Unlock, X, Mail, Plus, Edit, Trash2, UserMinus, User, Settings, LogOut, RotateCw, Flag, ThumbsUp, ThumbsDown } from 'lucide-angular';
import { PostesMComponent } from './pages/postes-m/postes-m.component';
import { ModerateurLayoutComponent } from './pages/moderateur-layout/moderateur-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    IndexComponent,
    NavbarComponent,
    PostFormComponent,
    CategoryBarComponent,
    FooterComponent,
    AdminCategoriesComponent,
    AdminLayoutComponent,
    PaginationComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    ProfilComponent,
    AuthComponent,
    PostesMComponent,
    ModerateurLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatBadgeModule,
    MatSelectModule,
    LucideAngularModule.pick({ Users, Newspaper, FolderTree, Shield, MessageSquare, MessageSquareLock, File, Calendar, Coins, XCircle, Search, SearchX, Filter, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Eye, EyeOff, Lock, Unlock, X, Mail, Plus, Edit, Trash2, UserMinus, User, Settings, LogOut, RotateCw, Flag, ThumbsUp, ThumbsDown })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }