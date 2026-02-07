import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OfferFormData } from '@/types/offerForm';

interface FinalClientRequirementSectionProps {
  form: UseFormReturn<OfferFormData>;
}

export const FinalClientRequirementSection = ({ form }: FinalClientRequirementSectionProps) => {
  const formData = form.watch();

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold text-lg mb-2">Požadavky na objednávku</h2>
      
      <div className="flex items-start space-x-3 p-4 bg-secondary rounded-lg">
        <Checkbox 
          id="requireFinalClient" 
          checked={formData.requireFinalClient}
          onCheckedChange={(checked) => form.setValue('requireFinalClient', checked as boolean)}
        />
        <div>
          <Label htmlFor="requireFinalClient" className="cursor-pointer font-medium">
            Nutné uvést finálního klienta
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Pokud zatrhnete, agentura bude muset v objednávce povinně uvést finálního klienta. 
            Tuto možnost využijte, pokud se cenové podmínky liší podle klienta.
          </p>
        </div>
      </div>
    </div>
  );
};
