use axum::Json;
use crate::{models::{ApiResponse, DhcpLease, DhcpConfig}, error::AppResult, services::dhcp_service};

pub async fn get_dhcp_leases() -> AppResult<Json<ApiResponse<Vec<DhcpLease>>>> {
    let leases = dhcp_service::get_dhcp_leases().await?;
    Ok(Json(ApiResponse::success(leases)))
}

pub async fn get_dhcp_config() -> AppResult<Json<ApiResponse<DhcpConfig>>> {
    let config = dhcp_service::get_dhcp_config().await?;
    Ok(Json(ApiResponse::success(config)))
}

pub async fn update_dhcp_config(Json(config): Json<DhcpConfig>) -> AppResult<Json<ApiResponse<String>>> {
    dhcp_service::update_dhcp_config(config).await?;
    Ok(Json(ApiResponse::success("DHCP配置更新成功".to_string())))
}
