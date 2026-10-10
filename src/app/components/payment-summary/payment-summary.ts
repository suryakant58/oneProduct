import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartItem } from '../view-cart/view-cart';
import { AddressData } from '../address/address';

export type PaymentMethod = 'UPI' | 'Card' | 'COD';

// Matches your SQL "Payment" table (PaymentMethod, Amount)
export interface PaymentData {
  paymentMethod: PaymentMethod;
  amount: number;
  detail?: string; // e.g. UPI id or "Card ending 4242" (never store full card details)
}

const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 49;
const COD_FEE = 20;
const COUPONS: Record<string, number> = { FRESH15: 15, COCOFEST20: 20 }; // code -> % off

@Component({
  selector: 'app-payment-summary',
  imports: [ReactiveFormsModule],
  templateUrl: './payment-summary.html',
  styleUrl: './payment-summary.scss'
})
export class PaymentSummary {
  private readonly fb = inject(FormBuilder);

  readonly items = input<CartItem[]>([]);
  readonly coupon = input('');
  readonly address = input<AddressData | null>(null);

  readonly previous = output<void>();
  readonly next = output<void>();
  readonly paymentSelected = output<PaymentData>();

  protected readonly method = signal<PaymentMethod>('UPI');
  protected readonly methods: { id: PaymentMethod; title: string; sub: string; icon: string }[] = [
    { id: 'UPI', title: 'UPI', sub: 'Pay by any UPI app', icon: '📱' },
    { id: 'Card', title: 'Credit / Debit / ATM Card', sub: 'Add and secure cards as per RBI guidelines', icon: '💳' },
    { id: 'COD', title: 'Cash on Delivery', sub: `Handling fee ₹${COD_FEE} applies`, icon: '💵' }
  ];

  // ---------- Price details ----------
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
  protected readonly codFee = computed(() => (this.method() === 'COD' ? COD_FEE : 0));
  protected readonly total = computed(
    () => this.subtotal() - this.discount() + this.delivery() + this.codFee()
  );

  // ---------- Forms ----------
  protected readonly upiForm = this.fb.nonNullable.group({
    upiId: ['', [Validators.required, Validators.pattern(/^[\w.\-]{2,}@[a-zA-Z]{2,}$/)]]
  });

  protected readonly cardForm = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
  });

  protected money(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  protected choose(m: PaymentMethod): void {
    this.method.set(m);
  }

  protected showError(form: 'upi' | 'card', name: string): boolean {
    const c = form === 'upi' ? this.upiForm.get(name) : this.cardForm.get(name);
    return !!c && c.touched && c.invalid;
  }

  // Auto-format card number as 1234 5678 9012 3456
  protected formatCard(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
    this.cardForm.controls.number.setValue(digits.replace(/(\d{4})(?=\d)/g, '$1 '));
  }

  // Auto-format expiry as MM/YY
  protected formatExpiry(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
    this.cardForm.controls.expiry.setValue(
      digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits
    );
  }

  protected pay(): void {
    const m = this.method();
    let detail: string | undefined;

    if (m === 'UPI') {
      if (this.upiForm.invalid) {
        this.upiForm.markAllAsTouched();
        return;
      }
      detail = this.upiForm.getRawValue().upiId;
    } else if (m === 'Card') {
      if (this.cardForm.invalid) {
        this.cardForm.markAllAsTouched();
        return;
      }
      detail = 'Card ending ' + this.cardForm.getRawValue().number.slice(-4);
    }

    this.paymentSelected.emit({ paymentMethod: m, amount: this.total(), detail });
    this.next.emit();
  }
}