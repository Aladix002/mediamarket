import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, CheckCircle2, XCircle, Lock, Eye, EyeOff } from 'lucide-react';
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
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
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
          // companyName sa neposiela - nie je možné ho meniť
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Chyba',
        description: 'Hesla se neshodují',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Chyba',
        description: 'Nové heslo musí mít minimálně 8 znaků',
        variant: 'destructive',
      });
      return;
    }

    // Validácia - heslo musí obsahovať aspoň jedno písmeno a aspoň jednu číslicu
    const hasLetter = /[a-zA-Z]/.test(passwordData.newPassword);
    const hasDigit = /[0-9]/.test(passwordData.newPassword);
    if (!hasLetter || !hasDigit) {
      toast({
        title: 'Chyba',
        description: 'Nové heslo musí obsahovat alespoň jedno písmeno a alespoň jednu číslici',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingPassword(true);

      // Zavolaj backend endpoint - musíme ho pridať do API client
      // Pre teraz použijeme fetch priamo
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5234'}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Úspěch',
          description: 'Heslo bylo úspěšně změněno',
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
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
      setChangingPassword(false);
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
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Název společnosti není možné změnit</p>
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

        {/* Sekcia na zmenu hesla */}
        <div className="bg-card rounded-xl border p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Změna hesla</h2>
              <p className="text-sm text-muted-foreground">Změňte své heslo pro zvýšení bezpečnosti</p>
            </div>
            {!showPasswordForm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Změnit heslo
              </Button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Aktuální heslo</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Zadejte aktuální heslo"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nové heslo</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Zadejte nové heslo (min. 8 znaků)"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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

              <div className="flex gap-4">
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Měním...
                    </>
                  ) : (
                    'Změnit heslo'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setShowPasswords({
                      current: false,
                      new: false,
                      confirm: false,
                    });
                  }}
                  disabled={changingPassword}
                >
                  Zrušit
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
