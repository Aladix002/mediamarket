import { useRef, useState, useEffect } from 'react';

const partners = [
  'Economia',
  'Mafra',
  'Vltava Labe Media',
  'CNC',
  'MediaClub',
  'Radiohouse',
  'Nova',
  'Burda',
  'Jaga media',
  'Areklama',
];

const PartnerLogo = ({ name }: { name: string }) => (
  <div 
    className="flex items-center justify-center px-6 py-3 mx-4 border border-border/50 rounded-lg bg-card/50 min-w-[140px] md:min-w-[160px]"
    role="img"
    aria-label={`Logo partnera ${name}`}
  >
    <span className="text-muted-foreground font-medium text-sm md:text-base whitespace-nowrap select-none">
      {name}
    </span>
  </div>
);

const PartnersTicker = () => {
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Duplicate partners for seamless loop
  const allPartners = [...partners, ...partners];

  return (
    <section className="py-12 md:py-16 bg-background overflow-hidden" aria-label="Partneři">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="section-title text-center">Partneři</h2>
        <p className="text-muted-foreground text-center mt-2">
          Ukázkový výběr mediálních domů a vydavatelství
        </p>
      </div>
      
      {/* Ticker container with edge fades */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Ticker track */}
        <div 
          ref={tickerRef}
          className="flex overflow-x-auto scrollbar-hide touch-pan-x"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className={`flex items-center py-4 ticker-animation ${isPaused ? 'ticker-paused' : ''}`}
            style={{ willChange: 'transform' }}
          >
            {allPartners.map((partner, index) => (
              <PartnerLogo key={`${partner}-${index}`} name={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersTicker;
