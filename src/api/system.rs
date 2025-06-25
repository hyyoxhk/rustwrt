use axum::Json;
use crate::{models::{ApiResponse, SystemInfo}, error::AppResult, services::system_service};

pub async fn get_system_info() -> AppResult<Json<ApiResponse<SystemInfo>>> {
    let system_info = system_service::get_system_info().await?;
    Ok(Json(ApiResponse::success(system_info)))
}

pub async fn reboot_system() -> AppResult<Json<ApiResponse<String>>> {
    system_service::reboot_system().await?;
    Ok(Json(ApiResponse::success("系统正在重启...".to_string())))
}
