import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { MediaTypeMap, OfferTagMap, OfferStatusMap, PricingModelMap } from '@/api/mappers';
import { toast } from '@/hooks/use-toast';

const AddOffer = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    mediaType: '',
    format: '',
    pricePerUnit: '',
    cpt: '',
    minOrderValue: '',
    validFrom: '',
    validTo: '',
    description: '',
    whatsIncluded: '',
    technicalConditionsText: '',
    technicalConditionsPdf: null as File | null,
    technicalConditionsUrl: '',
    deadline: '',
    lastOrderDate: '',
    requireFinalClient: false,
  });

  // Tag checkboxes
  const [tags, setTags] = useState({
    'last-minute': false,
    'speciál': false,
    'akce': false,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (action: 'draft' | 'publish') => {
    try {
      setSubmitting(true);

      // Získaj mediaUserId z kontextu (uložené po prihlásení)
      const mediaUserId = userId;
      if (!mediaUserId) {
        toast({
          title: 'Chyba',
          description: 'Musíte být přihlášeni pro vytvoření nabídky',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // Konvertuj tags na flags enum
      let tagsValue: 0 | 1 | 2 | 4 = 0;
      if (tags['akce']) tagsValue = (tagsValue | 1) as 0 | 1 | 2 | 4;
      if (tags['speciál']) tagsValue = (tagsValue | 2) as 0 | 1 | 2 | 4;
      if (tags['last-minute']) tagsValue = (tagsValue | 4) as 0 | 1 | 2 | 4;

      // Urči pricing model
      const pricingModel = formData.pricePerUnit ? PricingModelMap.unit : PricingModelMap.cpt;

      const response = await apiClient.offers.createOffer({
        mediaUserId,
        requestBody: {
          title: formData.title,
          mediaType: MediaTypeMap[formData.mediaType as keyof typeof MediaTypeMap] || 0,
          format: formData.format,
          description: formData.description,
          pricingModel,
          unitPrice: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : null,
          cpt: formData.cpt ? parseFloat(formData.cpt) : null,
          minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
          discountPercent: 0, // TODO: Pridať do formulára
          tags: tagsValue,
          deadlineAssetsAt: formData.deadline || null,
          lastOrderDay: formData.lastOrderDate || null,
          validFrom: formData.validFrom,
          validTo: formData.validTo,
          technicalConditionsText: formData.technicalConditionsText || null,
          technicalConditionsUrl: formData.technicalConditionsUrl || null,
        },
      });

      // Ak je publish, publikuj ponuku
      if (action === 'publish' && response.id) {
        await apiClient.offers.publishOffer({ id: response.id });
      }

      toast({
        title: 'Úspech',
        description: action === 'publish' ? 'Ponuka bola úspešne publikovaná' : 'Ponuka bola uložená ako draft',
      });

      navigate('/media');
    } catch (error) {
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodarilo sa vytvorit ponuku',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagChange = (tag: keyof typeof tags) => {
    setTags(prev => ({ ...prev, [tag]: !prev[tag] }));
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
          {/* Basic info */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-2">Základní informace</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title">Název nabídky *</Label>
              <Input 
                id="title" 
                placeholder="např. Prémiový banner na homepage" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required 
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ média *</Label>
                <Select 
                  value={formData.mediaType}
                  onValueChange={(value) => setFormData({ ...formData, mediaType: value })}
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
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, whatsIncluded: e.target.value })}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-2">Cena</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Cena za ks (Kč bez DPH)</Label>
                <Input 
                  id="pricePerUnit" 
                  type="number" 
                  placeholder="45000" 
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpt">CPT - cena za tisíc zobrazení (Kč)</Label>
                <Input 
                  id="cpt" 
                  type="number" 
                  placeholder="90" 
                  value={formData.cpt}
                  onChange={(e) => setFormData({ ...formData, cpt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Minimální hodnota objednávky (Kč)</Label>
              <Input 
                id="minOrderValue" 
                type="number" 
                placeholder="20000" 
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Nepovinné</p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-2">Štítky nabídky</h2>
            <p className="text-sm text-muted-foreground mb-4">Vyberte štítky, které se zobrazí u nabídky</p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-lastminute" 
                  checked={tags['last-minute']}
                  onCheckedChange={() => handleTagChange('last-minute')}
                />
                <Label htmlFor="tag-lastminute" className="cursor-pointer">Last minute</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-special" 
                  checked={tags['speciál']}
                  onCheckedChange={() => handleTagChange('speciál')}
                />
                <Label htmlFor="tag-special" className="cursor-pointer">Speciál</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tag-akce" 
                  checked={tags['akce']}
                  onCheckedChange={() => handleTagChange('akce')}
                />
                <Label htmlFor="tag-akce" className="cursor-pointer">Akce</Label>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-2">Platnost a termíny</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Platnost nabídky od *</Label>
                <Input 
                  id="validFrom" 
                  type="date" 
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Platnost nabídky do *</Label>
                <Input 
                  id="validTo" 
                  type="date" 
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline na dodání podkladů</Label>
                <Input 
                  id="deadline" 
                  placeholder="3 pracovní dny před spuštěním" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastOrderDate">Poslední možný den objednání</Label>
                <Input 
                  id="lastOrderDate" 
                  type="date" 
                  value={formData.lastOrderDate}
                  onChange={(e) => setFormData({ ...formData, lastOrderDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Technical conditions */}
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
                onChange={(e) => setFormData({ ...formData, technicalConditionsText: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Nahrát PDF s technickými podmínkami</Label>
              <Input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFormData({ ...formData, technicalConditionsPdf: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground">Maximální velikost souboru: 10 MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalConditionsUrl">Odkaz na technické podmínky</Label>
              <Input 
                id="technicalConditionsUrl" 
                type="url"
                placeholder="https://example.com/specs" 
                value={formData.technicalConditionsUrl}
                onChange={(e) => setFormData({ ...formData, technicalConditionsUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Final client requirement */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-2">Požadavky na objednávku</h2>
            
            <div className="flex items-start space-x-3 p-4 bg-secondary rounded-lg">
              <Checkbox 
                id="requireFinalClient" 
                checked={formData.requireFinalClient}
                onCheckedChange={(checked) => setFormData({ ...formData, requireFinalClient: checked as boolean })}
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

          {/* Media kit */}
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-2">Přílohy</h2>
            
            <div className="space-y-2">
              <Label>Media kit (PDF)</Label>
              <Input type="file" accept=".pdf" disabled />
              <p className="text-xs text-muted-foreground">Upload je v této verzi nedostupný</p>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSubmit('draft')} 
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Uložit draft
                </>
              )}
            </Button>
            <Button 
              type="button" 
              onClick={() => handleSubmit('publish')} 
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publikujem...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publikovat
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOffer;
