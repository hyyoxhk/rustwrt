use axum::Json;
use crate::{models::ApiResponse, error::AppResult};

pub async fn health_check() -> AppResult<Json<ApiResponse<String>>> {
    Ok(Json(ApiResponse::success("服务运行正常".to_string())))
}
