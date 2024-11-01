export interface Order {
    id?: string;
    customerName: string;
    email: string;
    products: Array<{
      productId: number;
      quantity: number;
      price: number;
      stock: number;
    }>;
    total: number;
    orderCode: string;
    timestamp: Date;
  }
  