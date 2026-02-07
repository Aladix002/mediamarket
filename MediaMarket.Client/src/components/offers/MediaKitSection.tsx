import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const MediaKitSection = () => {
  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h2 className="font-semibold text-lg mb-2">Přílohy</h2>
      
      <div className="space-y-2">
        <Label>Media kit (PDF)</Label>
        <Input type="file" accept=".pdf" disabled />
        <p className="text-xs text-muted-foreground">Upload je v této verzi nedostupný</p>
      </div>
    </div>
  );
};
