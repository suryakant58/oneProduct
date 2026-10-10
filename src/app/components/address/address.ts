import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  email?: string | null;
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
  protected readonly deletingId = signal<number | null>(null);
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
    email: ['', [Validators.required, Validators.email]],
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
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          // Server cannot be reached -> use addresses saved on this device
          this.offline.set(true);
          this.showList(this.readLocal());
        } else {
          this.error.set(`Could not load addresses (server error ${err.status}).`);
          this.showList([]);
        }
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
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          // Server cannot be reached -> keep the address on this device
          this.offline.set(true);
          this.afterSave({ ...body, addressId: Date.now() });
          this.writeLocal(this.addresses());
        } else {
          this.saving.set(false);
          this.error.set(`The address could not be saved (server error ${err.status}).`);
        }
      }
    });
  }

  protected deleteAddress(a: AddressData, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const id = a.addressId;
    if (id == null) return;
    if (!window.confirm(`Delete the address for ${a.fullName} (${a.addressLine1})?`)) return;

    this.deletingId.set(id);
    this.error.set('');

    this.http.delete(`${API}/${id}`, { params: { userId: USER_ID } }).subscribe({
      next: () => this.afterDelete(id),
      error: (err: HttpErrorResponse) => {
        this.deletingId.set(null);
        if (err.status === 0) {
          // Server cannot be reached -> remove it from this device only
          this.afterDelete(id);
          this.writeLocal(this.addresses());
        } else {
          this.error.set(`The address could not be deleted (server error ${err.status}).`);
        }
      }
    });
  }

  private afterDelete(id: number): void {
    const remaining = this.addresses().filter((a) => a.addressId !== id);
    this.addresses.set(remaining);

    if (this.selectedId() === id) {
      const next = remaining.find((a) => a.isDefault) ?? remaining[0];
      this.selectedId.set(next?.addressId ?? null);
    }
    if (remaining.length === 0) this.showForm.set(true);
    this.deletingId.set(null);
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