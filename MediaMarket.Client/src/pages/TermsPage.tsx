import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Všeobecné obchodní podmínky portálu Media Market (VOP)
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Platné od 1. ledna 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">1. Úvodní ustanovení</h2>
            <p className="text-muted-foreground mb-4">
              <strong>1.1.</strong> Tyto všeobecné obchodní podmínky (dále jen „VOP") upravují podmínky užívání internetového portálu mediamarket.cz (dále jen „Portál") a smluvní vztah mezi provozovatelem Portálu a registrovanými uživateli.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>1.2.</strong> Provozovatelem Portálu je: White Wolf Consulting s.r.o., IČ: 27753654, se sídlem Mozolky 1243/17, 616 00 Brno (dále jen „Provozovatel").
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>1.3.</strong> Portál je určen výhradně pro subjekty jednající v rámci své podnikatelské činnosti (B2B). Uživatel registrací potvrzuje, že nevystupuje jako spotřebitel.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>1.4.</strong> Portál slouží ke zprostředkování obchodních příležitostí mezi:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Médii (zveřejňují nabídky mediálních/reklamních plnění), a</li>
              <li>Agenturami (odesílají objednávky/poptávky na tyto nabídky),</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              (dále společně jen „Uživatelé").
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>1.5.</strong> Registrací do Portálu Uživatel souhlasí s VOP a zavazuje se je dodržovat. Registrací vzniká mezi Uživatelem a Provozovatelem smluvní vztah o užívání Portálu dle těchto VOP.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">2. Vymezení pojmů</h2>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>2.1.</strong> Médium – Uživatel zveřejňující Nabídky na Portálu.</li>
              <li><strong>2.2.</strong> Agentura – Uživatel odesílající Objednávky prostřednictvím Portálu.</li>
              <li><strong>2.3.</strong> Nabídka – nabídka plnění zveřejněná Médiem, včetně parametrů, ceny a podmínek.</li>
              <li><strong>2.4.</strong> Objednávka – objednávka/poptávka odeslaná Agenturou prostřednictvím objednávkového formuláře Portálu.</li>
              <li><strong>2.5.</strong> Kalkulovaná hodnota Objednávky – částka vypočtená Portálem dle čl. 6 (model „Cena za ks" nebo „CPT") a zaokrouhlená dle čl. 6.4; slouží zejména jako základ pro vyúčtování provize Agentuře dle čl. 7.3.</li>
              <li><strong>2.6.</strong> Finální hodnota Objednávky – konečná hodnota plnění dohodnutá mezi Médiem a Agenturou po kontaktu navazujícím na Objednávku z Portálu (např. v potvrzené objednávce/smlouvě, e-mailu apod.); slouží zejména jako základ pro vyúčtování provize Médiu dle čl. 7.2, je-li řádně doložena dle čl. 7.6.</li>
              <li><strong>2.7.</strong> Stav Objednávky – stav Objednávky v interním systému Portálu dle čl. 5.</li>
              <li><strong>2.8.</strong> „Objednávka uzavřena" – stav Objednávky v Portálu označený jako „objednávka uzavřena".</li>
              <li><strong>2.9.</strong> Ceny a DPH – veškeré ceny uváděné na Portálu, zejména v Nabídkách a Objednávkách, jsou uváděny bez DPH.</li>
              <li><strong>2.10.</strong> Základ pro provize – provize dle těchto VOP se vždy počítají z částek bez DPH.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">3. Registrace a uživatelský účet</h2>
            <p className="text-muted-foreground mb-4">
              <strong>3.1.</strong> Pro používání Portálu je nutná registrace a vytvoření uživatelského účtu.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>3.2.</strong> Uživatel je povinen uvádět pravdivé, úplné a aktuální údaje (zejména identifikační a kontaktní údaje).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>3.3.</strong> Uživatel odpovídá za zabezpečení přihlašovacích údajů a za veškeré úkony provedené prostřednictvím jeho účtu.
            </p>
            <p className="text-muted-foreground">
              <strong>3.4.</strong> Provozovatel je oprávněn účet pozastavit nebo zrušit, pokud Uživatel poruší VOP, právní předpisy, jedná podvodně, obchází Portál nebo poškozuje Provozovatele či jiné Uživatele.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">4. Role Provozovatele a charakter služby</h2>
            <p className="text-muted-foreground mb-4">
              <strong>4.1.</strong> Provozovatel poskytuje Portál jako technologickou platformu pro zveřejňování Nabídek a odesílání Objednávek.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>4.2.</strong> Provozovatel není smluvní stranou obchodního vztahu uzavíraného mezi Médiem a Agenturou, pokud není výslovně ujednáno jinak.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>4.3.</strong> Zveřejněním Nabídky na Portálu nevzniká Médiu povinnost uzavřít obchodní případ s Agenturou. Odesláním Objednávky nevzniká automaticky povinnost Média Objednávku přijmout.
            </p>
            <p className="text-muted-foreground">
              <strong>4.4.</strong> Provozovatel neodpovídá za správnost, úplnost a aktuálnost údajů v Nabídkách ani za plnění závazků mezi Médiem a Agenturou.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">5. Stavy objednávek a jejich význam</h2>
            <p className="text-muted-foreground mb-4">
              <strong>5.1.</strong> V Portálu jsou u Objednávek evidovány tyto stavy:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>„nová" (výchozí stav po odeslání Objednávky),</li>
              <li>„v řešení",</li>
              <li>„objednávka uzavřena".</li>
            </ul>
            <p className="text-muted-foreground mb-4 mt-4">
              <strong>5.2.</strong> Stav Objednávky nastavuje a mění primárně Médium. Admin Portálu (Provozovatel) může stav změnit zejména z důvodu opravy, vyřešení sporu, zajištění správné evidence nebo při zjevném zneužití. Tím není dotčena možnost admina doplnit nebo upravit Finální hodnotu v systému dle čl. 5.8.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>5.3.</strong> Stav „objednávka uzavřena" znamená, že dle tvrzení Média došlo na základě Objednávky z Portálu k uzavření obchodního případu mezi Médiem a Agenturou.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>5.4.</strong> Médium se zavazuje měnit stavy pravdivě a v souladu se skutečným průběhem obchodu. Účelové či nepravdivé označování stavů je podstatným porušením VOP.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">5.5 Evidence finální hodnoty Objednávky</h3>
            <p className="text-muted-foreground mb-4">
              V případě, že se po kontaktu mezi Médiem a Agenturou změní cena a/nebo rozsah plnění oproti Kalkulované hodnotě Objednávky evidované v Portálu, je Médium povinno bez zbytečného odkladu uvést v Portálu Finální hodnotu Objednávky bez DPH (dále jen „Finální hodnota v systému").
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">5.6 Lhůta pro doplnění Finální hodnoty v systému</h3>
            <p className="text-muted-foreground mb-4">
              Médium je povinno doplnit Finální hodnotu v systému nejpozději do 5 pracovních dnů od okamžiku uzavření obchodního případu (typicky od potvrzení objednávky/smlouvy mezi Médiem a Agenturou), nejpozději však do okamžiku nastavení stavu „objednávka uzavřena", pokud není Finální hodnota v systému již vyplněna.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">5.7 Následky nedoplnění Finální hodnoty v systému</h3>
            <p className="text-muted-foreground mb-4">
              Není-li Finální hodnota v systému doplněna, je Provozovatel oprávněn pro účely vyúčtování provize vycházet z Kalkulované hodnoty Objednávky evidované v Portálu. Opakované nesplnění povinnosti dle čl. 5.5 a 5.6 může být považováno za porušení VOP a může vést k omezení nebo pozastavení účtu.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">5.8 Oprava/doplnění Finální hodnoty administrátorem</h3>
            <p className="text-muted-foreground">
              Provozovatel (admin) je oprávněn doplnit nebo upravit Finální hodnotu v systému zejména v případech, kdy (i) Médium Finální hodnotu v systému nedoplní ve lhůtě dle čl. 5.6, (ii) existuje důvodné podezření na nesprávnost uvedené Finální hodnoty, nebo (iii) je to nezbytné k vyřešení sporu či zajištění správné evidence. Provozovatel tak učiní na základě dostupných podkladů, zejména dokladů dle čl. 7.6, případně vyžádáním součinnosti od Média a/nebo Agentury.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">6. Objednávkový formulář, údaje a kalkulace ceny</h2>
            <p className="text-muted-foreground mb-4">
              <strong>6.1.</strong> Objednávka má povahu žádosti o kontakt a uzavření objednávky: „Vyplňte formulář a médium vás bude kontaktovat pro uzavření objednávky."
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>6.2.</strong> Objednávka obsahuje zejména položky:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Preferovaný termín „od – do" (kalendář).</li>
              <li>Rozpočet / cena dle Nabídky:
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>„Cena za ks" + počet ks → cena celkem = cena za ks × počet ks (zaokrouhlení na celé Kč).</li>
                  <li>„CPT" + počet zobrazení → cena celkem = (zobrazení/1000) × CPT (zaokrouhlení na celé Kč).</li>
                </ul>
              </li>
              <li>Finální klient (povinné, pokud Médium vyžaduje).</li>
              <li>Poznámka k poptávce.</li>
              <li>Kontaktní osoba, e-mail, telefon (předvyplněno z registrace Agentury).</li>
              <li>Tlačítka „Zrušit" / „Odeslat objednávku".</li>
            </ul>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">6.3 Měna a DPH</h3>
            <p className="text-muted-foreground mb-2">
              <strong>6.3.1.</strong> Veškeré ceny jsou uváděny v Kč.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>6.3.2.</strong> Veškeré ceny v Nabídkách a Objednávkách jsou uváděny bez DPH.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">6.4 Zaokrouhlování</h3>
            <p className="text-muted-foreground mb-2">
              <strong>6.4.1.</strong> Výsledek výpočtu „Cena celkem" může vzniknout jako desetinné číslo (zejména u CPT). Portál zaokrouhluje na celé Kč matematicky na nejbližší celou korunu (0,50 Kč a více nahoru).
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>6.4.2.</strong> Pro účely Kalkulované hodnoty Objednávky se použije částka po zaokrouhlení dle 6.4.1.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">6.5 Model „Cena za ks"</h3>
            <p className="text-muted-foreground mb-4">
              Pokud Nabídka obsahuje „Cena za ks", Portál předvyplní cenu za ks a Agentura zadá počet ks (dle UI). Cena celkem = cena za ks × počet ks (následně zaokrouhlení dle 6.4).
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">6.6 Model „CPT (cena za tisíc zobrazení)"</h3>
            <p className="text-muted-foreground mb-4">
              Pokud Nabídka obsahuje CPT, Portál předvyplní CPT a Agentura zadá počet zobrazení. Cena celkem = (počet zobrazení / 1000) × CPT (následně zaokrouhlení dle 6.4).
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">6.7 Finální klient</h3>
            <p className="text-muted-foreground">
              Pokud Médium u Nabídky aktivuje volbu „Nutné uvést finálního klienta", je Agentura povinna finálního klienta v Objednávce uvést.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">7. Provize (odměna Provozovatele)</h2>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.1 Obecně</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.1.1.</strong> Provozovateli vzniká nárok na provizi za zprostředkování obchodních příležitostí prostřednictvím Portálu.
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>7.1.2.</strong> Provize dle těchto VOP se počítají vždy z částek bez DPH (tj. z Kalkulované hodnoty Objednávky bez DPH nebo z Finální hodnoty Objednávky bez DPH).
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>7.1.3.</strong> Provozovatel vyúčtuje provizi fakturou. Splatnost činí 14 dnů, není-li na faktuře uvedeno jinak.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.1.4.</strong> Provozovatel je oprávněn provizi vyúčtovat průběžně (např. po vzniku nároku), případně v souhrnných intervalech dle provozních nastavení Portálu.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.2 Provize – Média (5 %)</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.2.1.</strong> Médium se zavazuje uhradit Provozovateli provizi ve výši 5 % z hodnoty uskutečněné Objednávky (Finální hodnota bez DPH), pokud došlo k uzavření obchodního případu na základě Objednávky doručené Médiu prostřednictvím Portálu.
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>7.2.2.</strong> Za rozhodný okamžik vzniku nároku na provizi vůči Médiu se považuje označení stavu Objednávky v Portálu jako „objednávka uzavřena".
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.2.3.</strong> Médium nemá povinnost hradit provizi, pokud k uzavření či uskutečnění obchodního případu nedojde z důvodu na straně Agentury, zejména pokud: Médium zašle Agentuře vytvořenou objednávku / smluvní ujednání k potvrzení, a Agentura ji ve lhůtě stanovené Médiem nepotvrdí, a obchodní případ se tím neuskuteční.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.2.4.</strong> Pokud byla Objednávka označena jako „objednávka uzavřena", ale následně se prokáže, že obchodní případ nevznikl nebo se neuskutečnil, Médium je povinno tuto skutečnost bez zbytečného odkladu oznámit Provozovateli a doložit důvod; Provozovatel provede odpovídající opravu vyúčtování.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.3 Provize – Agentury (3 %)</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.3.1.</strong> Agentura se zavazuje uhradit Provozovateli provizi ve výši 3 % z Kalkulované hodnoty Objednávky bez DPH.
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>7.3.2.</strong> Nárok Provozovatele na provizi vůči Agentuře vzniká odesláním Objednávky prostřednictvím Portálu.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.3.3.</strong> Agentura má povinnost uhradit provizi i v případě, že dojde ke zrušení nebo neuskutečnění obchodu z její strany, zejména pokud: Médium zašle Agentuře vytvořenou objednávku / smluvní ujednání k potvrzení, a Agentura ji ve lhůtě stanovené Médiem nepotvrdí, a obchodní případ se tím neuskuteční.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.3.4.</strong> Agentura nemá povinnost hradit provizi, pokud dojde ke zrušení nebo neuskutečnění obchodu ze strany Média, zejména pokud Médium: nezašle Agentuře vytvořenou objednávku / smluvní ujednání k potvrzení v přiměřené lhůtě, nejpozději do 10 pracovních dnů od odeslání Objednávky (není-li v Nabídce uvedeno jinak), nebo bezdůvodně odmítne uzavřít obchodní případ bez nabídky alternativy.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.4 Změna rozsahu/ceny po kontaktu a určení základu pro provizi</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.4.1.</strong> Po odeslání Objednávky může dojít k úpravě rozsahu plnění a ceny v rámci jednání mezi Médiem a Agenturou.
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>7.4.2.</strong> Agentura: základ pro provizi Agentury je Kalkulovaná hodnota Objednávky dle Portálu, není-li prokázána chyba výpočtu Portálu.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.4.3.</strong> Médium: základ pro provizi Média je Finální hodnota Objednávky, pokud ji Médium řádně doloží dle čl. 7.6. Není-li Finální hodnota doložena, použije se jako základ Kalkulovaná hodnota Objednávky (nebo jiná hodnota evidovaná v Portálu).
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.5 Zákaz obcházení Portálu</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.5.1.</strong> Uživatelé se zavazují neobcházet Portál za účelem vyhnutí se provizi.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.5.2.</strong> Pokud dojde k uzavření obchodního případu mezi Médiem a Agenturou (nebo propojenými osobami) na základě kontaktu/Objednávky získané přes Portál do 2 měsíců od odeslání Objednávky, považuje se obchod pro účely provize za zprostředkovaný Portálem.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.6 Dokladování Finální hodnoty (pro Média)</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.6.1.</strong> Médium je povinno na vyžádání Provozovatele doložit Finální hodnotu Objednávky, zejména pokud se liší od Kalkulované hodnoty.
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>7.6.2.</strong> Akceptovatelné doklady:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>potvrzená objednávka / smlouva,</li>
              <li>potvrzení ceny a rozsahu e-mailem (s identifikací Objednávky),</li>
              <li>faktura / zálohová faktura,</li>
              <li>jiné prokazatelné potvrzení.</li>
            </ul>
            <p className="text-muted-foreground mb-2 mt-4">
              <strong>7.6.3.</strong> Médium může začernit obchodně citlivé části, nesmí však odstranit údaje nutné k ověření (strany, datum, identifikace Objednávky/plnění, částka).
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>7.6.4.</strong> Povinnost doplnit Finální hodnotu v systému: Dokladování Finální hodnoty dle tohoto článku nenahrazuje povinnost Média doplnit Finální hodnotu v systému dle čl. 5.5 až 5.6. Provozovatel je oprávněn vyžádat si doklady zejména při rozdílu mezi Kalkulovanou hodnotou Objednávky a Finální hodnotou v systému nebo při sporných případech.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.6.5.</strong> Součinnost při evidenci Finální hodnoty: Uživatelé se zavazují poskytnout Provozovateli přiměřenou součinnost pro ověření a evidenci Finální hodnoty v systému, zejména předložením podkladů dle čl. 7.6.2. Citlivé obchodní části mohou být začerněny dle čl. 7.6.3, musí však zůstat zachovány údaje nutné k ověření (strany, datum, identifikace Objednávky/plnění a částka bez DPH).
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.7 Reklamace vyúčtování</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.7.1.</strong> Uživatel může uplatnit reklamaci vyúčtování (faktury) písemně nejpozději do 10 pracovních dnů od doručení faktury, jinak se považuje za odsouhlasenou.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>7.7.2.</strong> Reklamace nemá odkladný účinek, ledaže Provozovatel písemně potvrdí opak. V případě uznané reklamace Provozovatel vystaví dobropis/vrubopis.
            </p>
            
            <h3 className="font-semibold text-lg mb-2 mt-4">7.8 Prodlení, úroky a náklady vymáhání</h3>
            <p className="text-muted-foreground mb-2">
              <strong>7.8.1.</strong> V případě prodlení s úhradou je Uživatel povinen uhradit:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>úrok z prodlení v zákonné výši, a dále</li>
              <li>paušální náhradu nákladů spojených s uplatněním pohledávky 1 200 Kč za každý případ prodlení (pokud právní předpisy umožňují), a</li>
              <li>případně účelně vynaložené náklady vymáhání (právní zastoupení, soudní poplatky apod.).</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>7.8.2.</strong> Při prodlení delším než 14 dnů je Provozovatel oprávněn omezit nebo pozastavit přístup Uživatele k Portálu až do úplné úhrady dluhu.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">8. Obchodní sdělení (newsletter)</h2>
            <p className="text-muted-foreground mb-4">
              <strong>8.1.</strong> Registrací Agentura souhlasí se zasíláním týdenního přehledu nabídek (newsletteru) na kontaktní e-mail.
            </p>
            <p className="text-muted-foreground">
              <strong>8.2.</strong> Souhlas lze kdykoliv odvolat (odhlášení v e-mailu / nastavení účtu). Tím není dotčena možnost zasílat nezbytná provozní sdělení (změny VOP, bezpečnostní informace).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">9. Odpovědnost a omezení odpovědnosti</h2>
            <p className="text-muted-foreground mb-4">
              <strong>9.1.</strong> Provozovatel neodpovídá za správnost Nabídek a údajů vložených Uživateli ani za uzavření a plnění obchodních vztahů mezi Médiem a Agenturou.
            </p>
            <p className="text-muted-foreground">
              <strong>9.2.</strong> Provozovatel může dočasně omezit dostupnost Portálu z důvodu údržby, bezpečnosti či vyšší moci.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">10. Práva k obsahu a licence</h2>
            <p className="text-muted-foreground mb-4">
              <strong>10.1.</strong> Uživatel poskytuje Provozovateli nevýhradní licenci k užití obsahu vloženého do Portálu (zejména texty, loga, vizuály) za účelem provozu Portálu, zobrazení Nabídek a propagace Portálu.
            </p>
            <p className="text-muted-foreground">
              <strong>10.2.</strong> Uživatel prohlašuje, že má k obsahu potřebná práva.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">11. Ochrana osobních údajů</h2>
            <p className="text-muted-foreground">
              <strong>11.1.</strong> Zpracování osobních údajů se řídí samostatným dokumentem „Zásady ochrany osobních údajů" dostupným na Portálu. Viz{' '}
              <Link to="/privacy" className="underline hover:text-primary">Zásady ochrany osobních údajů</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">12. Nahlášení závadného obsahu a stížnosti</h2>
            <p className="text-muted-foreground mb-4">
              <strong>12.1.</strong> Uživatel může nahlásit obsah, který považuje za protiprávní nebo odporující VOP, prostřednictvím kontaktních údajů uvedených na Portálu.
            </p>
            <p className="text-muted-foreground">
              <strong>12.2.</strong> Provozovatel je oprávněn obsah odstranit, omezit jeho dostupnost, nebo ponechat, a to dle VOP a právních předpisů. Uživatel může podat stížnost proti zásahu Provozovatele.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">13. Změny VOP a ukončení účtu</h2>
            <p className="text-muted-foreground mb-4">
              <strong>13.1.</strong> Provozovatel je oprávněn VOP měnit. Nové znění zveřejní na Portálu a oznámí Uživatelům.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>13.2.</strong> Nesouhlasí-li Uživatel se změnou, je oprávněn účet ukončit.
            </p>
            <p className="text-muted-foreground">
              <strong>13.3.</strong> Ukončením účtu nejsou dotčeny povinnosti uhradit již vzniklé provize a související pohledávky.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">14. Závěrečná ustanovení</h2>
            <p className="text-muted-foreground mb-4">
              <strong>14.1.</strong> Právní vztahy se řídí právním řádem České republiky.
            </p>
            <p className="text-muted-foreground">
              <strong>14.2.</strong> Tyto VOP nabývají účinnosti dnem 1. ledna 2026.
            </p>
          </section>

          <div className="mt-12 p-6 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Pro výtah pravidel pro konkrétní roli viz{' '}
              <Link to="/agency-rules" className="underline hover:text-primary">Pravidla pro Agentury</Link>
              {' '}nebo{' '}
              <Link to="/media-rules" className="underline hover:text-primary">Pravidla pro Média</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
