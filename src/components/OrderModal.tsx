import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Offer, Order, generateOrderId } from '@/data/mockData';

interface OrderModalProps {
  offer: Offer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderModal = ({ offer, open, onOpenChange }: OrderModalProps) => {
  const { addOrder } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');

  // Determine pricing type based on offer
  const pricingType: 'unit' | 'cpt' = offer.pricePerUnit ? 'unit' : 'cpt';

  const [formData, setFormData] = useState({
    preferredFrom: '',
    preferredTo: '',
    quantity: '1',
    impressions: '',
    finalClient: '',
    note: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (pricingType === 'unit' && offer.pricePerUnit) {
      const qty = parseInt(formData.quantity) || 0;
      return offer.pricePerUnit * qty;
    } else if (pricingType === 'cpt' && offer.cpt) {
      const imp = parseInt(formData.impressions) || 0;
      return (imp / 1000) * offer.cpt;
    }
    return 0;
  }, [pricingType, offer, formData.quantity, formData.impressions]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderId = generateOrderId();
    
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderId,
      offerId: offer.id,
      offerTitle: offer.title,
      mediaId: offer.mediaId,
      mediaName: offer.mediaName,
      agencyId: 'ag1', // Mock agency ID
      status: 'nová',
      createdAt: new Date().toISOString().split('T')[0],
      preferredFrom: formData.preferredFrom,
      preferredTo: formData.preferredTo,
      pricingType,
      unitPrice: pricingType === 'unit' ? offer.pricePerUnit : undefined,
      cptValue: pricingType === 'cpt' ? offer.cpt : undefined,
      quantity: pricingType === 'unit' ? parseInt(formData.quantity) : undefined,
      impressions: pricingType === 'cpt' ? parseInt(formData.impressions) : undefined,
      totalPrice,
      finalClient: formData.finalClient || undefined,
      note: formData.note,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
    };

    addOrder(newOrder);
    setNewOrderId(orderId);
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setNewOrderId('');
      setFormData({
        preferredFrom: '',
        preferredTo: '',
        quantity: '1',
        impressions: '',
        finalClient: '',
        note: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
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
                    type="number"
                    placeholder="např. 100000"
                    value={formData.impressions}
                    onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

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

          {/* Contact info */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Kontaktní údaje</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="contactName">Kontaktní osoba *</Label>
                <Input
                  id="contactName"
                  placeholder="Jméno a příjmení"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">E-mail *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="vas@email.cz"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefon</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+420 xxx xxx xxx"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Zrušit
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={offer.minOrderValue ? totalPrice < offer.minOrderValue : false}
            >
              Odeslat objednávku
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
