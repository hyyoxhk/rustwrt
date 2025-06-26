import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useI18n } from '../hooks/useI18n';

const LanguageSwitcher = () => {
  const { getCurrentLanguage, changeLanguage, getAvailableLanguages } = useI18n();

  const languages = getAvailableLanguages();

  const handleLanguageChange = (value) => {
    changeLanguage(value);
  };

  return (
    <Space>
      <GlobalOutlined />
      <Select
        value={getCurrentLanguage()}
        onChange={handleLanguageChange}
        style={{ width: 120 }}
        options={languages.map(lang => ({
          value: lang.value,
          label: (
            <Space>
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </Space>
          )
        }))}
      />
    </Space>
  );
};

export default LanguageSwitcher; 