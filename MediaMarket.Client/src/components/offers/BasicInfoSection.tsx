import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfferFormData } from '@/types/offerForm';

interface BasicInfoSectionProps {
  form: UseFormReturn<OfferFormData>;
}

export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const formData = form.watch();

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold text-lg mb-2">Základní informace</h2>
      
      <div className="space-y-2">
        <Label htmlFor="title">Název nabídky *</Label>
        <Input 
          id="title" 
          placeholder="např. Prémiový banner na homepage" 
          value={formData.title}
          onChange={(e) => form.setValue('title', e.target.value)}
          maxLength={255}
          required 
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Typ média *</Label>
          <Select 
            value={formData.mediaType}
            onValueChange={(value) => form.setValue('mediaType', value)}
            required
          >
            <SelectTrigger><SelectValue placeholder="Vyberte typ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="rádio">Rádio</SelectItem>
              <SelectItem value="OOH">OOH</SelectItem>
              <SelectItem value="print">Print</SelectItem>
              <SelectItem value="sociální sítě">Sociální sítě</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="influenceři">Influenceři</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="format">Formát *</Label>
          <Input 
            id="format" 
            placeholder="např. Leaderboard 970x250" 
            value={formData.format}
            onChange={(e) => form.setValue('format', e.target.value)}
            maxLength={255}
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Popis nabídky *</Label>
        <Textarea 
          id="description" 
          rows={3} 
          placeholder="Popište nabídku..." 
          value={formData.description}
          onChange={(e) => form.setValue('description', e.target.value)}
          maxLength={2000}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="included">Co je v ceně (každý bod na nový řádek)</Label>
        <Textarea 
          id="included" 
          rows={3} 
          placeholder="500 000 impresí&#10;Kreativní konzultace&#10;Reporty" 
          value={formData.whatsIncluded}
          onChange={(e) => form.setValue('whatsIncluded', e.target.value)}
        />
      </div>
    </div>
  );
};
