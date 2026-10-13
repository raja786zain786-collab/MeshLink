<?php
/**
 * Plugin Name: MeshLink Offline Mesh Backend
 * Plugin URI: https://meshlink.local
 * Description: Robust backend engine for the MeshLink offline Bluetooth mesh messenger. Handles encrypted envelope queues, REST API endpoints, peer routing, duplicate suppression, and store-and-forward persistence.
 * Version: 1.0.0
 * Author: MeshLink Engineering Team
 * Author URI: https://meshlink.local
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: meshlink-plugin
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MESHLINK_PLUGIN_VERSION', '1.0.0');
define('MESHLINK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MESHLINK_PLUGIN_URL', plugin_dir_url(__FILE__));

// Autoload includes
require_once MESHLINK_PLUGIN_DIR . 'includes/class-meshlink-db.php';
require_once MESHLINK_PLUGIN_DIR . 'includes/class-meshlink-crypto.php';
require_once MESHLINK_PLUGIN_DIR . 'includes/class-meshlink-relay.php';
require_once MESHLINK_PLUGIN_DIR . 'includes/class-meshlink-api.php';
require_once MESHLINK_PLUGIN_DIR . 'includes/class-meshlink-shortcode.php';

if (is_admin()) {
    require_once MESHLINK_PLUGIN_DIR . 'admin/class-meshlink-admin.php';
}

/**
 * Plugin Activation Hook
 */
function meshlink_plugin_activate() {
    MeshLink_DB::create_tables();
    
    // Schedule periodic TTL queue pruning cron
    if (!wp_next_scheduled('meshlink_hourly_prune_cron')) {
        wp_schedule_event(time(), 'hourly', 'meshlink_hourly_prune_cron');
    }
}
register_activation_hook(__FILE__, 'meshlink_plugin_activate');

/**
 * Plugin Deactivation Hook
 */
function meshlink_plugin_deactivate() {
    wp_clear_scheduled_hook('meshlink_hourly_prune_cron');
}
register_deactivation_hook(__FILE__, 'meshlink_plugin_deactivate');

// Cron worker hook
add_action('meshlink_hourly_prune_cron', array('MeshLink_Relay', 'prune_expired_envelopes'));

/**
 * Initialize REST API and Shortcodes
 */
add_action('rest_api_init', array('MeshLink_API', 'register_routes'));
add_action('init', array('MeshLink_Shortcode', 'register_shortcode'));
