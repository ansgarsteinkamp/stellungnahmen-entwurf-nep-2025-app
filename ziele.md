# ziele.md – Was die App leisten soll

## Fachlicher Kontext

Im Rahmen der öffentlichen Konsultation zum Entwurf des Netzentwicklungsplans (NEP) Gas und Wasserstoff 2025 haben 44 Organisationen Stellungnahmen eingereicht. Diese wurden in ca. 138 Themen geclustert. Pro Organisation gibt es eine **Zusammenfassung der Stellungnahmen** (verdichtete Gesamtaussage) und **Einzelstellungnahmen** (die konkreten Einreichungen mit Kapitelbezug). Die vollständige Datenbeschreibung steht in `erläuterung_der_quelldaten.md` — **lies diese Datei vollständig**, bevor du mit der Umsetzung beginnst.

## Zielgruppe

Mitarbeiter der Fernleitungsnetzbetreiber (FNB) — von Fachexperten bis Management. Sie wollen die eingereichten Stellungnahmen effizient erfassen und verstehen.

## Kernziele

Die App soll ihren Nutzern helfen, folgende Fragen zu beantworten:

- **Schwerpunkte erkennen** — Welche Themen waren besonders präsent?
- **Themen verstehen** — Worum geht es bei einem bestimmten Thema?
- **Akteure sehen** — Welche Organisationen stehen hinter einem Thema?
- **Positionen lesen** — Was sagt eine Organisation insgesamt (Zusammenfassung der Stellungnahmen) und im Detail (Einzelstellungnahmen)?
- **Gezielt finden** — Wo taucht ein bestimmter Begriff, ein Thema oder eine Organisation auf?

Diese Ziele sind bewusst offen formuliert. Es gibt keine Vorgaben für Darstellungsform, Navigationsstruktur oder Interaktionsmuster. Du entscheidest, wie du diese Ziele umsetzt.

## Kreativitäts-Aufruf

Lies `erläuterung_der_quelldaten.md` aufmerksam. Überlege dir, was man aus diesen Daten noch Sinnvolles oder Nützliches machen kann — über die fünf Kernziele hinaus. Eigene Ideen sind ausdrücklich erwünscht.

## Nicht-Ziele

Wenige, aber harte Grenzen:

- **Kein Export, kein Teilen** — Kein Copy-to-Clipboard, kein CSV-Download, keine Druckansicht, kein Link-Sharing.
- **Keine Dateneingabe** — Die App ist eine reine Lese-Anwendung. Keine Annotationen, Favoriten, Notizen oder Bewertungen.
- **Kein Login, keine Serverseite** — Alles läuft clientseitig im Browser. Keine API-Calls, keine Datenbank.
- **Kein Light Mode** — Nur Dark Theme.

## Technischer Rahmen

Die App ist ein bestehendes React-Projekt. Die technischen Details (Stack, Styling-Konventionen, Pfade) stehen in `CLAUDE.md` — **lies auch diese Datei**. Wichtig:

- Nutze den bestehenden Stack: React, Tailwind CSS, shadcn/ui.
- Halte dich an das bestehende Farbschema und die Schriftart (DM Mono).
- Die UI-Sprache ist Deutsch.
- Primär für Desktop-Browser optimieren. Auf Mobilgeräten grundlegend nutzbar, aber kein optimiertes Mobile-Erlebnis nötig.
- Die JSON-Daten werden per Dropzone geladen (bereits implementiert). Deine App-Komponente erhält `{ organisationen, themen }` als Props.
- Zum Testen liegt eine echte `quelldaten.json` im Repo-Root. Lade sie im Browser per Drag-and-Drop in die Dropzone.

### UI-Komponenten und Abhängigkeiten

**Nutze shadcn/ui-Komponenten** für alle Standard-UI-Elemente. Baue keine eigenen Varianten von Dingen, die shadcn/ui bereits bietet. Einige der Komponenten liegen bereits in `src/components/ui/`.

**Bevor du eine Komponente neu erstellst:** Prüfe zuerst, ob sie in der Schwester-App bereits existiert — sowohl unter `/home/ansgar/repos/marktabfrage-wasserstoff/frontend/src/components/ui/` (shadcn-Primitives) als auch unter `/home/ansgar/repos/marktabfrage-wasserstoff/frontend/src/components/custom/` (projektspezifische Komponenten wie SearchInput, Typography, ConfirmationDialog). Übernimm sie von dort (aber vorher ausmisten: alles rund um React Hook Form, React Query und React Router ist in diesem Projekt irrelevant). Falls die Komponente dort nicht vorliegt, installiere sie per `pnpm dlx shadcn@latest add <component>`.

**npm-Pakete:** Pakete, die bereits in `/home/ansgar/repos/marktabfrage-wasserstoff/frontend/package.json` als Dependency stehen, darfst du in der aktuellsten Version verwenden. Darüber hinaus darfst du weitere Pakete installieren, sofern sie bewährt, aktiv gepflegt und weit verbreitet sind. Keine Exoten, keine veralteten Libraries.

### Regeln für App-Varianten

- **Obere linke Ecke ist reserviert:** Dort sitzt der Home-Button (40×40px, `fixed top-3 left-3`). Platziere dort keine eigenen Elemente.
- **Kein globales CSS:** Verwende ausschließlich Tailwind-Klassen und shadcn/ui-Komponenten. Keine eigenen globalen CSS-Regeln, die andere Apps beeinflussen könnten.

## Prozess: Mehrere App-Varianten

Dieses Projekt verfolgt einen besonderen Ansatz: Mehrere unabhängige Claude-Instanzen bauen jeweils eine eigene Umsetzung derselben Ziele. Am Ende wird die beste Variante ausgewählt und weiterentwickelt.

### Struktur

- Jede App-Variante lebt in einem eigenen, isolierten Ordner: `src/apps/app1/`, `src/apps/app2/` usw.
- Jeder Ordner enthält eine `index.jsx`, die `{ id, name, component }` als Default exportiert. Die Registry (`src/apps/registry.js`) erkennt alle App-Ordner automatisch per `import.meta.glob` — **du musst `registry.js` nicht anfassen**.
- Die Varianten sind vollständig voneinander unabhängig — kein geteilter State, keine gemeinsamen Komponenten (außer shadcn/ui-Primitives und ggf. aus der Schwester-App übernommene Komponenten in `src/components/`).

### Auswahlseite

Nach dem Laden der JSON-Daten sieht der Nutzer eine einfache Auswahlseite mit Kacheln ("App #1", "App #2" usw.). Klick auf eine Kachel öffnet die jeweilige Variante. Ein Home-Button oben links führt zurück zur Auswahlseite.

Diese Auswahlseite ist temporär — sie dient nur dem Vergleich und wird später durch die Gewinner-App ersetzt.

### Ablauf

Die Instanzen laufen **nacheinander**, nicht parallel. Nach jeder Runde wird `ziele.md` ggf. feinjustiert. Jede Instanz sieht also die bereits vorhandenen App-Ordner, soll aber nicht in fremde Ordner eingreifen.

### Auftrag an jede Instanz

1. Lies `erläuterung_der_quelldaten.md`, `CLAUDE.md` und `ziele.md` (diese Datei) vollständig.
2. Ermittle deine Nummer N: Schau, welche Ordner in `src/apps/` bereits existieren, und nimm die nächste freie Nummer.
3. Baue deine App-Variante in `src/apps/appN/`.
4. Erstelle `src/apps/appN/index.jsx` mit folgendem Default-Export:
   ```js
   import App from "./App";
   export default { id: N, name: "App #N", component: App };
   ```
5. Deine Root-Komponente (`App.jsx`) erhält `{ organisationen, themen }` als Props.
6. Stelle sicher, dass `pnpm dev` ohne Fehler läuft und deine App funktioniert.
7. Fasse **keine** Dateien außerhalb von `src/apps/appN/` an (außer `src/components/ui/` bei Bedarf neuer shadcn-Komponenten).
8. Erstelle keinen Git-Commit — das übernimmt der Nutzer.
