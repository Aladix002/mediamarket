import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useResendVerification } from '@/api/hooks';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { accessToken, setAccessToken, setUserId, setRole } = useApp();
  const { resendVerification, loading: resending } = useResendVerification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [accessToken]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.users.getMyProfile();
      
      if (response) {
        setFormData({
          companyName: response.companyName || '',
          contactName: response.contactName || '',
          phone: response.phone || '',
          email: response.email || '',
        });
        setEmailVerified(response.emailVerifiedAt !== null && response.emailVerifiedAt !== undefined);
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst profil',
        variant: 'destructive',
      });
      // Ak je token neplatný, odhlás používateľa
      if (error instanceof Error && error.message.includes('401')) {
        setAccessToken(null);
        setUserId(null);
        setRole('visitor');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const response = await apiClient.users.updateMyProfile({
        requestBody: {
          companyName: formData.companyName,
          contactName: formData.contactName,
          phone: formData.phone,
        },
      });

      if (response) {
        toast({
          title: 'Úspěch',
          description: 'Profil byl úspěšně aktualizován',
        });
      }
    } catch (error) {
        toast({
          title: 'Chyba',
          description: error instanceof Error ? error.message : 'Nepodařilo se aktualizovat profil',
          variant: 'destructive',
        });
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) return;
    
    try {
      await resendVerification(formData.email);
    } catch (error) {
      // Error je už zobrazený v hooku
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
      setUserId(null);
      setRole('visitor');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Můj profil</h1>
          <p className="text-muted-foreground">Spravujte své osobní údaje a nastavení</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">E-mail</Label>
              {emailVerified !== null && (
                <Badge variant={emailVerified ? "default" : "secondary"} className="flex items-center gap-1">
                  {emailVerified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Ověřený
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Neověřený
                    </>
                  )}
                </Badge>
              )}
            </div>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">E-mail není možné změnit</p>
              {emailVerified === false && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="text-xs h-auto p-0"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Posílám...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-1 h-3 w-3" />
                      Poslat znovu ověřovací email
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Název společnosti</Label>
            <Input
              id="companyName"
              placeholder="Název společnosti"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Kontaktní osoba</Label>
            <Input
              id="contactName"
              placeholder="Jméno a příjmení"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
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

          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                'Uložit změny'
              )}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleLogout}>
              Odhlásit se
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
