import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Chyba',
        description: 'Prosím zadejte email',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5234'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailSent(true);
        toast({
          title: 'Úspěch',
          description: data.message || 'Email s instrukcemi na reset hesla byl odeslán',
        });
      } else {
        toast({
          title: 'Chyba',
          description: data.message || 'Nepodařilo se poslat email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se poslat email',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-primary-foreground h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              Email odeslán
            </h1>
            <p className="text-muted-foreground">
              Zkontrolujte svou emailovou schránku
            </p>
          </div>

          <div className="bg-card rounded-xl border p-6 space-y-4 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Poslali jsme vám email s instrukcemi na reset hesla na adresu <strong>{email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Zkontrolujte prosím svou emailovou schránku a klikněte na odkaz v emailu pro reset hesla.
            </p>
            <div className="pt-4 space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Zpět na přihlášení
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Poslat znovu
              </Button>
            </div>
          </div>
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
            Zapomněli jste heslo?
          </h1>
          <p className="text-muted-foreground">
            Zadejte svůj email a pošleme vám instrukce na reset hesla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="jan@firma.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Odesílám...
              </>
            ) : (
              'Odeslat instrukce'
            )}
          </Button>

          <div className="text-center">
            <Link to="/login">
              <Button type="button" variant="link">
                Zpět na přihlášení
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
