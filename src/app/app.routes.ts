import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Services } from './pages/services/services';
import { AboutUs } from './pages/about-us/about-us';
import { ContactUs } from './pages/contact-us/contact-us';
import { CountryInfo } from './pages/country-info/country-info';
import { AdminLogin } from './pages/admin/admin-login/admin-login';
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { EditHome } from './pages/admin/edit-home/edit-home';
import { EditAbout } from './pages/admin/edit-about/edit-about';
import { EditServices } from './pages/admin/edit-services/edit-services';
import { EditContact } from './pages/admin/edit-contact/edit-contact';
import { EditCountryInfo } from './pages/admin/edit-country-info/edit-country-info';
import { AddSection } from './pages/admin/add-section/add-section';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'services',
        component : Services
    },
    {
        path: 'about-us',
        component: AboutUs
    },
    {
        path: 'contact-us',
        component: ContactUs
    },
    {
        path: 'countries/:slug',
        component: CountryInfo
    },
    {
        path: 'admin/login',
        component: AdminLogin
    },
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [adminAuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard'
            },
            {
                path: 'dashboard',
                component: AdminDashboard
            },
            {
                path: 'add-section',
                component: AddSection
            },
            {
                path: 'edit-home',
                component: EditHome
            },
            {
                path: 'edit-about',
                component: EditAbout
            },
            {
                path: 'edit-services',
                component: EditServices
            },
            {
                path: 'edit-contact',
                component: EditContact
            },
            {
                path: 'edit-country-info',
                component: EditCountryInfo
            }
        ]
    }
];
