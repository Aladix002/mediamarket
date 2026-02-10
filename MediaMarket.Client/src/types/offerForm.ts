import { z } from 'zod';

export const offerSchema = z.object({
  title: z.string().min(1, 'Název nabídky je povinný').max(255, 'Název nabídky může mít maximálně 255 znaků'),
  mediaType: z.string().min(1, 'Typ média je povinný'),
  format: z.string().max(255, 'Formát může mít maximálně 255 znaků').optional().or(z.literal('')),
  pricingType: z.enum(['unit', 'cpt']).optional(),
  pricePerUnit: z.string().optional().or(z.literal('')),
  cpt: z.string().optional().or(z.literal('')),
  minOrderValue: z.string().optional().or(z.literal('')),
  discountPercent: z.string().refine((val) => {
    const num = parseFloat(val || '0');
    return num >= 0 && num <= 100;
  }, 'Sleva musí být mezi 0 a 100%'),
  validFrom: z.string().min(1, 'Platnost nabídky od je povinná')
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      return selectedDate >= today;
    }, 'Datum platnosti od nemůže být dříve než dnes'),
  validTo: z.string().min(1, 'Platnost nabídky do je povinná'),
  description: z.string().min(1, 'Popis nabídky je povinný').max(2000, 'Popis může mít maximálně 2000 znaků'),
  whatsIncluded: z.string().optional().or(z.literal('')),
  technicalConditionsText: z.string().max(2000, 'Technické podmínky mohou mít maximálně 2000 znaků').optional().or(z.literal('')),
  technicalConditionsUrl: z.string()
    .max(500, 'URL technických podmínek může mít maximálně 500 znaků')
    .refine((url) => {
      if (!url || url.trim() === '') return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, 'URL technických podmínek musí být platná URL adresa')
    .optional()
    .or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  lastOrderDate: z.string().optional().or(z.literal('')),
  requireFinalClient: z.boolean().optional(),
}).refine((data) => {
  const fromDate = new Date(data.validFrom);
  const toDate = new Date(data.validTo);
  return toDate > fromDate;
}, {
  message: 'Datum platnosti do musí být později než datum platnosti od',
  path: ['validTo'],
}).refine((data) => {
  if (!data.pricingType) {
    return false;
  }
  if (data.pricingType === 'unit') {
    return data.pricePerUnit && parseFloat(data.pricePerUnit) > 0;
  } else {
    return data.cpt && parseFloat(data.cpt) > 0;
  }
}, {
  message: 'Musíte vyplnit cenu podle vybraného typu',
  path: ['pricePerUnit'],
}).refine((data) => {
  if (!data.deadline || data.deadline.trim() === '') return true;
  const validFrom = new Date(data.validFrom);
  const deadline = new Date(data.deadline);
  return deadline >= validFrom;
}, {
  message: 'Deadline na dodání podkladů nemůže být dříve než datum platnosti nabídky od',
  path: ['deadline'],
}).refine((data) => {
  if (!data.lastOrderDate || data.lastOrderDate.trim() === '') return true;
  const validFrom = new Date(data.validFrom);
  const lastOrderDate = new Date(data.lastOrderDate);
  return lastOrderDate >= validFrom;
}, {
  message: 'Poslední možný den objednávky nemůže být dříve než datum platnosti nabídky od',
  path: ['lastOrderDate'],
}).refine((data) => {
  if (!data.deadline || !data.lastOrderDate || data.deadline.trim() === '' || data.lastOrderDate.trim() === '') return true;
  const deadline = new Date(data.deadline);
  const lastOrderDate = new Date(data.lastOrderDate);
  return lastOrderDate <= deadline;
}, {
  message: 'Poslední den objednávky nesmí být později než deadline pro zasílání materiálů',
  path: ['lastOrderDate'],
});

export type OfferFormData = z.infer<typeof offerSchema>;

export type OfferTags = {
  'last-minute': boolean;
  'speciál': boolean;
  'akce': boolean;
};
