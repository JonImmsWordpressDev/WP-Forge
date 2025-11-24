<?php
/**
 * Navigation Component
 *
 * @package ForgeAdvanced
 */

namespace ForgeAdvanced\Components;

use WPForge\ComponentInterface;

/**
 * Navigation menus with multiple locations
 */
class Navigation implements ComponentInterface {
    /**
     * {@inheritdoc}
     */
    public function get_slug(): string {
        return 'navigation';
    }

    /**
     * {@inheritdoc}
     */
    public function initialize(): void {
        add_action( 'after_setup_theme', [ $this, 'register_menus' ] );
    }

    /**
     * Register navigation menus - multiple locations for advanced theme
     */
    public function register_menus(): void {
        register_nav_menus([
            'primary'  => __( 'Primary Menu', 'forge-advanced' ),
            'top-bar'  => __( 'Top Bar Menu', 'forge-advanced' ),
            'footer'   => __( 'Footer Menu', 'forge-advanced' ),
            'mobile'   => __( 'Mobile Menu', 'forge-advanced' ),
            'social'   => __( 'Social Links', 'forge-advanced' ),
        ]);
    }
}
