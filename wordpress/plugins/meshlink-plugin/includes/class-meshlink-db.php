<?php
/**
 * MeshLink Database Schema and Persistence
 */

if (!defined('ABSPATH')) {
    exit;
}

class MeshLink_DB {

    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        // 1. Messages table
        $table_messages = $wpdb->prefix . 'meshlink_messages';
        $sql_messages = "CREATE TABLE $table_messages (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            message_id varchar(64) NOT NULL,
            sender_id varchar(64) NOT NULL,
            recipient_id varchar(64) NOT NULL,
            encrypted_payload longtext NOT NULL,
            iv varchar(64) NOT NULL,
            message_type varchar(32) DEFAULT 'TEXT' NOT NULL,
            delivery_state varchar(32) DEFAULT 'SAVED_LOCALLY' NOT NULL,
            hop_count int(11) DEFAULT 0 NOT NULL,
            max_hops int(11) DEFAULT 5 NOT NULL,
            expires_at bigint(20) NOT NULL,
            created_at bigint(20) NOT NULL,
            ack_received_at bigint(20) NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY message_id (message_id),
            KEY recipient_id (recipient_id),
            KEY delivery_state (delivery_state)
        ) $charset_collate;";
        dbDelta($sql_messages);

        // 2. Relay Store & Forward Queue
        $table_queue = $wpdb->prefix . 'meshlink_relay_queue';
        $sql_queue = "CREATE TABLE $table_queue (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            message_id varchar(64) NOT NULL,
            recipient_id varchar(64) NOT NULL,
            envelope_json longtext NOT NULL,
            hop_count int(11) DEFAULT 0 NOT NULL,
            expires_at bigint(20) NOT NULL,
            queued_at bigint(20) NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY message_id (message_id),
            KEY expires_at (expires_at)
        ) $charset_collate;";
        dbDelta($sql_queue);

        // 3. Known Peers Directory
        $table_peers = $wpdb->prefix . 'meshlink_peers';
        $sql_peers = "CREATE TABLE $table_peers (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            identity_id varchar(64) NOT NULL,
            display_name varchar(128) NOT NULL,
            public_key_base64 text NOT NULL,
            safety_number varchar(32) NOT NULL,
            is_verified tinyint(1) DEFAULT 0 NOT NULL,
            last_seen bigint(20) NOT NULL,
            rssi int(11) DEFAULT -70 NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY identity_id (identity_id)
        ) $charset_collate;";
        dbDelta($sql_peers);
    }
}
