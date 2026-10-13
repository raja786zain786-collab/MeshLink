<?php
/**
 * MeshLink WordPress Theme Functions
 *
 * @package MeshLink
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function meshlink_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    add_theme_support('responsive-embeds');

    register_nav_menus(array(
        'primary' => __('Primary Navigation', 'meshlink'),
        'mobile'  => __('Mobile Bottom Bar', 'meshlink'),
    ));
}
add_action('after_setup_theme', 'meshlink_theme_setup');

function meshlink_enqueue_scripts() {
    wp_enqueue_style('meshlink-main', get_stylesheet_uri(), array(), '1.0.0');
    wp_enqueue_style('meshlink-app-style', get_template_directory_uri() . '/assets/css/meshlink.css', array(), '1.0.0');

    wp_enqueue_script('meshlink-app-js', get_template_directory_uri() . '/assets/js/meshlink-app.js', array(), '1.0.0', true);

    wp_localize_script('meshlink-app-js', 'meshlinkSettings', array(
        'ajaxUrl'   => admin_url('admin-ajax.php'),
        'restUrl'   => esc_url_raw(rest_url('meshlink/v1/')),
        'nonce'     => wp_create_nonce('wp_rest'),
        'isLoggedIn'=> is_user_logged_in(),
        'themeUrl'  => get_template_directory_uri(),
    ));
}
add_action('wp_enqueue_scripts', 'meshlink_enqueue_scripts');

/**
 * Filter body classes for theme styling
 */
function meshlink_body_classes($classes) {
    $classes[] = 'meshlink-theme';
    $classes[] = 'dark-mode';
    return $classes;
}
add_filter('body_class', 'meshlink_body_classes');
