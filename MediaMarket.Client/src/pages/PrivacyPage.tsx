const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Zásady ochrany osobních údajů (GDPR)
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Media Market
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Tyto zásady vysvětlují, jakým způsobem společnost White Wolf Consulting s.r.o. jako provozovatel portálu mediamarket.cz zpracovává osobní údaje uživatelů (typicky kontaktních osob médií a agentur) a návštěvníků webu.
          </p>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">1. Kdo je správce osobních údajů</h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>Správce:</strong> White Wolf Consulting s.r.o.</p>
              <p><strong>IČ:</strong> 27753654</p>
              <p><strong>Sídlo:</strong> Mozolky 1243/17, 616 00 Brno</p>
              <p><strong>Kontaktní e-mail:</strong> gdpr@mediamarket.cz</p>
            </div>
            <p className="text-muted-foreground mt-4">
              Pověřenec pro ochranu osobních údajů (DPO): Správce nemá jmenovaného pověřence, protože mu tato povinnost typicky nevzniká. Pokud ho později jmenuje, údaje doplní.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">2. Koho se zpracování týká</h2>
            <p className="text-muted-foreground mb-4">Zpracování se týká zejména:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>kontaktních osob Médií a Agentur registrovaných v Portálu,</li>
              <li>osob, které vyplní objednávkový formulář / komunikují přes Portál,</li>
              <li>návštěvníků webu (cookies a technické logy).</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Portál je určen primárně pro B2B uživatele, nicméně osobní údaje kontaktních osob jsou stále osobními údaji ve smyslu GDPR.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">3. Jaké osobní údaje zpracováváme</h2>
            <p className="text-muted-foreground mb-4">V závislosti na tom, jak Portál používáte, můžeme zpracovávat zejména:</p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">3.1 Údaje při registraci a správě účtu</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>jméno a příjmení kontaktní osoby,</li>
              <li>e-mail, telefon,</li>
              <li>pracovní pozice (pokud ji uvedete),</li>
              <li>přihlašovací údaje (heslo je uloženo v zabezpečené podobě – hash),</li>
              <li>informace o účtu a nastavení.</li>
            </ul>

            <h3 className="font-semibold text-lg mb-2 mt-4">3.2 Údaje k objednávkám / poptávkám</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>identifikace objednávky, preferovaný termín „od–do",</li>
              <li>parametry objednávky (počet ks / počet zobrazení, cena celkem bez DPH),</li>
              <li>poznámka k poptávce,</li>
              <li>údaj „finální klient", pokud je vyžadován (typicky název společnosti; pokud by šlo o fyzickou osobu, může jít o osobní údaj),</li>
              <li>kontaktní údaje předvyplněné z registrace.</li>
            </ul>

            <h3 className="font-semibold text-lg mb-2 mt-4">3.3 Fakturační a smluvní údaje (provize)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>údaje potřebné pro vyúčtování provizí (např. historie objednávek, hodnoty objednávek, informace o stavu „objednávka uzavřena"),</li>
              <li>fakturační kontakty a fakturační údaje, pokud jsou navázány na osobu (např. e-mail pro faktury).</li>
            </ul>

            <h3 className="font-semibold text-lg mb-2 mt-4">3.4 Technické údaje a bezpečnost</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>IP adresa, identifikátory zařízení/prohlížeče, logy přístupů,</li>
              <li>cookies a obdobné technologie (více viz část 9).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">4. Proč osobní údaje zpracováváme a na jakém právním základě</h2>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">A) Registrace, účet a provoz Portálu</h3>
            <p className="text-muted-foreground mb-2">
              <strong>Účel:</strong> vytvoření účtu, přihlášení, správa přístupu, provoz Portálu.
            </p>
            <p className="text-muted-foreground">
              <strong>Právní základ:</strong> plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR).
            </p>

            <h3 className="font-semibold text-lg mb-2 mt-4">B) Zprostředkování objednávek mezi Agenturami a Médii</h3>
            <p className="text-muted-foreground mb-2">
              <strong>Účel:</strong> předání objednávky/poptávky, umožnění komunikace a evidence procesu (včetně stavů objednávek).
            </p>
            <p className="text-muted-foreground">
              <strong>Právní základ:</strong> plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR).
            </p>

            <h3 className="font-semibold text-lg mb-2 mt-4">C) Vyúčtování provizí, účetnictví a daňové povinnosti</h3>
            <p className="text-muted-foreground mb-2">
              <strong>Účel:</strong> fakturace provizí, evidence, účetní a daňové doklady, vymáhání pohledávek.
            </p>
            <p className="text-muted-foreground">
              <strong>Právní základ:</strong> plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR) + právní povinnost (čl. 6 odst. 1 písm. c) GDPR).
            </p>

            <h3 className="font-semibold text-lg mb-2 mt-4">D) Zabezpečení Portálu a prevence zneužití</h3>
            <p className="text-muted-foreground mb-2">
              <strong>Účel:</strong> bezpečnost, prevence podvodů, ochrana Portálu a uživatelů, logování událostí.
            </p>
            <p className="text-muted-foreground">
              <strong>Právní základ:</strong> oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR).
            </p>

            <h3 className="font-semibold text-lg mb-2 mt-4">E) Zasílání obchodních sdělení (newsletter pro Agentury)</h3>
            <p className="text-muted-foreground mb-2">
              <strong>Účel:</strong> zasílání týdenního přehledu nabídek (newsletter).
            </p>
            <p className="text-muted-foreground">
              <strong>Právní základ:</strong> souhlas (čl. 6 odst. 1 písm. a) GDPR) – lze kdykoliv odvolat.
            </p>

            <h3 className="font-semibold text-lg mb-2 mt-4">F) Zákaznická podpora a komunikace</h3>
            <p className="text-muted-foreground mb-2">
              <strong>Účel:</strong> řešení dotazů, požadavků, reklamací a sporů.
            </p>
            <p className="text-muted-foreground">
              <strong>Právní základ:</strong> plnění smlouvy (b) a/nebo oprávněný zájem (f) dle povahy požadavku.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">5. Komu mohou být osobní údaje zpřístupněny (příjemci)</h2>
            <p className="text-muted-foreground mb-4">Osobní údaje mohou být zpřístupněny:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>druhé smluvní straně obchodu:</strong> pokud Agentura odešle objednávku, údaje nutné k řešení objednávky obdrží příslušné Médium, a naopak údaje z objednávky/komunikace se mohou dostat k Agentuře,</li>
              <li><strong>poskytovatelům IT služeb</strong> (zpracovatelům), kteří zajišťují provoz Portálu (hosting, databáze, e-mailové rozesílky, monitoring, podpora),</li>
              <li><strong>účetním/daňovým poradcům</strong> a případně právním zástupcům (pokud je to nutné),</li>
              <li><strong>orgánům veřejné moci</strong>, pokud nám to ukládá zákon.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Aktuální seznam kategorií zpracovatelů poskytneme na vyžádání.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">6. Předávání do třetích zemí (mimo EU/EHP)</h2>
            <p className="text-muted-foreground mb-4">
              Někteří poskytovatelé IT služeb mohou sídlit mimo EU/EHP (např. u cloudových a e-mailových služeb). Pokud k předání dojde, zajistíme odpovídající ochranu osobních údajů, typicky prostřednictvím:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>rozhodnutí o odpovídající ochraně, nebo</li>
              <li>standardních smluvních doložek (SCC) a doplňkových opatření.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">7. Jak dlouho údaje uchováváme (doby uchování)</h2>
            <p className="text-muted-foreground mb-4">Uchováváme údaje pouze po dobu nezbytnou pro dané účely:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Účet a profil uživatele:</strong> po dobu aktivního účtu; poté obvykle až 5 let pro ochranu právních nároků a obranu v případě sporu.</li>
              <li><strong>Objednávky a související evidence</strong> (včetně stavů): obvykle až 5 let od uzavření nebo poslední aktivity, dle potřeby pro vyúčtování a spory.</li>
              <li><strong>Faktury a účetní doklady:</strong> dle právních předpisů, typicky 10 let.</li>
              <li><strong>Newsletter:</strong> do odvolání souhlasu nebo zrušení odběru.</li>
              <li><strong>Bezpečnostní logy:</strong> typicky 6–12 měsíců, pokud delší uchování není nutné (např. při incidentu).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">8. Jaká máte práva</h2>
            <p className="text-muted-foreground mb-4">Pokud zpracováváme vaše osobní údaje, máte právo:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>na přístup k údajům,</li>
              <li>na opravu nepřesných údajů,</li>
              <li>na výmaz (v zákonných mezích),</li>
              <li>na omezení zpracování,</li>
              <li>na přenositelnost (pokud se zpracování opírá o smlouvu a probíhá automatizovaně),</li>
              <li>vznést námitku proti zpracování na základě oprávněného zájmu,</li>
              <li>odvolat souhlas (např. newsletter) – odvolání nemá vliv na zpracování před odvoláním.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Žádosti vyřizujeme bez zbytečného odkladu, nejpozději do 1 měsíce.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">9. Cookies a obdobné technologie</h2>
            <p className="text-muted-foreground mb-4">
              Portál může používat cookies a obdobné technologie. Podrobnosti jsou uvedeny v samostatném dokumentu{' '}
              <a href="/cookies" className="underline hover:text-primary">Zásady cookies</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">10. Zabezpečení osobních údajů</h2>
            <p className="text-muted-foreground mb-4">Používáme přiměřená technická a organizační opatření k ochraně osobních údajů, zejména:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>řízení přístupů a role (včetně admin oprávnění),</li>
              <li>šifrovaná komunikace (HTTPS),</li>
              <li>bezpečné ukládání přihlašovacích údajů,</li>
              <li>logování a monitoring podezřelých aktivit.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">11. Automatizované rozhodování a profilování</h2>
            <p className="text-muted-foreground">
              V rámci Portálu neprovádíme automatizované rozhodování ani profilování, které by mělo pro uživatele právní účinky nebo obdobně významné dopady.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">12. Odkud údaje získáváme</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>přímo od vás (registrace, formuláře, komunikace),</li>
              <li>z používání Portálu (logy, technické údaje),</li>
              <li>v omezené míře od druhé strany obchodu (Médium/Agentura) v souvislosti s konkrétní objednávkou.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">13. Jak nás kontaktovat a stížnost u dozorového úřadu</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Kontakt pro GDPR:</strong> gdpr@mediamarket.cz
            </p>
            <p className="text-muted-foreground">
              Pokud máte za to, že zpracování není v souladu s právními předpisy, máte právo podat stížnost u dozorového úřadu:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Úřad pro ochranu osobních údajů (ÚOOÚ)</strong>, Pplk. Sochora 27, 170 00 Praha 7.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">14. Změny těchto zásad</h2>
            <p className="text-muted-foreground">
              Tyto zásady můžeme průběžně aktualizovat (např. při změně funkcí Portálu nebo poskytovatelů služeb). Aktuální verze bude vždy dostupná na Portálu.
            </p>
            <p className="text-muted-foreground mt-4">
              <strong>Účinnost od:</strong> 1. ledna 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
