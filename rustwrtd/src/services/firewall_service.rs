use crate::{models::{FirewallRule, FirewallAction}, error::AppResult, utils::command_utils};

pub async fn get_firewall_rules() -> AppResult<Vec<FirewallRule>> {
    // 使用iptables获取防火墙规则
    let iptables_output = command_utils::execute_command("iptables", &["-L", "-n", "--line-numbers"]).await?;
    parse_iptables_output(&iptables_output)
}

pub async fn add_firewall_rule(rule: FirewallRule) -> AppResult<()> {
    let mut args = vec!["-A".to_string()];
    
    // 确定链
    let chain = match rule.action {
        FirewallAction::Accept => "INPUT",
        FirewallAction::Drop => "INPUT",
        FirewallAction::Reject => "INPUT",
    };
    args.push(chain.to_string());
    
    // 添加协议
    if rule.protocol != "all" {
        args.push("-p".to_string());
        args.push(rule.protocol);
    }
    
    // 添加源地址
    if rule.source != "any" {
        args.push("-s".to_string());
        args.push(rule.source);
    }
    
    // 添加目标地址
    if rule.destination != "any" {
        args.push("-d".to_string());
        args.push(rule.destination);
    }
    
    // 添加源端口
    if let Some(port) = rule.source_port {
        args.push("--sport".to_string());
        args.push(port.to_string());
    }
    
    // 添加目标端口
    if let Some(port) = rule.destination_port {
        args.push("--dport".to_string());
        args.push(port.to_string());
    }
    
    // 添加动作
    let action = match rule.action {
        FirewallAction::Accept => "ACCEPT",
        FirewallAction::Drop => "DROP",
        FirewallAction::Reject => "REJECT",
    };
    args.push("-j".to_string());
    args.push(action.to_string());
    
    // 执行命令
    let args_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    command_utils::execute_command("iptables", &args_refs).await?;
    
    Ok(())
}

fn parse_iptables_output(output: &str) -> AppResult<Vec<FirewallRule>> {
    let mut rules = Vec::new();
    let mut rule_id = 1;

    for line in output.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("Chain") || line.starts_with("target") {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 4 {
            let action = match parts[0] {
                "ACCEPT" => FirewallAction::Accept,
                "DROP" => FirewallAction::Drop,
                "REJECT" => FirewallAction::Reject,
                _ => continue,
            };

            let protocol = parts[1].to_string();
            let source = parts[3].to_string();
            let destination = if parts.len() > 4 { parts[4].to_string() } else { "any".to_string() };

            let rule = FirewallRule {
                id: rule_id.to_string(),
                name: format!("Rule {}", rule_id),
                action,
                protocol,
                source,
                destination,
                source_port: None, // 需要更复杂的解析
                destination_port: None, // 需要更复杂的解析
                enabled: true,
            };

            rules.push(rule);
            rule_id += 1;
        }
    }

    Ok(rules)
}
