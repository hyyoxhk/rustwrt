use chrono::{DateTime, Utc};
use crate::{models::{DhcpLease, DhcpConfig}, error::AppResult, utils::command_utils};

pub async fn get_dhcp_leases() -> AppResult<Vec<DhcpLease>> {
    // 读取DHCP租约文件
    let leases_output = command_utils::execute_command("cat", &["/var/lib/dhcp/dhcpd.leases"]).await?;
    parse_dhcp_leases(&leases_output)
}

pub async fn get_dhcp_config() -> AppResult<DhcpConfig> {
    // 读取DHCP配置文件
    let config_output = command_utils::execute_command("cat", &["/etc/dhcp/dhcpd.conf"]).await?;
    parse_dhcp_config(&config_output)
}

pub async fn update_dhcp_config(config: DhcpConfig) -> AppResult<()> {
    // 生成新的DHCP配置文件
    let config_content = generate_dhcp_config(&config);
    
    // 写入配置文件
    command_utils::write_file("/etc/dhcp/dhcpd.conf", &config_content).await?;
    
    // 重启DHCP服务
    command_utils::execute_command("systemctl", &["restart", "isc-dhcp-server"]).await?;
    
    Ok(())
}

fn parse_dhcp_leases(leases_content: &str) -> AppResult<Vec<DhcpLease>> {
    let mut leases = Vec::new();
    let mut current_lease: Option<DhcpLease> = None;

    for line in leases_content.lines() {
        let line = line.trim();
        
        if line.starts_with("lease") && line.ends_with("{") {
            // 新的租约开始
            if let Some(lease) = current_lease.take() {
                leases.push(lease);
            }
            
            let ip_address = line[5..line.len()-1].trim();
            current_lease = Some(DhcpLease {
                mac_address: "Unknown".to_string(),
                ip_address: ip_address.to_string(),
                hostname: None,
                lease_time: Utc::now(),
                expires_at: Utc::now(),
            });
        } else if let Some(ref mut lease) = current_lease {
            if line.starts_with("  hardware ethernet") {
                if let Some(mac_start) = line.find("ethernet") {
                    let mac_part = &line[mac_start + 9..];
                    if let Some(mac) = mac_part.strip_suffix(';') {
                        lease.mac_address = mac.trim().to_string();
                    }
                }
            } else if line.starts_with("  client-hostname") {
                if let Some(hostname_start) = line.find("hostname") {
                    let hostname_part = &line[hostname_start + 9..];
                    if let Some(hostname) = hostname_part.strip_prefix('"').and_then(|s| s.strip_suffix("\";")) {
                        lease.hostname = Some(hostname.to_string());
                    }
                }
            } else if line.starts_with("  starts") {
                // 解析租约开始时间
                if let Some(time_start) = line.find("starts") {
                    let time_part = &line[time_start + 7..];
                    if let Some(time_end) = time_part.find(';') {
                        let time_str = &time_part[..time_end];
                        if let Ok(timestamp) = time_str.parse::<i64>() {
                            lease.lease_time = DateTime::from_timestamp(timestamp, 0).unwrap_or(Utc::now());
                        }
                    }
                }
            } else if line.starts_with("  ends") {
                // 解析租约结束时间
                if let Some(time_start) = line.find("ends") {
                    let time_part = &line[time_start + 5..];
                    if let Some(time_end) = time_part.find(';') {
                        let time_str = &time_part[..time_end];
                        if let Ok(timestamp) = time_str.parse::<i64>() {
                            lease.expires_at = DateTime::from_timestamp(timestamp, 0).unwrap_or(Utc::now());
                        }
                    }
                }
            }
        }
    }

    // 添加最后一个租约
    if let Some(lease) = current_lease {
        leases.push(lease);
    }

    Ok(leases)
}

fn parse_dhcp_config(config_content: &str) -> AppResult<DhcpConfig> {
    let mut config = DhcpConfig {
        enabled: true,
        start_ip: "192.168.1.100".to_string(),
        end_ip: "192.168.1.200".to_string(),
        lease_time: 86400,
        dns_servers: vec!["8.8.8.8".to_string(), "8.8.4.4".to_string()],
        static_leases: Vec::new(),
    };

    for line in config_content.lines() {
        let line = line.trim();
        
        if line.starts_with("range") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 3 {
                config.start_ip = parts[1].to_string();
                config.end_ip = parts[2].to_string();
            }
        } else if line.starts_with("option domain-name-servers") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                config.dns_servers = parts[1..].iter().map(|s| s.to_string()).collect();
            }
        } else if line.starts_with("default-lease-time") {
            if let Some(time_start) = line.find("default-lease-time") {
                let time_part = &line[time_start + 18..];
                if let Some(time_end) = time_part.find(';') {
                    if let Ok(lease_time) = time_part[..time_end].trim().parse() {
                        config.lease_time = lease_time;
                    }
                }
            }
        }
    }

    Ok(config)
}

fn generate_dhcp_config(config: &DhcpConfig) -> String {
    let mut content = String::new();
    
    content.push_str("default-lease-time 600;\n");
    content.push_str("max-lease-time 7200;\n\n");
    
    content.push_str("subnet 192.168.1.0 netmask 255.255.255.0 {\n");
    content.push_str(&format!("  range {} {};\n", config.start_ip, config.end_ip));
    content.push_str(&format!("  option domain-name-servers {};\n", config.dns_servers.join(", ")));
    content.push_str(&format!("  default-lease-time {};\n", config.lease_time));
    
    // 添加静态租约
    for static_lease in &config.static_leases {
        content.push_str(&format!("  host {} {{\n", static_lease.hostname.as_ref().unwrap_or(&"unknown".to_string())));
        content.push_str(&format!("    hardware ethernet {};\n", static_lease.mac_address));
        content.push_str(&format!("    fixed-address {};\n", static_lease.ip_address));
        content.push_str("  }\n");
    }
    
    content.push_str("}\n");
    
    content
}
