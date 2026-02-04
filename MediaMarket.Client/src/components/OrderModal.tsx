import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

  const [formData, setFormData] = useState({
    preferredFrom: '',
    preferredTo: '',
    quantity: '1',
    impressions: '',
    finalClient: '',
    note: '',
  });

  // Normalize impressions input (remove spaces, convert to number)
  const normalizedImpressions = useMemo(() => {
    const cleaned = formData.impressions.replace(/\s/g, '');
    const num = parseInt(cleaned);
    return isNaN(num) || num <= 0 ? 0 : num;
  }, [formData.impressions]);

  // Calculate total price (with discount)
  const totalPrice = useMemo(() => {
    let basePrice = 0;
    
    if (pricingType === 'unit' && offer.pricePerUnit) {
      const qty = parseInt(formData.quantity) || 0;
      basePrice = offer.pricePerUnit * qty;
    } else if (pricingType === 'cpt' && offer.cpt) {
      basePrice = (normalizedImpressions / 1000) * offer.cpt;
    }
    
    // Aplikuj zľavu ak existuje
    if (basePrice > 0 && offer.discountPercent > 0) {
      return basePrice * (1 - offer.discountPercent / 100);
    }
    
    return basePrice;
  }, [pricingType, offer, formData.quantity, normalizedImpressions]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validácia
      if (!formData.preferredFrom || !formData.preferredTo) {
        toast({
          title: 'Chyba',
          description: 'Vyplňte preferované termíny',
          variant: 'destructive',
        });
        return;
      }

      if (pricingType === 'unit' && (!formData.quantity || parseInt(formData.quantity) < 1)) {
        toast({
          title: 'Chyba',
          description: 'Vyplňte počet ks',
          variant: 'destructive',
        });
        return;
      }

      if (pricingType === 'cpt' && normalizedImpressions === 0) {
        toast({
          title: 'Chyba',
          description: 'Vyplňte počet zobrazení',
          variant: 'destructive',
        });
        return;
      }

      // Kontrola minimálnej hodnoty objednávky
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
          preferredFrom: formData.preferredFrom,
          preferredTo: formData.preferredTo,
          quantityUnits: pricingType === 'unit' && parseInt(formData.quantity) > 0 ? parseInt(formData.quantity) : undefined,
          impressions: pricingType === 'cpt' && normalizedImpressions > 0 ? normalizedImpressions : undefined,
          note: formData.note || '',
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
      setFormData({
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Offer info */}
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm font-medium">{offer.title}</p>
            <p className="text-xs text-muted-foreground">{offer.mediaName}</p>
          </div>

          {/* Preferred dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferredFrom">Preferovaný termín od *</Label>
              <Input
                id="preferredFrom"
                type="date"
                value={formData.preferredFrom}
                onChange={(e) => setFormData({ ...formData, preferredFrom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTo">Preferovaný termín do *</Label>
              <Input
                id="preferredTo"
                type="date"
                value={formData.preferredTo}
                onChange={(e) => setFormData({ ...formData, preferredTo: e.target.value })}
                required
              />
            </div>
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
                <div className="space-y-2">
                  <Label htmlFor="quantity">Počet ks *</Label>
                  <Select
                    value={formData.quantity}
                    onValueChange={(value) => setFormData({ ...formData, quantity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte počet" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} ks
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {pricingType === 'cpt' && offer.cpt && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPT (cena za tisíc zobrazení):</span>
                  <span className="font-medium">{formatPrice(offer.cpt)}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impressions">Počet zobrazení *</Label>
                  <Input
                    id="impressions"
                    type="text"
                    placeholder="např. 100000"
                    value={formData.impressions}
                    onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                    required={pricingType === 'cpt'}
                  />
                  {formData.impressions && normalizedImpressions === 0 && (
                    <p className="text-xs text-destructive">Zadejte platné kladné číslo</p>
                  )}
                </div>
              </>
            )}

            {offer.discountPercent > 0 && (() => {
              const basePrice = pricingType === 'unit' && offer.pricePerUnit 
                ? offer.pricePerUnit * (parseInt(formData.quantity) || 0)
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
            <div className="space-y-2">
              <Label htmlFor="finalClient">Finální klient *</Label>
              <Input
                id="finalClient"
                placeholder="Název finálního klienta"
                value={formData.finalClient}
                onChange={(e) => setFormData({ ...formData, finalClient: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                Cenové podmínky tohoto formátu se mohou lišit pro různé klienty, z tohoto důvodu médium vyžaduje uvedení finálního klienta.
              </p>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Poznámka k objednávce</Label>
            <Textarea
              id="note"
              placeholder="Popište vaše požadavky, cíle kampaně, cílovou skupinu..."
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

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
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
