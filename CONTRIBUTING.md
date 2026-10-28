# Cómo contribuir a Deepdots Documentation (con Claude)

Sitio público de documentación para integradores de los SDK y APIs de Deepdots
(Astro + Starlight), publicado en https://docs.deepdots.com. Esta guía explica cómo
trabajar en el repo y qué pedirle a Claude Code según tu caso:

- [Caso A](#caso-a--actualizar-un-producto-ya-documentado): el producto ya está documentado y sacaste una versión nueva.
- [Caso B](#caso-b--documentar-un-proyecto-existente-sin-docs): el SDK o API ya funciona, pero no tiene sección en el sitio.
- [Caso C](#caso-c--proyecto-nuevo-aún-en-desarrollo): el proyecto está en desarrollo y lo queremos publicar cuando salga.

Las reglas de autoría (estructura, idiomas, estilo, enlaces, deploy) están en
[`CLAUDE.md`](CLAUDE.md). Claude las carga solo; tú revísalas una vez.

## Antes de empezar

> [!CAUTION]
> **El repo y la web son públicos.** Todo lo que hagas commit lo puede leer cualquiera.
> Nunca incluyas claves reales (`publicKey`, tokens, contraseñas), nombres de clientes,
> URLs internas o del admin, ni detalles de cómo funciona la plataforma por dentro. Solo lo
> que necesita quien integra el producto. Pídele a Claude que lo revise antes del PR (los
> prompts de abajo ya lo incluyen).

**Qué va aquí y qué no**

- **Sí:** todo lo que usa un cliente o integrador: SDKs (web, nativo, Python), API REST
  pública, guías de integración.
- **No:** herramientas internas (admin panel, notebooks, pipelines), runbooks, decisiones de
  arquitectura. Eso va en el README o el `CLAUDE.md` del propio repo.

Los productos que ya existen y su repo de código están en la tabla "Products (topics)" de
[`CLAUDE.md`](CLAUDE.md).

## Puesta en marcha (una sola vez)

1. Clona este repo y, en la misma carpeta padre, el repo del producto que vas a documentar.
   Claude necesita leer los dos.

   ```bash
   git clone git@github.com:MagicFeedback/Deepdots-Documentation.git
   cd Deepdots-Documentation
   npm ci
   npm run dev   # http://localhost:4321
   ```

2. Abre Claude Code **con este repo como carpeta de trabajo** (terminal: `claude` dentro de
   `Deepdots-Documentation`; app de escritorio: elige esa carpeta). Así carga el `CLAUDE.md`
   de este repo.
3. Para que lea el código del producto, dale la ruta absoluta en el prompt. Si te pide
   permiso para leer fuera de la carpeta, acéptalo (o añádela con `/add-dir ../<repo-del-sdk>`).
4. Antes de cada tarea, ponte al día: `git checkout main && git pull`.

## Reglas del repo

- **Inglés es la fuente de la verdad.** Se escribe primero en `src/content/docs/<producto>/`;
  `es/` y `da/` son espejos con **exactamente los mismos ficheros**.
- **Tres secciones por producto:** `getting-started/`, `guides/`, `reference/`, más un
  `index.mdx` de portada.
- **Enlaces absolutos con el producto:** `/popup-web/guides/events/`, `/es/popup-web/…`,
  `/da/popup-web/…`. Sin prefijo de base.
- **Cada página** lleva `title` y `description` en el frontmatter; cada bloque de código, su
  lenguaje.
- **`npm run build` tiene que pasar.** Valida los enlaces internos: un enlace roto rompe el
  build y el deploy.
- **Siempre por PR a `main`.** El merge publica automáticamente en docs.deepdots.com (GitHub
  Actions, un par de minutos). No hagas push directo a `main`.

## Caso A — Actualizar un producto ya documentado

Lo normal tras una release: un método nuevo, un parámetro que cambia, una versión de
instalación nueva. Que Claude compare el código con los docs y te proponga los cambios antes
de tocar nada.

```text
Estás en el repo Deepdots-Documentation. Sigue las reglas de CLAUDE.md.

PRODUCTO: <<carpeta del producto, p. ej. popup-web>>
CÓDIGO FUENTE: <<ruta absoluta al repo del SDK/API>>
QUÉ CAMBIÓ: <<versión nueva (p. ej. 1.12.0) y/o enlace al PR o changelog>>

1. Revisa qué cambió en el código entre <<versión/tag anterior>> y la nueva
   (CHANGELOG, git log, diff de la API pública).
2. Compáralo con lo que dicen hoy las páginas del producto en inglés.
3. Dame una lista corta: qué páginas tocarías y qué cambiarías en cada una.
   Espera mi OK antes de editar.
4. Edita primero en inglés y luego replica los mismos cambios en es/ y da/.
5. Revisa que no se cuele nada interno (claves, clientes, URLs internas):
   el repo es público.
6. Ejecuta npm run build y arregla hasta que pase limpio.
7. Crea la rama docs/<producto>-<versión>, commit con el formato
   "docs(<producto>): <resumen> (<versión>)" y abre un PR a main.
   No hagas merge.
```

Si el cambio es pequeño (una versión en la instalación, un parámetro), basta con decírselo
directamente: «actualiza la versión de instalación de popup-native a 0.7.3 en los tres
idiomas, build y PR».

## Caso B — Documentar un proyecto existente sin docs

El repo trae un prompt preparado para esto: [`.claude/prompts/new-product.md`](.claude/prompts/new-product.md).
Crea la sección nueva con la misma estructura, estilo y voz que las demás, la registra en el
selector de productos y la añade a las portadas en los tres idiomas.

1. Copia el bloque de texto de `new-product.md` y rellena los dos marcadores: la **ruta
   absoluta al proyecto** y el **nombre del producto** tal como saldrá en el selector.
2. Añade al final el bloque de abajo, que cubre lo que el prompt original no menciona.
3. Pégalo en Claude Code. Primero leerá el `CLAUDE.md`, los productos existentes y tu
   proyecto, y te propondrá un **esquema de páginas**. Revísalo bien: es el momento más barato
   para corregir.

```text
EXTRA:
- El repo es público: documenta solo la superficie pública que usa un
  integrador. Nada de claves reales, clientes, URLs internas ni detalles
  de implementación. Si dudas de si algo es público, pregúntame.
- Si el código y su README se contradicen, fíate del código y avísame.
- Actualiza la tabla "Products (topics)" de CLAUDE.md con el nuevo producto
  y su repo de código.
- Cuando el build pase, crea la rama docs/<slug>, commit
  "docs(<slug>): <resumen>" y abre un PR a main. No hagas merge.
```

Si el proyecto no tiene README ni ejemplos, Claude lo deducirá del código, pero revisa con
cuidado los ejemplos de uso: pídele que cada snippet se base en una firma real del código y
que te diga de qué fichero la sacó.

## Caso C — Proyecto nuevo, aún en desarrollo

Mientras la API pública cambia, no tiene sentido publicar. Documenta cuando haya una primera
versión que alguien de fuera pueda instalar.

1. **Durante el desarrollo:** en el repo del proyecto, deja un `README` con instalación,
   inicialización y un ejemplo mínimo. Es lo que Claude usará luego como punto de partida.
2. **Para la primera release:** sigue el [caso B](#caso-b--documentar-un-proyecto-existente-sin-docs).
   Abre el PR de docs a la vez que el de la release y haz merge del de docs cuando la versión
   esté publicada (npm, PyPI, SPM…), para que nadie lea instrucciones de algo que aún no puede
   instalar.
3. **Para que no se quede desactualizado:** añade al `CLAUDE.md` del repo del proyecto una
   regla como esta, así Claude te avisará en cada cambio de API:

```markdown
## Public documentation
This package is documented for integrators at https://docs.deepdots.com
(repo MagicFeedback/Deepdots-Documentation, folder src/content/docs/<slug>/).
When a change touches the public API (new or renamed methods, options,
events, defaults, install steps or version), say so at the end of the task
and list which docs pages need updating. Do not edit the docs repo from here.
```

## Antes de pedir revisión del PR

- [ ] `npm run build` pasa sin errores.
- [ ] Has mirado las páginas cambiadas en `npm run dev`, en inglés y al menos en uno de los
      otros idiomas.
- [ ] `es/` y `da/` tienen los mismos ficheros que inglés (pregúntale a Claude: «¿hay alguna
      página que exista en un idioma y no en otro?»).
- [ ] Los ejemplos de código funcionan con la versión publicada del producto.
- [ ] No hay claves, clientes ni URLs internas.
- [ ] Rama `docs/<producto>-<qué>`, título del PR `docs(<producto>): …`, y lo revisa otra
      persona antes del merge.

## Problemas frecuentes

| Qué pasa | Qué hacer |
|---|---|
| El build falla por un enlace | Falta el segmento del producto o del idioma (`/es/…`). Pásale el error a Claude. |
| Un componente (`Tabs`, `Aside`…) sale como texto | La página tiene que ser `.mdx`, no `.md`, e importar el componente de `@astrojs/starlight/components`. |
| El producto nuevo no sale en el selector | Falta registrarlo en `astro.config.mjs` (`starlightSidebarTopics`). |
| Hice merge y la web no cambia | Mira la pestaña Actions del repo: el deploy tarda un par de minutos y, si el build falla, no se publica. |
| Claude ignora las reglas del repo | Comprueba que lo abriste dentro de `Deepdots-Documentation`. Si lo lanzas desde otra carpeta, no carga este `CLAUDE.md`. |
