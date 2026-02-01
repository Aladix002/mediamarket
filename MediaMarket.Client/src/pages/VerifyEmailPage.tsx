import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { useVerifyEmail, useResendVerification } from '@/api/hooks';
import { toast } from '@/hooks/use-toast';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, loading: verifying } = useVerifyEmail();
  const { resendVerification, loading: resending } = useResendVerification();
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [verified, setVerified] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Skus ziskat token z URL parametrov
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type') || 'signup';

    if (tokenParam) {
      setToken(tokenParam);
      handleVerify(tokenParam, typeParam);
    }

    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (verifyToken: string, type: string = 'signup') => {
    try {
      setError('');
      const response = await verifyEmail(verifyToken, type);
      if (response.success) {
        setVerified(true);
        setTimeout(() => {
          navigate('/auth?mode=login');
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se ověřit email');
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast({
        title: 'Chyba',
        description: 'Prosím zadejte email',
        variant: 'destructive',
      });
      return;
    }

    try {
      await resendVerification(email);
    } catch (err) {
      // Error je už zobrazený v hooku
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">
            Email byl úspěšně ověřen
          </h1>
          <p className="text-muted-foreground mb-6">
            Váš email byl úspěšně ověřen. Nyní se můžete přihlásit.
          </p>
          <Button onClick={() => navigate('/auth?mode=login')}>
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
            <Mail className="text-primary-foreground h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Ověření emailu
          </h1>
          <p className="text-muted-foreground">
            Zadejte token z emailu nebo pošlete znovu ověřovací email
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Ověřovací token</Label>
            <Input
              id="token"
              placeholder="Token z emailu"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={verifying}
            />
            <p className="text-xs text-muted-foreground">
              Token jste měli dostat v emailu po registraci
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium">Chyba</p>
                <p className="text-xs text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          <Button
            onClick={() => handleVerify(token, 'signup')}
            className="w-full"
            size="lg"
            disabled={!token || verifying}
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ověřuji...
              </>
            ) : (
              'Ověřit email'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Alebo</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="vas@email.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={resending}
            />
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={!email || resending}
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

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => navigate('/auth')}
            >
              Zpět na přihlášení
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
