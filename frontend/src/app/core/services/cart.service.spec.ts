import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService, CartItem } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CartService);
  });

  const mockItem = (overrides: Partial<CartItem> = {}): CartItem => ({
    id: '1',
    type: 'standalone',
    name: 'Test Product',
    image_url: 'url',
    unit_price: 100,
    quantity: 1,
    product_id: 'prod-1',
    custom_data_json: '{}',
    ...overrides,
  });

  it('should start with empty cart', () => {
    expect(service.items().length).toBe(0);
    expect(service.totalPrice()).toBe(0);
    expect(service.totalItems()).toBe(0);
  });

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      service.addItem(mockItem());

      expect(service.items().length).toBe(1);
      expect(service.items()[0].name).toBe('Test Product');
    });

    it('should increment quantity for existing item', () => {
      service.addItem(mockItem({ quantity: 1 }));
      service.addItem(mockItem({ quantity: 2 }));

      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(3);
    });

    it('should add different items separately', () => {
      service.addItem(mockItem({ id: '1', name: 'Product A' }));
      service.addItem(mockItem({ id: '2', name: 'Product B' }));

      expect(service.items().length).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item by id', () => {
      service.addItem(mockItem({ id: '1' }));
      service.addItem(mockItem({ id: '2', name: 'Other' }));

      service.removeItem('1');

      expect(service.items().length).toBe(1);
      expect(service.items()[0].id).toBe('2');
    });

    it('should handle removing non-existent item', () => {
      service.addItem(mockItem({ id: '1' }));
      service.removeItem('999');

      expect(service.items().length).toBe(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity for existing item', () => {
      service.addItem(mockItem({ id: '1', quantity: 1 }));

      service.updateQuantity('1', 5);

      expect(service.items()[0].quantity).toBe(5);
    });

    it('should not update quantity to less than 1', () => {
      service.addItem(mockItem({ id: '1', quantity: 3 }));

      service.updateQuantity('1', 0);

      expect(service.items()[0].quantity).toBe(3);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      service.addItem(mockItem({ id: '1' }));
      service.addItem(mockItem({ id: '2' }));

      service.clear();

      expect(service.items().length).toBe(0);
      expect(service.totalPrice()).toBe(0);
    });
  });

  describe('computed totals', () => {
    it('should calculate total price correctly', () => {
      service.addItem(mockItem({ id: '1', unit_price: 100, quantity: 2 }));
      service.addItem(mockItem({ id: '2', unit_price: 50, quantity: 3 }));

      expect(service.totalPrice()).toBe(350); // 100*2 + 50*3
    });

    it('should calculate total items correctly', () => {
      service.addItem(mockItem({ id: '1', quantity: 2 }));
      service.addItem(mockItem({ id: '2', quantity: 3 }));

      expect(service.totalItems()).toBe(5);
    });
  });
});
