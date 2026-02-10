import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useResendVerification } from '@/api/hooks';

const AuthPage = () => {
  const navigate = useNavigate();
  const { setRole, setUserId, setAccessToken, setRefreshToken } = useApp();
  const { resendVerification, loading: resending } = useResendVerification();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    role: '',
    phone: '',
    password: '',
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
      if (!formData.email.trim() || !formData.password || !formData.company.trim() || 
          !formData.name.trim() || !formData.phone.trim()) {
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
        companyName: formData.company.trim(),
        contactName: formData.name.trim(),
        phone: formData.phone.trim(),
        role: roleValue,
      };

      const response = await apiClient.auth.register({
        requestBody,
      });

      if (response.success && response.accessToken) {
        // Uloz token a user ID
        setAccessToken(response.accessToken);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      const response = await apiClient.auth.login({
        requestBody: {
          email: formData.email,
          password: formData.password,
        },
      });

      if (response.success && response.accessToken && response.user) {
        // Uloz token a user info
        setAccessToken(response.accessToken);
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }
        setUserId(response.user.id.toString());
        setRole(response.user.role.toLowerCase() as 'agency' | 'media' | 'admin');
        
        toast({
          title: 'Úspěch',
          description: 'Přihlášení bylo úspěšné',
        });

        // Presmeruj podla role
        if (response.user.role.toLowerCase() === 'agency') {
          navigate('/agency');
        } else if (response.user.role.toLowerCase() === 'media') {
          navigate('/media');
        } else if (response.user.role.toLowerCase() === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Skontroluj ci je problem s email verification
        const errorMessage = response.message || 'Nesprávné přihlašovací údaje';
        
        toast({
          title: 'Chyba',
          description: errorMessage,
          variant: 'destructive',
        });

        // Ak je problem s email verification, ponukni presmerovanie
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('verify')) {
          setTimeout(() => {
            if (confirm('Chcete ověřit email?')) {
              navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            }
          }, 2000);
        }
      }
    } catch (error) {
        toast({
          title: 'Chyba',
          description: error instanceof Error ? error.message : 'Nepodařilo se přihlásit',
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

  if (submitted && mode === 'register') {
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
          
          <Button onClick={() => {
            setSubmitted(false);
            setMode('login');
            setRegisteredEmail('');
          }} variant="outline">
            Přihlásit se
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
            {mode === 'login' ? 'Přihlášení' : 'Registrace'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login' 
              ? 'Přihlaste se do svého účtu'
              : 'Vytvořte si nový účet'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="bg-card rounded-xl border p-6 space-y-4">
          {mode === 'register' && (
            <>
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
            </>
          )}

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
              placeholder={mode === 'login' ? 'Heslo' : 'Minimálně 8 znaků'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={mode === 'register' ? 8 : undefined}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'login' ? 'Přihlašuji...' : 'Registruji...'}
              </>
            ) : (
              mode === 'login' ? 'Přihlásit se' : 'Registrovat se'
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setFormData({
                  name: '',
                  company: '',
                  email: '',
                  role: '',
                  phone: '',
                  password: '',
                });
              }}
            >
              {mode === 'login' 
                ? 'Nemáte účet? Zaregistrujte se'
                : 'Už máte účet? Přihlaste se'}
            </Button>
          </div>

          {mode === 'register' && (
            <p className="text-xs text-muted-foreground text-center">
              Odesláním souhlasíte se zpracováním osobních údajů za účelem vytvoření účtu.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
