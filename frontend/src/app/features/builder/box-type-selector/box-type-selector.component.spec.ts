import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BoxTypeSelectorComponent } from './box-type-selector.component';

describe('BoxTypeSelectorComponent', () => {
  let component: BoxTypeSelectorComponent;
  let fixture: ComponentFixture<BoxTypeSelectorComponent>;
  let httpMock: HttpTestingController;

  const mockBoxTypes = [
    { id: '1', name: 'For Him', slug: 'for-him', gender: 'male', base_price: 200, image_url: '/img/him.jpg' },
    { id: '2', name: 'For Her', slug: 'for-her', gender: 'female', base_price: 250, image_url: '/img/her.jpg' },
    { id: '3', name: 'Couple', slug: 'couple', gender: 'couple', base_price: 350, image_url: '/img/couple.jpg' },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BoxTypeSelectorComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BoxTypeSelectorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.match(() => true);
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with loading true', () => {
    expect(component.loading()).toBe(true);
  });

  it('should start with empty box types', () => {
    expect(component.boxTypes().length).toBe(0);
  });

  it('should fetch box types on init and set loading to false', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/api/builder/box-types'));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockBoxTypes });

    expect(component.boxTypes().length).toBe(3);
    expect(component.loading()).toBe(false);
  });

  it('should render box type cards after loading', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/api/builder/box-types'));
    req.flush({ success: true, data: mockBoxTypes });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('should display box type name and price', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/api/builder/box-types'));
    req.flush({ success: true, data: mockBoxTypes });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('For Him');
    expect(compiled.textContent).toContain('For Her');
    expect(compiled.textContent).toContain('Couple');
  });

  it('should handle error gracefully and stop loading', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.includes('/api/builder/box-types'));
    req.error(new ProgressEvent('error'));

    expect(component.loading()).toBe(false);
    expect(component.boxTypes().length).toBe(0);
  });
});
