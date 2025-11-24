<?php
/**
 * WooCommerce Component
 *
 * @package ForgeAdvanced
 */

namespace ForgeAdvanced\Components;

use WPForge\ComponentInterface;

/**
 * WooCommerce integration and customization
 */
class WooCommerce implements ComponentInterface {
    /**
     * {@inheritdoc}
     */
    public function get_slug(): string {
        return 'woocommerce';
    }

    /**
     * {@inheritdoc}
     */
    public function initialize(): void {
        add_action( 'after_setup_theme', [ $this, 'setup' ] );
        add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );
    }

    /**
     * Setup WooCommerce support
     */
    public function setup(): void {
        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }

        // Declare WooCommerce support
        add_theme_support( 'woocommerce' );
        add_theme_support( 'wc-product-gallery-zoom' );
        add_theme_support( 'wc-product-gallery-lightbox' );
        add_theme_support( 'wc-product-gallery-slider' );

        // Custom image sizes for WooCommerce
        add_image_size( 'forge-shop-thumbnail', 300, 300, true );
        add_image_size( 'forge-shop-catalog', 600, 600, true );
        add_image_size( 'forge-shop-single', 1200, 1200, true );
    }
}
