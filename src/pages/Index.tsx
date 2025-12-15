import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Snowfall from '@/components/Snowfall';
import { Gift, Sparkles, Users, Shuffle, Eye } from 'lucide-react';
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <Snowfall />
        <div className="text-primary animate-pulse text-xl">Cargando...</div>
      </div>;
  }
  if (user) {
    return <Dashboard />;
  }
  return <div className="min-h-screen min-h-[100dvh] relative overflow-hidden">
      <Snowfall />
      <div className="absolute inset-0 bg-gradient-festive opacity-40" />
      
      <div className="relative z-10 container mx-auto px-4 py-10 sm:py-16 flex flex-col items-center pb-safe">
        <header className="text-center mb-10 sm:mb-16 animate-float">
          <div className="relative inline-block mb-4 sm:mb-6">
            <Gift className="w-16 h-16 sm:w-24 sm:h-24 text-primary" />
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold-light absolute -top-1 sm:-top-2 -right-2 sm:-right-4 animate-twinkle" />
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-gold-light absolute -bottom-0 sm:-bottom-1 -left-2 sm:-left-3 animate-twinkle" style={{
            animationDelay: '0.5s'
          }} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-3 sm:mb-4 text-gradient-gold">
            Amigo Invisible
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-lg mx-auto px-4">Haz tu amigo invisible desde donde quieras perra</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-14 sm:mb-20 w-full sm:w-auto px-4 sm:px-0">
          <Link to="/auth?mode=login" className="w-full sm:w-auto">
            <Button variant="gold" size="xl" className="w-full py-6 sm:py-4 text-base">
              Iniciar sesión
            </Button>
          </Link>
          <Link to="/auth?mode=signup" className="w-full sm:w-auto">
            <Button variant="outline" size="xl" className="w-full py-6 sm:py-4 text-base border-primary text-primary hover:bg-primary/10">
              Registrarte
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl w-full px-4 sm:px-0">
          <FeatureCard icon={<Users className="w-8 h-8 sm:w-10 sm:h-10" />} title="Crea tu grupo" description="Crea tu grupo con quien te salga de la picha y que se una cualquiera desde donde quiera" />
          <FeatureCard icon={<Shuffle className="w-8 h-8 sm:w-10 sm:h-10" />} title="Sorteo automático" description="NO tienes que hacer nada puto vago solo con un click se hace el sorteo" />
          <FeatureCard icon={<Eye className="w-8 h-8 sm:w-10 sm:h-10" />} title="Secreto garantizado" description="Solo puedes ver tu al subnormal que te ha tocado, los demas cotillas no" />
        </div>

        <footer className="mt-14 sm:mt-20 text-center text-muted-foreground text-xs sm:text-sm">
          <p>Hecho por Paula Solaz Pérez</p>
        </footer>
      </div>
    </div>;
};
const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => <div className="glass-card rounded-xl p-5 sm:p-6 text-center hover:glow-gold transition-all duration-300 group active:scale-[0.98]">
    <div className="text-primary mb-3 sm:mb-4 flex justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
  </div>;
import Dashboard from './Dashboard';
export default Index;