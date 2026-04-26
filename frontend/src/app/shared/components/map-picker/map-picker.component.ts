import { ChangeDetectionStrategy, Component, input, output, signal, OnInit, OnDestroy, ElementRef, viewChild, PLATFORM_ID, inject, NgZone, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

type LeafletModule = typeof import('leaflet');

export interface MapAddress {
  governorate: string;
  city: string;
  district: string;
  street: string;
  label: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      @if (mapLoaded()) {
        <div class="relative rounded-2xl overflow-hidden border border-border shadow-md group">
          <div #mapContainer class="w-full h-72 sm:h-80"></div>

          <!-- Pick Me button overlay -->
          <button type="button" (click)="pickMyLocation()" [disabled]="locating()"
                  class="absolute top-3 end-3 z-[1000] inline-flex items-center gap-1.5 text-xs font-semibold
                         bg-white/95 backdrop-blur-sm text-foreground shadow-lg
                         px-3 py-2 rounded-xl border border-border/50
                         hover:bg-white hover:shadow-xl hover:-translate-y-0.5
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            @if (locating()) {
              <div class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            } @else {
              <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2a1 1 0 011 1v2.07A8.003 8.003 0 0118.93 11H21a1 1 0 110 2h-2.07A8.003 8.003 0 0113 18.93V21a1 1 0 11-2 0v-2.07A8.003 8.003 0 015.07 13H3a1 1 0 110-2h2.07A8.003 8.003 0 0111 5.07V3a1 1 0 011-1zm0 5a5 5 0 100 10 5 5 0 000-10zm0 3a2 2 0 110 4 2 2 0 010-4z"/></svg>
            }
            {{ 'mapPicker.pickMe' | t }}
          </button>

          <!-- Status badge overlay -->
          <div class="absolute bottom-3 start-3 z-[1000]">
            @if (lat() && lng()) {
              <span class="inline-flex items-center gap-1.5 text-xs font-medium bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-md">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                {{ 'mapPicker.locationSet' | t }}
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 text-xs font-medium bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-md">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                {{ 'mapPicker.clickToSet' | t }}
              </span>
            }
          </div>
        </div>
      } @else if (mapError()) {
        <div class="w-full h-40 rounded-2xl border border-border bg-muted flex items-center justify-center">
          <p class="text-sm text-muted-foreground">{{ 'mapPicker.unavailable' | t }}</p>
        </div>
      } @else {
        <div class="w-full h-72 sm:h-80 rounded-2xl border border-border bg-muted flex items-center justify-center">
          <div class="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    </div>
  `,
  styles: `
    :host ::ng-deep .leaflet-control-attribution {
      font-size: 9px;
      opacity: 0.6;
      background: rgba(255,255,255,0.7) !important;
      backdrop-filter: blur(4px);
      border-radius: 6px 0 0 0;
      padding: 2px 6px;
    }
    :host ::ng-deep .leaflet-control-zoom {
      border: none !important;
      border-radius: 12px !important;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    }
    :host ::ng-deep .leaflet-control-zoom a {
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      font-size: 16px !important;
      color: #333 !important;
      border-bottom-color: #eee !important;
    }
    :host ::ng-deep .leaflet-control-zoom a:hover {
      background: #f5f5f5 !important;
    }
  `,
})
export class MapPickerComponent implements OnInit, OnDestroy {
  initialLat = input<number>(30.044);
  initialLng = input<number>(31.235);
  locationChange = output<{ lat: number; lng: number }>();
  addressDetected = output<MapAddress>();

  mapContainer = viewChild<ElementRef>('mapContainer');
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  lat = signal<number | null>(null);
  lng = signal<number | null>(null);
  mapLoaded = signal(false);
  mapError = signal(false);
  locating = signal(false);

  private L: LeafletModule | null = null;
  private map: import('leaflet').Map | null = null;
  private marker: import('leaflet').Marker | null = null;

  private readonly initEffect = effect(() => {
    const container = this.mapContainer();
    if (container && this.L && !this.map) {
      this.initMap(container.nativeElement);
    }
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadLeaflet();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
    this.marker = null;
  }

  pickMyLocation(): void {
    if (!navigator.geolocation) return;

    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.zone.run(() => {
          const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
          this.placeMarker(pos);
          this.lat.set(pos[0]);
          this.lng.set(pos[1]);
          this.map?.setView(pos, 16);
          this.locationChange.emit({ lat: pos[0], lng: pos[1] });
          this.reverseGeocode(pos[0], pos[1]);
          this.locating.set(false);
        });
      },
      () => {
        this.zone.run(() => this.locating.set(false));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  private async loadLeaflet(): Promise<void> {
    try {
      const mod = await import('leaflet');
      this.L = (mod as unknown as { default: LeafletModule }).default ?? mod;

      // Fix default marker icon paths broken by bundlers
      const IconDefault = this.L.Icon.Default;
      delete (IconDefault.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
      IconDefault.mergeOptions({
        iconUrl: 'assets/leaflet/marker-icon.png',
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
      });

      this.mapLoaded.set(true);
    } catch {
      this.mapError.set(true);
    }
  }

  private initMap(container: HTMLElement): void {
    const L = this.L!;
    const center: [number, number] = [this.initialLat(), this.initialLng()];

    this.map = L.map(container, {
      center,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    if (this.initialLat() !== 30.044 || this.initialLng() !== 31.235) {
      this.placeMarker(center);
    }

    this.map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
      this.zone.run(() => {
        const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
        this.placeMarker(pos);
        this.lat.set(pos[0]);
        this.lng.set(pos[1]);
        this.locationChange.emit({ lat: pos[0], lng: pos[1] });
        this.reverseGeocode(pos[0], pos[1]);
      });
    });
  }

  private placeMarker(pos: [number, number]): void {
    const L = this.L!;
    if (this.marker) {
      this.marker.setLatLng(pos);
    } else if (this.map) {
      this.marker = L.marker(pos, { draggable: true }).addTo(this.map);

      this.marker.on('dragend', () => {
        this.zone.run(() => {
          const latlng = this.marker!.getLatLng();
          this.lat.set(latlng.lat);
          this.lng.set(latlng.lng);
          this.locationChange.emit({ lat: latlng.lat, lng: latlng.lng });
        });
      });
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
        { headers: { 'User-Agent': 'SoulmateStore/1.0' } },
      );
      const data = await res.json();
      const addr = data.address;
      if (!addr) return;

      const street = addr.road || addr.pedestrian || addr.street || '';
      const city = addr.city || addr.town || addr.city_district || '';
      const district = addr.suburb || addr.neighbourhood || addr.quarter || '';
      const rawGov = addr.state || addr.governorate || addr.state_district || '';
      const governorate = rawGov.replace(/\s*governorate\s*/i, '').replace(/\s*محافظة\s*/g, '').trim();
      const label = [district || city, governorate].filter(Boolean).join(', ');

      this.zone.run(() => {
        this.addressDetected.emit({ governorate, city, district, street, label: label || city });
      });
    } catch {
      // Silently fail — address fields remain empty for manual input
    }
  }
}
