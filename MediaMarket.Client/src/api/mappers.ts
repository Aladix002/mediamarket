/**
 * Helper funkcie pre mapovanie medzi frontend a backend typmi
 */

import type { MediaMarket_API_DTOs_Offers_Responses_OfferResponse } from './generated/models/MediaMarket_API_DTOs_Offers_Responses_OfferResponse';
import type { MediaMarket_API_DTOs_Orders_Responses_OrderResponse } from './generated/models/MediaMarket_API_DTOs_Orders_Responses_OrderResponse';
import type { Offer, Order } from '@/data/mockData';

// Enum mappings
export const MediaTypeMap = {
  'online': 0,
  'rádio': 1,
  'OOH': 2,
  'print': 3,
  'sociální sítě': 4,
  'video': 5,
  'influenceři': 6,
} as const;

export const MediaTypeReverseMap: Record<number, keyof typeof MediaTypeMap> = {
  0: 'online',
  1: 'rádio',
  2: 'OOH',
  3: 'print',
  4: 'sociální sítě',
  5: 'video',
  6: 'influenceři',
};

export const OfferStatusMap = {
  'draft': 0,
  'published': 1,
  'archived': 2,
} as const;

export const OfferStatusReverseMap: Record<number, keyof typeof OfferStatusMap> = {
  0: 'draft',
  1: 'published',
  2: 'archived',
};

export const OrderStatusMap = {
  'nová': 0,
  'v řešení': 1,
  'objednávka uzavřena': 2,
} as const;

export const OrderStatusReverseMap: Record<number, keyof typeof OrderStatusMap> = {
  0: 'nová',
  1: 'v řešení',
  2: 'objednávka uzavřena',
};

export const OfferTagMap = {
  'akce': 1,
  'speciál': 2,
  'last-minute': 4,
} as const;

export const OfferTagReverseMap: Record<number, keyof typeof OfferTagMap> = {
  1: 'akce',
  2: 'speciál',
  4: 'last-minute',
};

export const PricingModelMap = {
  'unit': 0,
  'cpt': 1,
} as const;

export const PricingModelReverseMap: Record<number, keyof typeof PricingModelMap> = {
  0: 'unit',
  1: 'cpt',
};

/**
 * Konvertuje backend OfferResponse na frontend Offer
 */
export function mapOfferResponseToOffer(response: MediaMarket_API_DTOs_Offers_Responses_OfferResponse): Offer {
  // Konvertuj tags (flags enum) na array
  const tags: Array<keyof typeof OfferTagMap> = [];
  if (response.tags !== undefined) {
    if (response.tags & 1) tags.push('akce');
    if (response.tags & 2) tags.push('speciál');
    if (response.tags & 4) tags.push('last-minute');
  }

  // Parsuj whatsIncluded z description alebo použij prázdny array
  // TODO: Backend by mal mať samostatné pole whatsIncluded
  const whatsIncluded: string[] = [];

  return {
    id: response.id || '',
    title: response.title || '',
    mediaId: response.mediaUserId || '',
    mediaName: response.mediaUserName || '',
    mediaType: response.mediaType !== undefined ? MediaTypeReverseMap[response.mediaType] : 'online',
    publisher: response.mediaUserName || '' as any, // Publisher nie je v backendu, použijeme mediaUserName
    format: response.format || '',
    pricePerUnit: response.unitPrice ?? undefined,
    cpt: response.cpt ?? undefined,
    minOrderValue: response.minOrderValue ?? undefined,
    priceFrom: response.unitPrice || response.cpt || 0,
    discountPercent: response.discountPercent || 0,
    validFrom: response.validFrom || '',
    validTo: response.validTo || '',
    description: response.description || '',
    whatsIncluded,
    technicalConditionsText: response.technicalConditionsText ?? undefined,
    technicalConditionsUrl: response.technicalConditionsUrl ?? undefined,
    deadline: response.deadlineAssetsAt || '',
    lastOrderDate: response.lastOrderDay ?? undefined,
    tags,
    requireFinalClient: false, // Backend už nemá toto pole
    status: response.status !== undefined ? OfferStatusReverseMap[response.status] : 'draft',
  };
}

/**
 * Konvertuje backend OrderResponse na frontend Order
 */
export function mapOrderResponseToOrder(response: MediaMarket_API_DTOs_Orders_Responses_OrderResponse): Order {
  const pricingType = response.pricingModelSnapshot !== undefined 
    ? PricingModelReverseMap[response.pricingModelSnapshot] 
    : 'unit';

  return {
    id: response.id || '',
    orderId: response.orderNumber || '',
    offerId: response.offerId || '',
    offerTitle: response.offerTitle || '',
    mediaId: response.mediaUserId || '',
    mediaName: response.mediaCompanyName || '',
    agencyId: response.agencyUserId || '',
    status: response.status !== undefined ? OrderStatusReverseMap[response.status] : 'nová',
    createdAt: response.createdAt || '',
    preferredFrom: response.preferredFrom || '',
    preferredTo: response.preferredTo || '',
    pricingType,
    unitPrice: response.unitPriceSnapshot ?? undefined,
    cptValue: response.cptSnapshot ?? undefined,
    quantity: response.quantityUnits ?? undefined,
    impressions: response.impressions ?? undefined,
    totalPrice: response.totalPrice || 0,
    finalClient: undefined, // Backend už nemá toto pole
    note: response.note || '',
    contactName: response.agencyCompanyName || '', // TODO: Backend by mal mať kontaktné údaje
    contactEmail: '', // TODO: Backend by mal mať kontaktné údaje
    contactPhone: '', // TODO: Backend by mal mať kontaktné údaje
  };
}
