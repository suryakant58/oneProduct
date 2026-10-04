import { Component, computed, input, output, signal } from '@angular/core';

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  location: string;
  qty: number;
}

const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 49;
const COUPON_CODE = 'FRESH15';
const COUPON_PERCENT = 15;

@Component({
  selector: 'app-view-cart',
  imports: [],
  templateUrl: './view-cart.html',
  styleUrl: './view-cart.scss'
})
export class ViewCart {
  // ---------- Inputs / outputs (App owns the cart data) ----------
  readonly items = input<CartItem[]>([]);

  readonly previous = output<void>();
  readonly next = output<void>();
  readonly qtyUp = output<CartItem['id']>();
  readonly qtyDown = output<CartItem['id']>();
  readonly removeItem = output<CartItem['id']>();
  readonly clearCart = output<void>();

  // ---------- Local UI state ----------
  protected readonly steps = ['Cart', 'Address', 'Payment', 'Place order'];
  protected readonly couponInput = signal('');
  readonly coupon = input('');
  readonly couponChange = output<string>();
  protected readonly appliedCoupon = computed(() => this.coupon());
  protected readonly couponMessage = signal('');
  protected readonly couponValid = signal(false);

  // ---------- Totals ----------
  protected readonly count = computed(() => this.items().reduce((n, i) => n + i.qty, 0));
  protected readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.qty, 0)
  );
  protected readonly discount = computed(() =>
    this.appliedCoupon() === COUPON_CODE
      ? Math.round((this.subtotal() * COUPON_PERCENT) / 100)
      : 0
  );
  protected readonly delivery = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE
  );
  protected readonly total = computed(() => this.subtotal() - this.discount() + this.delivery());
  protected readonly freeDeliveryRemaining = computed(() =>
    Math.max(0, FREE_DELIVERY_AT - this.subtotal())
  );
  protected readonly freeDeliveryProgress = computed(() =>
    Math.min(100, Math.round((this.subtotal() / FREE_DELIVERY_AT) * 100))
  );

  // ---------- Helpers ----------
  protected money(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  protected applyCoupon(): void {
    const value = this.couponInput().trim().toUpperCase();
    if (!value) {
      this.couponValid.set(false);
      this.couponMessage.set('Enter a coupon code.');
    } else if (value === COUPON_CODE) {
      this.couponChange.emit(COUPON_CODE);
      this.couponValid.set(true);
      this.couponMessage.set(`${COUPON_CODE} applied – ${COUPON_PERCENT}% off`);
    } else {
      this.couponChange.emit('');
      this.couponValid.set(false);
      this.couponMessage.set('Invalid coupon code.');
    }
  }
}