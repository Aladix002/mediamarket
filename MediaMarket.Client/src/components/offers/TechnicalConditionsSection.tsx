import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OfferFormData } from '@/types/offerForm';

interface TechnicalConditionsSectionProps {
  form: UseFormReturn<OfferFormData>;
}

export const TechnicalConditionsSection = ({ form }: TechnicalConditionsSectionProps) => {
  const formData = form.watch();

  return (
    <>
      {/* TODO: V budúcnosti pridať možnosť nahrávania prílohy (PDF súbor) pre technické podmienky */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-lg mb-2">Technické podmínky</h2>
        <p className="text-sm text-muted-foreground mb-4">Zadejte technické podmínky jedním nebo více způsoby</p>
        
        <div className="space-y-2">
          <Label htmlFor="technicalConditionsText">Text technických podmínek</Label>
          <Textarea 
            id="technicalConditionsText" 
            rows={3} 
            placeholder="Podklady ve formátu HTML5 nebo statický JPG/PNG..." 
            value={formData.technicalConditionsText}
            onChange={(e) => form.setValue('technicalConditionsText', e.target.value)}
            maxLength={2000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technicalConditionsUrl">Odkaz na technické podmínky</Label>
          <Input 
            id="technicalConditionsUrl" 
            type="url"
            placeholder="https://example.com/specs" 
            value={formData.technicalConditionsUrl}
            onChange={(e) => form.setValue('technicalConditionsUrl', e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
