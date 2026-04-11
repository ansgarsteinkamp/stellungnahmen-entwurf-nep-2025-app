# quelldaten_v2.json – Erläuterung

Diese Datei beschreibt Struktur, Feldbedeutungen und fachlichen Hintergrund der Datei `quelldaten_v2.json`. Sie dient als Kontextdokument für die Entwicklung einer Web-App, die `quelldaten_v2.json` als einzige Datenquelle per Dropzone einlädt.

## Fachlicher Hintergrund

Der Netzentwicklungsplan (NEP) Gas und Wasserstoff 2025 beschreibt den notwendigen Aus- und Umbau der deutschen Gas- und Wasserstoffinfrastruktur. Er wird von den Fernleitungsnetzbetreibern (FNB) erstellt und von der Bundesnetzagentur (BNetzA) bestätigt. Im Rahmen einer öffentlichen Konsultation (März 2026) konnten Organisationen Stellungnahmen zum NEP-Entwurf einreichen – entweder kapitelweise über ein Online-Formular (mit thematischen Schlagwörtern, max. 2.000 Zeichen pro Feld) oder postalisch als PDF.

`quelldaten_v2.json` enthält die Stellungnahmen von 44 Organisationen sowie zwei voneinander unabhängige verdichtete Sichten auf den Gesamtbestand:

- **Themen** (`themen[]`) — eine feingranulare Clusterung in 100–150 thematische Gruppen.
- **Kapitel** (`kapitel[]`) — eine grobgranulare, inhaltsbasierte Zusammenfassung entlang der 12 NEP-Kapitel.

Pro Organisation liegen zwei Ebenen vor:

- **Zusammenfassung der Stellungnahmen** (`zusammenfassung`) — eine verdichtete Gesamtaussage über alles, was die Organisation eingereicht hat.
- **Einzelstellungnahmen** (`stellungnahmen[]`) — die konkreten Einreichungen der Organisation, jeweils mit Kapitelbezug und Originaltext. Pro Organisation gibt es 1 bis 12 Einzelstellungnahmen.

**Wichtig:** Die Anzahl der Einzelstellungnahmen pro Organisation ist kein inhaltliches Maß. Sie ergibt sich allein aus dem Einreichungsformat: Wer das Online-Formular kapitelweise nutzte, erzeugte mehrere Einträge; wer alles in ein Kapitel schrieb oder als PDF einreichte, hat nur einen. Auch die Gesamtzahl (derzeit 180) ist daher ein Artefakt und sollte in der App nicht prominent dargestellt werden. Aussagekräftig sind die Anzahl der **Organisationen** (44), der **Themen** (100–150) und der **Kapitel** (12).

### Zwei Kapitelsichten

Es existieren zwei unterschiedliche Zuordnungen von Stellungnahmen zu NEP-Kapiteln:

1. **Formularbasiert** über `organisationen[].stellungnahmen[].kapitel`. Das ist die Selbstauskunft der einreichenden Organisation aus dem Online-Formular. Sie spiegelt **nicht zwingend** den tatsächlichen inhaltlichen Bezug wider: Zeichenbegrenzungen pro Feld haben Inhalte auf andere Kapitel verschoben, die Trennschärfe zwischen Kapiteln ist begrenzt, und alle postalischen PDF-Einreichungen wurden pauschal „Generelle Anmerkungen" zugeordnet.
2. **Inhaltsbasiert** über `kapitel[]`. Diese Sicht ist nachträglich aus den Volltexten erzeugt worden. Eine Organisation erscheint dort, wo sie inhaltlich Stellung genommen hat — unabhängig vom Formularabschnitt.

Beide Sichten haben ihre Berechtigung und werden in der App parallel genutzt.

Themen (`themen[]`) und Kapitel (`kapitel[]`) sind unabhängige Sichten auf denselben Datenbestand: Themen sind ~138 feingranulare thematische Cluster, Kapitel sind 12 grobgranulare Strukturpunkte entlang des NEP-Dokuments. Eine Organisation kann in beliebig vielen Themen und beliebig vielen Kapiteln gelistet sein.

Die typischen Nutzer der App sind Fachexperten der FNB.

## Kennzahlen

| Kennzahl                                        | Wert                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| Organisationen                                  | 44                                                  |
| Einzelstellungnahmen gesamt                     | 180 (Artefakt des Einreichungsformats, siehe oben)  |
| Max. Einzelstellungnahmen pro Organisation      | 12                                                  |
| Themen                                          | 100–150 (aktuell 138, kann sich noch leicht ändern) |
| Max. Organisationen pro Thema                   | 16                                                  |
| Kapitel                                         | 12 (fixe Reihenfolge, siehe unten)                  |
| Max. Zeichenlänge `stellungnahme`               | ca. 5.000                                           |
| Max. Zeichenlänge `zusammenfassung` (Org)       | ca. 5.300                                           |
| Max. Zeichenlänge `beschreibung` (Themen)       | ca. 1.100                                           |
| Max. Zeichenlänge `dokument`                    | ca. 35.000                                          |
| Organisationen mit PDF-Einreichung (`dokument`) | 4                                                   |
| Dateigröße                                      | ca. 600 KB                                          |
| Encoding                                        | UTF-8                                               |

## Datenmodell

```
quelldaten_v2.json
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
├── themen[]  ─── Array der 100–150 thematischen Cluster
│   ├── thema
│   ├── beschreibung
│   └── organisationen[]            ◄── Array von nr-Werten → Verweis auf organisationen[].nr
│
└── kapitel[]  ─── Array der 12 NEP-Kapitel (inhaltsbasierte Sicht)
    ├── kapitel
    ├── organisationen[]            ◄── Array von nr-Werten → Verweis auf organisationen[].nr
    ├── zusammenfassung
    ├── zusammenfassung_H2          ◄── optional, kann null sein
    └── zusammenfassung_CH4         ◄── optional, kann null sein
```

### Verknüpfungen

```
themen[].organisationen[]    ──nr──►  organisationen[].nr
kapitel[].organisationen[]   ──nr──►    ├── .zusammenfassung    (Gesamtbild der Org)
                                        └── .stellungnahmen[]   (Einzeltexte der Org)
```

Die Verknüpfung läuft sowohl von Themen als auch von Kapiteln über `nr` (Organisations-Nummer) auf `organisationen[]`. Pro Organisation steht die **Zusammenfassung der Stellungnahmen** als verdichtete Gesamtaussage bereit; die **Einzelstellungnahmen** liefern die Detailebene.

Es gibt keine direkte Verknüpfung zwischen einem Thema (oder Kapitel) und einer bestimmten Einzelstellungnahme – die Zuordnung existiert nur auf Organisationsebene.

### Sortierung

- `organisationen[]`: nach `nr` aufsteigend sortiert ("1", "2", ..., "44")
- `stellungnahmen[]`: keine definierte Sortierung (weder nach Kapitel noch nach Stellungnahmen-Nummer)
- `themen[]`: keine garantierte Sortierung
- `themen[].organisationen[]`: aufsteigend sortiert
- `kapitel[]`: feste fachlich vorgegebene Reihenfolge (siehe Feldbeschreibung `kapitel[].kapitel`)
- `kapitel[].organisationen[]`: aufsteigend sortiert

## Feldbeschreibungen

### Top-Level

| Feld             | Typ   | Beschreibung                                                                                                                                |
| ---------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `organisationen` | Array | Alle 44 Organisationen mit ihren Stellungnahmen.                                                                                            |
| `themen`         | Array | 100–150 thematische Cluster über alle Stellungnahmen hinweg. Feingranular.                                                                  |
| `kapitel`        | Array | Genau 12 Einträge, einer pro NEP-Kapitel. Inhaltsbasierte Kapitelzusammenfassungen, unabhängig von der formularbasierten Zuordnung.         |

### organisationen[]

| Feld              | Typ    | Beschreibung                                                                                                                                      |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nr`              | String | Organisations-Nummer ("1" bis "44"). Primärschlüssel, auf den `themen[].organisationen` und `kapitel[].organisationen` verweisen.                 |
| `organisation`    | String | Vollständiger Name der Organisation (manuell erfasst).                                                                                            |
| `abkürzung`       | String | Kurzform, z.B. "VKU", "BDEW" (nachträglich vergeben). Eignet sich als kompakte Anzeige in der UI.                                                 |
| `email_endung`    | String | E-Mail-Domain der einreichenden Person, z.B. "vku.de" (manuell erfasst). Hinweis auf institutionellen Hintergrund.                                |
| `zusammenfassung` | String | **Zusammenfassung der Stellungnahmen:** Verdichtung aller Einzelstellungnahmen dieser Organisation zu einer Gesamtaussage. Bis ca. 5.300 Zeichen. |
| `stellungnahmen`  | Array  | **Einzelstellungnahmen:** Die konkreten Einreichungen dieser Organisation (1 bis 12 Stück), jeweils mit Kapitelbezug und Originaltext.            |

### stellungnahmen[]

| Feld            | Typ               | Beschreibung                                                                                                                                                                                                                                                                                                        |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#`             | String            | Laufende Stellungnahmen-Nummer, z.B. "2025-42". Eindeutige ID als String. Sonderfälle: "2025-7 \| 2025-8" (zusammengelegte Stellungnahme), "2025-166 bis 2025-170" (zusammengefasster Nummernbereich), "2025-PDF-I" bis "2025-PDF-IV" (postalische Einreichungen).                                                  |
| `kapitel`       | String            | Bezugskapitel des NEP-Entwurfs (Originaltext der Org, Auswahl aus Formular). Bei PDF-Einreichungen immer "Generelle Anmerkungen". Mögliche Werte: die 12 Kapitelnamen aus der Liste in `kapitel[].kapitel` (siehe unten). **Diese formularbasierte Zuordnung spiegelt nicht zwingend den inhaltlichen Bezug wider** — siehe Abschnitt „Zwei Kapitelsichten".                                                |
| `schlagworte`   | Array von Strings | Thematische Tags aus dem Konsultationsformular, z.B. ["Integrierte Planung", "Kernnetz-Anpassungen"] (Originaltext der Org, Auswahl aus Formular). Bei PDF-Einreichungen ein leeres Array `[]`.                                                                                                                     |
| `stellungnahme` | String oder null  | Freitext der Stellungnahme (Originaltext der Org). Bis ca. 5.000 Zeichen. Bei Online-Einreichungen immer ein nicht-leerer String. Ist `null` bei den 4 PDF-Einreichungen – dort steht der Text stattdessen in `dokument`.                                                                                           |
| `dokument`      | String (optional) | Nur bei 4 postalischen PDF-Einreichungen vorhanden: der vollständige Text der Stellungnahme als Markdown (konvertiert aus PDF). Bis ca. 35.000 Zeichen. Bei allen anderen Organisationen fehlt dieser Key komplett (nicht `null`, sondern absent). Wenn `dokument` vorhanden ist, ist `stellungnahme` immer `null`. |

### themen[]

| Feld             | Typ                | Beschreibung                                                                                                                                                                                |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `thema`          | String             | Kurztitel des Themas auf mittlerem Abstraktionsniveau. Spezifisch genug für konkrete Inhalte, breit genug, dass mehrere Organisationen sich darin wiederfinden.                             |
| `beschreibung`   | String             | Fachliche Synthese aller Kernaussagen der zugeordneten Organisationen zu diesem Thema. Benennt Mehrheits- und Minderheitspositionen, konsolidiert ohne Redundanz. Bis ca. 1.100 Zeichen.    |
| `organisationen` | Array von Integers | Organisations-Nummern (als Integer, nicht String), die dieses Thema adressiert haben. Werte entsprechen `organisationen[].nr` – Achtung: hier Integer (z.B. `4`), dort String (z.B. `"4"`). |

### kapitel[]

`kapitel[]` ist ein Array mit **genau 12 Einträgen** — einer pro NEP-Kapitel. Die Reihenfolge ist fachlich vorgegeben und unveränderlich.

| Feld                 | Typ                       | Beschreibung                                                                                                                                                                                                                                                                                              |
| -------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kapitel`            | String                    | Exakte Kapitelbezeichnung. Einer der 12 unten aufgeführten Werte. Diese Strings sind verbindlich und sollten **nicht heuristisch gematcht** werden (kein Lowercasing, kein Trim, keine Levenshtein-Suche).                                                                                                |
| `organisationen`     | Array von Integers        | Aufsteigend sortierte Liste der Organisations-Nummern, die zu diesem Kapitel inhaltlich Stellung genommen haben. Verweis auf `organisationen[].nr`. **Achtung:** hier Integer, dort String – siehe Implementierungshinweise.                                                                              |
| `zusammenfassung`    | String oder null          | Kapitelweiter Fließtext, der die Positionen aller in `organisationen` gelisteten Organisationen quellenbasiert zusammenfasst. Mehrere Absätze möglich (mit `\n\n` getrennt). Enthält in der Regel wörtliche Nennungen einzelner Organisationen per Namen oder Abkürzung. `null` nur bei leerem Kapitel.   |
| `zusammenfassung_H2` | String oder null          | Optionale Wasserstoff-spezifische Teilzusammenfassung. `null` bedeutet: Der Kapitelinhalt lässt sich nicht natürlich nach Energieträger aufteilen — in dem Fall sollte die UI den Energieträger-Toggle gar nicht erst anbieten (nicht als „keine Daten" anzeigen).                                        |
| `zusammenfassung_CH4`| String oder null          | Analog für den Methan-Teil.                                                                                                                                                                                                                                                                               |

**Die 12 gültigen Kapitelnamen, in genau dieser Reihenfolge:**

1. `Executive Summary`
2. `Kapitel 1: Einführung`
3. `Kapitel 2: Genehmigter Szenariorahmen`
4. `Kapitel 3: Rahmenbedingungen und Eingangsgrößen der Modellierung`
5. `Kapitel 4: Stand der Umsetzung von Netzausbaumaßnahmen`
6. `Kapitel 5: Versorgungssicherheitsbetrachtung für Methan 2030`
7. `Kapitel 6: Szenarienbasierte Modellierungen für 2037 und 2045`
8. `Kapitel 7: Netzausbauvorschlag`
9. `Kapitel 8: Schlusswort und Ausblick`
10. `Anhänge und Anlagen`
11. `Generelle Anmerkungen`
12. `NEP-Gas-Datenbank`

**Invarianten** (können als feste Zusicherung behandelt werden):

- Die Reihenfolge der 12 Kapitel ist immer die oben genannte.
- Für jeden Eintrag gilt: `organisationen == []` ⇔ alle drei Zusammenfassungs-Felder sind `null`.
- Entweder sind `zusammenfassung_H2` **und** `zusammenfassung_CH4` beide `null`, oder beide sind nicht-null. (Aktuell haben 5 von 12 Kapiteln eine H₂/CH₄-Aufteilung.)
- `null` ist der JSON-Literalwert, niemals der String `"null"`.

## Synthetische Beispiele

### Gesamtstruktur (Top-Level)

```json
{
   "organisationen": [
      /* 44 Einträge */
   ],
   "themen": [
      /* 100–150 Einträge */
   ],
   "kapitel": [
      /* 12 Einträge */
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
         "kapitel": "Kapitel 7: Netzausbauvorschlag",
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

### Kapitel mit H₂/CH₄-Aufteilung

```json
{
   "kapitel": "Kapitel 2: Genehmigter Szenariorahmen",
   "organisationen": [2, 5, 10, 11, 12, 15, 18, 21, 23, 25, 28, 29, 33, 35, 36, 37, 41, 42, 44],
   "zusammenfassung": "Die grundsätzliche Anlage des genehmigten Szenariorahmens wird von der Mehrheit der Stellungnehmenden mitgetragen...",
   "zusammenfassung_H2": "Die Stellungnahmen zum H₂-Teil des Szenariorahmens fokussieren auf die Hochlaufpfade...",
   "zusammenfassung_CH4": "Im Methanteil des Szenariorahmens dominieren Hinweise zur Versorgungssicherheit..."
}
```

### Kapitel ohne Energieträger-Aufteilung

```json
{
   "kapitel": "Generelle Anmerkungen",
   "organisationen": [1, 4, 7, 12, 19, 29, 30, 43, 44],
   "zusammenfassung": "Die generellen Anmerkungen kreisen um Verfahrensfragen, Konsultationsdesign und übergreifende methodische Kritik...",
   "zusammenfassung_H2": null,
   "zusammenfassung_CH4": null
}
```

## Implementierungshinweise (JavaScript)

**Typunterschied bei Organisations-Nummern.** In `organisationen[].nr` ist die Nummer ein **String**, in den Querverweisen aus `themen[]` und `kapitel[]` jeweils ein **Integer**:

| Ort                          | Typ         | Beispiel              |
| ---------------------------- | ----------- | --------------------- |
| `organisationen[].nr`        | **String**  | `"1"`, `"22"`, `"44"` |
| `themen[].organisationen[]`  | **Integer** | `[4, 6, 7, 9]`        |
| `kapitel[].organisationen[]` | **Integer** | `[2, 5, 10, 11]`      |

Beim Verknüpfen muss explizit konvertiert werden, etwa:

```js
const org = organisationen.find(o => Number(o.nr) === orgNr);
```

**`#` als JSON-Key.** Das Zeichen `#` ist in JavaScript ein reserviertes Zeichen für Private Class Fields. Zugriff nur per Bracket-Notation: `s["#"]`, nicht `s.#` (Syntaxfehler).

**Abwesendes `dokument`-Feld.** Bei den 40 Online-Organisationen fehlt der Key `dokument` komplett. Prüfung per `"dokument" in s` (nicht `s.dokument`, da der Key bei Online-Einreichungen fehlt und `undefined` zurückgäbe).

**Umlaut-Keys.** Mehrere Feldnamen enthalten Umlaute (`abkürzung`, `zusammenfassung`). In JavaScript unproblematisch, aber bei URL-Encoding oder als CSS-Klassen zu beachten.

**Kapitelnamen nicht heuristisch matchen.** Die 12 Strings in `kapitel[].kapitel` und in `stellungnahmen[].kapitel` sind identisch und verbindlich. Vergleiche per Gleichheit, nicht per Lowercase/Trim/Fuzzy-Match.

**`null` vs. fehlender Eintrag bei Kapiteln.** Ein leeres Kapitel ist immer als vollständiger Eintrag mit `organisationen: []` und allen drei Zusammenfassungs-Feldern auf `null` enthalten — niemals als fehlender Listeneintrag. Die Länge von `kapitel[]` ist immer 12.
