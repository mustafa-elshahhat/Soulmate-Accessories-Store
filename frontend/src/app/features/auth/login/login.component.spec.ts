import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.match(() => true);
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with email and password controls', () => {
    expect(component.form.contains('email')).toBe(true);
    expect(component.form.contains('password')).toBe(true);
  });

  it('should require email', () => {
    component.form.get('email')?.setValue('');
    expect(component.form.get('email')?.valid).toBe(false);
  });

  it('should validate email format', () => {
    component.form.get('email')?.setValue('notanemail');
    expect(component.form.get('email')?.hasError('email')).toBe(true);
  });

  it('should accept valid email', () => {
    component.form.get('email')?.setValue('test@example.com');
    expect(component.form.get('email')?.valid).toBe(true);
  });

  it('should require password', () => {
    component.form.get('password')?.setValue('');
    expect(component.form.get('password')?.valid).toBe(false);
  });

  it('should start with loading false', () => {
    expect(component.loading()).toBe(false);
  });

  it('should start with empty errorMessage', () => {
    expect(component.errorMessage()).toBe('');
  });

  it('should not submit when form is invalid', () => {
    component.form.get('email')?.setValue('');
    component.form.get('password')?.setValue('');

    component.onSubmit();

    expect(component.loading()).toBe(false);
  });

  it('should mark all fields as touched on invalid submit', () => {
    component.onSubmit();

    expect(component.form.get('email')?.touched).toBe(true);
    expect(component.form.get('password')?.touched).toBe(true);
  });

  it('should set loading true on valid submit', () => {
    component.form.get('email')?.setValue('test@example.com');
    component.form.get('password')?.setValue('password123');

    component.onSubmit();

    expect(component.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.includes('/api/auth/login'));
    req.flush({
      success: true,
      data: { access_token: 'tok', user: { id: '1', name: 'T', email: 'e', phone: 'p', role: 'customer', created_at: '' } },
    });
  });

  it('should render the form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="password"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should show validation error when email is touched and empty', async () => {
    const emailInput = component.form.get('email');
    emailInput?.markAsTouched();
    emailInput?.setValue('');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorEl = compiled.querySelector('.text-red-500');
    expect(errorEl).toBeTruthy();
  });
});
