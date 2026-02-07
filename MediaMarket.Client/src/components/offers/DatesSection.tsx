import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { OfferFormData } from '@/types/offerForm';

interface DatesSectionProps {
  form: UseFormReturn<OfferFormData>;
}

export const DatesSection = ({ form }: DatesSectionProps) => {
  const formData = form.watch();

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold text-lg mb-2">Platnost a termíny</h2>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Platnost nabídky od *</Label>
          <Input 
            id="validFrom" 
            type="date" 
            value={formData.validFrom}
            onChange={(e) => form.setValue('validFrom', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validTo">Platnost nabídky do *</Label>
          <Input 
            id="validTo" 
            type="date" 
            value={formData.validTo}
            onChange={(e) => form.setValue('validTo', e.target.value)}
            min={formData.validFrom || new Date().toISOString().split('T')[0]}
            required 
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline na dodání podkladů</Label>
          <Input 
            id="deadline" 
            type="date"
            value={formData.deadline}
            onChange={(e) => form.setValue('deadline', e.target.value)}
            min={formData.validFrom || new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-muted-foreground">Nepovinné, minimálně od data platnosti nabídky</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastOrderDate">Poslední možný den objednání</Label>
          <Input 
            id="lastOrderDate" 
            type="date" 
            value={formData.lastOrderDate}
            onChange={(e) => form.setValue('lastOrderDate', e.target.value)}
            min={formData.validFrom || new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-muted-foreground">Nepovinné, minimálně od data platnosti nabídky</p>
        </div>
      </div>
    </div>
  );
};
