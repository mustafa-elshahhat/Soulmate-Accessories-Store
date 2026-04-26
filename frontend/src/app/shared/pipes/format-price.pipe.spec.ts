import { FormatPricePipe } from './format-price.pipe';

describe('FormatPricePipe', () => {
  let pipe: FormatPricePipe;

  beforeEach(() => {
    pipe = new FormatPricePipe();
  });

  it('should format a number with Arabic locale and currency suffix', () => {
    const result = pipe.transform(1500);
    expect(result).toContain('١٬٥٠٠');
    expect(result).toContain('ج.م');
  });

  it('should format zero', () => {
    const result = pipe.transform(0);
    expect(result).toContain('٠');
    expect(result).toContain('ج.م');
  });

  it('should format decimal numbers', () => {
    const result = pipe.transform(99.5);
    expect(result).toContain('ج.م');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format large numbers correctly', () => {
    const result = pipe.transform(1000000);
    expect(result).toContain('ج.م');
    expect(result).toContain('١٬٠٠٠٬٠٠٠');
  });
});
