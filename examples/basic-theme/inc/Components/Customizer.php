<?php
/**
 * Customizer Component
 *
 * @package ForgeBasic
 */

namespace ForgeBasic\Components;

use WPForge\ComponentInterface;
use WP_Customize_Manager;

/**
 * Theme Customizer settings
 */
class Customizer implements ComponentInterface {
    /**
     * {@inheritdoc}
     */
    public function get_slug(): string {
        return 'customizer';
    }

    /**
     * {@inheritdoc}
     */
    public function initialize(): void {
        add_action( 'customize_register', [ $this, 'register_settings' ] );
    }

    /**
     * Register customizer settings
     *
     * @param WP_Customize_Manager $wp_customize Customizer manager.
     */
    public function register_settings( WP_Customize_Manager $wp_customize ): void {
        // Add theme section
        $wp_customize->add_section(
            'forge_basic_theme_options',
            [
                'title'    => __( 'Theme Options', 'forge-basic' ),
                'priority' => 30,
            ]
        );

        // Header text color
        $wp_customize->add_setting(
            'forge_basic_header_color',
            [
                'default'           => '#000000',
                'sanitize_callback' => 'sanitize_hex_color',
                'transport'         => 'postMessage',
            ]
        );

        $wp_customize->add_control(
            new \WP_Customize_Color_Control(
                $wp_customize,
                'forge_basic_header_color',
                [
                    'label'   => __( 'Header Text Color', 'forge-basic' ),
                    'section' => 'forge_basic_theme_options',
                ]
            )
        );

        // Show/hide tagline
        $wp_customize->add_setting(
            'forge_basic_show_tagline',
            [
                'default'           => true,
                'sanitize_callback' => 'wp_validate_boolean',
            ]
        );

        $wp_customize->add_control(
            'forge_basic_show_tagline',
            [
                'label'   => __( 'Show Site Tagline', 'forge-basic' ),
                'section' => 'forge_basic_theme_options',
                'type'    => 'checkbox',
            ]
        );
    }
}
