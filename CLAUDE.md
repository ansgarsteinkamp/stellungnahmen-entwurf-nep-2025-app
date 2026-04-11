# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Was die App macht

Eine clientseitige React-App zur Auswertung der öffentlichen Stellungnahmen zum Entwurf des Netzentwicklungsplans (NEP) Gas und Wasserstoff 2025. Nutzer laden eine `quelldaten.json`-Datei per Drag-and-Drop im Browser — alle Daten werden lokal verarbeitet, kein Upload. Die App bietet sechs Hauptansichten: Übersicht (Dashboard), Themen, Kapitel, Schlagworte, Organisationen und Suche.

## Befehle

- `pnpm dev` — Entwicklungsserver starten (öffnet Browser automatisch)
- `pnpm build` — Produktions-Build nach `dist/`
- `pnpm preview` — Produktions-Build lokal ausliefern

Kein Test-Runner oder Linter konfiguriert.

## Tech-Stack

- **React 19** mit JSX (kein TypeScript)
- **Vite 7** mit `@vitejs/plugin-react`
- **Tailwind CSS v4** über `@tailwindcss/vite`-Plugin (Konfiguration in `src/index.css`, nicht `tailwind.config.js`)
- **shadcn/ui** (new-york-Stil, JSX-Variante) — konfiguriert in `components.json`, UI-Primitives in `src/components/ui/`.
- **pnpm** als Paketmanager
- Pfad-Alias: `@/` → `src/`

## Architektur

**App-Ablauf:** `main.jsx` → `App.jsx` → entweder `Dropzone` (ohne Daten) oder `MainView` (nach JSON-Laden).

- `src/App.jsx` — Root-Komponente. Hält das geparste JSON im State. Zeigt `Dropzone` bis Daten geladen sind, dann `MainView`.
- `src/components/Dropzone.jsx` — Datei-Dropzone mit `react-dropzone`. Akzeptiert eine einzelne `.json`-Datei, parst sie, validiert die Top-Level-Struktur (`organisationen` + `themen` müssen vorhanden sein) und gibt die Daten über `onDataLoaded` nach oben.
- `src/components/MainView.jsx` — Zentrale Ansicht mit Tab-Navigation (Übersicht, Themen, Kapitel, Schlagworte, Organisationen, Suche). Verwaltet den Navigations-State und die Browser-History.
- `src/components/Dashboard.jsx` — Übersichtsseite mit Kennzahlen und Einstiegspunkten.
- `src/components/ThemenView.jsx` — Master-Detail-Ansicht der thematischen Cluster.
- `src/components/KapitelView.jsx` — Ansicht gruppiert nach NEP-Kapiteln.
- `src/components/SchlagworteView.jsx` — Ansicht über die Schlagwort-Facetten der Stellungnahmen.
- `src/components/OrgView.jsx` — Ansicht der Organisationen mit Zusammenfassungen und Einzelstellungnahmen.
- `src/components/SucheView.jsx` — Volltextsuche über Themen, Organisationen und Stellungnahmen.
- `src/components/viz/NetworkGraph.jsx` — Netzwerk-Visualisierung der Beziehungen zwischen Themen/Organisationen.
- `src/lib/helpers.js` — Hilfsfunktionen (OrgMap-Aufbau, Textextraktion, Highlighting).
- `src/lib/similarity.js` — Ähnlichkeitsberechnung (z.B. für Themen-/Organisationsverknüpfungen im NetworkGraph).
- `src/components/ui/` — shadcn/ui-Primitives (wird laufend erweitert).
- `src/components/custom/` — Projektspezifische Komponenten (z.B. SearchInput).

## Komponenten-Reuse

Vor dem Erstellen neuer UI-Komponenten prüfen, ob sie in der Schwester-App `/home/ansgar/repos/marktabfrage-wasserstoff/frontend` bereits vorliegen (unter `src/components/ui/` oder `src/components/custom/`). Übernommene Komponenten von React Hook Form, React Query und React Router bereinigen. Falls dort nicht vorhanden: `pnpm dlx shadcn@latest add <component>`.

## Abhängigkeiten

npm-Pakete, die bereits in `/home/ansgar/repos/marktabfrage-wasserstoff/frontend/package.json` als Dependency stehen, dürfen in der aktuellsten Version verwendet werden. Darüber hinaus weitere Pakete nur, sofern bewährt, aktiv gepflegt und weit verbreitet. Keine Exoten, keine veralteten Libraries.

## Datenmodell (quelldaten.json)

Vollständige Dokumentation in `erläuterung_der_quelldaten.md`. Implementierungs-Fallstricke:

- `themen[].organisationen` enthält Integer-IDs, aber `organisationen[].nr` ist ein String — Konvertierung beim Verknüpfen nötig
- Zugriff auf Stellungnahmen-IDs nur per Bracket-Notation: `s["#"]` (nicht `s.#`)
- 4 Organisationen haben per PDF eingereicht: dort `dokument` (Markdown-String) statt `stellungnahme`; Prüfung mit `"dokument" in s`
- Feldnamen enthalten Umlaute (`abkürzung`, `zusammenfassung`)

## Styling-Konventionen

- Nur Dark Theme (kein Light Mode), definiert über CSS Custom Properties in `src/index.css`
- Primärfarbe: `#d97757` (warmes Orange)
- Schriftart: DM Mono (Monospace), geladen aus `src/fonts/`
- Eigene Breakpoints: `3xs` (411px), `2xs` (480px), `xs` (540px) sowie Standard-Tailwind `sm`–`2xl`
- Eigene Textgrößen: `2xs`, `3xs`, `4xs` unterhalb der Standard-Tailwind-Skala
- UI-Sprache ist Deutsch
- Primär für Desktop-Browser optimieren. Auf Mobilgeräten grundlegend nutzbar, aber kein optimiertes Mobile-Erlebnis nötig.
- Kein linksbündiges Layout: Container mit `max-w-*` immer mit `mx-auto` zentrieren.

## Git-Commits

Nur committen, wenn der User es ausdrücklich wünscht. Commit-Stil:

- Commit-Message auf Englisch, kurz und prägnant (Imperative Mood)
- `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>` als letzte Zeile
- Nur die vom User genannten Dateien stagen — kein `git add -A`

## Deployment

Gebaut für GitHub Pages mit Base-Pfad `/stellungnahmen-entwurf-nep-2025-app/` (gesetzt in `vite.config.js`).
