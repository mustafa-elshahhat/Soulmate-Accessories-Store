import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../core/models/product.model';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Perfume',
    name_en: 'Test Perfume',
    slug: 'test-perfume',
    description: 'A nice perfume for testing',
    description_en: 'A nice perfume for testing',
    price: 250,
    image_url: '/images/perfume.jpg',
    gallery_json: null,
    category: 'watch',
    gender: 'male',
    is_active: true,
    is_standalone: true,
    is_builder_item: false,
    is_customizable: false,
    stock_quantity: 10,
    original_price: null,
    final_price: null,
    discount_percentage: null,
    customization_price: 0,
    average_rating: 0,
    review_count: 0,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Perfume');
  });

  it('should display product description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('A nice perfume for testing');
  });

  it('should display product price with currency', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('EGP');
  });

  it('should render product image with correct src', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/images/perfume.jpg');
    expect(img?.getAttribute('alt')).toBe('Test Perfume');
  });

  it('should have a router link to product detail', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('/products/test-perfume');
  });

  it('should have lazy loading on image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });
});
