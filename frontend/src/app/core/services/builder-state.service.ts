import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoxType, BoxSlot, SlotProduct, Customization } from '../models/box-type.model';

export interface BuilderState {
  boxType: BoxType | null;
  slots: BoxSlot[];
  slotProducts: Record<string, SlotProduct[]>;
  selectedProducts: Record<string, SlotProduct>;
  customizedSlots: Record<string, boolean>;
  customization: Customization;
}

const INITIAL_STATE: BuilderState = {
  boxType: null,
  slots: [],
  slotProducts: {},
  selectedProducts: {},
  customizedSlots: {},
  customization: { name1: '', name2: '', date: '', message: '' },
};

@Injectable({ providedIn: 'root' })
export class BuilderStateService {
  private state$ = new BehaviorSubject<BuilderState>({ ...INITIAL_STATE });
  readonly state = this.state$.asObservable();

  get snapshot(): BuilderState {
    return this.state$.value;
  }

  setBoxType(boxType: BoxType): void {
    this.state$.next({
      ...INITIAL_STATE,
      boxType,
    });
  }

  setSlots(slots: BoxSlot[]): void {
    this.state$.next({ ...this.snapshot, slots });
  }

  setSlotProducts(slotId: string, products: SlotProduct[]): void {
    this.state$.next({
      ...this.snapshot,
      slotProducts: { ...this.snapshot.slotProducts, [slotId]: products },
    });
  }

  selectProduct(slotId: string, product: SlotProduct): void {
    const customizedSlots = { ...this.snapshot.customizedSlots };
    // Clear customization toggle if product changed
    delete customizedSlots[slotId];
    this.state$.next({
      ...this.snapshot,
      selectedProducts: { ...this.snapshot.selectedProducts, [slotId]: product },
      customizedSlots,
    });
  }

  toggleCustomization(slotId: string, enabled: boolean): void {
    this.state$.next({
      ...this.snapshot,
      customizedSlots: { ...this.snapshot.customizedSlots, [slotId]: enabled },
    });
  }

  setCustomization(customization: Customization): void {
    this.state$.next({ ...this.snapshot, customization });
  }

  getSlotSelections(): Record<string, string> {
    const selections: Record<string, string> = {};
    for (const [slotId, product] of Object.entries(this.snapshot.selectedProducts)) {
      selections[slotId] = product.id;
    }
    return selections;
  }

  getCustomizedSlotIds(): string[] {
    return Object.entries(this.snapshot.customizedSlots)
      .filter(([, enabled]) => enabled)
      .map(([slotId]) => slotId);
  }

  hasAnyCustomization(): boolean {
    return this.getCustomizedSlotIds().length > 0;
  }

  getCustomizationTotal(): number {
    let total = 0;
    for (const [slotId, enabled] of Object.entries(this.snapshot.customizedSlots)) {
      if (enabled) {
        const product = this.snapshot.selectedProducts[slotId];
        if (product?.is_customizable) {
          total += product.customization_price;
        }
      }
    }
    return total;
  }

  getTotalPrice(): number {
    const base = this.snapshot.boxType?.base_price ?? 0;
    const products = Object.values(this.snapshot.selectedProducts).reduce((sum, p) => sum + p.price, 0);
    return base + products + this.getCustomizationTotal();
  }

  canProceedFromSlots(): boolean {
    const requiredSlots = this.snapshot.slots.filter(s => s.is_required);
    return requiredSlots.every(s => this.snapshot.selectedProducts[s.id]);
  }

  reset(): void {
    this.state$.next({ ...INITIAL_STATE });
  }
}
