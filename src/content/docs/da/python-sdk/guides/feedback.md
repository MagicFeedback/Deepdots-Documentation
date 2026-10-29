---
title: Administration af Feedback
description: Opret, læs, opdater og slet feedback-submissions med Deepdots Python SDK.
---

Feedback-submissions er den primære ressource i Deepdots. Hver submission registrerer et sæt svar for en specifik integration og et specifikt produkt.

## Opret en submission

```python
feedback = client.feedbacks.create({
    "name": "Bruger-undersøgelsessvar",
    "type": "APP",
    "identity": "MAGICFORM",
    "answers": [
        {"key": "nps", "value": "9"},
        {"key": "reason", "value": "Hurtig og pålidelig"},
    ],
    "integrationId": "DIT_INTEGRATION_ID",
    "companyId": "DIT_COMPANY_ID",
    "productId": "DIT_PRODUCT_ID",
    # Valgfrit: hvor feedbacket kommer fra (se "Kildesystemfelter" nedenfor)
    "external_id": "48213",
    "externalGeneratedAt": "2026-10-06T11:00:00.000Z",
})
print(feedback["id"])
```

SDK'en sender dict'et som JSON-body i `POST /feedbacks` med dine nøglenavne præcis som du har skrevet dem, så alle felter ligger på øverste niveau. Valgfrie felter som `external_id` og `externalGeneratedAt` skal stå ved siden af `integrationId` og `companyId`, ikke inde i `answers` eller `metadata`.

### Påkrævede felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `name` | string | Læsbar etiket for denne submission |
| `type` | string | Kildetype: `"APP"`, `"SURVEY"` eller `"DOCUMENT"` |
| `identity` | string | Kildeidentitet — brug identiteten for den integration feedbacket tilhører (f.eks. `"MAGICFORM"`). Den afgør om og hvordan feedbacket analyseres |
| `integrationId` | string | UUID for den integration dette feedback tilhører |
| `companyId` | string | Din virksomhedsidentifikator |
| `productId` | string | Det produkt dette feedback er tilknyttet |

Værdierne i `type` og `identity` skrives med store bogstaver; enhver anden stavemåde afvises. Nogle accepterede `identity`-værdier bliver slet ikke analyseret, så vælg ikke en værdi, bare fordi den har samme navn som det værktøj feedbacket kommer fra. Identiteten afgør også hvad der analyseres: for spørgeskemaidentiteter som `MAGICFORM`, `MAGICSURVEY` og `CSV` er det `answers`, mens det for de fleste andre, som `GENERAL` og `CUSTOM`, kun er `text`. Hvis du ikke kender identiteten for din integration, så spørg din kontaktperson hos Deepdots.

### Valgfrie felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `answers` | Answer[] | Svar som `{"key": …, "value": [...]}`-par. `key` er spørgsmålets `ref` (se `integrations_questions.get()`) |
| `text` | string | Fritekst for feedbacket — f.eks. en anmeldelse eller en supportsamtale |
| `metadata` | Metadata[] | Brugerdefinerede nøgle/værdi-poster (se [Opdater metrics og metadata](#opdater-metrics-og-metadata)) |
| `metrics` | Metric[] | Navngivne metric-værdier |
| `crmContactId` | string | ID på den CRM-kontakt der har givet feedbacket. Kontakten skal tilhøre samme virksomhed |
| `external_id` | string | ID på posten i kildesystemet. Sender du det igen for samme virksomhed, produkt og integration, returneres det eksisterende feedback i stedet for en dublet |
| `externalGeneratedAt` | string | Hvornår feedbacket blev oprettet i kildesystemet — den dato dashboardet bruger. UTC ISO 8601 der ender på `Z`; standard er tidspunktet for requesten. Se [Feedbackdatoen](#feedbackdatoen-externalgeneratedat) |
| `externalUpdatedAt` | string | Hvornår posten sidst blev ændret i kildesystemet |
| `externalUrl` | string | Link til den oprindelige post |

Feltnavne skelner mellem store og små bogstaver. `external_id` er det eneste felt i snake_case; alle andre felter er i camelCase (det hedder `companyId`, ikke `company_id`). API'en afviser enhver nøgle den ikke kender: en ukendt eller fejlstavet nøgle som `externalId` får hele requesten til at fejle med HTTP 422, og intet bliver oprettet. Det samme sker, hvis du sender `status` eller `createdAt`, som API'en selv sætter. En fejlstavet påkrævet nøgle som `company_id` bliver fanget, før noget bliver sendt: `create()` kaster `ValueError: Missing required field: companyId`. Se [Fejlhåndtering](/da/python-sdk/reference/api/#fejlhåndtering).

### Automatisk indpakning af svarværdier

SDK'en pakker automatisk en enkeltstående `value`-string ind i en liste. Begge former nedenfor er ækvivalente:

```python
{"key": "comment", "value": "Godt produkt"}
{"key": "comment", "value": ["Godt produkt"]}
```

Du kan altid sende en liste direkte, hvis du har brug for flere værdier til én nøgle.

Svarværdier skal være strings: send `"9"`, ikke `9`. En numerisk værdi accepteres, når du opretter feedbacket, men så bliver feedbacket aldrig analyseret.

## Kildesystemfelter

Brug disse valgfrie felter, når feedbacket kommer fra et andet system — et helpdesksystem, en anmeldelsesplatform, et spørgeskemaværktøj eller en CSV-eksport. De registrerer hvornår feedbacket faktisk fandt sted, og gør det sikkert at sende det igen. Alle fire er strings og skal ligge på øverste niveau i payloaden.

### Feedbackdatoen: `externalGeneratedAt`

`externalGeneratedAt` er den dato dashboardet, rapporterne og datofiltrene bruger for et feedback. I dashboardet er det kolonnen **Dato** i feedbacklisten; *Tilføjet den* i detaljerne for et feedback er det tidspunkt hvor API'en modtog det (`createdAt`). Diagrammer og rapporter regner i UTC-døgn.

Udelader du feltet, bruger API'en det tidspunkt hvor den modtog requesten, så historisk feedback der er importeret uden det, vises på importdagen. Se [Ret datoen på et eksisterende feedback](#ret-datoen-på-et-eksisterende-feedback), hvis du vil rette feedback du allerede har importeret.

Send værdien som en **UTC ISO 8601-string der ender på `Z`**, for eksempel `"2026-10-06T11:00:00.000Z"` — det format JavaScripts `toISOString()` giver. Sekunder uden millisekunder (`"2026-10-06T11:00:00Z"`) fungerer også.

API'en gemmer værdien præcis som du sender den, og kontrollerer ikke formatet. Værdier i andre formater bliver stadig gemt, men analyseværktøjerne kan ikke læse de fleste af dem, så feedbacket forsvinder fra datofiltrerede diagrammer og rapporter. Det gælder blandt andet en tidszoneforskydning som `+02:00`, en dato uden klokkeslæt, et mellemrum i stedet for `T` og mere end seks cifre efter decimaltegnet (f.eks. `.1234567Z` fra .NET eller `.123456789Z` fra Java).

Send en string. SDK'en kan ikke serialisere et `datetime`-objekt (den kaster `TypeError`), og API'en afviser et tal eller `None` med HTTP 422. Konverter datetime-objekter sådan her:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo  # Python 3.9+; på Windows skal du også køre: pip install tzdata

def to_api_datetime(dt: datetime) -> str:
    """Formater et tidszonebevidst datetime-objekt som UTC ISO 8601 med millisekunder og afsluttende Z."""
    if dt.utcoffset() is None:
        raise ValueError("Naivt datetime-objekt: tilføj først kildesystemets tidszone, f.eks. dt.replace(tzinfo=ZoneInfo('Europe/Copenhagen'))")
    return dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

to_api_datetime(datetime(2026, 10, 6, 13, 0, tzinfo=ZoneInfo("Europe/Copenhagen")))
# '2026-10-06T11:00:00.000Z'
```

:::caution
For et datetime-objekt i UTC giver Pythons `isoformat()` som standard `2026-10-06T11:00:00+00:00`, som analyseværktøjerne ikke kan læse. Brug hjælpefunktionen ovenfor; den afviser naive datetime-objekter. Hvis dine datetime-objekter ikke har nogen tidszone, så tilføj først kildesystemets tidszone — `dt.replace(tzinfo=ZoneInfo("Europe/Copenhagen"))` — fordi `astimezone()` ellers ville behandle et naivt datetime-objekt som lokal tid på den maskine der kører koden.
:::

### `externalUpdatedAt` og `externalUrl`

- `externalUpdatedAt` — hvornår posten sidst blev ændret i kildesystemet. Brug samme format som til `externalGeneratedAt`. Udelader du feltet, bruger API'en tidspunktet for requesten.
- `externalUrl` — et link til den oprindelige post, som i dashboardet vises som feedbackets *Original kilde*-link. Brug en absolut `https://`-URL.

### Sikker gensendelse: `external_id`

`external_id` er din identifikator for posten i kildesystemet. Send den som en string — `"48213"`, ikke `48213`.

Når du opretter et feedback med et `external_id` der allerede findes for samme virksomhed, produkt og integration, opretter API'en ikke en dublet. Den returnerer det **eksisterende** feedback, uændret, med samme succes-svar som for et nyt. Det gør genforsøg sikre.

Det betyder også, at gensendelse af et feedback aldrig opdaterer det — heller ikke dets dato. Brug [`update()`](#opdater-en-submission) til at ændre et feedback der allerede findes. Svaret ser ens ud for et nyt og et eksisterende feedback; vil du genkende et eksisterende — for eksempel når du kører en import igen med datoerne tilføjet — så sammenlign det returnerede `externalGeneratedAt` med det du sendte.

Feedbacks der sendes uden `external_id`, dedupliceres aldrig: sender du requesten igen, oprettes der en ekstra kopi. Send genforsøg for samme `external_id` efter hinanden i stedet for parallelt, fordi to samtidige requests begge kan oprette et feedback.

## List alle submissions

```python
feedbacks = client.feedbacks.get()
```

Filtrer med et LoopBack-filter-dict (se [Forespørgsler](/da/python-sdk/guides/querying/)):

```python
feedbacks = client.feedbacks.get({
    "where": {"companyId": "DIT_COMPANY_ID"},
    "limit": 50,
})
```

## Hent en enkelt submission

```python
feedback = client.feedbacks.get_id("feedback-uuid-her")
```

Send et filter som andet argument for at forme de returnerede felter:

```python
feedback = client.feedbacks.get_id("feedback-uuid-her", {"fields": {"answers": True}})
```

## Opdater en submission

```python
client.feedbacks.update("feedback-uuid-her", {
    "name": "Opdateret etiket",
})
```

Kun de felter du sender, bliver ændret; resten forbliver uændret. `update()` returnerer et tomt dict (`{}`), fordi API'en svarer `204 No Content`. Kald `get_id()`, hvis du har brug for det opdaterede feedback.

Nogle felter kan ikke ændres, når feedbacket først er oprettet: `external_id`, `type`, `identity`, `integrationId`, `productId`, `profile` og `data` samt `id`, `createdAt` og `userId`, som serveren selv sætter. Sender du et af dem, fejler hele requesten med HTTP 422. Vil du rette datoen på et feedback, skal du ændre `externalGeneratedAt`, ikke `createdAt` (se [Ret datoen på et eksisterende feedback](#ret-datoen-på-et-eksisterende-feedback)). Send kun de felter du ændrer, ikke et helt objekt som du har læst tilbage fra `get_id()`.

`update()` kræver en API-bruger hvis rolle har lov til at opdatere feedback. Kan din bruger oprette feedback, men ikke opdatere det, fejler kaldet med HTTP 405 (se [Fejlhåndtering](/da/python-sdk/reference/api/#fejlhåndtering)); bed din kontaktperson hos Deepdots om at ændre brugerens rolle.

### Kør analysen igen

Opdateringen gemmes med det samme, men diagrammer og rapporter afspejler først ændringer af datoen, `text`, `answers`, `metrics` eller `metadata`, når feedbacket er blevet analyseret igen. Tilføj `"status": "REGISTERED"` i samme kald for at sætte en ny analyse i kø. En ny analyse er en helt ny kørsel:

- Resuméet, problemerne og emnerne genereres igen og kan afvige fra den forrige kørsel. Enhver status eller prioritet du har sat på feedbackets problemer, nulstilles.
- Feedbacket går igennem `PROCESSING` og ender normalt i `DONE` igen — tjek dets `status` med `get_id()`. Når det er `DONE`, kan der gå op til en time, før diagrammer og rapporter fuldt ud afspejler ændringen. Ender det i `PARTIAL` eller `ERROR`, viser diagrammerne fortsat den forrige version: send den samme opdatering igen.
- Automatiseringer der kører, når et feedback er færdigbehandlet, kører igen.

Send kun `"status": "REGISTERED"`, når feedbacket er færdigbehandlet: sender du den, mens feedbacket stadig er `REGISTERED` eller `PROCESSING`, starter der en ekstra analyse. Hvis nogle feedbacks forbliver `REGISTERED` eller `PROCESSING` længe efter at resten er færdigbehandlet, bliver de sandsynligvis slet ikke analyseret (for eksempel fordi en svarværdi er et tal, eller fordi deres `identity` ikke analyseres); spørg din kontaktperson hos Deepdots i stedet for at sende dem igen. Enhver opdatering af et feedback med status `DONE` får også disse automatiseringer til at køre igen, selv uden `status`. Hvis du skal analysere mange feedbacks igen, så tal med din kontaktperson hos Deepdots, før du går i gang.

### Ret datoen på et eksisterende feedback

Gensendelse af et feedback ændrer det ikke (se [Sikker gensendelse](#sikker-gensendelse-external_id)), så ret en manglende eller forkert dato med `update()`. Medtag `"status": "REGISTERED"`, så feedbacket bliver analyseret igen, og diagrammer og rapporter flytter det til den nye dato (se [Kør analysen igen](#kør-analysen-igen)):

```python
client.feedbacks.update("feedback-uuid-her", {
    "externalGeneratedAt": "2026-10-06T11:00:00.000Z",
    "status": "REGISTERED",
})
```

Skal du rette mange feedbacks, så slå dem op ud fra dine egne ID'er (se [Find et feedback ud fra dets kilde-ID](/da/python-sdk/guides/querying/#find-et-feedback-ud-fra-dets-kilde-id)), og opdater hvert enkelt:

```python
# De korrekte datoer med dine egne ID'er som nøgler (UTC ISO 8601 der ender på Z)
dates = {
    "48213": "2024-05-01T10:00:00.000Z",
    "48214": "2024-05-02T08:30:00.000Z",
}

found = client.feedbacks.get({
    "where": {
        "integrationId": "DIT_INTEGRATION_ID",
        "external_id": {"inq": list(dates)},
    },
    "fields": {"id": True, "external_id": True, "status": True, "externalGeneratedAt": True},
})

for fb in found:
    new_date = dates[fb["external_id"]]
    if fb["status"] in ("REGISTERED", "PROCESSING"):
        continue  # analyseres stadig: kør scriptet igen senere
    if fb["status"] in ("DONE", "EMPTY") and fb["externalGeneratedAt"] == new_date:
        continue  # allerede rettet
    client.feedbacks.update(fb["id"], {
        "externalGeneratedAt": new_date,
        "status": "REGISTERED",
    })
```

Du kan køre scriptet igen: feedbacks der allerede er rettet, springes over, og feedbacks hvor analysen endte i `PARTIAL` eller `ERROR`, sendes igen. Slå lange lister af ID'er op i portioner (for eksempel 100 ad gangen), så request-URL'en holdes kort, og se [Forespørgsler](/da/python-sdk/guides/querying/#find-et-feedback-ud-fra-dets-kilde-id), hvis dine ID'er indeholder `%`, `+`, `&`, `#` eller `=`. Et feedback der er importeret uden dato, har et `externalGeneratedAt` der svarer til dets `createdAt` på få millisekunder nær. Send ikke et tomt `externalGeneratedAt` til `update()`: i modsætning til `create()` gemmer `update()` værdien som den er, og feedbacket forsvinder så fra datofiltrerede diagrammer og rapporter.

## Opdater metrics og metadata

Ud over kernefelterne kan en submission bære **metrics** (navngivne værdier, f.eks. en score eller en kanal) og **metadata** (brugerdefinerede nøgle/værdi-poster). Du kan sende begge med `create()`. Når feedbacket først findes, ændrer du dem med `update()` og sender den fulde liste du vil gemme: læs de nuværende værdier først, ret dem, og skriv dem tilbage, så du ikke mister poster du vil beholde.

```python
from datetime import datetime, timedelta, timezone

# Hent de feedbacks der skal beriges — f.eks. alt modtaget i går (UTC)
today = datetime.now(timezone.utc).date()
yesterday = today - timedelta(days=1)
feedbacks = client.feedbacks.get({
    "where": {"and": [
        {"createdAt": {"gte": f"{yesterday}T00:00:00.000Z"}},
        {"createdAt": {"lt": f"{today}T00:00:00.000Z"}},
    ]},
})

for fb in feedbacks:
    if fb["status"] in ("REGISTERED", "PROCESSING"):
        continue  # analyseres stadig: prøv igen senere

    metrics = [m for m in (fb.get("metrics") or []) if m["key"] != "nps"]
    metrics.append({"key": "nps", "value": ["9"]})

    metadata = [m for m in (fb.get("metadata") or []) if m["key"] != "source"]
    metadata.append({"key": "source", "value": ["crm-import"]})

    # Ét kald pr. feedback, så det kun analyseres én gang
    client.feedbacks.update(fb["id"], {
        "metrics": metrics,
        "metadata": metadata,
        "status": "REGISTERED",
    })
```

| Felt | Shape | Beskrivelse |
|---|---|---|
| `metrics` | `[{"key": str, "value": [str]}]` | Navngivne metric-værdier |
| `metadata` | `[{"key": str, "value": [str]}]` | Brugerdefineret nøgle/værdi-metadata |
| `status` | string | `"REGISTERED"` sætter en ny analyse i kø, så ændringen når frem til diagrammer og rapporter (se [Kør analysen igen](#kør-analysen-igen)) |

Send værdier som strings — `["9"]`, ikke `[9]`. Metric-navne og -værdier konverteres til små bogstaver i rapporter.

:::tip
`update()` erstatter hele `metrics`- (eller `metadata`-)listen — den fletter ikke enkelte poster. Start altid fra den eksisterende liste, som vist ovenfor, så du beholder de værdier du ikke ændrer.
:::

### Tilføj metadata til mange feedbacks på én gang

Til metadata findes der en enklere måde, som ikke kræver at du læser først. `update_metadata_batch()` tilføjer eller overskriver de metadata-nøgler du sender, på mange feedbacks i én request, bevarer alle andre nøgler og får hvert feedback analyseret igen. Tilgængelig fra SDK 1.0.21.

```python
result = client.feedbacks.update_metadata_batch([
    {"feedbackId": "feedback-uuid-1", "metadata": [{"key": "source", "value": ["crm-import"]}]},
    {"feedbackId": "feedback-uuid-2", "metadata": [{"key": "source", "value": ["crm-import"]}]},
])
print(result)  # {"feedbacks": 2, "triggered": 2, "failed": []}
```

- **Overskriv eller tilføj:** en nøgle du sender, får sine værdier erstattet, så en nøgle der sendes uden værdi (`None`, `""` eller `[]`), bliver tømt. Nøgler du ikke sender, bevares, og ingen nøgle bliver nogensinde fjernet. Send `mode="append"` (SDK 1.0.22) for at føje dine værdier til dem nøglen allerede har; værdier den allerede har, springes over, så et nyt forsøg aldrig tilføjer noget to gange.
- **Alt eller intet:** hvis et feedback-id ikke findes, er slettet eller tilhører en virksomhed du ikke har adgang til, svarer API'en 404 med de pågældende id'er, og intet bliver skrevet.
- **`failed`:** viser kun et feedback, når det ikke lykkedes at skrive det eller at sætte det i kø til analyse.

## Slet en submission

```python
client.feedbacks.delete("feedback-uuid-her")
```

Returnerer et tomt dict (`{}`) ved succes.

:::caution
SDK'en kan ikke fortryde en sletning. Feedbacket udfases (dets status bliver `DEPRECATED`) og skjules i `get_id()`, dashboardet og rapporter, og i `get()`, medmindre du filtrerer på `status`. Opretter du bagefter et feedback med samme `external_id`, oprettes der et nyt feedback i stedet for at det gamle gendannes.
:::

## Upload en fil-vedhæftning

Vedhæft en fil til en eksisterende feedback-submission. Filen sendes som en multipart-upload.

Før uploaden læser SDK'en feedbackets vedhæftninger og kaster `ValueError` uden at uploade noget, hvis:
- feedbacket allerede har `max_attachments` filer (3 som standard);
- det samme indhold allerede er vedhæftet, også under et andet navn (`check_duplicate_content=True`, standard). Det downloader hver eksisterende vedhæftning for at sammenligne; send `check_duplicate_content=False` for at springe det over.

Hvis de eksisterende vedhæftninger ikke kan læses, afvises uploaden.

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-her",
    file_path="/sti/til/rapport.pdf",
)
```

Send valgfrie argumenter for at styre visningsnavnet og vedhæfte ekstra metadata:

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-her",
    file_path="/sti/til/rapport.pdf",
    filename="q3-rapport.pdf",
    extra_data={"kilde": "crm", "år": 2026},
)
```

| Parameter | Type | Beskrivelse |
|---|---|---|
| `feedback_id` | string | ID på det feedback filen skal vedhæftes |
| `file_path` | string | Absolut eller relativ sti til filen på disk |
| `filename` | string \| None | Visningsnavn i dashboardet — standard er filnavnet |
| `extra_data` | dict \| None | Et JSON-serialiserbart dict gemt sammen med vedhæftningen |
| `max_attachments` | int | Største antal vedhæftninger et feedback må have; standard `3` |
| `check_duplicate_content` | bool | Afvis en fil med indhold der allerede er vedhæftet; standard `True` |
