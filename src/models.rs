use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub hostname: String,
    pub uptime: u64,
    pub load_average: [f64; 3],
    pub memory: MemoryInfo,
    pub cpu: CpuInfo,
    pub disk: DiskInfo,
    pub openwrt_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryInfo {
    pub total: u64,
    pub used: u64,
    pub free: u64,
    pub available: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CpuInfo {
    pub model: String,
    pub cores: u32,
    pub usage_percent: f64,
    pub temperature: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiskInfo {
    pub total: u64,
    pub used: u64,
    pub free: u64,
    pub usage_percent: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NetworkInterface {
    pub name: String,
    pub interface_type: InterfaceType,
    pub status: InterfaceStatus,
    pub ip_addresses: Vec<String>,
    pub mac_address: Option<String>,
    pub speed: Option<u32>,
    pub duplex: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum InterfaceType {
    Ethernet,
    Wireless,
    Loopback,
    Bridge,
    VLAN,
    Other(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub enum InterfaceStatus {
    Up,
    Down,
    Unknown,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NetworkStatus {
    pub interfaces: Vec<NetworkInterface>,
    pub default_gateway: Option<String>,
    pub dns_servers: Vec<String>,
    pub internet_connectivity: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WirelessNetwork {
    pub ssid: String,
    pub bssid: String,
    pub channel: u8,
    pub frequency: u32,
    pub signal_strength: i8,
    pub encryption: String,
    pub mode: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FirewallRule {
    pub id: String,
    pub name: String,
    pub action: FirewallAction,
    pub protocol: String,
    pub source: String,
    pub destination: String,
    pub source_port: Option<u16>,
    pub destination_port: Option<u16>,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum FirewallAction {
    Accept,
    Drop,
    Reject,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DhcpLease {
    pub mac_address: String,
    pub ip_address: String,
    pub hostname: Option<String>,
    pub lease_time: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DhcpConfig {
    pub enabled: bool,
    pub start_ip: String,
    pub end_ip: String,
    pub lease_time: u32,
    pub dns_servers: Vec<String>,
    pub static_leases: Vec<StaticLease>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StaticLease {
    pub mac_address: String,
    pub ip_address: String,
    pub hostname: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
            timestamp: Utc::now(),
        }
    }

    #[allow(dead_code)]
    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(message),
            timestamp: Utc::now(),
        }
    }
}
