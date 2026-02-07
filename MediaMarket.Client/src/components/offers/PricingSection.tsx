import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OfferFormData } from '@/types/offerForm';

interface PricingSectionProps {
  form: UseFormReturn<OfferFormData>;
}

export const PricingSection = ({ form }: PricingSectionProps) => {
  const formData = form.watch();
  // Urči pricingType - ak nie je nastavený, skús ho odvodiť z existujúcich hodnôt
  const pricingType = formData.pricingType || 
    (formData.pricePerUnit && parseFloat(formData.pricePerUnit) > 0 ? 'unit' : 
     formData.cpt && parseFloat(formData.cpt) > 0 ? 'cpt' : undefined);

  const handlePricingTypeChange = (value: 'unit' | 'cpt') => {
    form.setValue('pricingType', value);
    // Vymaž druhé pole pri zmene typu
    if (value === 'unit') {
      form.setValue('cpt', '');
    } else {
      form.setValue('pricePerUnit', '');
    }
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold text-lg mb-2">Cena</h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Typ ceny *</Label>
          <RadioGroup 
            value={pricingType} 
            onValueChange={(value) => handlePricingTypeChange(value as 'unit' | 'cpt')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unit" id="pricing-unit" />
              <Label htmlFor="pricing-unit" className="cursor-pointer font-normal">
                Cena za ks (Kč bez DPH)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cpt" id="pricing-cpt" />
              <Label htmlFor="pricing-cpt" className="cursor-pointer font-normal">
                CPT - cena za tisíc zobrazení (Kč)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {pricingType === 'unit' && (
          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">Cena za ks (Kč bez DPH) *</Label>
            <Input 
              id="pricePerUnit" 
              type="number" 
              placeholder="45000" 
              value={formData.pricePerUnit}
              onChange={(e) => form.setValue('pricePerUnit', e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        )}

        {pricingType === 'cpt' && (
          <div className="space-y-2">
            <Label htmlFor="cpt">CPT - cena za tisíc zobrazení (Kč) *</Label>
            <Input 
              id="cpt" 
              type="number" 
              placeholder="90" 
              value={formData.cpt}
              onChange={(e) => form.setValue('cpt', e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minOrderValue">Minimální hodnota objednávky (Kč)</Label>
          <Input 
            id="minOrderValue" 
            type="number" 
            placeholder="20000" 
            value={formData.minOrderValue}
            onChange={(e) => form.setValue('minOrderValue', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Nepovinné</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPercent">Sleva (%)</Label>
          <Input 
            id="discountPercent" 
            type="number" 
            min="0"
            max="100"
            placeholder="0" 
            value={formData.discountPercent}
            onChange={(e) => form.setValue('discountPercent', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">0-100%</p>
        </div>
      </div>
    </div>
  );
};
