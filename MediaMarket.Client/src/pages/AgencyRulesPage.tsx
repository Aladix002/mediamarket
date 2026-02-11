import { Link } from 'react-router-dom';

const AgencyRulesPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Pravidla pro Agentury
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          (Výtah z obchodních podmínek)
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Co Media Market dělá</h2>
            <p className="text-muted-foreground mb-4">
              Portál vám umožní rychle objednat/poptat nabídku od Média.
            </p>
            <p className="text-muted-foreground">
              Provozovatel není smluvní stranou obchodu – obchod uzavíráte s Médiem.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Objednávka (formulář)</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Vyplníte termín (od–do), množství / zobrazení a doplníte případnou poznámku.</li>
              <li>Kontakty se předvyplní z registrace.</li>
              <li>Pokud Médium vyžaduje „Finální klient", je to povinné pole.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Ceny a výpočty</h2>
            <p className="text-muted-foreground mb-4">
              Všechny ceny v objednávkách jsou uváděny bez DPH.
            </p>
            <p className="text-muted-foreground mb-4">Cena se počítá automaticky:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Cena za ks:</strong> cena celkem = cena za ks × počet ks</li>
              <li><strong>CPT:</strong> cena celkem = (zobrazení/1000) × CPT</li>
            </ul>
            <p className="text-muted-foreground">
              Zaokrouhlení na celé Kč matematicky (0,50 nahoru).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Provize Agentury: 3 %</h2>
            <p className="text-muted-foreground mb-4">
              Platíte 3 % z kalkulované hodnoty objednávky bez DPH.
            </p>
            <p className="text-muted-foreground mb-4">
              Nárok na provizi vzniká odesláním objednávky přes Portál.
            </p>
            <p className="text-muted-foreground mb-4">
              Provizi platíte i tehdy, když obchod nakonec nevznikne z vaší strany (typicky: médium vám pošle potvrzení a vy ho ve lhůtě nepotvrdíte).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Kdy provizi neplatíte</h2>
            <p className="text-muted-foreground">
              Pokud obchod nevznikne ze strany Média (např. médium vás nekontaktuje / nezašle potvrzení v přiměřené lhůtě – standardně do 10 pracovních dnů, není-li v nabídce uvedeno jinak).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Newsletter</h2>
            <p className="text-muted-foreground mb-4">
              Registrací souhlasíte se zasíláním týdenního přehledu nabídek.
            </p>
            <p className="text-muted-foreground">
              Odhlášení je kdykoliv možné (bez vlivu na provozní e-maily typu „měníme VOP").
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Zákaz obcházení</h2>
            <p className="text-muted-foreground mb-4">
              Když kontakt z Portálu použijete „bokem" a obchod uzavřete do 2 měsíců, pořád se to bere jako obchod z Portálu.
            </p>
            <p className="text-muted-foreground">
              Následkem porušení zákazu obcházení může být vyřazení z Portálu (zrušení nebo pozastavení účtu).
            </p>
          </section>

          <div className="mt-12 p-6 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Pro úplné znění obchodních podmínek viz{' '}
              <Link to="/terms" className="underline hover:text-primary">
                Všeobecné obchodní podmínky
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyRulesPage;
