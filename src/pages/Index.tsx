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
  return <div className="min-h-screen relative overflow-hidden">
      <Snowfall />
      <div className="absolute inset-0 bg-gradient-festive opacity-40" />
      
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        <header className="text-center mb-16 animate-float">
          <div className="relative inline-block mb-6">
            <Gift className="w-24 h-24 text-primary" />
            <Sparkles className="w-8 h-8 text-gold-light absolute -top-2 -right-4 animate-twinkle" />
            <Sparkles className="w-6 h-6 text-gold-light absolute -bottom-1 -left-3 animate-twinkle" style={{
            animationDelay: '0.5s'
          }} />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-gradient-gold">
            Amigo Invisible
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-lg mx-auto">Haz tu amigo invisible desde donde quieras perra</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/auth">
            <Button variant="gold" size="xl">
              <Gift className="w-5 h-5 mr-2" />
              Comenzar ahora
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl w-full">
          <FeatureCard icon={<Users className="w-10 h-10" />} title="Crea tu grupo" description="Crea tu grupo con quien te salga de la picha y que se una cualquiera desde donde quiera" />
          <FeatureCard icon={<Shuffle className="w-10 h-10" />} title="Sorteo automático" description="Con un clic, el sistema asigna aleatoriamente a quién regala cada participante." />
          <FeatureCard icon={<Eye className="w-10 h-10" />} title="Secreto garantizado" description="Solo tú puedes ver a quién te toca regalar. ¡Nadie más lo sabrá!" />
        </div>

        <footer className="mt-20 text-center text-muted-foreground text-sm">
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
}) => <div className="glass-card rounded-xl p-6 text-center hover:glow-gold transition-all duration-300 group">
    <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>;
import Dashboard from './Dashboard';
export default Index;