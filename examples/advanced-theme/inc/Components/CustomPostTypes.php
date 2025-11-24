<?php
/**
 * Custom Post Types Component
 *
 * @package ForgeAdvanced
 */

namespace ForgeAdvanced\Components;

use WPForge\ComponentInterface;

/**
 * Register custom post types for Portfolio, Testimonials, and Team
 */
class CustomPostTypes implements ComponentInterface {
    /**
     * {@inheritdoc}
     */
    public function get_slug(): string {
        return 'custom-post-types';
    }

    /**
     * {@inheritdoc}
     */
    public function initialize(): void {
        add_action( 'init', [ $this, 'register_portfolio' ] );
        add_action( 'init', [ $this, 'register_testimonials' ] );
        add_action( 'init', [ $this, 'register_team' ] );
    }

    /**
     * Register Portfolio post type
     */
    public function register_portfolio(): void {
        $labels = [
            'name'                  => __( 'Portfolio', 'forge-advanced' ),
            'singular_name'         => __( 'Portfolio Item', 'forge-advanced' ),
            'menu_name'             => __( 'Portfolio', 'forge-advanced' ),
            'add_new'               => __( 'Add New', 'forge-advanced' ),
            'add_new_item'          => __( 'Add New Portfolio Item', 'forge-advanced' ),
            'edit_item'             => __( 'Edit Portfolio Item', 'forge-advanced' ),
            'new_item'              => __( 'New Portfolio Item', 'forge-advanced' ),
            'view_item'             => __( 'View Portfolio Item', 'forge-advanced' ),
            'search_items'          => __( 'Search Portfolio', 'forge-advanced' ),
            'not_found'             => __( 'No portfolio items found', 'forge-advanced' ),
            'not_found_in_trash'    => __( 'No portfolio items found in trash', 'forge-advanced' ),
        ];

        $args = [
            'labels'              => $labels,
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_rest'        => true,
            'query_var'           => true,
            'rewrite'             => [ 'slug' => 'portfolio' ],
            'capability_type'     => 'post',
            'has_archive'         => true,
            'hierarchical'        => false,
            'menu_position'       => 5,
            'menu_icon'           => 'dashicons-portfolio',
            'supports'            => [ 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ],
            'taxonomies'          => [ 'portfolio_category', 'portfolio_tag' ],
        ];

        register_post_type( 'portfolio', $args );

        // Register Portfolio Category taxonomy
        register_taxonomy(
            'portfolio_category',
            'portfolio',
            [
                'label'        => __( 'Portfolio Categories', 'forge-advanced' ),
                'rewrite'      => [ 'slug' => 'portfolio-category' ],
                'hierarchical' => true,
                'show_in_rest' => true,
            ]
        );

        // Register Portfolio Tag taxonomy
        register_taxonomy(
            'portfolio_tag',
            'portfolio',
            [
                'label'        => __( 'Portfolio Tags', 'forge-advanced' ),
                'rewrite'      => [ 'slug' => 'portfolio-tag' ],
                'hierarchical' => false,
                'show_in_rest' => true,
            ]
        );
    }

    /**
     * Register Testimonials post type
     */
    public function register_testimonials(): void {
        $labels = [
            'name'                  => __( 'Testimonials', 'forge-advanced' ),
            'singular_name'         => __( 'Testimonial', 'forge-advanced' ),
            'menu_name'             => __( 'Testimonials', 'forge-advanced' ),
            'add_new'               => __( 'Add New', 'forge-advanced' ),
            'add_new_item'          => __( 'Add New Testimonial', 'forge-advanced' ),
            'edit_item'             => __( 'Edit Testimonial', 'forge-advanced' ),
            'new_item'              => __( 'New Testimonial', 'forge-advanced' ),
            'view_item'             => __( 'View Testimonial', 'forge-advanced' ),
            'search_items'          => __( 'Search Testimonials', 'forge-advanced' ),
            'not_found'             => __( 'No testimonials found', 'forge-advanced' ),
            'not_found_in_trash'    => __( 'No testimonials found in trash', 'forge-advanced' ),
        ];

        $args = [
            'labels'              => $labels,
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_rest'        => true,
            'query_var'           => true,
            'rewrite'             => [ 'slug' => 'testimonials' ],
            'capability_type'     => 'post',
            'has_archive'         => false,
            'hierarchical'        => false,
            'menu_position'       => 6,
            'menu_icon'           => 'dashicons-format-quote',
            'supports'            => [ 'title', 'editor', 'thumbnail' ],
        ];

        register_post_type( 'testimonial', $args );
    }

    /**
     * Register Team post type
     */
    public function register_team(): void {
        $labels = [
            'name'                  => __( 'Team', 'forge-advanced' ),
            'singular_name'         => __( 'Team Member', 'forge-advanced' ),
            'menu_name'             => __( 'Team', 'forge-advanced' ),
            'add_new'               => __( 'Add New', 'forge-advanced' ),
            'add_new_item'          => __( 'Add New Team Member', 'forge-advanced' ),
            'edit_item'             => __( 'Edit Team Member', 'forge-advanced' ),
            'new_item'              => __( 'New Team Member', 'forge-advanced' ),
            'view_item'             => __( 'View Team Member', 'forge-advanced' ),
            'search_items'          => __( 'Search Team', 'forge-advanced' ),
            'not_found'             => __( 'No team members found', 'forge-advanced' ),
            'not_found_in_trash'    => __( 'No team members found in trash', 'forge-advanced' ),
        ];

        $args = [
            'labels'              => $labels,
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_rest'        => true,
            'query_var'           => true,
            'rewrite'             => [ 'slug' => 'team' ],
            'capability_type'     => 'post',
            'has_archive'         => true,
            'hierarchical'        => false,
            'menu_position'       => 7,
            'menu_icon'           => 'dashicons-groups',
            'supports'            => [ 'title', 'editor', 'thumbnail' ],
            'taxonomies'          => [ 'team_department' ],
        ];

        register_post_type( 'team', $args );

        // Register Team Department taxonomy
        register_taxonomy(
            'team_department',
            'team',
            [
                'label'        => __( 'Departments', 'forge-advanced' ),
                'rewrite'      => [ 'slug' => 'department' ],
                'hierarchical' => true,
                'show_in_rest' => true,
            ]
        );
    }
}
