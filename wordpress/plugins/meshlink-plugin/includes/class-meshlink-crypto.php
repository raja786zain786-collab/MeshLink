<?php
/**
 * MeshLink Server-Side Cryptographic Validation and Safety Fingerprints
 */

if (!defined('ABSPATH')) {
    exit;
}

class MeshLink_Crypto {

    /**
     * Computes identical 12-digit safety number fingerprint from two Base64 public keys.
     */
    public static function compute_safety_number($pub_a_base64, $pub_b_base64) {
        $bin_a = base64_decode($pub_a_base64);
        $bin_b = base64_decode($pub_b_base64);

        // Lexicographically sort binary keys
        if (strcmp($bin_a, $bin_b) <= 0) {
            $combined = $bin_a . $bin_b;
        } else {
            $combined = $bin_b . $bin_a;
        }

        $hash = hash('sha256', $combined, true);
        $bytes = array_values(unpack('C*', substr($hash, 0, 6)));

        $part1 = ((($bytes[0] << 16) | ($bytes[1] << 8) | $bytes[2])) % 1000000;
        $part2 = ((($bytes[3] << 16) | ($bytes[4] << 8) | $bytes[5])) % 1000000;

        return sprintf('%06d %06d', $part1, $part2);
    }

    /**
     * Derives stable identity ID from public key digest.
     */
    public static function derive_identity_id($pub_base64) {
        $bin = base64_decode($pub_base64);
        return substr(hash('sha256', $bin), 0, 32);
    }
}
