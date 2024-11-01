import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchControl = new FormControl('');

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.setupSearch();
  }

  // Método para cargar los pedidos
  loadOrders() {
    this.orderService.getOrders().subscribe((orders) => {
      this.orders = orders;
      this.filteredOrders = orders; // Inicia con todos los pedidos
    });
  }

  // Configuración del filtro de búsqueda
  // setupSearch() {
  //   this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe((searchTerm) => {
  //     this.filteredOrders = this.orders.filter((order) =>
  //       order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       order.email.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   });
  // }
  setupSearch() {
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe((searchTerm) => {
      const term = searchTerm ? searchTerm.toLowerCase() : '';
      this.filteredOrders = this.orders.filter((order) =>
        order.customerName.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term)
      );
    });
  }
  
}
