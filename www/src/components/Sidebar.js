import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  WifiOutlined,
  GlobalOutlined,
  SafetyOutlined,
  SettingOutlined,
  DesktopOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表板',
  },
  {
    key: '/network',
    icon: <GlobalOutlined />,
    label: '网络管理',
  },
  {
    key: '/wireless',
    icon: <WifiOutlined />,
    label: '无线网络',
  },
  {
    key: '/firewall',
    icon: <SafetyOutlined />,
    label: '防火墙',
  },
  {
    key: '/dhcp',
    icon: <DesktopOutlined />,
    label: 'DHCP管理',
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
    </Sider>
  );
}

export default Sidebar;
