import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOrderComponent } from './create-order/create-order.component';
import { OrdersComponent } from './orders/orders.component';

const routes: Routes = [
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'orders', component: OrdersComponent },
  { path: '', redirectTo: 'create-order', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
