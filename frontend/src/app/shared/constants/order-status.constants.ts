import { TranslationService } from '../../core/services/translation.service';

/** Translation keys for order statuses — resolve via TranslationService.get() */
export const STATUS_KEY_MAP: Record<string, string> = {
  pending: 'status.pending',
  payment_review: 'status.paymentReview',
  processing: 'status.processing',
  shipped: 'status.shipped',
  delivered: 'status.delivered',
  cancelled: 'status.cancelled',
};

export const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  payment_review: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  delivered: 'bg-green-500/10 text-green-500 border border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
};

export function getStatusLabel(status: string, t: TranslationService): string {
  return t.get(STATUS_KEY_MAP[status] ?? status);
}

export function getStatusColor(status: string): string {
  return STATUS_COLOR[status] ?? 'bg-muted text-foreground';
}
