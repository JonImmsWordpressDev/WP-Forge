<?php
/**
 * Navigation Component
 *
 * @package ForgeBasic
 */

namespace ForgeBasic\Components;

use WPForge\ComponentInterface;

/**
 * Navigation menus and walker
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
     * Register navigation menus
     */
    public function register_menus(): void {
        register_nav_menus([
            'primary' => __( 'Primary Menu', 'forge-basic' ),
            'footer'  => __( 'Footer Menu', 'forge-basic' ),
        ]);
    }
}
