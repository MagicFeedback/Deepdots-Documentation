---
title: CRM-objekter
description: Gem billetter, kampe, medlemskaber og andre poster ved siden af dine kontakter med Deepdots Python SDK, og knyt surveysvar til dem.
---

Ud over [kontakter](/da/python-sdk/guides/contacts/) kan dit CRM rumme alle andre poster, du vil analysere feedback ud fra: billetter, kampe, medlemskaber, ordrer og så videre. Hver af dem er et **CRM-objekt**:

- en `type`, f.eks. `ticket` eller `match`;
- dit eget id for objektet, `externalId`;
- et `data`-objekt med de felter, du har brug for.

Et objekt kan høre til en kontakt (`contactKey`) og til et andet objekt (`parentType` + `parentKey`). En billet hører for eksempel til en fan og til en kamp. Når et surveylink angiver et objekt, får alle svar givet via det link objektets oplysninger. Se [Knyt surveysvar til objekter](#knyt-surveysvar-til-objekter).

Tilgængelig fra SDK 1.0.23 som `client.crm`.

## Gem objekter

```python
result = client.crm.upsert_objects("match", [
    {
        "externalId": "8449",
        "startsAt": "2026-10-18T16:00:00Z",
        "sourceUpdatedAt": "2026-10-07T00:00:00Z",
        "data": {"name": "F.C. København - AGF", "venue": "Parken"},
    },
])
print(result)  # {"count": 1, "created": 1, "updated": 0, "failed": []}
```

`upsert_objects(object_type, items)` opretter hvert objekt, eller opdaterer det objekt af samme type, der har samme `externalId`.

| Felt | Type | Beskrivelse |
|---|---|---|
| `externalId` | string eller tal | **Påkrævet.** Dit id for objektet, unikt per type (op til 255 tegn) |
| `status` | string | En hvilken som helst status, du bruger, f.eks. `active` eller `cancelled` |
| `contactKey` | string | `externalId` for den kontakt, objektet hører til |
| `parentType`, `parentKey` | string | Typen og `externalId` for det objekt, dette objekt hører til, f.eks. `"match"` og `"8449"` |
| `startsAt`, `endsAt` | string | ISO 8601-datoer, f.eks. hvornår en kamp starter, eller et medlemskab udløber |
| `sourceUpdatedAt` | string | Hvornår posten sidst blev ændret i dit system (se nedenfor) |
| `data` | dict | Alle andre felter |

- **Felter du udelader, beholder deres gemte værdi**, og `data` flettes nøgle for nøgle.
- **Datoer** er en ISO 8601-dato (`2026-10-18`) eller et tidspunkt med tidszone (`2026-10-18T16:00:00Z` eller `+02:00`). Et tidspunkt uden tidszone afvises, så serveren aldrig skal gætte zonen.
- **Med `sourceUpdatedAt`** udfylder en post, der er ældre end det gemte objekt, kun felter, der er tomme, så posterne kan ankomme i vilkårlig rækkefølge. **Uden den** vinder den sidst sendte post.
- **Objekttyper** bruger små bogstaver, tal og `_`, starter med et bogstav og kan ikke være `contact`.
- **Størrelse:** hver post kan fylde op til 64 KB.

## Læs objekter

```python
tickets = client.crm.get_objects("ticket", contact_key="1058531")
```

`get_objects(object_type, ...)` returnerer objekterne af én type, sorteret efter `externalId`. Slettede objekter returneres aldrig. Alle filtre matcher præcist:

| Argument | Matcher |
|---|---|
| `external_id` | `externalId` |
| `status` | `status` |
| `contact_key` | `contactKey` |
| `parent_type`, `parent_key` | `parentType`, `parentKey` |

Resultaterne kommer i sider med `limit` objekter (100 som standard, højst 1000). Send det sidste `externalId`, du modtog, som `after` for at få næste side:

```python
after = None
while True:
    page = client.crm.get_objects("match", limit=1000, after=after)
    if not page:
        break
    for match in page:
        print(match["externalId"], match["data"].get("name"))
    after = page[-1]["externalId"]
```

## Portioner, gensendelser og fejl

Disse regler gælder for alle `client.crm`-metoder:

- **Vilkårlig listelængde.** Send en liste af vilkårlig længde, eller en enkelt post som et dict. SDK'en sender 500 poster per request og returnerer totalerne over alle requests.
- **Fejl per post.** En post, som API'en ikke kan gemme, står i `failed` med sit `index` i den liste, du sendte, og de øvrige poster gemmes stadig. En post, der ikke er et dict, får `upsert_objects()` til at kaste `ValueError`, før noget bliver sendt.
- **Request-størrelse.** En request skal holde sig under API'ens grænse på 1 MB; 500 almindelige poster ligger et godt stykke under. Send en mindre `chunk_size` for store poster.
- **Automatisk gensendelse.** En request, der fejler midlertidigt (502, 503 eller 504, en forbindelsesfejl eller intet svar inden for 300 sekunder), sendes igen op til 3 gange, efter 2, 4 og 8 sekunder. Er tokenet udløbet, logger klienten ind igen én gang og sender igen.
- **Fejl.** Fejler en request stadig, kaster kaldet en `requests.RequestException`: `HTTPError` for et fejlsvar, `ConnectionError` eller `Timeout` for netværket. De requests, der blev sendt før, er allerede udført.
- **Ingen dubletter.** At sende poster igen opretter aldrig dubletter, fordi de matches på deres eget id. Send den samme liste igen med det samme efter en fejl.

```python
import requests

try:
    result = client.crm.upsert_objects("match", matches)
except requests.RequestException as e:
    print("Ikke sendt, prøv igen:", e)
```

## Connectors

En connector tager et andet systems poster præcis som det system leverer dem og mapper dem til kontakter og objekter hos os. Du behøver ikke at omforme noget. Connectors sættes op til en bestemt kundes systemer, så spørg din kontaktperson hos Deepdots, hvis du gerne vil have en til dine.

### FCK-brugere

```python
result = client.crm.sync_fck_users(users)
# {"count": 1, "created": 1, "updated": 0, "failed": []}
```

Hvert FCK-brugerobjekt bliver til en kontakt.
- **Matching:** brugere matches først på `roboticket_id` og derefter på e-mail, så den første indlæsning og senere ændringer er det samme kald. Hver bruger skal have en e-mail.
- **Den sidste version vinder:** send aldrig en ældre eksport efter nyere ændringer.
- **Fejl:** hver `failed`-post har brugerens `index`, deres FCK-`id` og `error`.

### Roboticket

```python
result = client.crm.ingest_roboticket(lines)
# {"count": 2, "applied": 2, "ignored": 0, "failed": []}
```

- **Hvad en linje opdaterer:** hver linje opdaterer sin billet eller sit medlemskab og den kamp eller det produkt, den hører til.
- **Returneringer og overdragelser:** begge håndteres. En annulleret billet forbliver annulleret, og en ældre linje overskriver aldrig en nyere.
- **`AccessToken`:** feltet fjernes og gemmes aldrig.
- **`ignored`:** tæller linjer, der hverken er et salg eller en returnering. De gemmes kun i loggen.

## Knyt surveysvar til objekter

Du kan knytte et surveysvar til et objekt ved at tilføje en URL-parameter med objektets type som navn og dets `externalId` som værdi:

```text
https://<your survey link>?ticket=21522673
```

Alle svar givet via det link får objektets oplysninger som surveydata: for en billet for eksempel tribunen, kampen og fanens medlemskaber. Du kan derefter filtrere resultaterne på dem. Er feedbacket ikke knyttet til en kontakt endnu, knyttes det også til den kontakt, der ejer objektet. Deepdots sætter per virksomhed op, hvilke objekttyper der tilføjer oplysninger på den måde, og hvilke af deres felter der bliver til surveydata. Et link der angiver en objekttype, som ikke er sat op, gemmer kun objektets id.

En virksomhed kan også kræve en **bevis**-parameter, som kun den rette persons link indeholder, for eksempel ejerens id i jeres e-mailplatform:
- **Beviset matcher objektets ejer:** svaret får objektets oplysninger.
- **Beviset tilhører en anden** (linket er blevet redigeret): surveyen viser en side med "ugyldigt link".
- **Beviset mangler, eller ejeren er ikke synkroniseret endnu:** surveyen virker stadig, og svaret gemmes uden objektets oplysninger.

:::tip
Indlæs kontakter og objekter, før surveylinkene sendes ud. Et svar får et objekts oplysninger, når det analyseres, kort efter at det er indsendt, så et objekt der ankommer senere, mangler i det.
:::
