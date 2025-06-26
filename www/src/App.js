import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Network from './pages/Network';
import Wireless from './pages/Wireless';
import Firewall from './pages/Firewall';
import DHCP from './pages/DHCP';
import System from './pages/System';
import './i18n';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/network" element={<Network />} />
            <Route path="/wireless" element={<Wireless />} />
            <Route path="/firewall" element={<Firewall />} />
            <Route path="/dhcp" element={<DHCP />} />
            <Route path="/system" element={<System />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
