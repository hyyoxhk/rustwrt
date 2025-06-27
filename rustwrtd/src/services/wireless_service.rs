use crate::{models::WirelessNetwork, error::AppResult, utils::command_utils};

pub async fn get_wireless_networks() -> AppResult<Vec<WirelessNetwork>> {
    // 使用iwlist扫描无线网络
    let scan_output = command_utils::execute_command("iwlist", &["scan"]).await?;
    parse_wireless_scan_output(&scan_output)
}

pub async fn scan_networks() -> AppResult<Vec<WirelessNetwork>> {
    // 触发新的扫描
    command_utils::execute_command("iwlist", &["scan"]).await?;
    
    // 等待扫描完成
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    
    // 获取扫描结果
    get_wireless_networks().await
}

fn parse_wireless_scan_output(output: &str) -> AppResult<Vec<WirelessNetwork>> {
    let mut networks = Vec::new();
    let mut current_network: Option<WirelessNetwork> = None;

    for line in output.lines() {
        let line = line.trim();
        
        if line.contains("Cell") && line.contains("Address") {
            // 新的网络
            if let Some(network) = current_network.take() {
                networks.push(network);
            }
            
            // 解析BSSID
            if let Some(bssid_start) = line.find("Address: ") {
                let bssid = line[bssid_start + 9..].trim();
                current_network = Some(WirelessNetwork {
                    ssid: "Unknown".to_string(),
                    bssid: bssid.to_string(),
                    channel: 0,
                    frequency: 0,
                    signal_strength: -100,
                    encryption: "Unknown".to_string(),
                    mode: "Unknown".to_string(),
                });
            }
        } else if let Some(ref mut network) = current_network {
            if line.contains("ESSID:") {
                if let Some(ssid_start) = line.find("ESSID:") {
                    let ssid_part = &line[ssid_start + 6..];
                    if let Some(ssid) = ssid_part.strip_prefix('"').and_then(|s| s.strip_suffix('"')) {
                        network.ssid = ssid.to_string();
                    }
                }
            } else if line.contains("Channel:") {
                if let Some(channel_start) = line.find("Channel:") {
                    let channel_part = &line[channel_start + 8..];
                    if let Ok(channel) = channel_part.trim().parse() {
                        network.channel = channel;
                    }
                }
            } else if line.contains("Frequency:") {
                if let Some(freq_start) = line.find("Frequency:") {
                    let freq_part = &line[freq_start + 10..];
                    if let Some(mhz_start) = freq_part.find(" GHz") {
                        if let Ok(freq_ghz) = freq_part[..mhz_start].trim().parse::<f64>() {
                            network.frequency = (freq_ghz * 1000.0) as u32;
                        }
                    }
                }
            } else if line.contains("Quality=") {
                if let Some(quality_start) = line.find("Quality=") {
                    let quality_part = &line[quality_start + 8..];
                    if let Some(signal_start) = quality_part.find("Signal level=") {
                        let signal_part = &quality_part[signal_start + 13..];
                        if let Some(dbm_end) = signal_part.find(" dBm") {
                            if let Ok(signal) = signal_part[..dbm_end].trim().parse() {
                                network.signal_strength = signal;
                            }
                        }
                    }
                }
            } else if line.contains("Encryption key:") {
                if line.contains("on") {
                    network.encryption = "WEP".to_string();
                } else {
                    network.encryption = "Open".to_string();
                }
            } else if line.contains("IE: IEEE 802.11i") {
                if line.contains("WPA") {
                    network.encryption = "WPA".to_string();
                } else if line.contains("WPA2") {
                    network.encryption = "WPA2".to_string();
                }
            }
        }
    }

    // 添加最后一个网络
    if let Some(network) = current_network {
        networks.push(network);
    }

    Ok(networks)
}
