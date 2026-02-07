import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Offer } from '@/data/mockData';
import { useCreateOrder } from '@/api/hooks';
import { toast } from '@/hooks/use-toast';

interface OrderModalProps {
  offer: Offer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderModal = ({ offer, open, onOpenChange }: OrderModalProps) => {
  const { role, userId } = useApp();
  const navigate = useNavigate();
  const { createOrder, loading: creatingOrder } = useCreateOrder();
  const [submitted, setSubmitted] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');

  // Check if offer is "Online" type - always use CPT
  const isOnline = offer.mediaType.toLowerCase() === 'online';

  // Check what pricing options are available
  const hasUnitPrice = !!offer.pricePerUnit;
  const hasCpt = !!offer.cpt;
  
  // For Online offers, force CPT; otherwise allow selection if both available
  const hasBothPricing = !isOnline && hasUnitPrice && hasCpt;

  // Default pricing type: Online = always CPT, otherwise unit if available
  const defaultPricingType: 'unit' | 'cpt' = isOnline ? 'cpt' : (hasUnitPrice ? 'unit' : 'cpt');
  const [selectedPricingType, setSelectedPricingType] = useState<'unit' | 'cpt'>(defaultPricingType);

  // Active pricing type (Online = always CPT, otherwise user-selected if both available)
  const pricingType = isOnline ? 'cpt' : (hasBothPricing ? selectedPricingType : defaultPricingType);

  // Zod schema - dynamicky podľa pricing type a offer
  const createOrderSchema = (pricingType: 'unit' | 'cpt', offer: Offer) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const offerValidFrom = offer.validFrom ? new Date(offer.validFrom) : null;
    const offerValidTo = offer.validTo ? new Date(offer.validTo) : null;
    const lastOrderDay = offer.lastOrderDate ? new Date(offer.lastOrderDate) : null;

    return z.object({
      preferredFrom: z.string().min(1, 'Vyplňte preferovaný termín od')
        .refine((date) => {
          const selectedDate = new Date(date);
          return selectedDate >= today;
        }, 'Preferovaný termín od nemůže být dříve než dnes')
        .refine((date) => {
          if (offerValidFrom) {
            const selectedDate = new Date(date);
            return selectedDate >= offerValidFrom;
          }
          return true;
        }, offerValidFrom 
          ? `Preferovaný termín od musí být v rámci platnosti ponuky (od ${offerValidFrom.toLocaleDateString('cs-CZ')})`
          : 'Preferovaný termín od musí být v rámci platnosti ponuky')
        .refine((date) => {
          if (lastOrderDay) {
            const selectedDate = new Date(date);
            return selectedDate >= lastOrderDay;
          }
          return true;
        }, lastOrderDay
          ? `Preferovaný termín od nemůže být dříve než poslední možný den objednávky (${lastOrderDay.toLocaleDateString('cs-CZ')})`
          : 'Preferovaný termín od nemůže být dříve než poslední možný den objednávky'),
      preferredTo: z.string().min(1, 'Vyplňte preferovaný termín do')
        .refine((date) => {
          if (offerValidTo) {
            const selectedDate = new Date(date);
            return selectedDate <= offerValidTo;
          }
          return true;
        }, offerValidTo
          ? `Preferovaný termín do musí být v rámci platnosti ponuky (do ${offerValidTo.toLocaleDateString('cs-CZ')})`
          : 'Preferovaný termín do musí být v rámci platnosti ponuky'),
      quantity: z.string().optional()
        .refine((val) => {
          if (pricingType === 'unit') {
            const num = parseInt(val || '0');
            return num >= 1 && num <= 100;
          }
          return true;
        }, 'Počet ks musí být mezi 1 a 100'),
      impressions: z.string().optional()
        .refine((val) => {
          if (pricingType === 'cpt') {
            const cleaned = (val || '').replace(/\s/g, '');
            const num = parseInt(cleaned);
            return !isNaN(num) && num > 0;
          }
          return true;
        }, 'Vyplňte počet zobrazení (větší než 0)'),
      finalClient: z.string().optional(),
      note: z.string().max(2000, 'Poznámka může mít maximálně 2000 znaků').optional(),
    }).refine((data) => {
      // Validácia PreferredTo > PreferredFrom
      const fromDate = new Date(data.preferredFrom);
      const toDate = new Date(data.preferredTo);
      return toDate > fromDate;
    }, {
      message: 'Preferovaný termín do musí být později než termín od',
      path: ['preferredTo'],
    }).refine((data) => {
      if (pricingType === 'unit') {
        return data.quantity && parseInt(data.quantity) >= 1 && parseInt(data.quantity) <= 100;
      }
      if (pricingType === 'cpt') {
        const cleaned = (data.impressions || '').replace(/\s/g, '');
        const num = parseInt(cleaned);
        return !isNaN(num) && num > 0;
      }
      return true;
    }, {
      message: 'Musíte vyplnit buď počet ks (1-100) nebo počet zobrazení (větší než 0)',
      path: ['quantity'],
    });
  };

  const orderSchema = createOrderSchema(pricingType, offer);
  type OrderFormData = z.infer<typeof orderSchema>;

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      preferredFrom: '',
      preferredTo: '',
      quantity: '1',
      impressions: '',
      finalClient: '',
      note: '',
    },
  });

  // Watch form values
  const watchedValues = form.watch();
  
  // Normalize impressions input (remove spaces, convert to number)
  const normalizedImpressions = useMemo(() => {
    const cleaned = (watchedValues.impressions || '').replace(/\s/g, '');
    const num = parseInt(cleaned);
    return isNaN(num) || num <= 0 ? 0 : num;
  }, [watchedValues.impressions]);

  // Calculate total price (with discount)
  const totalPrice = useMemo(() => {
    let basePrice = 0;
    
    if (pricingType === 'unit' && offer.pricePerUnit) {
      const qty = parseInt(watchedValues.quantity || '0') || 0;
      basePrice = offer.pricePerUnit * qty;
    } else if (pricingType === 'cpt' && offer.cpt) {
      basePrice = (normalizedImpressions / 1000) * offer.cpt;
    }
    
    // Aplikuj zľavu ak existuje
    if (basePrice > 0 && offer.discountPercent > 0) {
      return basePrice * (1 - offer.discountPercent / 100);
    }
    
    return basePrice;
  }, [pricingType, offer, watchedValues.quantity, normalizedImpressions]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      // Kontrola minimální hodnoty objednávky
      if (offer.minOrderValue && totalPrice < offer.minOrderValue) {
        toast({
          title: 'Chyba',
          description: `Minimální hodnota objednávky je ${formatPrice(offer.minOrderValue)}`,
          variant: 'destructive',
        });
        return;
      }

      // Získaj agencyUserId z kontextu (uložené po prihlásení)
      if (!userId) {
        toast({
          title: 'Chyba',
          description: 'Musíte být přihlášeni pro vytvoření objednávky',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      const order = await createOrder(
        offer.id,
        userId,
        {
          preferredFrom: data.preferredFrom,
          preferredTo: data.preferredTo,
          quantityUnits: pricingType === 'unit' && data.quantity && parseInt(data.quantity) > 0 ? parseInt(data.quantity) : undefined,
          impressions: pricingType === 'cpt' && normalizedImpressions > 0 ? normalizedImpressions : undefined,
          note: data.note || '',
        }
      );

      setNewOrderId(order.orderId);
      setSubmitted(true);
    } catch (error) {
      // Error je už spracovaný v hooku
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setNewOrderId('');
      setSelectedPricingType(defaultPricingType);
      form.reset({
        preferredFrom: '',
        preferredTo: '',
        quantity: '1',
        impressions: '',
        finalClient: '',
        note: '',
      });
    }, 200);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="font-display text-xl mb-2">
              Objednávka byla odeslána
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mb-4">
              Děkujeme za vaši objednávku. Médium vás bude kontaktovat pro uzavření objednávky.
            </DialogDescription>
            <div className="p-3 bg-secondary rounded-lg mb-4 w-full">
              <p className="text-sm text-muted-foreground">Číslo objednávky</p>
              <p className="font-mono font-bold text-lg">{newOrderId}</p>
            </div>
            <Button onClick={handleClose} className="mt-2">
              Zavřít
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Objednávka
          </DialogTitle>
          <DialogDescription>
            Vyplňte formulář a médium vás bude kontaktovat pro uzavření objednávky.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Offer info */}
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium">{offer.title}</p>
              <p className="text-xs text-muted-foreground">{offer.mediaName}</p>
            </div>

            {/* Preferred dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="preferredFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferovaný termín od *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={new Date().toISOString().split('T')[0]}
                        max={offer.validTo ? new Date(offer.validTo).toISOString().split('T')[0] : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferovaný termín do *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={watchedValues.preferredFrom || new Date().toISOString().split('T')[0]}
                        max={offer.validTo ? new Date(offer.validTo).toISOString().split('T')[0] : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          {/* Pricing section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Výpočet ceny</h3>
            
            {/* Pricing type selector - only show if both options available */}
            {hasBothPricing && (
              <div className="space-y-2">
                <Label>Způsob nacenění</Label>
                <RadioGroup
                  value={selectedPricingType}
                  onValueChange={(value) => setSelectedPricingType(value as 'unit' | 'cpt')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unit" id="pricing-unit" />
                    <Label htmlFor="pricing-unit" className="cursor-pointer">Cena za ks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cpt" id="pricing-cpt" />
                    <Label htmlFor="pricing-cpt" className="cursor-pointer">CPT</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {pricingType === 'unit' && offer.pricePerUnit && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cena za ks:</span>
                  <span className="font-medium">{formatPrice(offer.pricePerUnit)}</span>
                </div>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet ks *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte počet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} ks
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {pricingType === 'cpt' && offer.cpt && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPT (cena za tisíc zobrazení):</span>
                  <span className="font-medium">{formatPrice(offer.cpt)}</span>
                </div>
                <FormField
                  control={form.control}
                  name="impressions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Počet zobrazení *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="např. 100000"
                          {...field}
                          onChange={(e) => {
                            // Povoliť len čísla a medzery (pre formátovanie)
                            const value = e.target.value.replace(/[^\d\s]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {offer.discountPercent > 0 && (() => {
              const basePrice = pricingType === 'unit' && offer.pricePerUnit 
                ? offer.pricePerUnit * (parseInt(watchedValues.quantity || '0') || 0)
                : (normalizedImpressions / 1000) * (offer.cpt || 0);
              const discountAmount = basePrice * (offer.discountPercent / 100);
              return (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sleva ({offer.discountPercent}%):</span>
                  <span className="text-destructive font-medium">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              );
            })()}
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-medium">Cena celkem:</span>
              <span className="font-display text-xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {offer.minOrderValue && totalPrice < offer.minOrderValue && (
              <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-sm">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive">
                  Minimální hodnota objednávky je {formatPrice(offer.minOrderValue)}
                </span>
              </div>
            )}
          </div>

          {/* Final client - conditionally required */}
          {offer.requireFinalClient && (
            <FormField
              control={form.control}
              name="finalClient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finální klient *</FormLabel>
                  <FormControl>
                    <Input placeholder="Název finálního klienta" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    Cenové podmínky tohoto formátu se mohou lišit pro různé klienty, z tohoto důvodu médium vyžaduje uvedení finálního klienta.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poznámka k objednávce</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Popište vaše požadavky, cíle kampaně, cílovou skupinu..."
                    rows={3}
                    maxLength={2000}
                    {...field}
                  />
                </FormControl>
                {field.value && field.value.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {field.value.length} / 2000 znaků
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={creatingOrder}>
              Zrušit
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={
                creatingOrder ||
                (offer.minOrderValue && totalPrice < offer.minOrderValue) ||
                (pricingType === 'cpt' && normalizedImpressions === 0)
              }
            >
              {creatingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Odesílám...
                </>
              ) : (
                'Odeslat objednávku'
              )}
            </Button>
          </div>

          {/* Terms agreement */}
          <p className="text-xs text-muted-foreground text-center">
            Odesláním souhlasíte s{' '}
            <Link to="/terms" className="underline hover:text-primary" target="_blank">
              obchodními podmínkami
            </Link>
            .
          </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
