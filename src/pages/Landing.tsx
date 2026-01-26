import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OfferCard from '@/components/OfferCard';
import { mockOffers } from '@/data/mockData';
import { useApp } from '@/contexts/AppContext';
import { ArrowRight, Zap, MessageSquare, Handshake } from 'lucide-react';
import PartnersTicker from '@/components/PartnersTicker';

const Landing = () => {
  const { role } = useApp();
  const featuredOffers = mockOffers.filter(o => o.status === 'published').slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Nabídky mediálního prostoru na jednom místě
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Marketplace pro média a agentury. Formáty a ceny přehledně bez chaosu v emailech
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={role === 'visitor' ? '/auth' : '/media'}>
                <Button size="lg" className="btn-hero-secondary w-full sm:w-auto">
                  Nabízím mediální prostor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/offers">
                <Button size="lg" className="btn-hero-primary w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Hledám nabídky pro klienty
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">Jak to funguje</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Médium vloží nabídku</h3>
              <p className="text-muted-foreground text-sm">
                Akční plochy, last minute termíny, speciální balíčky – vše přehledně a rychle
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Agentura vybírá a poptává</h3>
              <p className="text-muted-foreground text-sm">
                Procházíte nabídky, filtrujete podle typu, termínu i ceny, poptáte jedním klikem
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Dohoda přímo mezi vámi</h3>
              <p className="text-muted-foreground text-sm">
                Jasné podmínky, předem daná provize pouze při uzavření objednávky
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Ticker */}
      <PartnersTicker />

      {/* Featured Offers */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="section-title">Ukázkové nabídky</h2>
            <Link to="/offers">
              <Button variant="outline">
                Zobrazit všechny
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} blurPrice />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="section-title mb-4">Připojte se k MediaMarket</h2>
            <p className="text-muted-foreground mb-8">
              Ať už jste médium hledající nové klienty, nebo agentura hledající výhodné nabídky – 
              MediaMarket je tu pro vás.
            </p>
            <Link to="/auth">
              <Button size="lg" className="btn-hero-primary">
                Požádat o přístup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
