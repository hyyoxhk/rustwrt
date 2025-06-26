import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  WifiOutlined,
  GlobalOutlined,
  SafetyOutlined,
  SettingOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import LanguageSwitcher from './LanguageSwitcher';

const { Sider } = Layout;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('common.dashboard'),
    },
    {
      key: '/network',
      icon: <GlobalOutlined />,
      label: t('common.network'),
    },
    {
      key: '/wireless',
      icon: <WifiOutlined />,
      label: t('common.wireless'),
    },
    {
      key: '/firewall',
      icon: <SafetyOutlined />,
      label: t('common.firewall'),
    },
    {
      key: '/dhcp',
      icon: <DesktopOutlined />,
      label: t('common.dhcp'),
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: t('common.system'),
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        background: '#001529',
      }}
    >
      <div style={{ 
        height: 32, 
        margin: 16, 
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
      }}>
        RustWrt
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
      }}>
        <LanguageSwitcher />
      </div>
    </Sider>
  );
}

export default Sidebar;
