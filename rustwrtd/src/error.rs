use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("数据库错误: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("配置错误: {0}")]
    Config(#[from] config::ConfigError),
    
    #[error("序列化错误: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("系统命令执行失败: {0}")]
    CommandExecution(String),
    
    #[error("文件操作失败: {0}")]
    FileOperation(String),
    
    #[error("网络接口不存在: {0}")]
    #[allow(dead_code)]
    InterfaceNotFound(String),
    
    #[error("权限不足")]
    #[allow(dead_code)]
    PermissionDenied,
    
    #[error("无效的配置: {0}")]
    #[allow(dead_code)]
    InvalidConfig(String),
    
    #[error("内部服务器错误")]
    #[allow(dead_code)]
    Internal,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "数据库错误"),
            AppError::Config(_) => (StatusCode::INTERNAL_SERVER_ERROR, "配置错误"),
            AppError::Serialization(_) => (StatusCode::BAD_REQUEST, "数据格式错误"),
            AppError::CommandExecution(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.as_str()),
            AppError::FileOperation(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.as_str()),
            AppError::InterfaceNotFound(msg) => (StatusCode::NOT_FOUND, msg.as_str()),
            AppError::PermissionDenied => (StatusCode::FORBIDDEN, "权限不足"),
            AppError::InvalidConfig(msg) => (StatusCode::BAD_REQUEST, msg.as_str()),
            AppError::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "内部服务器错误"),
        };

        let body = Json(json!({
            "error": error_message,
            "message": self.to_string()
        }));

        (status, body).into_response()
    }
}

pub type AppResult<T> = Result<T, AppError>;
