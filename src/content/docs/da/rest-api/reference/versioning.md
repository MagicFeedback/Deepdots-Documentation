---
title: Versioner og ændringer
description: Hvordan Deepdots REST API holdes stabilt, hvordan ændringer annonceres, og hvad du skal tage højde for i din integration.
sidebar:
  order: 3
---

Endpoints i denne dokumentation er en central del af Deepdots, og vi behandler dem som stabile.

## Det forpligter vi os til

- **Ingen inkompatible ændringer uden en ny version.** At fjerne eller omdøbe et felt, ændre dets type, gøre et felt påkrævet eller ændre en svarkode sker kun i en ny version af endpointet. Den nuværende version bliver ved med at virke.
- **Varsel i god tid.** Før en ny version erstatter en gammel, giver vi dig besked i god tid og holder begge kørende, mens du skifter over.
- **Ændringer annonceres.** Hver ændring står i [changeloggen](/da/rest-api/reference/changelog/).

## Ændringer, der kan komme når som helst

De bryder ikke en velbygget integration, så de udgives uden en ny version:

- Nye valgfrie felter i en forespørgsel.
- Nye felter i et svar.
- Nye endpoints.
- Nye værdier i `status` og andre tekstfelter.

## Det skal du tage højde for i din integration

Det er din opgave at holde din integration opdateret. For at gøre det nemt:

- **Ignorer felter, du ikke kender.** Fejl ikke, når et svar har et felt, du ikke forventede.
- **Afhæng ikke af feltrækkefølgen** i JSON-objekter eller af den præcise tekst i fejlbeskeder. Brug statuskoden.
- **Læs changeloggen**, når vi annoncerer en ændring, og test mod udviklingsmiljøet (`https://api-dev.deepdots.com`), før den når produktion.
- **Hav en kontaktperson registreret** hos os, så annonceringer når dem, der vedligeholder integrationen.
