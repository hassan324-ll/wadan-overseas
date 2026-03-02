import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Services } from './pages/services/services';
import { AboutUs } from './pages/about-us/about-us';
import { ContactUs } from './pages/contact-us/contact-us';

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
    }
];
