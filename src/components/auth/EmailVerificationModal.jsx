import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, AlertCircle, Repeat } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextMods';

const EmailVerificationModal = ({ open, onOpenChange }) => {
  const { currentUser, isAuthenticated, authenticatedFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      const res = await authenticatedFetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage('Email de verificação reenviado! Verifique sua caixa de entrada.');
        setCooldown(30);
      } else {
        throw new Error(data.message || 'Erro ao reenviar verificação');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const shouldOpen = open && currentUser && (currentUser.is_verified === 0 || currentUser.is_verified === false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <Dialog open={!!shouldOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px] border border-primary/20 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(109,40,217,.35)] animate-in fade-in-0 zoom-in-95 p-0 overflow-hidden">
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-b from-primary/12 via-primary/5 to-transparent">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center ring-1 ring-primary/30 shadow-inner">
            <Mail className="h-7 w-7" />
          </div>
        </div>

        <div className="px-8 pb-7 text-center">
          <h3 className="text-[22px] font-bold tracking-tight mb-2">Verifique seu e-mail</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[34ch] mx-auto">
            Enviamos um link de verificação para
            {' '}<span className="font-medium text-foreground">{currentUser?.email}</span>.{' '}
            Conclua a verificação para liberar todos os recursos da plataforma.
          </p>

          {message && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 px-4 py-2 text-xs">
              <CheckCircle className="h-4 w-4" />
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/30 px-4 py-2 text-xs">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center">
            <Button
              onClick={handleResend}
              disabled={loading || cooldown > 0}
              className="minecraft-btn bg-primary hover:bg-primary/85 text-primary-foreground px-6 py-4 rounded-xl shadow-md shadow-primary/25"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2"><Repeat className="h-4 w-4 animate-spin" /> Enviando...</span>
              ) : cooldown > 0 ? (
                <span className="inline-flex items-center gap-2"><Repeat className="h-4 w-4" /> Reenviar em {cooldown}s</span>
              ) : (
                <span>Reenviar e-mail</span>
              )}
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">Dica: verifique também as pastas <span className="font-medium">Spam</span> e <span className="font-medium">Promoções</span>.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;


