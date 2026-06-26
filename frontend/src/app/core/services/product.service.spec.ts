import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { API_BASE_URL } from '../tokens/api-base-url.token';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://soulmate.runasp.net' },
      ],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch products with default params', () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', name: 'P1', slug: 'p1', description: 'd', price: 100, image_url: 'u', gender: 'male', category: 'watch', is_active: true, is_standalone: true, is_builder_item: true, gallery_json: null, created_at: '', updated_at: '' },
          { id: '2', name: 'P2', slug: 'p2', description: 'd', price: 200, image_url: 'u', gender: 'female', category: 'wallet', is_active: true, is_standalone: true, is_builder_item: true, gallery_json: null, created_at: '', updated_at: '' },
        ],
        meta: { page: 1, limit: 10, total: 2, total_pages: 1 },
      };

      service.getAll().subscribe((res) => {
        expect(res.data.length).toBe(2);
        expect(res.meta.total).toBe(2);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
      expect(req.request.method).toBe('GET');
      expect(req.request.urlWithParams).toBe('https://soulmate.runasp.net/api/products');
      req.flush(mockResponse);
    });

    it('should request the production products endpoint with pagination', () => {
      service.getAll({ page: 1, limit: 4 }).subscribe();

      const req = httpMock.expectOne('https://soulmate.runasp.net/api/products?page=1&limit=4');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: [], meta: { page: 1, limit: 4, total: 0, total_pages: 0 } });
    });

    it('should pass query params when provided', () => {
      service.getAll({ page: 2, limit: 5, gender: 'male', sort: 'price', order: 'desc' }).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('5');
      expect(req.request.params.get('gender')).toBe('male');
      expect(req.request.params.get('sort')).toBe('price');
      expect(req.request.params.get('order')).toBe('desc');
      req.flush({ success: true, data: [], meta: { page: 2, limit: 5, total: 0, total_pages: 0 } });
    });

    it('should pass search param', () => {
      service.getAll({ search: 'perfume' }).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
      expect(req.request.params.get('search')).toBe('perfume');
      req.flush({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, total_pages: 0 } });
    });
  });

  describe('getBySlug', () => {
    it('should fetch single product by slug', () => {
      const mockProduct = {
        id: '1', name: 'Test Perfume', slug: 'test-perfume', description: 'Nice',
        price: 300, image_url: 'url', gender: 'male', category: 'watch', is_builder_item: true,
        is_active: true, is_standalone: true, gallery_json: null, created_at: '', updated_at: '',
      };

      service.getBySlug('test-perfume').subscribe((product) => {
        expect(product.name).toBe('Test Perfume');
        expect(product.price).toBe(300);
      });

      const req = httpMock.expectOne((r) => r.url.includes('/api/products/test-perfume'));
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockProduct });
    });
  });
});
