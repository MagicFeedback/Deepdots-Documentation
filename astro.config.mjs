import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';

const vercelSite =
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined;
const githubPagesSite =
  process.env.GITHUB_PAGES === 'true' && process.env.GITHUB_REPOSITORY_OWNER
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
    : undefined;
const site = process.env.SITE_URL || vercelSite || githubPagesSite;
const base =
  process.env.BASE_PATH
  || (process.env.GITHUB_PAGES === 'true' && process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
    : undefined);

export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: 'Deepdots Documentation',
      description: 'Official documentation for the Deepdots SDK ecosystem.',
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
        { icon: 'github', label: 'Popup Web', href: 'https://github.com/MagicFeedback/deepdots-popup-sdk' },
        { icon: 'github', label: 'Surveys', href: 'https://github.com/MagicFeedback/magicfeedback-sdk' },
      ],
      plugins: [
        starlightSidebarTopics([
          {
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
            label: { en: 'Popup Native (KMP)', es: 'Popup Nativo (KMP)', da: 'Popup Native (KMP)' },
            link: '/popup-native/',
            icon: 'phone',
            badge: { text: 'Beta', variant: 'caution' },
            items: [
              { label: 'Getting Started', autogenerate: { directory: 'popup-native/getting-started' } },
              { label: 'Guides', autogenerate: { directory: 'popup-native/guides' } },
              { label: 'Reference', autogenerate: { directory: 'popup-native/reference' } },
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
        ]),
      ],
    }),
  ],
});
