import type { BannerTranslations, SupportedLanguage } from './types';

export const BANNER_TRANSLATIONS: Record<SupportedLanguage, BannerTranslations> = {
  en: {
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    customize: 'Customize',
    savePreferences: 'Save Preferences',
    required: 'Required',
    modalTitle: 'Cookie Preferences',
    manage: 'Manage Cookies',
    description: 'We use cookies to improve your experience on our site.',
  },
  de: {
    acceptAll: 'Alle akzeptieren',
    rejectAll: 'Alle ablehnen',
    customize: 'Anpassen',
    savePreferences: 'Einstellungen speichern',
    required: 'Erforderlich',
    modalTitle: 'Cookie-Einstellungen',
    manage: 'Cookies verwalten',
    description: 'Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern.',
  },
  fr: {
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout refuser',
    customize: 'Personnaliser',
    savePreferences: 'Enregistrer les préférences',
    required: 'Obligatoire',
    modalTitle: 'Préférences des cookies',
    manage: 'Gérer les cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
  },
  es: {
    acceptAll: 'Aceptar todo',
    rejectAll: 'Rechazar todo',
    customize: 'Personalizar',
    savePreferences: 'Guardar preferencias',
    required: 'Obligatorio',
    modalTitle: 'Preferencias de cookies',
    manage: 'Gestionar cookies',
    description: 'Usamos cookies para mejorar su experiencia en nuestro sitio.',
  },
  it: {
    acceptAll: 'Accetta tutto',
    rejectAll: 'Rifiuta tutto',
    customize: 'Personalizza',
    savePreferences: 'Salva preferenze',
    required: 'Necessario',
    modalTitle: 'Preferenze cookie',
    manage: 'Gestisci cookie',
    description: 'Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito.',
  },
  pt: {
    acceptAll: 'Aceitar tudo',
    rejectAll: 'Rejeitar tudo',
    customize: 'Personalizar',
    savePreferences: 'Salvar preferências',
    required: 'Necessário',
    modalTitle: 'Preferências de cookies',
    manage: 'Gerenciar cookies',
    description: 'Usamos cookies para melhorar sua experiência em nosso site.',
  },
  nl: {
    acceptAll: 'Alles accepteren',
    rejectAll: 'Alles weigeren',
    customize: 'Aanpassen',
    savePreferences: 'Voorkeuren opslaan',
    required: 'Vereist',
    modalTitle: 'Cookie-instellingen',
    manage: 'Cookies beheren',
    description: 'We gebruiken cookies om uw ervaring op onze site te verbeteren.',
  },
  pl: {
    acceptAll: 'Akceptuj wszystko',
    rejectAll: 'Odrzuć wszystko',
    customize: 'Dostosuj',
    savePreferences: 'Zapisz preferencje',
    required: 'Wymagane',
    modalTitle: 'Ustawienia plików cookie',
    manage: 'Zarządzaj plikami cookie',
    description: 'Używamy plików cookie, aby poprawić Twoje doświadczenie na naszej stronie.',
  },
};

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
  { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { value: 'pl', label: 'Polski', flag: '🇵🇱' },
];

export function getTranslations(language: string): BannerTranslations {
  return BANNER_TRANSLATIONS[language as SupportedLanguage] ?? BANNER_TRANSLATIONS.en;
}
