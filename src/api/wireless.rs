use axum::Json;
use crate::{models::{ApiResponse, WirelessNetwork}, error::AppResult, services::wireless_service};

pub async fn get_wireless_networks() -> AppResult<Json<ApiResponse<Vec<WirelessNetwork>>>> {
    let networks = wireless_service::get_wireless_networks().await?;
    Ok(Json(ApiResponse::success(networks)))
}

pub async fn scan_networks() -> AppResult<Json<ApiResponse<Vec<WirelessNetwork>>>> {
    let networks = wireless_service::scan_networks().await?;
    Ok(Json(ApiResponse::success(networks)))
}
