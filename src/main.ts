import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { CreateOrderComponent } from './app/create-order/create-order.component';
import { OrdersComponent } from './app/orders/orders.component';
import { HttpClientModule } from '@angular/common/http';

// Definir las rutas de la aplicación
const routes: Routes = [
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'orders', component: OrdersComponent },
  { path: '', redirectTo: '/create-order', pathMatch: 'full' },
  { path: '**', redirectTo: '/create-order' }
];

// Inicializar la aplicación con el router y las rutas definidas
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    provideRouter(routes, withComponentInputBinding())
  ]
}).catch(err => console.error(err));
