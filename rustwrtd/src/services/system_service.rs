use crate::{models::SystemInfo, error::AppResult, utils::command_utils};

pub async fn get_system_info() -> AppResult<SystemInfo> {
    // 获取主机名
    let hostname = command_utils::execute_command("hostname", &[]).await?
        .trim()
        .to_string();

    // 获取运行时间
    let uptime_output = command_utils::execute_command("cat", &["/proc/uptime"]).await?;
    let uptime: u64 = uptime_output
        .split_whitespace()
        .next()
        .unwrap_or("0")
        .parse()
        .unwrap_or(0);

    // 获取负载平均值
    let loadavg_output = command_utils::execute_command("cat", &["/proc/loadavg"]).await?;
    let load_parts: Vec<&str> = loadavg_output.split_whitespace().collect();
    let load_average = [
        load_parts.get(0).unwrap_or(&"0").parse().unwrap_or(0.0),
        load_parts.get(1).unwrap_or(&"0").parse().unwrap_or(0.0),
        load_parts.get(2).unwrap_or(&"0").parse().unwrap_or(0.0),
    ];

    // 获取内存信息
    let meminfo_output = command_utils::execute_command("cat", &["/proc/meminfo"]).await?;
    let memory = parse_memory_info(&meminfo_output);

    // 获取CPU信息
    let cpuinfo_output = command_utils::execute_command("cat", &["/proc/cpuinfo"]).await?;
    let cpu = parse_cpu_info(&cpuinfo_output);

    // 获取磁盘信息
    let df_output = command_utils::execute_command("df", &["/", "-h"]).await?;
    let disk = parse_disk_info(&df_output);

    // 获取OpenWrt版本
    let version_output = command_utils::execute_command("cat", &["/etc/openwrt_version"]).await
        .unwrap_or_else(|_| "Unknown".to_string());

    Ok(SystemInfo {
        hostname,
        uptime,
        load_average,
        memory,
        cpu,
        disk,
        openwrt_version: version_output.trim().to_string(),
    })
}

pub async fn reboot_system() -> AppResult<()> {
    command_utils::execute_command("reboot", &[]).await?;
    Ok(())
}

fn parse_memory_info(meminfo: &str) -> crate::models::MemoryInfo {
    let mut total: u64 = 0;
    let mut free: u64 = 0;
    let mut available: u64 = 0;

    for line in meminfo.lines() {
        if line.starts_with("MemTotal:") {
            total = line.split_whitespace().nth(1).unwrap_or("0").parse().unwrap_or(0);
        } else if line.starts_with("MemFree:") {
            free = line.split_whitespace().nth(1).unwrap_or("0").parse().unwrap_or(0);
        } else if line.starts_with("MemAvailable:") {
            available = line.split_whitespace().nth(1).unwrap_or("0").parse().unwrap_or(0);
        }
    }

    let used = total.saturating_sub(available);
    
    crate::models::MemoryInfo {
        total,
        used,
        free,
        available,
    }
}

fn parse_cpu_info(cpuinfo: &str) -> crate::models::CpuInfo {
    let mut model = "Unknown".to_string();
    let mut cores = 0;

    for line in cpuinfo.lines() {
        if line.starts_with("model name") {
            model = line.split(':').nth(1).unwrap_or("Unknown").trim().to_string();
        } else if line.starts_with("processor") {
            cores += 1;
        }
    }

    crate::models::CpuInfo {
        model,
        cores,
        usage_percent: 0.0, // 需要更复杂的计算
        temperature: None,   // 需要读取温度传感器
    }
}

fn parse_disk_info(df_output: &str) -> crate::models::DiskInfo {
    let lines: Vec<&str> = df_output.lines().collect();
    if lines.len() < 2 {
        return crate::models::DiskInfo {
            total: 0,
            used: 0,
            free: 0,
            usage_percent: 0.0,
        };
    }

    let parts: Vec<&str> = lines[1].split_whitespace().collect();
    if parts.len() < 5 {
        return crate::models::DiskInfo {
            total: 0,
            used: 0,
            free: 0,
            usage_percent: 0.0,
        };
    }

    let total = parts[1].parse().unwrap_or(0);
    let used = parts[2].parse().unwrap_or(0);
    let free = parts[3].parse().unwrap_or(0);
    let usage_percent = if total > 0 {
        (used as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    crate::models::DiskInfo {
        total,
        used,
        free,
        usage_percent,
    }
}
