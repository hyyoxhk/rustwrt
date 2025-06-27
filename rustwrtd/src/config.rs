use serde::Deserialize;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub server: ServerConfig,
    #[allow(dead_code)]
    pub database: DatabaseConfig,
    #[allow(dead_code)]
    pub openwrt: OpenWrtConfig,
}

#[derive(Debug, Deserialize)]
pub struct ServerConfig {
    pub port: u16,
    #[allow(dead_code)]
    pub host: String,
}

#[derive(Debug, Deserialize)]
pub struct DatabaseConfig {
    #[allow(dead_code)]
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct OpenWrtConfig {
    #[allow(dead_code)]
    pub uci_path: String,
    #[allow(dead_code)]
    pub ubus_path: String,
    #[allow(dead_code)]
    pub network_config_path: String,
    #[allow(dead_code)]
    pub wireless_config_path: String,
    #[allow(dead_code)]
    pub firewall_config_path: String,
    #[allow(dead_code)]
    pub dhcp_config_path: String,
}

impl Config {
    pub fn load() -> Result<Self, config::ConfigError> {
        let config_path = std::env::var("CONFIG_PATH")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("config.toml"));

        let config = config::Config::builder()
            .add_source(config::File::from(config_path))
            .add_source(config::Environment::with_prefix("RUSTWRT"))
            .build()?;

        config.try_deserialize()
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            server: ServerConfig {
                port: 3000,
                host: "127.0.0.1".to_string(),
            },
            database: DatabaseConfig {
                url: "sqlite:rustwrt.db".to_string(),
            },
            openwrt: OpenWrtConfig {
                uci_path: "/sbin/uci".to_string(),
                ubus_path: "/sbin/ubus".to_string(),
                network_config_path: "/etc/config/network".to_string(),
                wireless_config_path: "/etc/config/wireless".to_string(),
                firewall_config_path: "/etc/config/firewall".to_string(),
                dhcp_config_path: "/etc/config/dhcp".to_string(),
            },
        }
    }
}
