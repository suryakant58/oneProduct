import { ChangeDetectorRef, Component, HostListener, OnInit, computed, signal } from '@angular/core';
import { ProductService, ProductData } from './services/member';


@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
    studentImages = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80'
  ];
  data: ProductData[] = [];

  constructor(private productService: ProductService, private cdr: ChangeDetectorRef) {}

private readonly apiBase = 'https://localhost:7181';

getImage(path: string): string {
  if (!path) return '';
  return path.startsWith('http') ? path : this.apiBase + path;
}
  
 ngOnInit() {
  this.productService.getProducts().subscribe({
    next: (res: ProductData[]) => { this.data = res; this.cdr.detectChanges(); },
    error: (err: any) => console.error('API error', err)
  });
}

  protected readonly themes = ['Light', 'Tropical', 'Midnight', 'Corporate', 'Glossy'] as const;
  protected readonly activeTheme = signal<(typeof this.themes)[number]>('Tropical');
  protected readonly cartCount = signal(2);
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
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=1000&q=85'
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
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85'
  ];
  protected readonly featuredProducts = [
    { name: 'Original Coconut Juice', detail: '200ml · 12 pack', price: 249, oldPrice: 299, rating: '4.9', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=720&q=85', tone: 'mint' },
    { name: 'Coconut Water Pure', detail: '400ml · Single bottle', price: 89, oldPrice: 110, rating: '4.8', tag: 'Hydration', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=720&q=85', tone: 'sun' },
    { name: 'Family Fresh Case', detail: '1 Liter · 6 pack', price: 699, oldPrice: 799, rating: '4.9', tag: 'Save 20%', image: 'https://images.unsplash.com/photo-1525385133512-2f3bde60365c?auto=format&fit=crop&w=720&q=85', tone: 'coral' },
    { name: 'Daily Reset', detail: '250ml · 12 pack', price: 319, oldPrice: 360, rating: '4.7', tag: 'New', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=720&q=85', tone: 'lavender' },
    { name: 'Island Mineral', detail: '200ml · Single bottle', price: 39, oldPrice: 49, rating: '4.8', tag: 'Everyday', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=720&q=85', tone: 'mint' },
    { name: 'Sunrise Squeeze', detail: '250ml · 6 pack', price: 179, oldPrice: 210, rating: '4.8', tag: 'Fresh pick', image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=720&q=85', tone: 'sun' },
    { name: 'Coco Calm', detail: '400ml · 12 pack', price: 429, oldPrice: 480, rating: '4.9', tag: 'Best value', image: 'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=720&q=85', tone: 'coral' },
    { name: 'Green Island', detail: '1 Liter · Single bottle', price: 149, oldPrice: 179, rating: '4.7', tag: 'New', image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=720&q=85', tone: 'lavender' }
    , { name: 'Palm Morning', detail: '200ml · 6 pack', price: 139, oldPrice: 169, rating: '4.8', tag: 'Fresh pick', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=720&q=85', tone: 'mint' }
    , { name: 'Coco Balance', detail: '250ml · Single bottle', price: 49, oldPrice: 59, rating: '4.7', tag: 'Everyday', image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=720&q=85', tone: 'sun' }
    , { name: 'Island Reserve', detail: '400ml · 6 pack', price: 269, oldPrice: 310, rating: '4.9', tag: 'Limited', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=720&q=85', tone: 'coral' }
    , { name: 'Coconut Club', detail: '1 Liter · 3 pack', price: 399, oldPrice: 450, rating: '4.8', tag: 'Save 12%', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=720&q=85', tone: 'lavender' }
    , { name: 'Morning Dew', detail: '200ml · 12 pack', price: 259, oldPrice: 300, rating: '4.9', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=720&q=85', tone: 'mint' }
    , { name: 'Coco Breeze', detail: '250ml · 6 pack', price: 189, oldPrice: 220, rating: '4.8', tag: 'New', image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=720&q=85', tone: 'sun' }
    , { name: 'Pure Tropic', detail: '400ml · Single bottle', price: 99, oldPrice: 119, rating: '4.7', tag: 'Hydration', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=720&q=85', tone: 'coral' }
    , { name: 'Harvest Case', detail: '1 Liter · 6 pack', price: 729, oldPrice: 820, rating: '4.9', tag: 'Best value', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=720&q=85', tone: 'lavender' }
  ];
  protected readonly allFilteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.featuredProducts.filter((product) => !term || `${product.name} ${product.detail}`.toLowerCase().includes(term));
  });
  protected readonly filteredProducts = computed(() => {
    const products = this.allFilteredProducts();
    const pageSize = 8;
    const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
    const page = Math.min(this.productPage(), pageCount - 1);
    return products.slice(page * pageSize, page * pageSize + pageSize);
  });

getProduct(i: number) {
  const list = this.filteredProducts();
  return list.length ? list[i % list.length] : null;
}

  protected setTheme(theme: (typeof this.themes)[number]): void {
    this.activeTheme.set(theme);
    localStorage.setItem('oneProduct-theme', theme);
    document.body.dataset['theme'] = theme.toLowerCase();
  }

  protected addToCart(productName: string): void {
    this.cartCount.update((count) => count + 1);
    this.toast.set(`${productName} added to your bag`);
    window.setTimeout(() => this.toast.set(''), 2600);
  }
  protected toggleWishlist(): void {
    const added = !this.wishlistAdded();
    this.wishlistAdded.set(added);
    this.wishlistCount.update((count) => Math.max(0, count + (added ? 1 : -1)));
    this.toast.set(added ? 'Added to your wishlist' : 'Removed from your wishlist');
    window.setTimeout(() => this.toast.set(''), 2200);
  }

  protected toggleAssistant(): void { this.isAssistantOpen.update((open) => !open); }
  protected toggleProfile(): void { this.isProfileOpen.update((open) => !open); }
  protected toggleNotifications(): void { this.isNotificationsOpen.update((open) => !open); }
  protected markNotificationsRead(): void { this.unreadNotifications.set(0); }
  protected openOrderForm(): void { this.isOrderFormOpen.set(true); this.orderSubmitted.set(false); this.isProfileOpen.set(false); }
  protected closeOrderForm(): void { this.isOrderFormOpen.set(false); }
  protected submitOrder(): void { this.orderSubmitted.set(true); this.toast.set('Order request received. We will contact you shortly.'); }
  protected chooseCategory(category: string): void { this.selectedCategory.set(category); this.isMenuOpen.set(false); }
  protected moveGallery(direction: number): void {
    this.galleryIndex.update((index) => (index + direction + this.galleryImages.length) % this.galleryImages.length);
  }
  protected openQuickView(): void { this.quickViewIndex.set(0); this.isQuickViewOpen.set(true); }
  protected closeQuickView(): void { this.isQuickViewOpen.set(false); }
protected moveQuickView(direction: number): void {
  this.quickViewIndex.update(
    (index) => (index + direction + this.quickViewImages().length) % this.quickViewImages().length
  );
}
  protected moveProductPage(direction: number): void {
    const pageCount = Math.max(1, Math.ceil(this.allFilteredProducts().length / 8));
    this.productPage.update((page) => (page + direction + pageCount) % pageCount);
  }

  @HostListener('click', ['$event'])
  protected handleShellClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.profile-button')) this.toggleProfile();
    if (target.closest('[aria-label="Notifications"]')) this.toggleNotifications();
    if (target.closest('.hero .button-dark')) this.openOrderForm();
    if (target.closest('.quick-view')) this.openQuickView();
    if (target.closest('.heart')) this.toggleWishlist();
    if (target.closest('.round-arrow')) document.querySelector('.product-card:nth-child(5)')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const productGrid = target.closest('.product-grid');
    const lastProductCard = target.closest('.product-card:last-child');
    if (productGrid) {
      const bounds = productGrid.getBoundingClientRect();
      const cardBounds = lastProductCard?.getBoundingClientRect();
      if (event instanceof MouseEvent && ((cardBounds && event.clientX > cardBounds.right - 70) || (!lastProductCard && event.clientX > bounds.right - 80))) this.moveProductPage(1);
      if (event instanceof MouseEvent && !lastProductCard && event.clientX < bounds.left + 80) this.moveProductPage(-1);
    }
  }
}


