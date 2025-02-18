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
        path:'shelf',
        loadComponent:()=>import('./pages/shelf/shelf.component').then((c)=>c.ShelfComponent)
    },
    {
        path:'shelfposition',
        loadComponent:()=>import('./pages/shelfposition/shelfposition.component').then((c)=>c.ShelfpositionComponent)
    },
];


