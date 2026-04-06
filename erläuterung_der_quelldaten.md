# quelldaten.json – Erläuterung

Diese Datei beschreibt Struktur, Feldbedeutungen und fachlichen Hintergrund der Datei `quelldaten.json`. Sie dient als Kontextdokument für die Entwicklung einer Web-App, die `quelldaten.json` als einzige Datenquelle per Dropzone einlädt.

## Fachlicher Hintergrund

Der Netzentwicklungsplan (NEP) Gas und Wasserstoff 2025 beschreibt den notwendigen Aus- und Umbau der deutschen Gas- und Wasserstoffinfrastruktur. Er wird von den Fernleitungsnetzbetreibern (FNB) erstellt und von der Bundesnetzagentur (BNetzA) bestätigt. Im Rahmen einer öffentlichen Konsultation (März 2026) konnten Organisationen Stellungnahmen zum NEP-Entwurf einreichen – entweder kapitelweise über ein Online-Formular (mit thematischen Schlagwörtern, max. 2.000 Zeichen pro Feld) oder postalisch als PDF.

`quelldaten.json` enthält die Stellungnahmen von 44 Organisationen sowie eine thematische Clusterung in 100–150 Themen. Pro Organisation liegen zwei Ebenen vor:

- **Zusammenfassung der Stellungnahmen** (`zusammenfassung`) — eine verdichtete Gesamtaussage über alles, was die Organisation eingereicht hat.
- **Einzelstellungnahmen** (`stellungnahmen[]`) — die konkreten Einreichungen der Organisation, jeweils mit Kapitelbezug und Originaltext. Pro Organisation gibt es 1 bis 12 Einzelstellungnahmen.

**Wichtig:** Die Anzahl der Einzelstellungnahmen pro Organisation ist kein inhaltliches Maß. Sie ergibt sich allein aus dem Einreichungsformat: Wer das Online-Formular kapitelweise nutzte, erzeugte mehrere Einträge; wer alles in ein Kapitel schrieb oder als PDF einreichte, hat nur einen. Auch die Gesamtzahl (derzeit 180) ist daher ein Artefakt und sollte in der App nicht prominent dargestellt werden. Aussagekräftig sind die Anzahl der **Organisationen** (44) und der **Themen** (100–150).

Der Themen-Block ist der zentrale Datenbestand für die App: Er zeigt, welche Themen wie häufig adressiert wurden und welche Organisationen welche Themen ansprechen.

Die typischen Nutzer der App sind Fachexperten der FNB.

## Kennzahlen

| Kennzahl                                        | Wert                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| Organisationen                                  | 44                                                  |
| Einzelstellungnahmen gesamt                     | 180 (Artefakt des Einreichungsformats, siehe oben)  |
| Max. Einzelstellungnahmen pro Organisation      | 12                                                  |
| Themen                                          | 100–150 (aktuell 138, kann sich noch leicht ändern) |
| Max. Organisationen pro Thema                   | 16                                                  |
| Max. Zeichenlänge `stellungnahme`               | ca. 5.000                                           |
| Max. Zeichenlänge `zusammenfassung`             | ca. 5.300                                           |
| Max. Zeichenlänge `beschreibung` (Themen)       | ca. 1.100                                           |
| Max. Zeichenlänge `dokument`                    | ca. 35.000                                          |
| Organisationen mit PDF-Einreichung (`dokument`) | 4                                                   |
| Dateigröße                                      | ca. 500 KB                                          |
| Encoding                                        | UTF-8                                               |

## Datenmodell

```
quelldaten.json
├── organisationen[]  ─── Array aller 44 Organisationen
│   ├── nr                          ◄── Primärschlüssel (String "1" bis "44")
│   ├── organisation
│   ├── abkürzung
│   ├── email_endung
│   ├── zusammenfassung
│   └── stellungnahmen[]  ─── Einzelstellungnahmen dieser Org (1–12 Stück)
│       ├── #
│       ├── kapitel
│       ├── schlagworte[]
│       ├── stellungnahme
│       └── dokument                ◄── nur bei 4 PDF-Orgs statt stellungnahme
│
└── themen[]  ─── Array der 100–150 thematischen Cluster
    ├── thema
    ├── beschreibung
    └── organisationen[]            ◄── Array von nr-Werten → Verweis auf organisationen[].nr
```

### Verknüpfungen

```
themen[].organisationen[]  ──nr──►  organisationen[].nr
                                      ├── .zusammenfassung    (Gesamtbild der Org)
                                      └── .stellungnahmen[]   (Einzeltexte der Org)
```

Die Verknüpfung läuft über `nr` (Organisations-Nummer). Von einem Thema aus gelangt man zu den Organisationen, die dieses Thema adressiert haben. Pro Organisation steht die **Zusammenfassung der Stellungnahmen** als verdichtete Gesamtaussage bereit; die **Einzelstellungnahmen** liefern die Detailebene.

Es gibt keine direkte Verknüpfung zwischen einem Thema und einer bestimmten Einzelstellungnahme – die Zuordnung existiert nur auf Organisationsebene.

### Sortierung

- `organisationen[]`: nach `nr` aufsteigend sortiert ("1", "2", ..., "44")
- `stellungnahmen[]`: keine definierte Sortierung (weder nach Kapitel noch nach Stellungnahmen-Nummer)
- `themen[]`: keine garantierte Sortierung
- `themen[].organisationen[]`: aufsteigend sortiert

## Feldbeschreibungen

### Top-Level

| Feld             | Typ   | Beschreibung                                                                                    |
| ---------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `organisationen` | Array | Alle 44 Organisationen mit ihren Stellungnahmen                                                 |
| `themen`         | Array | 100–150 thematische Cluster über alle Stellungnahmen hinweg. **Wichtigster Block für die App.** |

### organisationen[]

| Feld              | Typ    | Beschreibung                                                                                                                                      |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nr`              | String | Organisations-Nummer ("1" bis "44"). Primärschlüssel, auf den `themen[].organisationen` verweist.                                                 |
| `organisation`    | String | Vollständiger Name der Organisation (manuell erfasst).                                                                                            |
| `abkürzung`       | String | Kurzform, z.B. "VKU", "BDEW" (nachträglich vergeben). Eignet sich als kompakte Anzeige in der UI.                                                 |
| `email_endung`    | String | E-Mail-Domain der einreichenden Person, z.B. "vku.de" (manuell erfasst). Hinweis auf institutionellen Hintergrund.                                |
| `zusammenfassung` | String | **Zusammenfassung der Stellungnahmen:** Verdichtung aller Einzelstellungnahmen dieser Organisation zu einer Gesamtaussage. Bis ca. 5.300 Zeichen. |
| `stellungnahmen`  | Array  | **Einzelstellungnahmen:** Die konkreten Einreichungen dieser Organisation (1 bis 12 Stück), jeweils mit Kapitelbezug und Originaltext.            |

### stellungnahmen[]

| Feld            | Typ               | Beschreibung                                                                                                                                                                                                                                                                                                        |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#`             | String            | Laufende Stellungnahmen-Nummer, z.B. "2025-42". Eindeutige ID als String. Sonderfälle: "2025-7 \| 2025-8" (zusammengelegte Stellungnahme), "2025-166 bis 2025-170" (zusammengefasster Nummernbereich), "2025-PDF-I" bis "2025-PDF-IV" (postalische Einreichungen).                                                  |
| `kapitel`       | String            | Bezugskapitel des NEP-Entwurfs (Originaltext der Org, Auswahl aus Formular). Bei PDF-Einreichungen immer "Generelle Anmerkungen". Mögliche Werte: "Executive Summary", "Kapitel 1" bis "Kapitel 8", "Generelle Anmerkungen", "Anhänge/Anlagen", "NEP-Gas-Datenbank".                                                |
| `schlagworte`   | Array von Strings | Thematische Tags aus dem Konsultationsformular, z.B. ["Integrierte Planung", "Kernnetz-Anpassungen"] (Originaltext der Org, Auswahl aus Formular). Bei PDF-Einreichungen ein leeres Array `[]`.                                                                                                                     |
| `stellungnahme` | String oder null  | Freitext der Stellungnahme (Originaltext der Org). Bis ca. 5.000 Zeichen. Bei Online-Einreichungen immer ein nicht-leerer String. Ist `null` bei den 4 PDF-Einreichungen – dort steht der Text stattdessen in `dokument`.                                                                                           |
| `dokument`      | String (optional) | Nur bei 4 postalischen PDF-Einreichungen vorhanden: der vollständige Text der Stellungnahme als Markdown (konvertiert aus PDF). Bis ca. 35.000 Zeichen. Bei allen anderen Organisationen fehlt dieser Key komplett (nicht `null`, sondern absent). Wenn `dokument` vorhanden ist, ist `stellungnahme` immer `null`. |

### themen[]

| Feld             | Typ                | Beschreibung                                                                                                                                                                                |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `thema`          | String             | Kurztitel des Themas auf mittlerem Abstraktionsniveau. Spezifisch genug für konkrete Inhalte, breit genug, dass mehrere Organisationen sich darin wiederfinden.                             |
| `beschreibung`   | String             | Fachliche Synthese aller Kernaussagen der zugeordneten Organisationen zu diesem Thema. Benennt Mehrheits- und Minderheitspositionen, konsolidiert ohne Redundanz. Bis ca. 1.100 Zeichen.    |
| `organisationen` | Array von Integers | Organisations-Nummern (als Integer, nicht String), die dieses Thema adressiert haben. Werte entsprechen `organisationen[].nr` – Achtung: hier Integer (z.B. `4`), dort String (z.B. `"4"`). |

## Synthetische Beispiele

### Gesamtstruktur (Top-Level)

```json
{
   "organisationen": [
      /* 44 Einträge */
   ],
   "themen": [
      /* 100–150 Einträge */
   ]
}
```

### Normale Organisation (Online-Einreichung)

```json
{
   "nr": "99",
   "organisation": "Muster-Stadtwerke GmbH",
   "abkürzung": "MSW",
   "email_endung": "muster-stadtwerke.de",
   "zusammenfassung": "Die Muster-Stadtwerke begrüßen den NEP-Entwurf, fordern jedoch eine frühzeitige Anbindung der Region Musterstadt an das Wasserstoff-Kernnetz bis spätestens 2030, da konkrete Elektrolyseprojekte und industrielle Abnehmer auf die Transportinfrastruktur angewiesen sind.",
   "stellungnahmen": [
      {
         "#": "2025-99",
         "kapitel": "Executive Summary",
         "schlagworte": ["Integrierte Planung"],
         "stellungnahme": "Die Muster-Stadtwerke begrüßen den NEP-Entwurf und die integrierte Betrachtung von Methan- und Wasserstoffnetzen."
      },
      {
         "#": "2025-100",
         "kapitel": "Kapitel 7",
         "schlagworte": ["Netzausbauvorschlag Wasserstoff", "Kernnetz-Anpassungen"],
         "stellungnahme": "Für den Standort Musterstadt ist die rechtzeitige Inbetriebnahme der Leitung H2-999-01 essenziell. Eine Verschiebung auf 2037 würde laufende Investitionsentscheidungen gefährden und den regionalen Wasserstoffhochlauf ausbremsen."
      }
   ]
}
```

### Postalische Einreichung (PDF)

```json
{
   "nr": "98",
   "organisation": "Beispielverband e.V.",
   "abkürzung": "BV",
   "email_endung": "beispielverband.de",
   "zusammenfassung": "Der Beispielverband fordert eine stärkere Berücksichtigung der Verteilnetzebene im NEP und kritisiert die unzureichende Verzahnung mit der kommunalen Wärmeplanung.",
   "stellungnahmen": [
      {
         "#": "2025-PDF-V",
         "kapitel": "Generelle Anmerkungen",
         "schlagworte": [],
         "stellungnahme": null,
         "dokument": "# Stellungnahme des Beispielverbands zum NEP 2025\n\n## Zusammenfassung\n\nDer Beispielverband fordert...\n\n## Detailkritik\n\n..."
      }
   ]
}
```

### Thema

```json
{
   "thema": "Frühzeitige Anbindung regionaler Wasserstoffcluster an das Kernnetz",
   "beschreibung": "Mehrere Organisationen fordern die rechtzeitige Fertigstellung konkreter Kernnetzleitungen als Voraussetzung für Investitionsentscheidungen. Ohne gesicherte Anbindung scheitern Elektrolyseprojekte und industrielle Abnehmer an der Finanzierung. Die Mehrheit der Stellungnehmenden sieht die aktuelle Zeitplanung als zu spät an.",
   "organisationen": [98, 99]
}
```

## Implementierungshinweise (JavaScript)

**Typunterschied bei Organisations-Nummern:** In `organisationen[].nr` ist die Nummer ein **String** (z.B. `"4"`), in `themen[].organisationen[]` ein **Integer** (z.B. `4`). Beim Verknüpfen muss konvertiert werden (z.B. `String(id)` oder `parseInt(nr)`).

**`#` als JSON-Key:** Das Zeichen `#` ist in JavaScript ein reserviertes Zeichen für Private Class Fields. Zugriff nur per Bracket-Notation: `s["#"]`, nicht `s.#` (Syntaxfehler).

**Abwesendes `dokument`-Feld:** Bei den 40 Online-Organisationen fehlt der Key `dokument` komplett. Prüfung per `"dokument" in s` (nicht `s.dokument`, da der Key bei Online-Einreichungen fehlt und `undefined` zurückgäbe).

**Umlaut-Keys:** Mehrere Feldnamen enthalten Umlaute (`abkürzung`, `zusammenfassung`). In JavaScript unproblematisch, aber bei URL-Encoding oder als CSS-Klassen zu beachten.
