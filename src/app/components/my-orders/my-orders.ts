import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

const API = 'https://localhost:7181/api/MyOrders';
const USER_ID = 1; // TODO: replace with the logged-in user's id

export interface ProductInfo {
  name: string;
  image: string;
}

interface OrderLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderFull {
  orderId: number;
  orderDate: string;
  orderStatus: string;
  subTotal: number;
  shippingCharge: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  items: OrderLine[];
}

@Component({
  selector: 'app-my-orders',
  imports: [],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss'
})
export class MyOrders implements OnInit {
  private readonly http = inject(HttpClient);

  /** product id -> name and image (the website already has this list) */
  readonly products = input<Record<string, ProductInfo>>({});

  readonly back = output<void>();
  readonly track = output<number>();

  protected readonly orders = signal<OrderFull[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly openId = signal<number | null>(null);

  protected readonly orderCount = computed(() => this.orders().length);

  ngOnInit(): void {
    this.http.get<OrderFull[]>(`${API}/user/${USER_ID}`).subscribe({
      next: (list) => {
        this.orders.set(list);
        this.loading.set(false);
        if (list.length > 0) this.openId.set(list[0].orderId); // newest order opens first
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 0
            ? 'Cannot reach the server. Please make sure the API is running.'
            : `Could not load your orders (server error ${err.status}).`
        );
      }
    });
  }

  protected toggle(id: number): void {
    this.openId.set(this.openId() === id ? null : id);
  }

  protected nameOf(productId: string): string {
    return this.products()[String(productId)]?.name ?? `Product #${productId}`;
  }

  protected imageOf(productId: string): string {
    return this.products()[String(productId)]?.image ?? '';
  }

  protected itemCount(o: OrderFull): number {
    return o.items.reduce((n, i) => n + i.quantity, 0);
  }

  protected itemsTotal(o: OrderFull): number {
    return o.items.reduce((sum, i) => sum + i.totalPrice, 0);
  }

  protected discount(o: OrderFull): number {
    return Math.max(0, this.itemsTotal(o) - o.subTotal);
  }

  protected methodLabel(m: string): string {
    return m === 'UPI' ? 'UPI' : m === 'Card' ? 'Credit / Debit Card' : m === 'COD' ? 'Cash on Delivery' : m;
  }

  protected when(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  protected money(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }
}