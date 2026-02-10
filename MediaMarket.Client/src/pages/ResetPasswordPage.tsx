import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccessToken, setRefreshToken, setUserId, setRole } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  useEffect(() => {
    // Supabase posiela access_token v hash fragmente po kliknutí na link z emailu
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const token = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (token && type === 'recovery') {
        // Máme access_token z reset password linku
        setAccessTokenState(token);
      }
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      toast({
        title: 'Chyba',
        description: 'Neplatný nebo expirovaný odkaz. Požádejte o nový reset hesla.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Chyba',
        description: 'Hesla se neshodují',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Chyba',
        description: 'Nové heslo musí mít minimálně 8 znaků',
        variant: 'destructive',
      });
      return;
    }

    // Validácia - heslo musí obsahovať aspoň jedno písmeno a aspoň jednu číslicu
    const hasLetter = /[a-zA-Z]/.test(formData.newPassword);
    const hasDigit = /[0-9]/.test(formData.newPassword);
    if (!hasLetter || !hasDigit) {
      toast({
        title: 'Chyba',
        description: 'Nové heslo musí obsahovat alespoň jedno písmeno a alespoň jednu číslici',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Použijeme náš backend endpoint pre reset hesla
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5234'}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        // Ak response nie je JSON, zobraz generickú chybu
        toast({
          title: 'Chyba',
          description: `Chyba ${response.status}: ${response.statusText}`,
          variant: 'destructive',
        });
        return;
      }

      if (!response.ok) {
        // Zobraz detailnú chybovú správu
        console.error('Reset password error:', data);
        toast({
          title: 'Chyba',
          description: data.message || `Chyba ${response.status}: ${response.statusText}`,
          variant: 'destructive',
        });
        return;
      }

      if (data.success) {
        setPasswordReset(true);
        toast({
          title: 'Úspěch',
          description: 'Heslo bylo úspěšně změněno',
        });
        
        // Po úspešnom reset hesla, automaticky prihlás používateľa
        // Získaj user info pomocou access tokenu
        try {
          const userResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5234'}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            setAccessToken(accessToken);
            setUserId(user.id.toString());
            setRole(user.role.toLowerCase() === 'admin' ? 'admin' : user.role.toLowerCase() === 'media' ? 'media' : 'agency');
            
            setTimeout(() => {
              if (user.role.toLowerCase() === 'agency') {
                navigate('/agency');
              } else if (user.role.toLowerCase() === 'media') {
                navigate('/media');
              } else if (user.role.toLowerCase() === 'admin') {
                navigate('/admin');
              } else {
                navigate('/');
              }
            }, 2000);
          }
        } catch (error) {
          // Ak sa nepodarí získať user info, len presmeruj na login
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        toast({
          title: 'Chyba',
          description: data.message || 'Nepodařilo se změnit heslo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se změnit heslo',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-primary-foreground h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              Heslo bylo změněno
            </h1>
            <p className="text-muted-foreground">
              Vaše heslo bylo úspěšně změněno. Přesměrováváme vás...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              Neplatný odkaz
            </h1>
            <p className="text-muted-foreground">
              Odkaz na reset hesla je neplatný nebo expiroval.
            </p>
          </div>

          <div className="bg-card rounded-xl border p-6 space-y-4 text-center">
            <Button
              type="button"
              className="w-full"
              onClick={() => navigate('/forgot-password')}
            >
              Požádat o nový odkaz
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Zpět na přihlášení
            </Button>
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
            Nastavení nového hesla
          </h1>
          <p className="text-muted-foreground">
            Zadejte nové heslo pro váš účet
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="bg-card rounded-xl border p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nové heslo</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Zadejte nové heslo (min. 8 znaků)"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                minLength={8}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Heslo musí obsahovat minimálně 8 znaků, alespoň jedno písmeno a alespoň jednu číslici
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potvrzení nového hesla</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Zadejte nové heslo znovu"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Měním heslo...
              </>
            ) : (
              'Změnit heslo'
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => navigate('/login')}
            >
              Zpět na přihlášení
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
