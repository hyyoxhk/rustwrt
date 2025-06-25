use axum::Json;
use crate::{models::{ApiResponse, NetworkInterface, NetworkStatus}, error::AppResult, services::network_service};

pub async fn get_interfaces() -> AppResult<Json<ApiResponse<Vec<NetworkInterface>>>> {
    let interfaces = network_service::get_interfaces().await?;
    Ok(Json(ApiResponse::success(interfaces)))
}

pub async fn get_network_status() -> AppResult<Json<ApiResponse<NetworkStatus>>> {
    let status = network_service::get_network_status().await?;
    Ok(Json(ApiResponse::success(status)))
}
