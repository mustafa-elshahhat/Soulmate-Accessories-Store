import { TestBed } from '@angular/core/testing';
import { FormatPricePipe } from './format-price.pipe';
import { TranslationService } from '../../core/services/translation.service';

describe('FormatPricePipe', () => {
  let pipe: FormatPricePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new FormatPricePipe());
  });

  it('should format a number with English locale and currency suffix by default', () => {
    const result = pipe.transform(1500);
    expect(result).toContain('1,500');
    expect(result).toContain('EGP');
  });

  it('should format zero', () => {
    const result = pipe.transform(0);
    expect(result).toContain('0');
    expect(result).toContain('EGP');
  });

  it('should format decimal numbers', () => {
    const result = pipe.transform(99.5);
    expect(result).toContain('EGP');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format large numbers correctly', () => {
    const result = pipe.transform(1000000);
    expect(result).toContain('EGP');
    expect(result).toContain('1,000,000');
  });

  describe('when language is Arabic', () => {
    beforeEach(() => {
      TestBed.inject(TranslationService).currentLang.set('ar');
    });

    it('should format a number with Arabic-Indic numerals and currency suffix', () => {
      const result = pipe.transform(1500);
      expect(result).toContain('١٬٥٠٠');
      expect(result).toContain('ج.م');
    });

    it('should format large numbers with Arabic-Indic numerals', () => {
      const result = pipe.transform(1000000);
      expect(result).toContain('١٬٠٠٠٬٠٠٠');
      expect(result).toContain('ج.م');
    });
  });
});
