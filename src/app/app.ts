import { Component, HostListener, OnInit, computed, signal } from '@angular/core';
import { ProductService, ProductData } from './services/member';
import { ViewCart, CartItem } from './components/view-cart/view-cart';
import { Address, AddressData } from './components/address/address';
import { PaymentSummary, PaymentData } from './components/payment-summary/payment-summary';
import { PlaceOrder } from './components/place-order/place-order';

@Component({
  selector: 'app-root',
  imports: [ViewCart, Address, PaymentSummary, PlaceOrder],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  // ---------- API data ----------
  private readonly apiBase = 'https://localhost:7181';
  protected readonly data = signal<ProductData[]>([]);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (res: ProductData[]) => this.data.set(res),
      error: (err: any) => console.error('API error', err)
    });
  }

  getImage(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : this.apiBase + path;
  }

  // ---------- UI state ----------
  protected readonly themes = ['Light', 'Tropical', 'Midnight', 'Corporate', 'Glossy'] as const;
  protected readonly activeTheme = signal<(typeof this.themes)[number]>('Tropical');
  protected readonly cartItems = signal<CartItem[]>([]);
  protected readonly selectedAddress = signal<AddressData | null>(null);
  protected readonly appliedCoupon = signal('');
  protected readonly selectedPayment = signal<PaymentData | null>(null);
  protected readonly cartCount = computed(() =>
    this.cartItems().reduce((n, i) => n + i.qty, 0)
  );
  protected readonly isCartOpen = signal(false);
  protected readonly checkoutStep = signal<'cart' | 'address' | 'payment-summary' | 'place-order'>('cart');
  protected readonly wishlistCount = signal(3);
  protected readonly wishlistAdded = signal(false);
  protected readonly isAssistantOpen = signal(false);
  protected readonly isMenuOpen = signal(false);
  protected readonly isProfileOpen = signal(false);
  protected readonly isNotificationsOpen = signal(false);
  protected readonly unreadNotifications = signal(2);
  protected readonly isOrderFormOpen = signal(false);
  protected readonly orderSubmitted = signal(false);
  protected readonly selectedCategory = signal('All products');
  protected readonly productPage = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly toast = signal('');
  protected readonly galleryIndex = signal(0);
  protected readonly quickViewIndex = signal(0);
  protected readonly isQuickViewOpen = signal(false);

  // ---------- Images ----------
  private readonly quickViewImageUrls = [
    'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1525385133512-2f3bde60365c?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=1000&q=85'
  ];
  protected readonly quickViewImages = signal(this.quickViewImageUrls);

  protected readonly galleryImages = [
    'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1525385133512-2f3bde60365c?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1511357840105-7f5c1b0a8a3f?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1536250741665-7b1c7b1f6a2f?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85'
  ];

  // ---------- Products (from API) ----------
  private readonly pageSize = 4;

  protected readonly allFilteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();

    return this.data().filter((p) => {
      const matchesSearch =
        !term || `${p.name} ${p.category} ${p.location}`.toLowerCase().includes(term);
      const matchesCategory =
        category === 'All products' || p.category?.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  });

  protected readonly visibleProducts = computed(() => {
    const products = this.allFilteredProducts();
    const pageCount = Math.max(1, Math.ceil(products.length / this.pageSize));
    const page = Math.min(this.productPage(), pageCount - 1);
    return products.slice(page * this.pageSize, page * this.pageSize + this.pageSize);
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.allFilteredProducts().length / this.pageSize))
  );

  protected readonly currentPage = computed(() =>
    Math.min(this.productPage(), this.pageCount() - 1)
  );

  // ---------- Theme ----------
  protected setTheme(theme: (typeof this.themes)[number]): void {
    this.activeTheme.set(theme);
    localStorage.setItem('oneProduct-theme', theme);
    document.body.dataset['theme'] = theme.toLowerCase();
  }

  // ---------- Cart / checkout ----------
  protected addToCart(product: ProductData): void {
    this.cartItems.update((list) => {
      const existing = list.find((i) => i.id === product.id);
      if (existing) {
        return list.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...list,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: this.getImage(product.image),
          category: product.category,
          location: product.location,
          qty: 1
        }
      ];
    });
    this.openCart(); // go straight to the "Your cart" page
  }
  protected increaseItem(id: CartItem['id']): void {
    this.cartItems.update((list) => list.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  }
  protected decreaseItem(id: CartItem['id']): void {
    this.cartItems.update((list) =>
      list.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    );
  }
  protected removeItem(id: CartItem['id']): void {
    this.cartItems.update((list) => list.filter((i) => i.id !== id));
  }
  protected clearCart(): void { this.cartItems.set([]); this.appliedCoupon.set(''); }
  protected openCart(): void {
    this.checkoutStep.set('cart');
    this.isCartOpen.set(true);
    window.scrollTo({ top: 0 });
  }
  protected closeCart(): void { this.isCartOpen.set(false); }
  protected openAddress(): void { this.checkoutStep.set('address'); }
  protected openPaymentSummary(): void { this.checkoutStep.set('payment-summary'); }
  protected openPlaceOrder(): void { this.checkoutStep.set('place-order'); }
  protected showCartStep(): void { this.checkoutStep.set('cart'); }

  // ---------- Wishlist ----------
  protected toggleWishlist(): void {
    const added = !this.wishlistAdded();
    this.wishlistAdded.set(added);
    this.wishlistCount.update((count) => Math.max(0, count + (added ? 1 : -1)));
    this.toast.set(added ? 'Added to your wishlist' : 'Removed from your wishlist');
    window.setTimeout(() => this.toast.set(''), 2200);
  }

  // ---------- Panels ----------
  protected toggleAssistant(): void { this.isAssistantOpen.update((open) => !open); }
  protected toggleProfile(): void { this.isProfileOpen.update((open) => !open); }
  protected toggleNotifications(): void { this.isNotificationsOpen.update((open) => !open); }
  protected markNotificationsRead(): void { this.unreadNotifications.set(0); }

  // ---------- Order form ----------
  protected openOrderForm(): void {
    this.isOrderFormOpen.set(true);
    this.orderSubmitted.set(false);
    this.isProfileOpen.set(false);
  }
  protected closeOrderForm(): void { this.isOrderFormOpen.set(false); }
  protected submitOrder(): void {
    this.orderSubmitted.set(true);
    this.toast.set('Order request received. We will contact you shortly.');
  }

  // ---------- Category / paging ----------
  protected chooseCategory(category: string): void {
    this.selectedCategory.set(category);
    this.productPage.set(0);
    this.isMenuOpen.set(false);
  }
  protected moveProductPage(direction: number): void {
    const next = this.currentPage() + direction;
    this.productPage.set(Math.min(Math.max(next, 0), this.pageCount() - 1));
  }

  // ---------- Gallery ----------
  protected moveGallery(direction: number): void {
    this.galleryIndex.update(
      (index) => (index + direction + this.galleryImages.length) % this.galleryImages.length
    );
  }

  // ---------- Quick view ----------
  protected openQuickView(): void {
    this.quickViewIndex.set(0);
    this.isQuickViewOpen.set(true);
  }
  protected closeQuickView(): void { this.isQuickViewOpen.set(false); }
  protected moveQuickView(direction: number): void {
    this.quickViewIndex.update(
      (index) => (index + direction + this.quickViewImages().length) % this.quickViewImages().length
    );
  }

  // ---------- Global click handling ----------
  @HostListener('click', ['$event'])
  protected handleShellClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.profile-button')) this.toggleProfile();
    if (target.closest('[aria-label="Notifications"]')) this.toggleNotifications();
    if (target.closest('.hero .button-dark')) this.openOrderForm();
    if (target.closest('.heart')) this.toggleWishlist();
    if (target.closest('.round-arrow')) {
      document.querySelector('.product-card:nth-child(5)')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}