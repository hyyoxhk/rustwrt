use crate::{models::{NetworkInterface, NetworkStatus, InterfaceType, InterfaceStatus}, error::AppResult, utils::command_utils};

pub async fn get_interfaces() -> AppResult<Vec<NetworkInterface>> {
    let ip_output = command_utils::execute_command("ip", &["link", "show"]).await?;
    let mut interfaces = Vec::new();

    for line in ip_output.lines() {
        if line.contains(':') && !line.contains("lo:") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let name = parts[1].trim_end_matches(':').to_string();
                let interface = parse_interface_info(&name).await?;
                interfaces.push(interface);
            }
        }
    }

    Ok(interfaces)
}

pub async fn get_network_status() -> AppResult<NetworkStatus> {
    let interfaces = get_interfaces().await?;
    
    // 获取默认网关
    let route_output = command_utils::execute_command("ip", &["route", "show", "default"]).await?;
    let default_gateway = route_output
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(2))
        .map(|s| s.to_string());

    // 获取DNS服务器
    let resolv_output = command_utils::execute_command("cat", &["/etc/resolv.conf"]).await?;
    let dns_servers: Vec<String> = resolv_output
        .lines()
        .filter(|line| line.starts_with("nameserver"))
        .filter_map(|line| line.split_whitespace().nth(1))
        .map(|s| s.to_string())
        .collect();

    // 检查互联网连接
    let internet_connectivity = check_internet_connectivity().await;

    Ok(NetworkStatus {
        interfaces,
        default_gateway,
        dns_servers,
        internet_connectivity,
    })
}

async fn parse_interface_info(name: &str) -> AppResult<NetworkInterface> {
    // 获取接口状态
    let status_output = command_utils::execute_command("ip", &["link", "show", name]).await?;
    let status = if status_output.contains("UP") {
        InterfaceStatus::Up
    } else {
        InterfaceStatus::Down
    };

    // 获取IP地址
    let addr_output = command_utils::execute_command("ip", &["addr", "show", name]).await?;
    let ip_addresses: Vec<String> = addr_output
        .lines()
        .filter(|line| line.trim().starts_with("inet "))
        .filter_map(|line| line.split_whitespace().nth(1))
        .map(|s| s.split('/').next().unwrap_or(s).to_string())
        .collect();

    // 获取MAC地址
    let mac_address = addr_output
        .lines()
        .find(|line| line.contains("link/"))
        .and_then(|line| line.split_whitespace().nth(1))
        .map(|s| s.to_string());

    // 确定接口类型
    let interface_type = determine_interface_type(name);

    // 获取速度和双工模式（仅对以太网接口）
    let (speed, duplex) = if matches!(interface_type, InterfaceType::Ethernet) {
        get_ethernet_speed_duplex(name).await
    } else {
        (None, None)
    };

    Ok(NetworkInterface {
        name: name.to_string(),
        interface_type,
        status,
        ip_addresses,
        mac_address,
        speed,
        duplex,
    })
}

fn determine_interface_type(name: &str) -> InterfaceType {
    if name.starts_with("eth") || name.starts_with("en") {
        InterfaceType::Ethernet
    } else if name.starts_with("wlan") || name.starts_with("wl") {
        InterfaceType::Wireless
    } else if name.starts_with("lo") {
        InterfaceType::Loopback
    } else if name.starts_with("br") {
        InterfaceType::Bridge
    } else if name.contains(".") {
        InterfaceType::VLAN
    } else {
        InterfaceType::Other(name.to_string())
    }
}

async fn get_ethernet_speed_duplex(name: &str) -> (Option<u32>, Option<String>) {
    let speed_file = format!("/sys/class/net/{}/speed", name);
    let duplex_file = format!("/sys/class/net/{}/duplex", name);

    let speed = command_utils::execute_command("cat", &[&speed_file]).await
        .ok()
        .and_then(|s| s.trim().parse().ok());

    let duplex = command_utils::execute_command("cat", &[&duplex_file]).await
        .ok()
        .map(|s| s.trim().to_string());

    (speed, duplex)
}

async fn check_internet_connectivity() -> bool {
    // 尝试ping Google DNS服务器
    command_utils::execute_command("ping", &["-c", "1", "-W", "3", "8.8.8.8"]).await.is_ok()
}
