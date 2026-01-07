import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">M</span>
            </div>
            <span className="font-display font-semibold text-foreground">MediaMarket</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Obchodní podmínky
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Ochrana soukromí
            </Link>
            <a href="mailto:info@mediamarket.cz" className="hover:text-primary transition-colors">
              Kontakt
            </a>
          </nav>

          <p className="text-xs text-muted-foreground">
            © 2026 MediaMarket. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
