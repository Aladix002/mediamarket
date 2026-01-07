import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddOffer = () => {
  const navigate = useNavigate();
  const [lastMinute, setLastMinute] = useState(false);

  const handleSubmit = (action: 'draft' | 'publish') => {
    // Mock action - just navigate back
    navigate('/media');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/media" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zpět na dashboard
        </Link>

        <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">Nová nabídka</h1>

        <form className="space-y-6">
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Název nabídky *</Label>
              <Input id="title" placeholder="např. Prémiový banner na homepage" required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ média *</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Vyberte typ" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="radio">Rádio</SelectItem>
                    <SelectItem value="ooh">OOH</SelectItem>
                    <SelectItem value="print">Print</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Formát *</Label>
                <Input id="format" placeholder="např. Leaderboard 970x250" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Cena od (bez DPH) *</Label>
                <Input id="price" type="number" placeholder="45000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validFrom">Platnost od *</Label>
                <Input id="validFrom" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Platnost do *</Label>
                <Input id="validTo" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis nabídky *</Label>
              <Textarea id="description" rows={3} placeholder="Popište nabídku..." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="included">Co je v ceně (každý bod na nový řádek)</Label>
              <Textarea id="included" rows={3} placeholder="500 000 impresí&#10;Kreativní konzultace&#10;Reporty" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Podmínky</Label>
              <Textarea id="terms" rows={2} placeholder="Podklady ve formátu..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline na dodání podkladů</Label>
              <Input id="deadline" placeholder="3 pracovní dny před spuštěním" />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-medium">Last minute nabídka</p>
                <p className="text-sm text-muted-foreground">Označí nabídku jako urgentní</p>
              </div>
              <Switch checked={lastMinute} onCheckedChange={setLastMinute} />
            </div>

            <div className="space-y-2">
              <Label>Media kit (PDF)</Label>
              <Input type="file" accept=".pdf" disabled />
              <p className="text-xs text-muted-foreground">Upload je v této verzi nedostupný</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => handleSubmit('draft')} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Uložit draft
            </Button>
            <Button type="button" onClick={() => handleSubmit('publish')} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Publikovat
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOffer;
