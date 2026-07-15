import { Routes } from '@angular/router';
import { App } from './app';
import { AuthComponent } from './auth.component';

export const routes: Routes = [
    { path: '', component: App },     
    { path: 'auth', component: AuthComponent }  
];
