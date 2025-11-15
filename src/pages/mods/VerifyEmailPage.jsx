import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextMods';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { currentUser, updateUser, setIsAuthenticated } = useAuth();
  const { closeVerificationModal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current || !token) {
      if (!token) {
        setError('Token de verificação não encontrado.');
        setLoading(false);
      }
      return;
    }
    
    hasVerified.current = true;
    
    const run = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email/${encodeURIComponent(token)}`);
        const data = await res.json();
        
        if (res.ok) {
          setSuccess(true);
          try { closeVerificationModal(); } catch {}
          
          try {
            const userResponse = await fetch(`/api/auth/verify`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.data && userData.data.user) {
                updateUser({ ...userData.data.user, is_verified: true });
                setIsAuthenticated(true);
                setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
              } else {
                setTimeout(() => navigate('/login', { replace: true }), 1500);
              }
            } else {
              setTimeout(() => navigate('/login', { replace: true }), 1500);
            }
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            setTimeout(() => navigate('/login', { replace: true }), 1500);
          }
        } else {
          if (data.message === 'Token já utilizado') {
            setError('Este link já foi usado. Faça login para acessar sua conta.');
          } else if (data.message === 'Token expirado') {
            setError('Este link expirou. Solicite um novo link de verificação.');
          } else {
            setError(data.message || 'Link inválido ou expirado');
          }
        }
      } catch (e) {
        setError('Erro de conexão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    run();
  }, [token, closeVerificationModal, navigate]);

  if (loading) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="minecraft-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-minecraft text-primary">E-mail verificado!</CardTitle>
              <CardDescription>Obrigado por confirmar seu e-mail. Sua conta está ativa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center">
              <Button asChild className="w-full minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/">Ir para a Home</Link>
              </Button>
              <Button asChild variant="outline" className="w-full minecraft-btn">
                <Link to="/login">Fazer login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="minecraft-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-minecraft text-primary">Link inválido</CardTitle>
            <CardDescription>{error || 'O link de verificação é inválido ou expirou.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
            <Button asChild className="w-full minecraft-btn bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;


