import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContextMods';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(true);
  
  const { resetPassword, verifyResetToken } = useAuth();

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação não encontrado');
      setTokenChecking(false);
      return;
    }

    const validateToken = async () => {
      try {
        const result = await verifyResetToken(token);
        if (result.success) {
          setTokenValid(true);
        } else {
          setError('Token de recuperação inválido ou expirado');
        }
      } catch (error) {
        setError('Erro ao verificar token de recuperação');
      } finally {
        setTokenChecking(false);
      }
    };

    validateToken();
  }, [token, verifyResetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Por favor, insira uma nova senha');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await resetPassword(token, password);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Ocorreu um erro ao redefinir a senha');
    } finally {
      setLoading(false);
    }
  };

  if (tokenChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-12 left-0 z-10"
          >
            <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
              <CardContent className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Verificando token...</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-12 left-0 z-10"
          >
            <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-minecraft text-primary flex items-center justify-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Token inválido
                </CardTitle>
                <CardDescription className="mb-16">
                  O link de recuperação é inválido ou expirou
                </CardDescription>
                <Separator className="bg-border/30" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error || 'Este link de recuperação não é válido ou já expirou.'}
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Solicite um novo link de recuperação de senha.
                  </p>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/95 hover:to-purple-500/95 text-white transition-all duration-200 hover:shadow-md hover:shadow-primary/20">
                    <Link to="/forgot-password">
                      Solicitar novo link
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-12 left-0 z-10"
          >
            <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-minecraft text-primary flex items-center justify-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Senha redefinida!
                </CardTitle>
                <CardDescription className="mb-16">
                  Sua senha foi alterada com sucesso
                </CardDescription>
                <Separator className="bg-border/30" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Você será redirecionado para a página de login em alguns segundos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-12 left-0 z-10"
        >
          <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o login
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="!bg-transparent bg-gradient-to-r from-primary/10 via-purple-600/10 to-primary/10 border border-primary/20 shadow-xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-minecraft text-primary flex items-center justify-center gap-3">
                <KeyRound className="h-5 w-5 text-primary" />
                Nova senha
              </CardTitle>
              <CardDescription className="mb-16">
                Digite sua nova senha para redefinir sua conta
              </CardDescription>
              <Separator className="bg-border/30" />
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Nova senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua nova senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar nova senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/95 hover:to-purple-500/95 text-white transition-all duration-200 hover:shadow-md hover:shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="mb-6 bg-border/30" />
                <p className="text-sm text-muted-foreground text-center">
                  Lembrou sua senha?{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Faça login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

