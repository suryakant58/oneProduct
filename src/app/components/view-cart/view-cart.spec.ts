import { Injectable, computed, effect, signal } from '@angular/core';

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  location: string;
  qty: number;
}

const STORAGE_KEY = 'oneProduct-cart';
const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 49;
const COUPON_CODE = 'FRESH15';
const COUPON_PERCENT = 15;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly appliedCoupon = signal('');
  readonly couponMessage = signal('');
  readonly couponValid = signal(false);

  readonly count = computed(() => this._items().reduce((n, i) => n + i.qty, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.qty, 0));
  readonly discount = computed(() =>
    this.appliedCoupon() === COUPON_CODE ? Math.round((this.subtotal() * COUPON_PERCENT) / 100) : 0
  );
  readonly delivery = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE
  );
  readonly total = computed(() => this.subtotal() - this.discount() + this.delivery());
  readonly freeDeliveryRemaining = computed(() => Math.max(0, FREE_DELIVERY_AT - this.subtotal()));
  readonly freeDeliveryProgress = computed(() =>
    Math.min(100, Math.round((this.subtotal() / FREE_DELIVERY_AT) * 100))
  );

  constructor() {
    effect(() => {
      const items = this._items();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* ignore storage errors */
      }
    });
  }

  add(item: Omit<CartItem, 'qty'>): void {
    this._items.update((list) => {
      const existing = list.find((i) => i.id === item.id);
      if (existing) {
        return list.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...list, { ...item, qty: 1 }];
    });
  }

  increase(id: CartItem['id']): void {
    this._items.update((list) => list.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  }

  decrease(id: CartItem['id']): void {
    this._items.update((list) =>
      list.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    );
  }

  remove(id: CartItem['id']): void {
    this._items.update((list) => list.filter((i) => i.id !== id));
  }

  clear(): void {
    this._items.set([]);
    this.appliedCoupon.set('');
    this.couponMessage.set('');
  }

  applyCoupon(code: string): void {
    const value = code.trim().toUpperCase();
    if (!value) {
      this.couponValid.set(false);
      this.couponMessage.set('Enter a coupon code.');
      return;
    }
    if (value === COUPON_CODE) {
      this.appliedCoupon.set(COUPON_CODE);
      this.couponValid.set(true);
      this.couponMessage.set(`${COUPON_CODE} applied – ${COUPON_PERCENT}% off`);
    } else {
      this.appliedCoupon.set('');
      this.couponValid.set(false);
      this.couponMessage.set('Invalid coupon code.');
    }
  }

  removeCoupon(): void {
    this.appliedCoupon.set('');
    this.couponMessage.set('');
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}