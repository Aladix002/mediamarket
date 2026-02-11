const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Zásady cookies
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Media Market
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Co jsou cookies</h2>
            <p className="text-muted-foreground mb-4">
              Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení (počítače, tabletu nebo mobilního telefonu) při návštěvě webových stránek. Cookies umožňují webovým stránkám zapamatovat si vaše akce a preference (např. přihlášení, jazyk, velikost písma a další zobrazovací preference) po určitou dobu, takže je nemusíte znovu zadávat při každé návštěvě stránky nebo při procházení z jedné stránky na druhou.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Jak používáme cookies</h2>
            <p className="text-muted-foreground mb-4">
              Portál mediamarket.cz používá cookies a obdobné technologie pro následující účely:
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">Nezbytné cookies</h3>
            <p className="text-muted-foreground mb-4">
              Tyto cookies jsou nezbytné pro fungování webu a nelze je vypnout v našich systémech. Obvykle se nastavují pouze v reakci na vaše akce, které se rovnají žádosti o služby, jako je nastavení vašich preferencí ochrany osobních údajů, přihlášení nebo vyplnění formulářů.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Autentifikační cookies:</strong> Umožňují vám zůstat přihlášeni k vašemu účtu</li>
              <li><strong>Bezpečnostní cookies:</strong> Pomáhají detekovat a předcházet bezpečnostním hrozbám</li>
              <li><strong>Funkční cookies:</strong> Umožňují základní funkce webu (např. zapamatování si vašich preferencí)</li>
            </ul>

            <h3 className="font-semibold text-lg mb-2 mt-4">Preferenční cookies</h3>
            <p className="text-muted-foreground mb-4">
              Tyto cookies umožňují webu zapamatovat si informace, které mění způsob, jakým se web chová nebo jak vypadá, jako je váš preferovaný jazyk nebo region, ve kterém se nacházíte.
            </p>

            <h3 className="font-semibold text-lg mb-2 mt-4">Analytické cookies</h3>
            <p className="text-muted-foreground mb-4">
              Tyto cookies nám pomáhají pochopit, jak návštěvníci interagují s našimi webovými stránkami, tím, že shromažďují a hlášení informací anonymně. To nám umožňuje zlepšovat fungování webu.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Počet návštěvníků</li>
              <li>Které stránky jsou nejnavštěvovanější</li>
              <li>Jak dlouho návštěvníci zůstávají na stránkách</li>
              <li>Odkud návštěvníci přicházejí</li>
            </ul>

            <h3 className="font-semibold text-lg mb-2 mt-4">Marketingové cookies</h3>
            <p className="text-muted-foreground mb-4">
              Tyto cookies mohou být nastaveny prostřednictvím našeho webu našimi reklamními partnery. Můžou být použity k vytvoření profilu vašich zájmů a zobrazení relevantních reklam na jiných webech. Pokud tyto cookies nepovolíte, nebudete dostávat méně cílené reklamy.
            </p>
            <p className="text-muted-foreground">
              <strong>Poznámka:</strong> V současné době nepoužíváme marketingové cookies, ale vyhrazujeme si právo je v budoucnu použít.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Správa cookies</h2>
            <p className="text-muted-foreground mb-4">
              Většina webových prohlížečů automaticky přijímá cookies. Můžete však upravit nastavení svého prohlížeče tak, aby cookies odmítal nebo vás upozorňoval, když jsou cookies odesílány. Mějte však na paměti, že pokud zakážete cookies, některé funkce webu nemusí fungovat správně.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">Jak spravovat cookies v různých prohlížečích:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Google Chrome:</strong> Nastavení → Soukromí a zabezpečení → Cookies a další údaje webů</li>
              <li><strong>Mozilla Firefox:</strong> Možnosti → Soukromí a zabezpečení → Cookies a údaje webů</li>
              <li><strong>Microsoft Edge:</strong> Nastavení → Cookies a oprávnění webu → Cookies a data uložená webem</li>
              <li><strong>Safari:</strong> Předvolby → Soukromí → Cookies a data webů</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Cookies třetích stran</h2>
            <p className="text-muted-foreground mb-4">
              Některé cookies na našich webových stránkách jsou nastaveny službami třetích stran, které používáme. Tyto služby mohou zahrnovat:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Analytické služby:</strong> Pro měření návštěvnosti a analýzu chování uživatelů</li>
              <li><strong>Hostingové služby:</strong> Pro zajištění provozu webu</li>
              <li><strong>Bezpečnostní služby:</strong> Pro ochranu před útoky a zneužitím</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Tyto služby mohou používat vlastní cookies v souladu se svými zásadami ochrany osobních údajů.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Doba uchování cookies</h2>
            <p className="text-muted-foreground mb-4">
              Doba, po kterou jsou cookies uloženy na vašem zařízení, závisí na jejich typu:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Session cookies:</strong> Jsou dočasné a jsou automaticky smazány, když zavřete prohlížeč</li>
              <li><strong>Trvalé cookies:</strong> Zůstávají na vašem zařízení po určitou dobu nebo dokud je ručně nesmažete</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Vaše práva</h2>
            <p className="text-muted-foreground mb-4">
              Máte právo kdykoliv změnit nebo odvolat svůj souhlas s používáním cookies (kromě nezbytných cookies, které jsou nutné pro fungování webu). Můžete tak učinit:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Prostřednictvím nastavení vašeho prohlížeče</li>
              <li>Prostřednictvím našeho cookie banneru (pokud je k dispozici)</li>
              <li>Kontaktováním nás na e-mailu: gdpr@mediamarket.cz</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Aktualizace těchto zásad</h2>
            <p className="text-muted-foreground">
              Tyto zásady cookies můžeme čas od času aktualizovat, abychom odrážely změny v našich postupech nebo z jiných provozních, právních nebo regulačních důvodů. Aktuální verze bude vždy dostupná na této stránce.
            </p>
            <p className="text-muted-foreground mt-4">
              <strong>Účinnost od:</strong> 1. ledna 2026
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">Kontakt</h2>
            <p className="text-muted-foreground">
              Pokud máte jakékoli dotazy týkající se našich zásad cookies, kontaktujte nás na: <a href="mailto:gdpr@mediamarket.cz" className="underline hover:text-primary">gdpr@mediamarket.cz</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
