import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return [
      {
        value: 'zh-CN',
        label: '中文',
        flag: '🇨🇳'
      },
      {
        value: 'en-US',
        label: 'English',
        flag: '🇺🇸'
      }
    ];
  };

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages
  };
}; 