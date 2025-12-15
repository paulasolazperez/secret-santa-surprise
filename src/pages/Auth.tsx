import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Snowfall from '@/components/Snowfall';
import { Gift, Sparkles } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email o contraseña incorrectos');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('¡Bienvenido de nuevo!');
          navigate('/');
        }
      } else {
        if (!displayName.trim()) {
          toast.error('Por favor, introduce tu nombre');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este email ya está registrado');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('¡Cuenta creada! Bienvenido');
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden">
      <Snowfall />
      
      <div className="absolute inset-0 bg-gradient-festive opacity-50" />
      
      <Card className="w-full max-w-md z-10 glow-gold border-primary/30 mx-4">
        <CardHeader className="text-center space-y-3 sm:space-y-4 pb-4 sm:pb-6">
          <div className="flex justify-center">
            <div className="relative">
              <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-primary animate-float" />
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-gold-light absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-twinkle" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-gradient-gold">
            Amigo Invisible
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            {isLogin ? 'Inicia sesión para ver tu amigo secreto' : 'Crea tu cuenta para participar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground text-sm">Tu nombre</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="¿Cómo te llamas?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  className="h-12 text-base"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full h-12 text-base" disabled={loading}>
              {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>
          <div className="mt-5 sm:mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-gold-light transition-colors text-sm py-2"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
          <div className="mt-3 sm:mt-4 text-center pb-2">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm py-2 inline-block">
              ← Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
