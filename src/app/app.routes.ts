import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadComponent:()=>import('./pages/home/home.component').then((c)=>c.HomeComponent)
    },
    {
        path:'device',
        loadComponent:()=>import('./pages/device/device.component').then((c)=>c.DeviceComponent)
    },
    {
        path:'device/:id',
        loadComponent:()=>import('./pages/device-details/device-details.component').then((c)=>c.DeviceDetailsComponent)
    },
    {
        path:'shelf',
        loadComponent:()=>import('./pages/shelf/shelf.component').then((c)=>c.ShelfComponent)
    },
    {
        path:'shelf/:id',
        loadComponent:()=>import('./pages/shelf-details/shelf-details.component').then((c)=>c.ShelfDetailsComponent)
    },
    {
        path:'shelfposition',
        loadComponent:()=>import('./pages/shelfposition/shelfposition.component').then((c)=>c.ShelfpositionComponent)
    },
    {
        path:'shelfposition/:id',
        loadComponent:()=>import('./pages/shelfposition-details/shelfposition-details.component').then((c)=>c.ShelfpositionDetailsComponent)
    },
];


