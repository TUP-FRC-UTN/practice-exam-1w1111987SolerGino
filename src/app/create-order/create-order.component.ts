import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../services/order.service';
import { Product } from '../models/product.model';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit {
  orderForm: FormGroup;
  products: Product[] = [];
  productOptions: { id: number; name: string }[] = [];

  constructor(private fb: FormBuilder, private orderService: OrderService) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [this.emailValidator()]],
      products: this.fb.array([], [this.productArrayValidator()]),
      total: [0]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.orderForm.get('products')?.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.updateTotal();
    });
  }
  onSubmit() {
    console.log("Estado del formulario:", this.orderForm.status);
    console.log("Errores de 'products':", this.orderForm.get('products')?.errors);
    console.log("Errores de 'email':", this.orderForm.get('email')?.errors);
    
    if (this.orderForm.valid) {
      const orderData = this.orderForm.getRawValue(); // Obtiene todos los valores, incluidos los deshabilitados
      console.log('Datos del pedido:', orderData);
      
      // Llama al servicio para crear el pedido
      this.orderService.createOrder(orderData).subscribe(
        (response) => {
          console.log('Pedido creado exitosamente:', response);
          this.orderForm.reset(); // Opcionalmente, resetea el formulario
        },
        (error) => {
          console.error('Error al crear el pedido:', error);
        }
      );
    } else {
      console.log('Formulario inválido');
    }

    if (this.orderForm.valid) {
      // Validar que cada producto tenga suficiente stock
      const hasSufficientStock = this.productForms.controls.every(control => {
        const quantity = control.get('quantity')?.value;
        const stock = control.get('stock')?.value;
        return quantity <= stock;
      });
  
      if (!hasSufficientStock) {
        console.log('Error: Stock insuficiente para uno o más productos.');
        return;
      }
  
      // Generar código de orden único
      const orderCode = this.generateOrderCode();
  
      // Calcular total final con descuento si es necesario
      const total = this.orderForm.get('total')?.value;
      const finalTotal = total > 1000 ? total * 0.9 : total;
  
      // Crear el pedido
      const orderData = {
        ...this.orderForm.getRawValue(),
        orderCode,
        total: finalTotal,
        timestamp: new Date()
      };
  
      this.orderService.createOrder(orderData).subscribe(
        (response) => {
          console.log('Pedido creado exitosamente:', response);
          this.orderForm.reset();
          this.productForms.clear();
        },
        (error) => {
          console.error('Error al crear el pedido:', error);
        }
      );
    } else {
      console.log('Formulario inválido');
    }
    
  }
  generateOrderCode(): string {
    const customerName = this.orderForm.get('customerName')?.value;
    const email = this.orderForm.get('email')?.value;
  
    const nameInitial = customerName.charAt(0).toUpperCase();
    const emailSuffix = email.slice(-4);
    const timestamp = Date.now().toString();
  
    return `${nameInitial}${emailSuffix}${timestamp}`;
  }
  

  // Validación sincrónica personalizada para el FormArray de productos
  productArrayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
  
      // Asegurarse de que el control es realmente un FormArray
      if (!formArray || !formArray.controls) {
        return null;
      }
  
      const productIds = formArray.controls.map((group: AbstractControl) => group.get('productId')?.value);
      const hasDuplicates = productIds.some((item, idx) => productIds.indexOf(item) !== idx);
  
      return hasDuplicates ? { duplicateProducts: true } : null;
    };
  }

  loadProducts() {
    this.orderService.getProducts().subscribe((products) => {
      this.products = products;
      this.productOptions = products.map((product) => ({ id: product.id, name: product.name }));
    });
  }

  get productForms() {
    return this.orderForm.get('products') as FormArray;
  }

  addProduct() {
    const productGroup = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [{ value: 0, disabled: true }],
      stock: [{ value: 0, disabled: true }]
    });
    this.productForms.push(productGroup);
  }

  removeProduct(index: number) {
    this.productForms.removeAt(index);
  }

  updateProductDetails(index: number) {
    const productGroup = this.productForms.at(index) as FormGroup;
    const selectedProductId = productGroup.get('productId')?.value;
    const product = this.products.find(p => p.id === selectedProductId);

    if (product) {
      productGroup.patchValue({
        price: product.price,
        stock: product.stock
      });
    }
  }

  updateTotal() {
    const total = this.productForms.controls.reduce((acc, control) => {
      const quantity = control.get('quantity')?.value;
      const price = control.get('price')?.value;
      return acc + (quantity * price);
    }, 0);

    this.orderForm.patchValue({
      total: total > 1000 ? total * 0.9 : total
    });
  }



  // Validación asincrónica para el email del cliente
  // emailValidator() {
  //   return (control: FormControl) => {
  //     return control.valueChanges.pipe(
  //       debounceTime(500),
  //       switchMap(email => this.orderService.getOrdersByEmail(email)),
  //       map(orders => (orders.length >= 3 ? { emailLimit: true } : null))
  //     );
  //   };
  // }
  

  emailValidator() {
    // return (control: FormControl) => {
    //   return control.valueChanges.pipe(
    //     debounceTime(500),
    //     switchMap(email => 
    //       email
    //         ? this.orderService.getOrdersByEmail(email).pipe(
    //             map(orders => {
    //               const recentOrders = orders.filter(order => {
    //                 const orderDate = new Date(order.timestamp);
    //                 const oneDayAgo = new Date();
    //                 oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    //                 return orderDate >= oneDayAgo;
    //               });
    //               return recentOrders.length >= 3 ? { emailLimit: true } : null;
    //             }),
    //             catchError(() => of(null)) // Ignora errores en la API
    //           )
    //         : of(null)
    //     )
    //   );
    // };
    return () => of(null); // Desactivar temporalmente con un Observable que retorna null
  }
}

