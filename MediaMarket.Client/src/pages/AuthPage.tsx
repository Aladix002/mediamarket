import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

const AuthPage = () => {
  const { setRole } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    role: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      const response = await apiClient.auth.register({
        requestBody: {
          email: formData.email,
          password: formData.password,
          companyName: formData.company,
          contactName: formData.name,
          phone: formData.phone,
          role: formData.role === 'agency' ? 0 : formData.role === 'media' ? 1 : 0,
        },
      });

      if (response.success) {
        // Nastav rolu v contextu
        setRole(formData.role as 'agency' | 'media');
        
        toast({
          title: 'Úspech',
          description: 'Registrácia bola úspešná. Overte si email.',
        });

        setSubmitted(true);
      } else {
        toast({
          title: 'Chyba',
          description: response.message || 'Nepodarilo sa zaregistrovat',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodarilo sa zaregistrovat',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">
            Žádost byla odeslána
          </h1>
          <p className="text-muted-foreground mb-6">
            Děkujeme za váš zájem o MediaMarket. Ozveme se vám do 24 hodin s přístupovými údaji.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Odeslat další žádost
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Požádat o beta přístup
          </h1>
          <p className="text-muted-foreground">
            MediaMarket je momentálně v uzavřené beta verzi. Vyplňte formulář a přidáme vás na seznam.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Jméno a příjmení</Label>
            <Input
              id="name"
              placeholder="Jan Novák"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Firma</Label>
            <Input
              id="company"
              placeholder="Název společnosti"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="jan@firma.cz"
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimálne 8 znakov"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Jsem</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              required
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Vyberte roli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agency">Agentura / Zadavatel</SelectItem>
                <SelectItem value="media">Médium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrujem...
              </>
            ) : (
              'Odeslat žádost'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Odesláním souhlasíte se zpracováním osobních údajů za účelem vytvoření účtu.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
