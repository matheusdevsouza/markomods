import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

const ConfirmAccountDeletionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!token) {
      setError('Token de confirmação não encontrado');
      setTokenChecking(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/account/delete/verify?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setTokenValid(true);
        } else {
          setError('Token de confirmação inválido ou expirado');
        }
      } catch (error) {
        setError('Erro ao verificar token de confirmação');
      } finally {
        setTokenChecking(false);
      }
    };

    validateToken();
  }, [token, API_BASE_URL]);

  const handleConfirmDeletion = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/account/delete/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 3000);
      } else {
        setError(data.message || 'Erro ao confirmar exclusão da conta');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  if (tokenChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Verificando token de confirmação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Conta Excluída</CardTitle>
            <CardDescription className="text-base">
              Sua conta foi excluída permanentemente com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Você será redirecionado para a página inicial em alguns segundos...
              </AlertDescription>
            </Alert>
            <Link to="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ir para a Página Inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">Token Inválido</CardTitle>
            <CardDescription className="text-base">
              {error || 'Token de confirmação inválido ou expirado'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a Página Inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">
            Confirmar Exclusão de Conta
          </CardTitle>
          <CardDescription className="text-base">
            Esta ação é permanente e não pode ser desfeita
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Ao confirmar, sua conta será permanentemente excluída e todos os seus dados serão removidos.
            </AlertDescription>
          </Alert>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
              Serão excluídos permanentemente:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
              <li>Seu perfil e informações pessoais</li>
              <li>Seus mods e conteúdo criado</li>
              <li>Seus comentários e interações</li>
              <li>Seus favoritos e downloads</li>
              <li>Todo o histórico de atividades</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleConfirmDeletion}
              disabled={loading}
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo conta...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sim, Excluir Minha Conta Permanentemente
                </>
              )}
            </Button>
            
            <Link to="/">
              <Button variant="outline" className="w-full" disabled={loading}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar e Voltar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmAccountDeletionPage;

