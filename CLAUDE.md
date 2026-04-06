# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Was die App macht

Eine clientseitige React-App zur Auswertung der öffentlichen Stellungnahmen zum Entwurf des Netzentwicklungsplans (NEP) Gas und Wasserstoff 2025. Nutzer laden eine `quelldaten.json`-Datei per Drag-and-Drop im Browser — alle Daten werden lokal verarbeitet, kein Upload. Die App befindet sich in früher Entwicklung (die Hauptansicht ist ein Platzhalter).

## Befehle

- `pnpm dev` — Entwicklungsserver starten (öffnet Browser automatisch)
- `pnpm build` — Produktions-Build nach `dist/`
- `pnpm preview` — Produktions-Build lokal ausliefern

Kein Test-Runner oder Linter konfiguriert.

## Tech-Stack

- **React 19** mit JSX (kein TypeScript)
- **Vite 7** mit `@vitejs/plugin-react`
- **Tailwind CSS v4** über `@tailwindcss/vite`-Plugin (Konfiguration in `src/index.css`, nicht `tailwind.config.js`)
- **shadcn/ui** (new-york-Stil, JSX-Variante) — konfiguriert in `components.json`, UI-Primitives in `src/components/ui/`. Bei Bedarf weiterer Komponenten zuerst in `/home/ansgar/repos/marktabfrage-wasserstoff/frontend` prüfen, ob dort fertige Varianten vorliegen. Diese können übernommen werden, aber vorher ausmisten: insbesondere alles rund um React Hook Form ist in diesem Projekt irrelevant.
- **pnpm** als Paketmanager
- Pfad-Alias: `@/` → `src/`

## Architektur

**App-Ablauf:** `main.jsx` → `App.jsx` → entweder `Dropzone` (ohne Daten) oder Auswahlseite (nach JSON-Laden) → App-Variante.

- `src/App.jsx` — Root-Komponente. Hält das geparste JSON im State. Zeigt `Dropzone` bis Daten geladen sind, wechselt dann zur Auswahlseite.
- `src/components/Dropzone.jsx` — Datei-Dropzone mit `react-dropzone`. Akzeptiert eine einzelne `.json`-Datei, parst sie, validiert die Top-Level-Struktur (`organisationen` + `themen` müssen vorhanden sein) und gibt die Daten über `onDataLoaded` nach oben.
- `src/pages/AppAuswahl.jsx` — Temporäre Auswahlseite mit Kacheln für die App-Varianten (App #1 bis App #N). Siehe `ziele.md` für den Hintergrund.
- `src/apps/appN/` — Isolierte App-Varianten. Jede hat eine `index.jsx` mit `{ id, name, component }` und eine `App.jsx` mit Props `{ organisationen, themen }`.
- `src/apps/registry.js` — Auto-Discovery per `import.meta.glob`. Erkennt alle `src/apps/app*/index.jsx` automatisch — muss nicht manuell editiert werden.
- `src/components/ui/` — shadcn/ui-Primitives (button, card, tooltip, dialog).

## App-Varianten-System

Dieses Projekt nutzt einen Multi-Varianten-Ansatz: Mehrere unabhängige App-Umsetzungen leben nebeneinander in `src/apps/app1/`, `src/apps/app2/` usw. Details und Auftrag stehen in `ziele.md`.

**Regeln für App-Varianten:**
- Obere linke Ecke ist reserviert: Dort sitzt der Home-Button (40×40px, `fixed top-3 left-3`). Keine eigenen Elemente dort platzieren.
- Kein globales CSS — nur Tailwind-Klassen und shadcn/ui.
- Varianten sind vollständig voneinander unabhängig (kein geteilter State).
- `registry.js` erkennt neue `src/apps/app*/index.jsx` automatisch — nicht manuell editieren.

**Komponenten-Reuse:** Vor dem Erstellen neuer UI-Komponenten prüfen, ob sie in der Schwester-App `/home/ansgar/repos/marktabfrage-wasserstoff/frontend` bereits vorliegen (unter `src/components/ui/` oder `src/components/custom/`). Übernommene Komponenten von React Hook Form, React Query und React Router bereinigen. Falls dort nicht vorhanden: `pnpm dlx shadcn@latest add <component>`.

## Datenmodell (quelldaten.json)

Vollständige Dokumentation in `erläuterung_der_quelldaten.md`. Wichtigste Punkte:

- Top-Level: `{ organisationen: [...], themen: [...] }`
- **44 Organisationen**, jeweils mit 1–12 `stellungnahmen`
- **100–150 thematisch geclusterte `themen`** — der zentrale Datenbestand der App
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
- Kein linksbündiges Layout: Container mit `max-w-*` immer mit `mx-auto` zentrieren.

## Deployment

Gebaut für GitHub Pages mit Base-Pfad `/stellungnahmen-entwurf-nep-2025-app/` (gesetzt in `vite.config.js`).
