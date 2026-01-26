const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">
          Obchodní podmínky
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Platné od 1. ledna 2026
          </p>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">1. Úvodní ustanovení</h2>
            <p className="text-muted-foreground mb-4">
              Tyto obchodní podmínky upravují práva a povinnosti smluvních stran při využívání služeb 
              platformy MediaMarket pro zprostředkování nabídek mediálního prostoru mezi médii a agenturami.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">2. Definice pojmů</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Platforma</strong> – webová aplikace MediaMarket dostupná na doméně mediamarket.cz</li>
              <li><strong>Médium</strong> – subjekt nabízející reklamní prostor</li>
              <li><strong>Agentura</strong> – subjekt poptávající reklamní prostor pro své klienty</li>
              <li><strong>Objednávka</strong> – závazný požadavek agentury na konkrétní nabídku média</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">3. Objednávky a jejich zpracování</h2>
            <p className="text-muted-foreground mb-4">
              Odesláním objednávky prostřednictvím platformy vyjadřuje agentura závazný zájem o danou 
              mediální nabídku. Médium je povinno reagovat na objednávku do 48 hodin od jejího přijetí.
            </p>
            <p className="text-muted-foreground mb-4">
              Stavy objednávky:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Nová</strong> – objednávka byla odeslána a čeká na zpracování médiem</li>
              <li><strong>V řešení</strong> – médium aktivně pracuje na objednávce</li>
              <li><strong>Objednávka uzavřena</strong> – objednávka byla úspěšně dokončena nebo zamítnuta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">4. Cenové podmínky</h2>
            <p className="text-muted-foreground mb-4">
              Všechny ceny uvedené na platformě jsou bez DPH, není-li uvedeno jinak. 
              Finální cena může být závislá na konkrétním klientovi agentury, zejména pokud médium 
              vyžaduje uvedení finálního klienta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">5. Ochrana osobních údajů</h2>
            <p className="text-muted-foreground mb-4">
              Provozovatel platformy zpracovává osobní údaje v souladu s GDPR. 
              Podrobnosti jsou uvedeny v samostatném dokumentu Zásady ochrany osobních údajů.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-4">6. Závěrečná ustanovení</h2>
            <p className="text-muted-foreground mb-4">
              Tyto obchodní podmínky nabývají účinnosti dnem jejich zveřejnění na platformě. 
              Provozovatel si vyhrazuje právo tyto podmínky jednostranně měnit.
            </p>
          </section>

          <div className="mt-12 p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Toto je placeholder text obchodních podmínek pro účely prototypu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
