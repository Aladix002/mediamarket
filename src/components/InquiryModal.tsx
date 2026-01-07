import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Offer, Inquiry } from '@/data/mockData';

interface InquiryModalProps {
  offer: Offer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InquiryModal = ({ offer, open, onOpenChange }: InquiryModalProps) => {
  const { addInquiry } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    term: '',
    budget: '',
    note: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      offerId: offer.id,
      offerTitle: offer.title,
      mediaName: offer.mediaName,
      status: 'nová',
      createdAt: new Date().toISOString().split('T')[0],
      ...formData,
    };

    addInquiry(newInquiry);
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        term: '',
        budget: '',
        note: '',
        contactPerson: '',
        email: '',
        phone: '',
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
              Poptávka byla odeslána
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Děkujeme za váš zájem. Médium vás bude kontaktovat s nabídkou do 48 hodin.
            </DialogDescription>
            <Button onClick={handleClose} className="mt-6">
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
            Nezávazná poptávka
          </DialogTitle>
          <DialogDescription>
            Vyplňte formulář a médium vás bude kontaktovat s konkrétní nabídkou.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm font-medium">{offer.title}</p>
            <p className="text-xs text-muted-foreground">{offer.mediaName}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="term">Preferovaný termín</Label>
              <Input
                id="term"
                placeholder="např. únor 2026"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Orientační rozpočet</Label>
              <Input
                id="budget"
                placeholder="např. 50 000 - 80 000 Kč"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Poznámka k poptávce</Label>
            <Textarea
              id="note"
              placeholder="Popište vaše požadavky, cíle kampaně, cílovou skupinu..."
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Kontaktní údaje</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="contactPerson">Kontaktní osoba</Label>
                <Input
                  id="contactPerson"
                  placeholder="Jméno a příjmení"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.cz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+420 xxx xxx xxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Zrušit
            </Button>
            <Button type="submit" className="flex-1">
              Odeslat poptávku
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryModal;
