import { Component, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartItem } from '../view-cart/view-cart';
import { AddressData } from '../address/address';
import { PaymentData } from '../payment-summary/payment-summary';

const API = 'https://localhost:7181/api/Order';
const USER_ID = 1; // TODO: replace with the logged-in user's id
const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 49;
const COD_FEE = 20;
const COUPONS: Record<string, number> = { FRESH15: 15, COCOFEST20: 20 }; // code -> % off

@Component({
  selector: 'app-place-order',
  imports: [],
  templateUrl: './place-order.html',
  styleUrl: './place-order.scss'
})
export class PlaceOrder {
  private readonly http = inject(HttpClient);

  readonly items = input<CartItem[]>([]);
  readonly coupon = input('');
  readonly address = input<AddressData | null>(null);
  readonly payment = input<PaymentData | null>(null);

  readonly previous = output<void>();
  readonly changeAddress = output<void>();
  readonly finished = output<void>();
  readonly trackOrder = output<string>();

  protected readonly steps = ['Cart', 'Address', 'Payment', 'Place order'];
  protected readonly placing = signal(false);
  protected readonly placed = signal(false);
  protected readonly orderNumber = signal('');
  protected readonly offline = signal(false);
  protected readonly error = signal('');

  // Snapshot of what was ordered, so the success screen still shows it
  protected readonly receipt = signal<{ total: number; method: string; detail?: string } | null>(null);

  // ---------- Totals ----------
  protected readonly itemCount = computed(() => this.items().reduce((n, i) => n + i.qty, 0));
  protected readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.qty, 0)
  );
  protected readonly discount = computed(() =>
    Math.round((this.subtotal() * (COUPONS[this.coupon()] ?? 0)) / 100)
  );
  protected readonly delivery = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE
  );
  protected readonly codFee = computed(() => (this.payment()?.paymentMethod === 'COD' ? COD_FEE : 0));
  protected readonly total = computed(
    () => this.subtotal() - this.discount() + this.delivery() + this.codFee()
  );

  protected readonly canPlace = computed(
    () => this.items().length > 0 && !!this.address() && !!this.payment() && !this.placing()
  );

  protected money(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  protected methodLabel(m: string | undefined): string {
    return m === 'UPI' ? 'UPI' : m === 'Card' ? 'Credit / Debit Card' : 'Cash on Delivery';
  }

  protected placeOrder(): void {
    const address = this.address();
    const payment = this.payment();
    if (!this.canPlace() || !address || !payment) return;

    this.placing.set(true);
    this.error.set('');

    // Matches your Orders / OrderItems / Payment tables
    const body = {
      userId: USER_ID,
      addressId: address.addressId,
      subTotal: this.subtotal() - this.discount(),
      shippingCharge: this.delivery() + this.codFee(),
      taxAmount: 0,
      totalAmount: this.total(),
      items: this.items().map((i) => ({ productId: i.id, quantity: i.qty, unitPrice: i.price })),
      paymentMethod: payment.paymentMethod,
      transactionId: null
    };

    const receipt = { total: this.total(), method: payment.paymentMethod, detail: payment.detail };

    this.http.post<{ orderId: number }>(API, body).subscribe({
      next: (res) => this.success(String(res.orderId), receipt),
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          // Server cannot be reached at all -> demo mode so the flow can still be tested
          this.offline.set(true);
          this.success('CR' + Date.now().toString().slice(-8), receipt);
        } else {
          // Server answered with an error (400/404/500): the order was NOT saved
          this.placing.set(false);
          this.error.set(
            `The order could not be saved (server error ${err.status}). ` +
            `Please check the API output window and try again.`
          );
        }
      }
    });
  }

  private success(orderNumber: string, receipt: { total: number; method: string; detail?: string }): void {
    this.orderNumber.set(orderNumber);
    this.receipt.set(receipt);
    this.placed.set(true);
    this.placing.set(false);
    window.scrollTo({ top: 0 });
  }
}