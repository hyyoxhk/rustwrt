use axum::Json;
use crate::{models::{ApiResponse, FirewallRule}, error::AppResult, services::firewall_service};

pub async fn get_firewall_rules() -> AppResult<Json<ApiResponse<Vec<FirewallRule>>>> {
    let rules = firewall_service::get_firewall_rules().await?;
    Ok(Json(ApiResponse::success(rules)))
}

pub async fn add_firewall_rule(Json(rule): Json<FirewallRule>) -> AppResult<Json<ApiResponse<String>>> {
    firewall_service::add_firewall_rule(rule).await?;
    Ok(Json(ApiResponse::success("防火墙规则添加成功".to_string())))
}
