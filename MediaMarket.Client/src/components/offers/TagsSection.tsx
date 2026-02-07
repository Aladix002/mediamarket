import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OfferFormData, OfferTags } from '@/types/offerForm';

interface TagsSectionProps {
  form: UseFormReturn<OfferFormData>;
  tags: OfferTags;
  onTagsChange: (tags: OfferTags) => void;
}

export const TagsSection = ({ form, tags, onTagsChange }: TagsSectionProps) => {
  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold text-lg mb-2">Štítky nabídky</h2>
      <p className="text-sm text-muted-foreground mb-4">Vyberte štítky, které se zobrazí u nabídky</p>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="tag-lastminute" 
            checked={tags['last-minute']}
            onCheckedChange={() => onTagsChange({ ...tags, 'last-minute': !tags['last-minute'] })}
          />
          <Label htmlFor="tag-lastminute" className="cursor-pointer">Last minute</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="tag-special" 
            checked={tags['speciál']}
            onCheckedChange={() => onTagsChange({ ...tags, 'speciál': !tags['speciál'] })}
          />
          <Label htmlFor="tag-special" className="cursor-pointer">Speciál</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="tag-akce" 
            checked={tags['akce']}
            onCheckedChange={() => onTagsChange({ ...tags, 'akce': !tags['akce'] })}
          />
          <Label htmlFor="tag-akce" className="cursor-pointer">Akce</Label>
        </div>
      </div>
    </div>
  );
};
