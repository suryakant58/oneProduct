import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

const API = 'https://localhost:7181/api/Order';
const USER_ID = 1; // TODO: replace with the logged-in user's id

// The steps, in order. The text must match the status names used by the API.
export const ORDER_STEPS = [
  { status: 'Order Placed', text: "We've received your order." },
  { status: 'Payment Confirmed', text: 'Your payment has been confirmed.' },
  { status: 'Order Confirmed', text: 'The seller has confirmed your order.' },
  { status: 'Processing', text: 'Your order is being prepared.' },
  { status: 'Packed', text: 'Your items are packed.' },
  { status: 'Ready to Ship', text: 'Waiting for the delivery partner.' },
  { status: 'Picked Up', text: 'The delivery partner picked up your package.' },
  { status: 'In Transit', text: 'Your package is on its way.' },
  { status: 'Out for Delivery', text: 'Your package will arrive today.' },
  { status: 'Delivered', text: 'Delivered. Enjoy!' }
];

interface OrderSummary {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
}

interface HistoryItem {
  status: string;
  note: string | null;
  createdDate: string;
}

interface Tracking extends OrderSummary {
  history: HistoryItem[];
}

@Component({
  selector: 'app-order-tracking',
  imports: [],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss'
})
export class OrderTracking implements OnInit {
  private readonly http = inject(HttpClient);

  /** Open this order first (e.g. the one that was just placed) */
  readonly orderId = input<number | null>(null);
  readonly back = output<void>();

  protected readonly steps = ORDER_STEPS;
  protected readonly orders = signal<OrderSummary[]>([]);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly tracking = signal<Tracking | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly currentIndex = computed(() => {
    const t = this.tracking();
    return t ? this.steps.findIndex((s) => s.status === t.orderStatus) : -1;
  });

  protected readonly progress = computed(() => {
    const i = this.currentIndex();
    return i < 0 ? 0 : Math.round(((i + 1) / this.steps.length) * 100);
  });

  // status name -> date it happened
  protected readonly dates = computed(() => {
    const map: Record<string, string> = {};
    for (const h of this.tracking()?.history ?? []) map[h.status] = h.createdDate;
    return map;
  });

  ngOnInit(): void {
    this.http.get<OrderSummary[]>(`${API}/user/${USER_ID}`).subscribe({
      next: (list) => {
        this.orders.set(list);
        if (list.length === 0) {
          this.loading.set(false);
          return;
        }
        const wanted = this.orderId();
        const first = list.find((o) => o.orderId === wanted) ?? list[0];
        this.select(first.orderId);
      },
      error: (err: HttpErrorResponse) => this.fail(err)
    });
  }

  protected select(id: number): void {
    this.selectedId.set(id);
    this.loading.set(true);
    this.error.set('');

    this.http.get<Tracking>(`${API}/${id}/tracking`, { params: { userId: USER_ID } }).subscribe({
      next: (t) => {
        this.tracking.set(t);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => this.fail(err)
    });
  }

  protected onPick(event: Event): void {
    this.select(Number((event.target as HTMLSelectElement).value));
  }

  protected refresh(): void {
    const id = this.selectedId();
    if (id !== null) this.select(id);
  }

  protected stateOf(index: number): 'done' | 'current' | 'todo' {
    const c = this.currentIndex();
    if (index < c) return 'done';
    if (index === c) return this.steps[index].status === 'Delivered' ? 'done' : 'current';
    return 'todo';
  }

  protected dateOf(status: string): string | undefined {
    return this.dates()[status];
  }

  protected when(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  protected money(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  private fail(err: HttpErrorResponse): void {
    this.loading.set(false);
    this.error.set(
      err.status === 0
        ? 'Cannot reach the server. Please make sure the API is running.'
        : `Could not load your orders (server error ${err.status}).`
    );
  }
}