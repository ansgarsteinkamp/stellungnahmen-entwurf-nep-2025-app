# ziele.md – Was die App leisten soll

## Fachlicher Kontext

Im Rahmen der öffentlichen Konsultation zum Entwurf des Netzentwicklungsplans (NEP) Gas und Wasserstoff 2025 haben 44 Organisationen Stellungnahmen eingereicht. Diese wurden in ca. 138 Themen geclustert. Pro Organisation gibt es eine **Zusammenfassung der Stellungnahmen** (verdichtete Gesamtaussage) und **Einzelstellungnahmen** (die konkreten Einreichungen mit Kapitelbezug). Die vollständige Datenbeschreibung steht in `erläuterung_der_quelldaten.md`.

## Zielgruppe

Mitarbeiter der Fernleitungsnetzbetreiber (FNB) — von Fachexperten bis Management. Sie wollen die eingereichten Stellungnahmen effizient erfassen und verstehen.

## Kernziele

Die App soll ihren Nutzern helfen, folgende Fragen zu beantworten:

- **Schwerpunkte erkennen** — Welche Themen waren besonders präsent?
- **Themen verstehen** — Worum geht es bei einem bestimmten Thema?
- **Akteure sehen** — Welche Organisationen stehen hinter einem Thema?
- **Positionen lesen** — Was sagt eine Organisation insgesamt (Zusammenfassung der Stellungnahmen) und im Detail (Einzelstellungnahmen)?
- **Gezielt finden** — Wo taucht ein bestimmter Begriff, ein Thema oder eine Organisation auf?

Über die Kernziele hinaus können weitere sinnvolle Auswertungen ergänzt werden.

## Nicht-Ziele

Wenige, aber harte Grenzen:

- **Kein Export, kein Teilen** — Kein Copy-to-Clipboard, kein CSV-Download, keine Druckansicht, kein Link-Sharing.
- **Keine Dateneingabe** — Die App ist eine reine Lese-Anwendung. Keine Annotationen, Favoriten, Notizen oder Bewertungen.
- **Kein Login, keine Serverseite** — Alles läuft clientseitig im Browser. Keine API-Calls, keine Datenbank.
- **Kein Light Mode** — Nur Dark Theme.

## Technischer Rahmen

Technische Details (Stack, Styling, Architektur, Abhängigkeiten) stehen in `CLAUDE.md`. Zum Testen liegt eine echte `quelldaten.json` im Repo-Root (nicht eingecheckt) — per Drag-and-Drop in die Dropzone laden.
