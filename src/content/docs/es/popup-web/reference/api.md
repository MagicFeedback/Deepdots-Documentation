---
title: API
description: Métodos públicos que usarás desde tu aplicación.
---

Estos son los métodos públicos de la clase `DeepdotsPopups`. Cubren todo lo que una aplicación host necesita para montar el SDK, reaccionar a los popups y lanzar eventos de negocio.

## `init(config)`

Inicializa el SDK y carga las definiciones de popup desde Deepdots.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123', // opcional
});
```

| Campo    | Obligatorio | Descripción                                              |
| -------- | ----------- | -------------------------------------------------------- |
| `apiKey` | sí          | Tu API key pública de Deepdots.                          |
| `userId` | no          | Identificador enviado con cada evento de popup.          |
| `language` | no        | Etiqueta de idioma BCP-47 (p. ej. `es-ES`). Determina tanto el contexto de analytics como la [segmentación por idioma](/es/popup-web/reference/popup-definition/#campos-que-afectan-al-comportamiento) de los popups (`segments.lang`). Se detecta automáticamente desde el navegador (o `Intl` en React Native) si se omite. Ver [Analytics → Detección de idioma](/es/popup-web/guides/analytics/#detección-de-idioma). |
| `contactAttributes` | no | Atributos internos del usuario a enviar al Contact (requiere `userId`). Ver [`setContactAttributes`](#setcontactattributesattributes). |
| `debug`  | no          | Activa la salida de debug del SDK. Desactivada por defecto. |
| `logger` | no          | Destino personalizado para esa salida de debug. Ver [Logger personalizado](#logger-personalizado). |
| `renderChrome` | no | **Solo React Native** (desde 1.4.0). Por defecto `true`. Ponlo en `false` cuando montas tu propio contenedor decorado, para que el WebView del survey se renderice sin la tarjeta ni el backdrop propios del SDK. Ver [React Native → renderChrome](/es/popup-web/reference/react-native/#renderizar-el-survey-sin-la-tarjeta-del-sdk-renderchrome). |
| `showProgressBar` | no | Desde 1.5.0. Muestra una etiqueta `Question X of Y` y una barra de progreso en la cabecera del popup. Omítelo para respetar lo que la plataforma haya configurado para el survey. Ver [Barra de progreso](#barra-de-progreso). |
| `surveyCss` | no | Desde 1.5.0. Tu propio CSS, inyectado como última hoja de estilos para que gane en cascada. Es la vía para reestilar el área de preguntas por integración. Ver [CSS personalizado](#css-personalizado). |

### Barra de progreso

La cabecera del popup puede indicar por dónde va el survey: una etiqueta `Question 2 of 3` — el número en negrita y el resto atenuado — sobre una barra de progreso fina.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  showProgressBar: true,
});
```

El flag tiene tres estados:

| Valor | Comportamiento |
| --- | --- |
| `true` | Se muestra siempre. |
| `false` | No se muestra nunca. |
| omitido | Sigue el ajuste `showProgressBar` configurado para el survey en la plataforma. |

La barra solo aparece cuando hay más de una página, una vez pasada la pantalla de inicio y antes de la pantalla final. También respeta el `progressUnit` del propio survey (`fraction` → `Question 2 of 3`, `percentage` → `66%`), `showProgressUnit` y `loadingBarColor`.

:::note
Las preguntas de seguimiento dinámicas no forman parte del grafo de páginas: avanzan la barra medio paso pero no cambian el total. La etiqueta redondea hacia abajo, así que un seguimiento de la pregunta 2 sigue leyéndose `Question 2` mientras la barra avanza.
:::

El texto de la etiqueta está de momento solo en inglés. Si lo necesitas localizado, desactiva la unidad con `showProgressUnit` en la plataforma y pinta tu propia cabecera.

### CSS personalizado

El área de preguntas — enunciados, opciones, escalas de valoración — la renderiza el SDK de Surveys con una hoja de estilos compartida por todos los clientes de Deepdots. `surveyCss` te permite reestilarla solo para tu integración: la cadena se inyecta como **última** hoja de estilos del popup, así que gana en cascada sin que nadie tenga que cambiar los valores por defecto compartidos.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  surveyCss: `
    /* Enunciado: más pequeño y compacto que el valor por defecto */
    .magicfeedback-label {
      font-size: 15px; font-weight: 600; color: #1a1a1a;
      display: block; margin-bottom: 12px; line-height: 1.4;
    }
    .magicfeedback-sublabel {
      font-size: 13px; font-weight: 400; color: #6b7280;
      display: block; margin-bottom: 12px;
    }
    /* Opciones como filas planas en lugar de tarjetas */
    .magicfeedback-radio-container {
      box-shadow: none !important; border: none !important;
      background: transparent !important; border-radius: 0 !important;
      padding: 6px 0 !important; margin: 0 !important;
    }
    .magicfeedback-radio-container label { font-size: 14px; font-weight: 400; color: #1a1a1a; }
  `,
});
```

Se aplica tanto al popup DOM de web como al WebView del survey en React Native.

:::note
La cadena se inyecta tal cual, sin sanear: es código tuyo, como cualquier hoja de estilos que publiques. No la construyas a partir de datos de usuario ni de terceros.
:::

Los nombres de clase vienen de `@magicfeedback/native` y no siempre son los evidentes. Los que más te van a interesar:

| Elemento | Selector |
| --- | --- |
| Enunciado de la pregunta | `label.magicfeedback-label` |
| Línea secundaria bajo la pregunta | `label.magicfeedback-sublabel` |
| Fila de opción radio / checkbox | `.magicfeedback-radio-container`, `.magicfeedback-checkbox-container` |
| Escala numérica de valoración | `.magicfeedback-rating-number-container`, `.magicfeedback-rating-number-option` |
| Campo de texto libre | `.magicfeedback-input` |

:::caution
El recuadro de una fila de opción es un `box-shadow`, no un `border`. Quitar solo el borde deja la tarjeta visible: hay que resetear `box-shadow`, `background` y `border-radius` a la vez.

```css
.magicfeedback-radio-container {
  box-shadow: none !important;
  background: transparent !important;
  border-radius: 0 !important;
}
```
:::

:::note
Inspecciona el DOM en vivo antes de escribir reglas: abre el popup en un navegador (o el inspector de WebView en React Native) y lee los nombres de clase reales. Adivinarlos es el motivo más común de que una regla parezca no hacer nada.
:::

#### Llegar al marco del popup

`surveyCss` se inyecta el último, así que también alcanza el chrome del propio SDK: cabecera, barra de progreso, footer y pantalla final. Desde la 1.5.0 todos los puntos de enganche de abajo existen en **ambos**, el popup web y el survey de React Native, así que una sola hoja de estilos cubre los dos.

| Parte | Selector |
| --- | --- |
| Contenedor del popup | `#dd-popup` · `.deepdots-popup` |
| Fila de cabecera | `.deepdots-popup-header` |
| Título de la cabecera | `#dd-title` · `.deepdots-popup-title` |
| Icono de cerrar | `#dd-close` |
| Bloque de progreso | `#dd-progress` · `.deepdots-progress` |
| Etiqueta de progreso | `#dd-progress-label` (`#dd-progress-current`, `#dd-progress-total`) |
| Barra de progreso | `.deepdots-progress-track` · `#dd-progress-bar` |
| Área de preguntas con scroll | `#dd-main` · `.deepdots-popup-main` |
| Footer | `#dd-footer` · `.deepdots-popup-footer` |
| Todos los botones de navegación | `.dd-nav-btn` |
| Botones individuales | `#dd-submit` · `#dd-back` · `#dd-start` · `#dd-complete` |
| Pantalla final | `.deepdots-success` |
| Aviso de validación | `#dd-error` · `.deepdots-error-hint` |

:::caution[Los valores que el SDK aplica inline necesitan `!important`]
Los colores que vienen del estilo del survey — `buttonPrimaryColor`, `buttonSecondaryColor`, `loadingBarColor`, `boxBackgroundColor` — se fijan como estilos inline en cuanto el survey carga, y un estilo inline gana a un selector de id. Para sobreescribir uno de esos desde `surveyCss`, marca la declaración:

```css
#dd-progress-bar { background: #0b5cd5 !important; }
```

Todo lo que el SDK estila desde su propia hoja de estilos (tamaños, espaciados, radios, tipografía) no necesita `!important`.
:::

Para los colores, mejor los ajustes de la plataforma que el CSS: el `theme`, la `position` y la `font` del popup, y el `buttonPrimaryColor`, `buttonSecondaryColor` y `loadingBarColor` del propio survey. Esos aplican en ambas plataformas y cambian sin publicar la app. En React Native también puedes ceder el marco entero a tu app con [`renderChrome: false`](/es/popup-web/reference/react-native/#renderizar-el-survey-sin-la-tarjeta-del-sdk-renderchrome).

### Logger personalizado

Por defecto el SDK escribe su salida de debug en `console`. Pasa un `logger` para enrutarla a otro sitio — un archivo de log, un servicio de logging remoto, Firebase, tu propio buffer — lo que resulta útil en React Native, donde la consola de Metro no está disponible en builds de producción.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  debug: true,
  logger: {
    log: (...args) => myLogger.info(...args),
    warn: (...args) => myLogger.warn(...args),
    error: (...args) => myLogger.error(...args),
  },
});
```

Solo `log` es obligatorio — `warn`, `error` e `info` caen a `log` si se omiten. `console` cumple la forma, así que `logger: console` es válido y es el valor por defecto.

```ts
interface DeepdotsLogger {
  log: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
}
```

:::note
`logger` solo cambia **dónde** va la salida, no cuánta hay: los mensajes de debug del SDK siguen requiriendo `debug: true`. Los errores que el SDK reporta independientemente de `debug` (un listener de evento que lanza, un aviso del renderer) también pasan por el logger una vez está fijado.
:::

## `autoLaunch()`

Arranca los triggers derivados de las definiciones cargadas durante `init()`. Llámalo una vez después de `init()`.

```ts
popups.autoLaunch();
```

## `triggerEvent(eventName)`

Lanza un evento de negocio personalizado. Cualquier popup en Deepdots configurado con un trigger de tipo `event` cuyo nombre coincida con `eventName` se mostrará (respetando cooldowns y segmentación).

```ts
popups.triggerEvent('checkout_completed');
```

Consulta [Triggers → event](/es/popup-web/guides/triggers/#event) para más detalles.

## `on(event, listener)` / `off(event, listener)`

Suscríbete a los eventos del SDK: `popup_shown`, `popup_clicked`, `survey_completed`.

```ts
const onShown = (event) => analytics.track('popup_shown', event);

popups.on('popup_shown', onShown);
popups.off('popup_shown', onShown);
```

Mira [Events](/es/popup-web/guides/events/) para el payload completo.

## `setContactAttributes(attributes)`

Envía atributos internos del usuario que solo conoce tu aplicación — idioma, edad, plan, segmento, etc. — al **Contact** del usuario en Deepdots, para usarlos en la segmentación y el targeting de popups.

Requiere un `userId` en `init()`: los atributos se asocian a esa identidad (el mismo id de tu propio sistema). Los valores de los atributos deben ser `string`, `number` o `boolean`.

```ts
const enviado = await popups.setContactAttributes({
  language: 'es',
  age: 34,
  plan: 'premium',
});
```

El SDK solo envía cuando los atributos **cambian** respecto al último envío — guarda un diff en el almacenamiento persistente —, así que puedes llamarlo en cada identificación de usuario sin generar peticiones de más. La promesa devuelta resuelve a:

- `true` — los atributos se enviaron al backend.
- `false` — no hubo cambios desde el último envío (o el tracking está desactivado, o no hay `userId`).

Por debajo hace `POST /sdk/popups/contact` con el body `{ publicKey, userId, userAttributes }`. El Contact se crea automáticamente en la primera carga de popups, así que no hace falta ningún orden concreto.

También puedes aportar los atributos iniciales directamente en `init()` con `contactAttributes` (equivale a llamar `setContactAttributes` justo después de init):

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123',
  contactAttributes: { language: 'es', plan: 'premium' },
});
```
