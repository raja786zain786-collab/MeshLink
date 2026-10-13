<?php
/**
 * MeshLink Shortcode Handler [meshlink_app]
 */

if (!defined('ABSPATH')) {
    exit;
}

class MeshLink_Shortcode {

    public static function register_shortcode() {
        add_shortcode('meshlink_app', array(__CLASS__, 'render_app'));
    }

    public static function render_app($atts = array()) {
        ob_start();
        ?>
        <div class="meshlink-embedded-wrapper" style="max-width: 600px; margin: 0 auto; background: #0b141a; border-radius: 16px; overflow: hidden; border: 1px solid #222e35; color: #e9edef;">
            <div style="background: #202c33; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222e35;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #00a884;"></div>
                    <strong style="color: #fff; font-size: 15px;">MeshLink Offline Web App</strong>
                </div>
                <span style="font-size: 11px; background: rgba(0,168,132,0.2); color: #00a884; padding: 2px 8px; border-radius: 10px; font-weight: bold;">
                    BLE P2P
                </span>
            </div>
            <div style="padding: 20px; text-align: center;">
                <p style="font-size: 13px; color: #8696a0; margin-bottom: 16px;">
                    MeshLink operates 100% offline via Web Bluetooth & native peer relays.
                </p>
                <a href="<?php echo esc_url(home_url('/meshlink/')); ?>" style="display: inline-block; background: #00a884; color: #111b21; font-weight: bold; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                    Launch Full-Screen WhatsApp Mesh App →
                </a>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}
