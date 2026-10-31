# Zento

En svensk B2C-sajt för AI-kurser live online. Fristående HTML, CSS och JavaScript, med samma Cal.com-baserade bokningsprincip som EUC Stockholm. Appkursen och spelkursen har separata tillfällen.

## Förhandsvisa

Kör `npm run dev` och öppna http://127.0.0.1:5187. Kräver Python 3. Ingen installation av npm-paket behövs.

Förhandsvisa via HTTP-servern ovan; spelets JavaScript-moduler kräver HTTP (eller GitHub Pages).

## Publicera på GitHub Pages

1. Lägg dessa filer i ett GitHub-repository och pusha dem.
2. Välj **Settings → Pages → Deploy from a branch**.
3. Välj din branch och **/(root)** och spara.

Alla sökvägar är relativa, så sidan fungerar även på `användare.github.io/repository/`. `.nojekyll` finns i roten. Inga Sites-tjänster eller ramverk används.

Om du föredrar att publicera en byggd katalog skapar `npm run build` en ren `dist/`. `npm run check` kontrollerar JavaScript-syntax.

## Aktivera bokning

Bokning är avsiktligt inte kopplad till EUC Stockholms 60-minuterslektion. Tills nya kurslänkar läggs in visar båda knapparna **Bokningen öppnar snart**, med en förifylld intresseförfrågan via deltagarens mejlprogram. Inget skickas automatiskt och ingen plats eller betalning registreras på sajten.

1. Skapa två nya Cal.com-event: appkurs och spelkurs.
2. Ställ in vardera till 120 minuter, online, med 4–8 bokningsbara deltagarplatser i pilotgruppen (använd Cal.coms funktion för seats). Säkerställ att dina Cal.com-inställningar stödjer gruppbokning och ger varje deltagare samma möteslänk.
3. Ange pilotpriset 399 kr per person och kurs, och Swish-instruktioner i bekräftelsen. Ordinarie pris på sajten är 699 kr. Kontrollera avbokningsvillkor och betalningsinformation i Cal.com före öppning.
4. Uppdatera `booking-config.js`:

```js
app: { title: 'Bygg din första app.', calLink: 'ditt-konto/din-appkurs' },
game: { title: 'Bygg ditt första spel.', calLink: 'ditt-konto/din-spelkurs' }
```

`origin` är `https://app.cal.com`, enligt Peters Cal.com-inbäddning för appkursen. Använder du ett konto på `https://cal.com` ändrar du `origin` till det. Sökvägarna ska vara relativa och av formen `konto/event`.

5. Uppdatera svaret på frågan **När är nästa kurs och hur bokar jag?** i `index.html` när datum publicerats.
6. Provboka båda kurserna och kontrollera rätt längd, pris, deltagarkapacitet, tidszon, online-möteslänk och bokningsbekräftelse innan du öppnar för deltagare.

Cal.com-kalendern laddas först när en kurs med en giltig länk väljs. En separat länk till kalendern finns om inbäddningen inte laddar. Senare kan gruppkapaciteten höjas till 30 i Cal.com.

## Ändra innehåll

- `index.html`: svensk text, kursinformation, priser, integritetsinformation och vanliga frågor.
- `style.css`: färger i `:root`, layout, animationer och responsiva brytpunkter.
- `script.js`: interaktiva demonstrationer, dialoger och Cal.com-integration.
- `booking-config.js`: kurslänkar, region och kontaktmejl för intresseförfrågan. Synliga kontaktlänkar finns även i `index.html`.

Priserna finns på flera ställen i HTML och behöver uppdateras tillsammans. Eget Codex- eller Claude-abonnemang ingår inte. Inga datum, lediga platser eller omdömen har hittats på.

## Integritet och tillgänglighet

Inga egna analysverktyg, formulärservrar, cookies eller localStorage används. Google Fonts laddas för typografin; Cal.com laddas vid aktiv bokning. Interaktiva demoexempel sparas bara i minnet. Native dialoger ger tangentbordsnavigation och Escape-stängning, och sidan respekterar `prefers-reduced-motion`.

## Visuell identitet

Logotyp: `assets/zento-logo.png`, transparent PNG skapad med imagegen. Ett vikt pappers-Z i tegelrött tillsammans med en mörk ordlogotyp. Full genereringsprompt och designanteckningar finns i `assets/logo-notes.md`. Favikonen är en liten förenklad SVG-variant.

Sajtens identitet använder varma papperstoner, tegelrött, dämpad salvia och lugnare typografi. De dekorativa asteriskerna är borttagna. Huvudrubriken växlar mjukt mellan ”Din första app” och ”Ditt första spel” och respekterar minskad rörelse. Det interaktiva spelet och dess stjärnor är kvar.

## Om Peter

Sektionen `#om-peter` innehåller den bakgrund Peter angett: 10 års erfarenhet som utvecklare från Klarna, Nordnet, Kustom, Irori och Forefront, och nuvarande roll som lösningsarkitekt. Samtliga fem företag visas med lokalt sparade officiella logotyper; källor finns i `assets/companies/SOURCES.md`.

Porträttet ligger i `assets/profile_pic.png` och används både i Om mig-sektionen och som liten bild vid kursupplägget. Originalfilen har flyttats från projektroten till assets. Beskärningen styrs med `object-position` på `.portrait-photo`, med separat anpassning för mobil.

## Lilla löparspelet

Klicka på spelytan för att starta. Klicka igen, eller använd mellanslag/pil upp/Enter när spelet har fokus, för att hoppa. Varje stjärna ger 10 poäng; om en stjärna passerar spelaren slutar omgången. Klicka för att försöka igen, eller använd omstartsknappen. Tempot ökar försiktigt. Spelet pausas när fliken tappar fokus eller spelytan lämnar skärmen, och fortsätter först vid ett aktivt klick.

`runner-engine.mjs` innehåller spelfysik i fasta koordinater. `runner.mjs` sköter inmatning och rendering. `npm test` kontrollerar fångst, miss, hopp, ökande hastighet och återställning.

Appkursens kalender är ansluten till `peter-jaaskelainen-vlpjko/app-kurs-120m` på `https://app.cal.com`. Spelkursen är ansluten till `peter-jaaskelainen-vlpjko/spel-kurs-120m` på samma Cal.com-konto.
