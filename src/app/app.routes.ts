import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth-guard';
import { isLoggedGuard } from './core/guard/is-logged-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: '', loadComponent: () => import('./core/layouts/auth-layout/auth-layout').then(c => c.AuthLayout),
        children: [
            { path: 'login', canActivate: [isLoggedGuard], loadComponent: () => import('./core/auth/login/login').then(c => c.Login), title: 'Login Page' },
            { path: 'register', canActivate: [isLoggedGuard], loadComponent: () => import('./core/auth/register/register').then(c => c.Register), title: 'Register Page' },
            { path: 'forgot-password', canActivate: [isLoggedGuard], loadComponent: () => import('./core/auth/forgot-password/forgot-password').then(c => c.ForgotPassword), title: 'Forgot Password Page' },
            { path: 'reset-password/:email', canActivate: [isLoggedGuard], loadComponent: () => import('./core/auth/reset-password/reset-password').then(c => c.ResetPassword), title: 'Reset Password Page' },
        ]
    },
    {
        path: '', loadComponent: () => import('./core/layouts/blank-layout/blank-layout').then(c => c.BlankLayout),
        children: [
            { path: 'home', canActivate: [authGuard], loadComponent: () => import('./features/home/home').then(c => c.Home), title: 'Home Page' },
            { path: 'reels', canActivate: [authGuard], loadComponent: () => import('./features/reels/reels').then(c => c.Reels), title: 'Reels Page' },
            { path: 'chat', canActivate: [authGuard], loadComponent: () => import('./features/chat/chat').then(c => c.Chat), title: 'Chat Page' },
            { path: 'profile/:id', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile').then(c => c.Profile), title: 'Profile Page' },
            { path: 'saved', canActivate: [authGuard], loadComponent: () => import('./features/saved/saved').then(c => c.Saved), title: 'Saved Page' },
            { path: 'friends', canActivate: [authGuard], loadComponent: () => import('./features/friends/friends').then(c => c.Friends), title: 'Friends Page' },
            { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./features/notification/notification').then(c => c.Notifications), title: 'Notification Page' },
        ]
    },
    {
        path: '**', loadComponent: () => import('./shared/components/not-found/not-found').then(c => c.NotFound),
    }
];
