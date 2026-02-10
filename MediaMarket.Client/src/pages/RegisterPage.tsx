import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useResendVerification } from '@/api/hooks';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setRole, setUserId, setAccessToken, setRefreshToken } = useApp();
  const { resendVerification, loading: resending } = useResendVerification();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    role: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      // Validacia - skontroluj ci su vsetky polia vyplnene
      if (!formData.role) {
        toast({
          title: 'Chyba',
          description: 'Prosím vyberte roli',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Validacia - skontroluj ci su vsetky povinne polia vyplnene
      if (!formData.email.trim() || !formData.password || 
          !formData.name.trim() || !formData.phone.trim() || !formData.companyName.trim()) {
        toast({
          title: 'Chyba',
          description: 'Prosím vyplňte všechna povinná pole',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Validacia hesla
      if (formData.password.length < 8) {
        toast({
          title: 'Chyba',
          description: 'Heslo musí mít minimálně 8 znaků',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Validácia - heslo musí obsahovať aspoň jedno písmeno a aspoň jednu číslicu
      const hasLetter = /[a-zA-Z]/.test(formData.password);
      const hasDigit = /[0-9]/.test(formData.password);
      if (!hasLetter || !hasDigit) {
        toast({
          title: 'Chyba',
          description: 'Heslo musí obsahovat alespoň jedno písmeno a alespoň jednu číslici',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Validacia potvrdenia hesla
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Chyba',
          description: 'Hesla se musí shodovat',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Konvertuj role na číslo
      let roleValue: 0 | 1;
      if (formData.role === 'agency') {
        roleValue = 0;
      } else if (formData.role === 'media') {
        roleValue = 1;
      } else {
        toast({
          title: 'Chyba',
          description: 'Prosím vyberte roli (Agentura alebo Médium)',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      const requestBody = {
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        companyName: formData.companyName.trim(),
        contactName: formData.name.trim(),
        phone: formData.phone.trim(),
        role: roleValue,
      };

      const response = await apiClient.auth.register({
        requestBody,
      });

      if (response.success) {
        // Ak máme access token, automaticky prihlásime používateľa
        if (response.accessToken) {
          setAccessToken(response.accessToken);
          if (response.refreshToken) {
            setRefreshToken(response.refreshToken);
          }
          if (response.userId) {
            setUserId(response.userId.toString());
          }
          
          // Nastav rolu v contextu
          setRole(formData.role as 'agency' | 'media');
          
          toast({
            title: 'Úspěch',
            description: 'Registrace byla úspěšná. Jste přihlášeni.',
          });

          // Presmeruj podľa role
          if (formData.role === 'agency') {
            navigate('/agency');
          } else if (formData.role === 'media') {
            navigate('/media');
          } else {
            navigate('/');
          }
        } else {
          // Ak nie je access token (email musí byť overený), zobraz success screen
          setAccessToken(null);
          if (response.userId) {
            setUserId(response.userId.toString());
          }
          
          // Nastav rolu v contextu
          setRole(formData.role as 'agency' | 'media');
          
          // Uloz email pre resend verification
          setRegisteredEmail(formData.email);
          
          toast({
            title: 'Úspěch',
            description: response.message || 'Registrace byla úspěšná. Ověřte si email.',
          });

          setSubmitted(true);
        }
      } else {
        toast({
          title: 'Chyba',
          description: response.message || 'Nepodařilo se zaregistrovat',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      // Zobraz presnu chybovu spravu z backendu
      let errorMessage = 'Nepodařilo se zaregistrovat';
      
      // Skús získať správu z error body (môže byť parsed JSON)
      if (error?.body) {
        // Ak je body objekt s message property
        if (typeof error.body === 'object' && error.body.message) {
          let msg = error.body.message;
          
          // Ak je message JSON string, skús ho parsovať
          if (typeof msg === 'string' && msg.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(msg);
              // Skús nájsť user-friendly správu
              if (parsed.msg) {
                msg = parsed.msg;
              } else if (parsed.message) {
                msg = parsed.message;
              } else if (parsed.error) {
                msg = parsed.error;
              }
            } catch (e) {
              // Nie je validný JSON, použij pôvodnú správu
            }
          }
          
          // Prekladaj Supabase error messages na češtinu
          if (msg.includes('email rate limit exceeded')) {
            errorMessage = 'Příliš mnoho pokusů o registraci. Zkuste to prosím později nebo použijte jiný email.';
          } else if (msg.includes('User already registered')) {
            errorMessage = 'Uživatel s tímto emailem již existuje. Zkuste se přihlásit.';
          } else if (msg.includes('Password')) {
            errorMessage = 'Heslo nevyhovuje požadavkům. Zkuste silnější heslo.';
          } else {
            errorMessage = msg;
          }
        }
        // Ak je body string (JSON string)
        else if (typeof error.body === 'string') {
          try {
            const parsed = JSON.parse(error.body);
            if (parsed.message) {
              errorMessage = parsed.message;
            }
          } catch (e) {
            // Nie je JSON, použij body ako message
            errorMessage = error.body;
          }
        }
        // Ak je body objekt, ale message nie je priamo v ňom, skús ho nájsť
        else if (typeof error.body === 'object') {
          // Skús rôzne možné cesty k message
          errorMessage = error.body.message || error.body.error || error.body.error_description || errorMessage;
        }
      }
      // Skús získať správu z response (ak existuje)
      else if (error?.response) {
        try {
          const responseData = await error.response.json();
          if (responseData.message) {
            errorMessage = responseData.message;
          }
        } catch (e) {
          // Ignore
        }
      }
      // Fallback na error message
      else if (error?.message) {
        errorMessage = error.message;
      }
      // Fallback na string
      else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    try {
      await resendVerification(registeredEmail);
    } catch (error) {
      // Error je už zobrazený v hooku
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
            Registrace úspěšná
          </h1>
          <p className="text-muted-foreground mb-6">
            Děkujeme za registraci. Poslali jsme vám email s odkazem na ověření. Po ověření emailu se můžete přihlásit.
          </p>
          
          {registeredEmail && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Email byl poslán na: <strong>{registeredEmail}</strong>
              </p>
              <Button
                onClick={handleResendVerification}
                variant="outline"
                size="sm"
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posílám...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Poslat znovu ověřovací email
                  </>
                )}
              </Button>
            </div>
          )}
          
          <Link to="/login">
            <Button variant="outline">
              Přihlásit se
            </Button>
          </Link>
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
            Registrace
          </h1>
          <p className="text-muted-foreground">
            Vytvořte si nový účet
          </p>
        </div>

        <form onSubmit={handleRegister} className="bg-card rounded-xl border p-6 space-y-4">
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
            <Label htmlFor="companyName">Názov firmy</Label>
            <Input
              id="companyName"
              placeholder="Název společnosti"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimálně 8 znaků"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Heslo musí obsahovat minimálně 8 znaků, alespoň jedno písmeno a alespoň jednu číslici
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potvrdenie hesla</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Zopakujte heslo"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registruji...
              </>
            ) : (
              'Registrovat se'
            )}
          </Button>

          <div className="text-center">
            <Link to="/login">
              <Button type="button" variant="link">
                Už máte účet? Přihlaste se
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Odesláním souhlasíte se zpracováním osobních údajů za účelem vytvoření účtu.
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
