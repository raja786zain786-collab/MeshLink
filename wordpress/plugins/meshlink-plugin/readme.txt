=== MeshLink Offline Mesh Backend ===
Contributors: meshlink
Tags: offline, messaging, bluetooth, peer-to-peer, relay, encrypted
Requires at least: 6.0
Tested up to: 6.7
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Complete backend and REST API engine for MeshLink peer-to-peer messaging.

== Description ==

MeshLink is an offline-first peer-to-peer messaging engine that enables nearby phones to communicate directly over Bluetooth Low Energy (BLE) and relay encrypted envelopes through intermediate nodes.

Features:
- Encrypted envelope store-and-forward queue
- Duplicate envelope suppression
- Maximum hop count enforcement (default 5 hops)
- Automatic TTL pruning of expired envelopes
- Verified recipient ACK binding
- Shortcode `[meshlink_app]` to embed anywhere

== Installation ==

1. Upload the `meshlink-plugin` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Use the `[meshlink_app]` shortcode in any page or template.

== Changelog ==

= 1.0.0 =
* Initial production release.
