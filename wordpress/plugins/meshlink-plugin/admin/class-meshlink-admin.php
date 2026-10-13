<?php
/**
 * MeshLink WordPress Admin Menu & Settings
 */

if (!defined('ABSPATH')) {
    exit;
}

class MeshLink_Admin {

    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }

    public function add_admin_menu() {
        add_menu_page(
            __('MeshLink Mesh Engine', 'meshlink-plugin'),
            __('MeshLink BLE', 'meshlink-plugin'),
            'manage_options',
            'meshlink-settings',
            array($this, 'render_admin_page'),
            'dashicons-networking',
            30
        );
    }

    public function render_admin_page() {
        global $wpdb;
        $table_queue = $wpdb->prefix . 'meshlink_relay_queue';
        $queue_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_queue");

        ?>
        <div class="wrap">
            <h1>MeshLink Offline Mesh Engine — Administration</h1>
            <p>Monitor Bluetooth Low Energy mesh routing, multi-hop relay queues, and cryptographic invariants.</p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;">
                <div style="background: #fff; padding: 16px; border: 1px solid #ccd0d4; border-radius: 8px;">
                    <h3 style="margin-top:0;">Relay Outbox Queue</h3>
                    <p style="font-size: 24px; font-weight: bold; color: #00a884; margin: 0;"><?php echo intval($queue_count); ?> envelopes</p>
                    <small>Bounded store-and-forward persistence</small>
                </div>
                <div style="background: #fff; padding: 16px; border: 1px solid #ccd0d4; border-radius: 8px;">
                    <h3 style="margin-top:0;">Max Hop Limit</h3>
                    <p style="font-size: 24px; font-weight: bold; color: #2271b1; margin: 0;">5 Hops</p>
                    <small>Strict loop and flood prevention</small>
                </div>
                <div style="background: #fff; padding: 16px; border: 1px solid #ccd0d4; border-radius: 8px;">
                    <h3 style="margin-top:0;">Encryption Standard</h3>
                    <p style="font-size: 24px; font-weight: bold; color: #46b450; margin: 0;">AES-256-GCM</p>
                    <small>NIST P-256 ECDH Authenticated</small>
                </div>
            </div>

            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 8px;">
                <h2>Shortcode Integration</h2>
                <p>Embed the interactive offline mesh messaging client on any post or page by adding:</p>
                <code>[meshlink_app]</code>
            </div>
        </div>
        <?php
    }
}

new MeshLink_Admin();
