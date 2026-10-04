import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartItem } from '../view-cart/view-cart';

// Matches your SQL "Address" table
export interface AddressData {
  addressId?: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

const API = 'https://localhost:7181/api/Address';
const USER_ID = 1; // TODO: replace with the logged-in user's id
const LOCAL_KEY = 'oneProduct-addresses';
const FREE_DELIVERY_AT = 499;
const DELIVERY_FEE = 49;

@Component({
  selector: 'app-address',
  imports: [ReactiveFormsModule],
  templateUrl: './address.html',
  styleUrl: './address.scss'
})
export class Address implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  // Cart items from App (for the order summary on the right)
  readonly items = input<CartItem[]>([]);

  readonly previous = output<void>();
  readonly next = output<void>();
  readonly addressSelected = output<AddressData>();

  protected readonly steps = ['Cart', 'Address', 'Payment', 'Place order'];
  protected readonly states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
    'Puducherry'
  ];

  protected readonly addresses = signal<AddressData[]>([]);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly showForm = signal(false);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  /** true when the API is not reachable and addresses are kept on this device only */
  protected readonly offline = signal(false);

  // ---------- Order summary ----------
  protected readonly subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.qty, 0)
  );
  protected readonly delivery = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE
  );
  protected readonly total = computed(() => this.subtotal() + this.delivery());

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    addressLine1: ['', [Validators.required, Validators.maxLength(200)]],
    addressLine2: ['', [Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['', Validators.required],
    country: ['India', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    isDefault: [false]
  });

  ngOnInit(): void {
    this.http.get<AddressData[]>(`${API}/user/${USER_ID}`).subscribe({
      next: (list) => this.showList(list),
      error: () => {
        // API not available yet -> fall back to addresses saved on this device
        this.offline.set(true);
        this.showList(this.readLocal());
      }
    });
  }

  protected money(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  protected invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  protected saveAddress(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body: AddressData = {
      userId: USER_ID,
      ...v,
      addressLine2: v.addressLine2.trim() || null
    };

    this.saving.set(true);
    this.error.set('');

    this.http.post<AddressData>(API, body).subscribe({
      next: (saved) => this.afterSave(saved),
      error: () => {
        // API not available -> keep the address on this device so the UI still works
        this.offline.set(true);
        this.afterSave({ ...body, addressId: Date.now() });
        this.writeLocal(this.addresses());
      }
    });
  }

  protected cancelForm(): void {
    this.form.reset({ country: 'India', isDefault: false });
    this.showForm.set(false);
    this.error.set('');
  }

  protected proceed(): void {
    const selected = this.addresses().find((a) => a.addressId === this.selectedId());
    if (!selected) {
      this.error.set('Please select or add a delivery address.');
      return;
    }
    this.addressSelected.emit(selected);
    this.next.emit();
  }

  // ---------- helpers ----------
  private showList(list: AddressData[]): void {
    this.addresses.set(list);
    const chosen = list.find((a) => a.isDefault) ?? list[0];
    this.selectedId.set(chosen?.addressId ?? null);
    this.showForm.set(list.length === 0);
    this.loading.set(false);
  }

  private afterSave(saved: AddressData): void {
    this.addresses.update((list) =>
      saved.isDefault
        ? [...list.map((a) => ({ ...a, isDefault: false })), saved]
        : [...list, saved]
    );
    this.selectedId.set(saved.addressId ?? null);
    this.showForm.set(false);
    this.form.reset({ country: 'India', isDefault: false });
    this.saving.set(false);
  }

  private readLocal(): AddressData[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as AddressData[];
    } catch {
      return [];
    }
  }

  private writeLocal(list: AddressData[]): void {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
}