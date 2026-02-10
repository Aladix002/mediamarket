import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setRole, setUserId, setAccessToken, setRefreshToken } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
    } catch (error: any) {
        console.error('Login error:', error);
        
        // Skontroluj, či je to network error
        let errorMessage = 'Nepodařilo se přihlásit';
        
        if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || error?.message?.includes('blocked')) {
          errorMessage = 'Request byl blokován. Zkuste vypnout adblocker nebo jiné rozšíření prohlížeče.';
        } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
          errorMessage = 'Nelze se připojit k serveru. Zkontrolujte, zda backend běží na http://localhost:5234';
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Přihlášení
          </h1>
          <p className="text-muted-foreground">
            Přihlaste se do svého účtu
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl border p-6 space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Heslo</Label>
              <Link to="/forgot-password">
                <Button type="button" variant="link" className="text-xs h-auto p-0">
                  Zapomněli jste heslo?
                </Button>
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Heslo"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Přihlašuji...
              </>
            ) : (
              'Přihlásit se'
            )}
          </Button>

          <div className="text-center">
            <Link to="/register">
              <Button type="button" variant="link">
                Nemáte účet? Zaregistrujte se
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
