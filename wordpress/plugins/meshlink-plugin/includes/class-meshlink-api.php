<?php
/**
 * MeshLink REST API Endpoints
 */

if (!defined('ABSPATH')) {
    exit;
}

class MeshLink_API {

    public static function register_routes() {
        $namespace = 'meshlink/v1';

        // POST /wp-json/meshlink/v1/envelopes (Dispatch / Forward envelope)
        register_rest_route($namespace, '/envelopes', array(
            'methods'  => 'POST',
            'callback' => array(__CLASS__, 'handle_post_envelope'),
            'permission_callback' => '__return_true',
        ));

        // GET /wp-json/meshlink/v1/envelopes/pending
        register_rest_route($namespace, '/envelopes/pending', array(
            'methods'  => 'GET',
            'callback' => array(__CLASS__, 'handle_get_pending'),
            'permission_callback' => '__return_true',
        ));

        // POST /wp-json/meshlink/v1/acks
        register_rest_route($namespace, '/acks', array(
            'methods'  => 'POST',
            'callback' => array(__CLASS__, 'handle_post_ack'),
            'permission_callback' => '__return_true',
        ));

        // GET /wp-json/meshlink/v1/stats
        register_rest_route($namespace, '/stats', array(
            'methods'  => 'GET',
            'callback' => array(__CLASS__, 'handle_get_stats'),
            'permission_callback' => '__return_true',
        ));
    }

    public static function handle_post_envelope($request) {
        $params = $request->get_json_params();
        if (empty($params['messageId']) || empty($params['recipientId'])) {
            return new WP_Error('invalid_data', 'Missing messageId or recipientId', array('status' => 400));
        }

        $result = MeshLink_Relay::enqueue_envelope($params);
        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response(array(
            'success'   => true,
            'messageId' => $params['messageId'],
            'status'    => 'QUEUED_FOR_FORWARD'
        ));
    }

    public static function handle_get_pending($request) {
        $recipient_id = sanitize_text_field($request->get_param('recipient_id'));
        if (empty($recipient_id)) {
            return new WP_Error('missing_recipient', 'recipient_id is required', array('status' => 400));
        }

        $pending = MeshLink_Relay::get_pending_for_recipient($recipient_id);
        return rest_ensure_response(array('envelopes' => $pending));
    }

    public static function handle_post_ack($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $orig_id = sanitize_text_field($params['ackMessageId']);

        $table_messages = $wpdb->prefix . 'meshlink_messages';
        $wpdb->update(
            $table_messages,
            array(
                'delivery_state'  => 'DELIVERED_TO_RECIPIENT',
                'ack_received_at' => time() * 1000
            ),
            array('message_id' => $orig_id)
        );

        return rest_ensure_response(array('success' => true, 'ackMessageId' => $orig_id));
    }

    public static function handle_get_stats() {
        global $wpdb;
        $table_queue = $wpdb->prefix . 'meshlink_relay_queue';
        $table_messages = $wpdb->prefix . 'meshlink_messages';

        $queue_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_queue");
        $delivered_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_messages WHERE delivery_state = 'DELIVERED_TO_RECIPIENT'");

        return rest_ensure_response(array(
            'relayQueueCount' => intval($queue_count),
            'deliveredCount'  => intval($delivered_count),
            'protocol'        => 'MeshLink BLE v1.0',
            'serverTime'      => time() * 1000
        ));
    }
}
