import { Link } from 'react-router-dom';

const MediaRulesPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Pravidla pro Média
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          (Výtah z obchodních podmínek)
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Co Media Market dělá</h2>
            <p className="text-muted-foreground mb-4">
              Portál zprostředkovává poptávky/objednávky od Agentur na vaše nabídky.
            </p>
            <p className="text-muted-foreground">
              Provozovatel není smluvní stranou obchodu mezi vámi a Agenturou.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Nabídky</h2>
            <p className="text-muted-foreground mb-4">
              Zodpovídáte za pravdivost a aktuálnost nabídky (parametry, dostupnost, cena).
            </p>
            <p className="text-muted-foreground">
              Všechny ceny v nabídkách jsou uváděny bez DPH.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Objednávky a stavy (Dashboard: „Objednávky na moje nabídky")</h2>
            <p className="text-muted-foreground mb-4">
              Objednávky mají stavy: <strong>nová</strong> / <strong>v řešení</strong> / <strong>objednávka uzavřena</strong>.
            </p>
            <p className="text-muted-foreground mb-4">
              Stav měníte vy (a případně admin kvůli opravám/sporům).
            </p>
            <p className="text-muted-foreground">
              „Objednávka uzavřena" nastavujte pouze tehdy, když je obchod na základě objednávky z Portálu reálně uzavřen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Provize Média: 5 %</h2>
            <p className="text-muted-foreground mb-4">
              Platíte 5 % z finální hodnoty obchodu bez DPH, pokud obchod vznikl na základě objednávky doručené přes mediamarket.cz.
            </p>
            <p className="text-muted-foreground mb-4">
              Nárok na provizi vzniká označením stavu „objednávka uzavřena".
            </p>
            <p className="text-muted-foreground">
              Neplatíte provizi, pokud obchod nevznikl z důvodu na straně Agentury (typicky: neodsouhlasila/ nepotvrdila ve vaší lhůtě).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Když se po kontaktu změní cena/rozsah</h2>
            <p className="text-muted-foreground mb-4">
              Pokud se finální cena/rozsah liší od objednávky v Portálu, máte povinnost doplnit do systému finální cenu (Finální hodnota) bez DPH (ideálně do 5 pracovních dnů a nejpozději při stavu „objednávka uzavřena").
            </p>
            <p className="text-muted-foreground mb-4">
              Základ pro provizi Média je finální hodnota bez DPH. Provozovatel si ji může vyžádat doložit (objednávka/smlouva/e-mail/faktura – citlivé části můžete začernit).
            </p>
            <p className="text-muted-foreground">
              Pokud finální cenu do systému nedoplníte nebo je zjevně nesprávná, admin může finální cenu doplnit/upravit na základě podkladů; jinak se provize může vyúčtovat z kalkulované hodnoty v Portálu.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Zákaz obcházení</h2>
            <p className="text-muted-foreground">
              Obchod uzavřený do 2 měsíců od kontaktu přes Portál se bere jako zprostředkovaný Portálem (a provize se uplatní).
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

export default MediaRulesPage;
