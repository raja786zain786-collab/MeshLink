<?php
/**
 * MeshLink Multi-Hop Relay Engine & Queue Manager
 */

if (!defined('ABSPATH')) {
    exit;
}

class MeshLink_Relay {

    const MAX_QUEUE_SIZE = 500;
    const DEFAULT_HOP_LIMIT = 5;

    /**
     * Enqueues an encrypted envelope for forwarding.
     * Enforces: duplicate suppression, TTL expiry, hop limit.
     */
    public static function enqueue_envelope($envelope) {
        global $wpdb;
        $table_queue = $wpdb->prefix . 'meshlink_relay_queue';

        $msg_id = sanitize_text_field($envelope['messageId']);
        $recipient_id = sanitize_text_field($envelope['recipientId']);
        $hop_count = intval($envelope['hopCount']);
        $hop_limit = isset($envelope['hopLimit']) ? intval($envelope['hopLimit']) : self::DEFAULT_HOP_LIMIT;
        $expires_at = intval($envelope['expiresAt']);

        // 1. Expiry check
        if (time() * 1000 > $expires_at) {
            return new WP_Error('expired', 'Envelope has expired');
        }

        // 2. Hop limit check
        if ($hop_count >= $hop_limit) {
            return new WP_Error('hop_limit_reached', 'Envelope reached maximum hop limit');
        }

        // 3. Duplicate suppression
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_queue WHERE message_id = %s",
            $msg_id
        ));
        if ($exists) {
            return true; // Suppressed duplicate
        }

        // 4. Increment hop count for next hop
        $envelope['hopCount'] = $hop_count + 1;

        $wpdb->insert($table_queue, array(
            'message_id'    => $msg_id,
            'recipient_id'  => $recipient_id,
            'envelope_json' => wp_json_encode($envelope),
            'hop_count'     => $envelope['hopCount'],
            'expires_at'    => $expires_at,
            'queued_at'     => time() * 1000,
        ));

        return true;
    }

    /**
     * Dequeues messages for a connected peer.
     */
    public static function get_pending_for_recipient($recipient_id) {
        global $wpdb;
        $table_queue = $wpdb->prefix . 'meshlink_relay_queue';

        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_queue WHERE recipient_id = %s ORDER BY queued_at ASC LIMIT 50",
            $recipient_id
        ));

        $envelopes = array();
        foreach ($rows as $row) {
            $envelopes[] = json_decode($row->envelope_json, true);
        }
        return $envelopes;
    }

    /**
     * Periodic cron worker: Purges expired packets from relay queue.
     */
    public static function prune_expired_envelopes() {
        global $wpdb;
        $table_queue = $wpdb->prefix . 'meshlink_relay_queue';
        $now = time() * 1000;

        $wpdb->query($wpdb->prepare(
            "DELETE FROM $table_queue WHERE expires_at < %d",
            $now
        ));
    }
}
