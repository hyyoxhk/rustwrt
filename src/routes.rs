use axum::{Router, routing::{get, post}};
use tower_http::cors::CorsLayer;
use crate::api;

pub fn build_router(cors: CorsLayer) -> Router {
    Router::new()
        .route("/api/health", get(api::health::health_check))
        .route("/api/system/info", get(api::system::get_system_info))
        .route("/api/system/reboot", post(api::system::reboot_system))
        .route("/api/network/interfaces", get(api::network::get_interfaces))
        .route("/api/network/status", get(api::network::get_network_status))
        .route("/api/wireless/networks", get(api::wireless::get_wireless_networks))
        .route("/api/wireless/scan", post(api::wireless::scan_networks))
        .route("/api/firewall/rules", get(api::firewall::get_firewall_rules))
        .route("/api/firewall/rules", post(api::firewall::add_firewall_rule))
        .route("/api/dhcp/leases", get(api::dhcp::get_dhcp_leases))
        .route("/api/dhcp/config", get(api::dhcp::get_dhcp_config))
        .route("/api/dhcp/config", post(api::dhcp::update_dhcp_config))
        .layer(cors)
}
