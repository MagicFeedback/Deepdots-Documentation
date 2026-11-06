import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import sitemap from '@astrojs/sitemap';
import { isUnlistedPath } from './src/unlisted.mjs';

// Served at the root of the custom domain (docs.deepdots.com), so there is no base path.
// All absolute links (`/popup-web/…`) resolve correctly without a prefix.
const site = process.env.SITE_URL || 'https://docs.deepdots.com';
const base = process.env.BASE_PATH; // undefined → served at domain root

export default defineConfig({
  site,
  base,
  integrations: [
    // Same as Starlight's built-in sitemap (i18n from `locales`), minus unlisted topics.
    // Declared here, Starlight skips adding its own.
    sitemap({
      i18n: { defaultLocale: 'root', locales: { root: 'en', es: 'es', da: 'da' } },
      filter: (page) => !isUnlistedPath(new URL(page).pathname),
    }),
    starlight({
      title: 'Deepdots Documentation',
      description: 'Official documentation for the Deepdots SDK ecosystem.',
      customCss: ['./src/styles/landing.css'],
      favicon: '/favicon.ico',
      logo: {
        light: './src/assets/logo-dark-long.svg',
        dark: './src/assets/logo-light-long.svg',
        replacesTitle: true,
      },
      disable404Route: true,
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
        da: { label: 'Dansk', lang: 'da' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/MagicFeedback' },
      ],
      components: {
        // Render the product topics as a dropdown selector (see src/components/TopicsDropdown.astro).
        Sidebar: './src/components/Sidebar.astro',
      },
      plugins: [
        starlightSidebarTopics([
          {
            id: 'popup-web',
            label: { en: 'Popup Web SDK', es: 'SDK Popup Web', da: 'Popup Web SDK' },
            link: '/popup-web/',
            icon: 'rocket',
            items: [
              { label: 'Getting Started', autogenerate: { directory: 'popup-web/getting-started' } },
              { label: 'Guides', autogenerate: { directory: 'popup-web/guides' } },
              { label: 'Reference', autogenerate: { directory: 'popup-web/reference' } },
            ],
          },
          {
            id: 'popup-native',
            label: { en: 'Popup Native (KMP)', es: 'Popup Nativo (KMP)', da: 'Popup Native (KMP)' },
            link: '/popup-native/',
            icon: 'phone',
            items: [
              { label: 'Getting Started', autogenerate: { directory: 'popup-native/getting-started' } },
              { label: 'Guides', autogenerate: { directory: 'popup-native/guides' } },
              { label: 'Reference', autogenerate: { directory: 'popup-native/reference' } },
            ],
          },
          {
            // Early access: unlisted (see src/unlisted.mjs).
            label: { en: 'Popup Flutter (early access)', es: 'Popup Flutter (acceso anticipado)', da: 'Popup Flutter (tidlig adgang)' },
            link: '/popup-flutter/',
            icon: 'phone',
            items: [
              { label: 'Getting Started', autogenerate: { directory: 'popup-flutter/getting-started' } },
              { label: 'Guides', autogenerate: { directory: 'popup-flutter/guides' } },
              { label: 'Reference', autogenerate: { directory: 'popup-flutter/reference' } },
            ],
          },
          {
            label: { en: 'Surveys SDK', es: 'SDK de Surveys', da: 'Surveys SDK' },
            link: '/surveys/',
            icon: 'comment',
            items: [
              { label: 'Getting Started', autogenerate: { directory: 'surveys/getting-started' } },
              { label: 'Guides', autogenerate: { directory: 'surveys/guides' } },
              { label: 'Reference', autogenerate: { directory: 'surveys/reference' } },
            ],
          },
          {
            label: { en: 'Python SDK', es: 'SDK Python', da: 'Python SDK' },
            link: '/python-sdk/',
            icon: 'puzzle',
            items: [
              { label: 'Getting Started', autogenerate: { directory: 'python-sdk/getting-started' } },
              { label: 'Guides', autogenerate: { directory: 'python-sdk/guides' } },
              { label: 'Reference', autogenerate: { directory: 'python-sdk/reference' } },
            ],
          },
          {
            label: { en: 'REST API', es: 'API REST', da: 'REST API' },
            link: '/rest-api/',
            icon: 'seti:json',
            items: [
              { label: 'Getting Started', autogenerate: { directory: 'rest-api/getting-started' } },
              { label: 'Guides', autogenerate: { directory: 'rest-api/guides' } },
              { label: 'Reference', autogenerate: { directory: 'rest-api/reference' } },
            ],
          },
        ], {
          // Unlisted single pages (src/unlisted.mjs): hidden from the sidebar, so the plugin needs
          // to be told which topic they belong to.
          topics: {
            'popup-web': ['/popup-web/reference/survey-compatibility', '/es/popup-web/reference/survey-compatibility', '/da/popup-web/reference/survey-compatibility'],
            'popup-native': ['/popup-native/reference/survey-compatibility', '/es/popup-native/reference/survey-compatibility', '/da/popup-native/reference/survey-compatibility'],
          },
        }),
      ],
    }),
  ],
});
