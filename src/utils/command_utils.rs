use std::process::Stdio;
use tokio::process::Command;
use crate::error::AppError;

pub async fn execute_command(command: &str, args: &[&str]) -> Result<String, AppError> {
    let output = Command::new(command)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| AppError::CommandExecution(format!("执行命令失败: {}", e)))?;

    if output.status.success() {
        let stdout = String::from_utf8(output.stdout)
            .map_err(|e| AppError::CommandExecution(format!("解析命令输出失败: {}", e)))?;
        Ok(stdout)
    } else {
        let stderr = String::from_utf8(output.stderr)
            .unwrap_or_else(|_| "未知错误".to_string());
        Err(AppError::CommandExecution(format!("命令执行失败: {}", stderr)))
    }
}

pub async fn write_file(path: &str, content: &str) -> Result<(), AppError> {
    tokio::fs::write(path, content)
        .await
        .map_err(|e| AppError::FileOperation(format!("写入文件失败: {}", e)))?;
    Ok(())
}

#[allow(dead_code)]
pub async fn read_file(path: &str) -> Result<String, AppError> {
    tokio::fs::read_to_string(path)
        .await
        .map_err(|e| AppError::FileOperation(e.to_string()))
}
