import { BuilderStateService } from './builder-state.service';
import { BoxType, SlotProduct, BoxSlot } from '../models/box-type.model';

describe('BuilderStateService', () => {
  let service: BuilderStateService;

  beforeEach(() => {
    service = new BuilderStateService();
  });

  const mockBoxType: BoxType = {
    id: 'box-1',
    name: 'For Him',
    name_en: 'For Him',
    slug: 'for-him',
    gender: 'male',
    base_price: 150,
    image_url: 'url',
  };

  const mockSlots: BoxSlot[] = [
    { id: 'slot-1', slot_key: 'perfume', label_ar: 'عطر', label_en: 'Perfume', is_required: true, sort_order: 1, filter_gender: 'male' },
    { id: 'slot-2', slot_key: 'watch', label_ar: 'ساعة', label_en: 'Watch', is_required: false, sort_order: 2, filter_gender: null },
  ];

  const mockProduct: SlotProduct = {
    id: 'prod-1',
    name: 'Perfume X',
    name_en: 'Perfume X',
    price: 200,
    image_url: 'url',
    category: 'watch',
    gender: 'male',
    is_customizable: false,
    customization_price: 0,
  };

  it('should start with null box type', () => {
    expect(service.snapshot.boxType).toBeNull();
  });

  describe('setBoxType', () => {
    it('should set box type and reset state', () => {
      service.setBoxType(mockBoxType);

      expect(service.snapshot.boxType).toEqual(mockBoxType);
      expect(service.snapshot.slots).toEqual([]);
      expect(service.snapshot.selectedProducts).toEqual({});
    });
  });

  describe('setSlots', () => {
    it('should set slots', () => {
      service.setSlots(mockSlots);

      expect(service.snapshot.slots).toEqual(mockSlots);
    });
  });

  describe('selectProduct', () => {
    it('should add product selection for slot', () => {
      service.selectProduct('slot-1', mockProduct);

      expect(service.snapshot.selectedProducts['slot-1']).toEqual(mockProduct);
    });

    it('should replace existing selection', () => {
      const anotherProduct: SlotProduct = { ...mockProduct, id: 'prod-2', name: 'Other', price: 300 };
      service.selectProduct('slot-1', mockProduct);
      service.selectProduct('slot-1', anotherProduct);

      expect(service.snapshot.selectedProducts['slot-1'].name).toBe('Other');
    });
  });

  describe('setCustomization', () => {
    it('should update customization', () => {
      service.setCustomization({ name1: 'Ali', name2: 'Sara', date: '2026-02-14', message: 'Love' });

      expect(service.snapshot.customization.name1).toBe('Ali');
      expect(service.snapshot.customization.name2).toBe('Sara');
    });
  });

  describe('getSlotSelections', () => {
    it('should return slot id to product id mapping', () => {
      service.selectProduct('slot-1', mockProduct);
      service.selectProduct('slot-2', { ...mockProduct, id: 'prod-2' });

      const selections = service.getSlotSelections();

      expect(selections['slot-1']).toBe('prod-1');
      expect(selections['slot-2']).toBe('prod-2');
    });
  });

  describe('getTotalPrice', () => {
    it('should return 0 when no box type selected', () => {
      expect(service.getTotalPrice()).toBe(0);
    });

    it('should return base price when no products selected', () => {
      service.setBoxType(mockBoxType);

      expect(service.getTotalPrice()).toBe(150);
    });

    it('should sum base price and product prices', () => {
      service.setBoxType(mockBoxType);
      service.selectProduct('slot-1', mockProduct); // 200
      service.selectProduct('slot-2', { ...mockProduct, id: 'prod-2', price: 100 }); // 100

      expect(service.getTotalPrice()).toBe(450); // 150 + 200 + 100
    });
  });

  describe('canProceedFromSlots', () => {
    it('should return false when required slots are unfilled', () => {
      service.setSlots(mockSlots);

      expect(service.canProceedFromSlots()).toBe(false);
    });

    it('should return true when all required slots are filled', () => {
      service.setSlots(mockSlots);
      service.selectProduct('slot-1', mockProduct); // slot-1 is required

      expect(service.canProceedFromSlots()).toBe(true);
    });

    it('should return true when no slots configured', () => {
      expect(service.canProceedFromSlots()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      service.setBoxType(mockBoxType);
      service.setSlots(mockSlots);
      service.selectProduct('slot-1', mockProduct);

      service.reset();

      expect(service.snapshot.boxType).toBeNull();
      expect(service.snapshot.slots).toEqual([]);
      expect(service.snapshot.selectedProducts).toEqual({});
    });
  });

  describe('state observable', () => {
    it('should emit state changes', () => {
      const states: unknown[] = [];
      service.state.subscribe((s) => states.push(s));

      service.setBoxType(mockBoxType);

      expect(states.length).toBe(2); // initial + setBoxType
    });
  });
});
