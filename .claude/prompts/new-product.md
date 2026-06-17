# Prompt: documentar un producto nuevo

Prompt reutilizable para añadir la documentación de un SDK/producto nuevo a este sitio,
siguiendo el mismo estilo visual y narrativo que el resto. Ejecútalo con Claude Code **dentro
de este repositorio** (`Deepdots-Documentation`). Rellena los dos marcadores `<<…>>` y pégalo.

---

```text
Estás trabajando dentro del repositorio Deepdots-Documentation: el sitio de documentación
unificado del ecosistema Deepdots (Astro + Starlight, un "topic"/producto por SDK,
selector desplegable, publicado en https://docs.deepdots.com). Quiero que añadas la
documentación de un nuevo producto SIGUIENDO EXACTAMENTE el mismo estilo —visual y
narrativo— que el resto del sitio.

PROYECTO A DOCUMENTAR:
  <<RUTA ABSOLUTA AL PROYECTO/SDK QUE QUIERO DOCUMENTAR>>
NOMBRE DEL PRODUCTO (cómo aparecerá en el selector):
  <<NOMBRE DEL PRODUCTO, p. ej. "Webhooks SDK">>

ANTES DE ESCRIBIR NADA:
1. Lee el archivo CLAUDE.md de este repo: contiene las reglas de autoría, estructura de
   topics, reglas de i18n, estilo/voz, terminología y deploy. Síguelas al pie de la letra.
2. Lee a fondo un topic existente como REFERENCIA de estructura y de VOZ NARRATIVA:
   - src/content/docs/popup-web/**  y  src/content/docs/popup-native/**
   - sus espejos en src/content/docs/es/** y src/content/docs/da/**
   Fíjate en: tono, longitud y orden de las páginas, uso de frontmatter (title/description),
   bloques de código, componentes de Starlight (Aside, Steps, Tabs/TabItem, Card/CardGrid,
   LinkButton) y cómo se enlazan las páginas entre sí.
3. Explora el proyecto a documentar (README, API pública, ejemplos, configuración) para
   entender qué hace y cómo se integra.

LUEGO, ANTES DE GENERAR TODO EL CONTENIDO, propónme un esquema breve (qué páginas tendrá
cada sección) y espera mi OK.

ESTRUCTURA A SEGUIR (idéntica a los otros productos):
- Crea un topic nuevo en src/content/docs/<slug-del-producto>/ con tres secciones:
  getting-started/  guides/  reference/  + un index.mdx como portada del topic.
- Inglés es la FUENTE DE LA VERDAD (en root). Después crea los espejos en
  src/content/docs/es/<slug>/ y src/content/docs/da/<slug>/ con la MISMA estructura de
  archivos (traducidos), sin que ningún idioma diverja en qué páginas existen.
- Registra el topic en astro.config.mjs dentro de starlightSidebarTopics([...]) con:
  label como objeto { en, es, da }, un icon válido de Starlight, link '/<slug>/' y los tres
  items autogenerados (getting-started, guides, reference). No definas `sidebar` aparte.
- Añade una tarjeta del producto a las tres portadas raíz (src/content/docs/index.mdx,
  es/index.mdx, da/index.mdx) dentro de la categoría que corresponda (Popups / Surveys / …),
  usando <Card> + <LinkButton href="/<slug>/" icon="right-arrow">…</LinkButton>, igual que
  las existentes.

REGLAS DE ENLACES (importante):
- El sitio se sirve en la RAÍZ del dominio, sin base path. Usa enlaces absolutos
  root-relative con el segmento del topic: '/<slug>/getting-started/…' en inglés,
  '/es/<slug>/…' y '/da/<slug>/…' en los idiomas. Nunca añadas prefijo de base.

ESTILO VISUAL:
- No escribas CSS nuevo: las tarjetas Material, el divisor de secciones y el selector
  desplegable ya son globales (src/styles/landing.css + componentes en src/components/).
  Reutiliza los componentes existentes; el resultado debe verse igual que los otros topics.

NARRATIVA:
- Mantén el mismo registro y vocabulario que los docs existentes (terminología consistente,
  audiencia por producto, frontmatter con title + description en cada página, bloques de
  código con lenguaje). Sé claro y conciso.

VERIFICACIÓN (obligatoria antes de dar por hecho nada):
- Ejecuta `npm run build`: Starlight valida los enlaces internos, así que un enlace mal
  formado fallará el build. Arregla hasta que el build pase en limpio.
- Opcional: `npm run dev` y revisa el topic nuevo, el selector y los tres idiomas.

DESPLIEGUE:
- NO hagas commit ni push hasta que yo lo confirme. Cuando lo apruebe, un push a main
  dispara el deploy a docs.deepdots.com vía GitHub Actions.
```

---

## Cómo usarlo

- Rellena `<<RUTA…>>` con la ruta absoluta del proyecto. Si está en otro repo/máquina,
  clónalo localmente o da acceso a Claude primero.
- Si el producto no encaja en las categorías actuales de la portada (Popups / Surveys), el
  prompt ya pide a Claude proponerte el esquema antes de escribir; ahí decides si crear una
  categoría nueva.
- El prompt pide confirmación antes de commitear/desplegar. Si prefieres deploy directo,
  elimina el bloque "DESPLIEGUE".
