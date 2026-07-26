<?php
/**
 * Assets Component
 *
 * @package StrataWP
 */

namespace StrataWP\Components;

use StrataWP\ComponentInterface;

/**
 * Asset management for Vite-built assets and web fonts
 */
class Assets implements ComponentInterface {
	/**
	 * Vite manifest
	 *
	 * @var array|null
	 */
	protected ?array $manifest = null;

	/**
	 * Google Fonts to load
	 *
	 * @var array
	 */
	protected array $google_fonts = array();

	/**
	 * {@inheritdoc}
	 */
	public function get_slug(): string {
		return 'assets';
	}

	/**
	 * {@inheritdoc}
	 */
	public function initialize(): void {
		$this->add_font_preconnect();
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_fonts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'after_setup_theme', array( $this, 'register_editor_styles' ) );
	}

	/**
	 * Register built editor CSS inside the block editor canvas
	 *
	 * Styles enqueued by enqueue_editor_assets() load page-level in
	 * wp-admin, but with apiVersion 3 blocks the editor canvas is iframed
	 * and page-level stylesheets never reach it. Paths registered via add_editor_style()
	 * are injected into the canvas by WordPress, which leaves selectors
	 * already containing .editor-styles-wrapper untransformed. Setup
	 * declares the required 'editor-styles' theme support.
	 */
	public function register_editor_styles(): void {
		$manifest = $this->get_manifest();

		if ( ! $manifest ) {
			return;
		}

		// Standalone CSS entry, for themes that list src/css/editor.css as a Vite input.
		if ( isset( $manifest['src/css/editor.css']['file'] ) ) {
			add_editor_style( 'dist/' . $manifest['src/css/editor.css']['file'] );
		}

		// The scaffolded vite.config defines editor as a JS entry; its
		// compiled CSS lands in the entry's `css` array.
		if ( ! empty( $manifest['src/js/editor.ts']['css'] ) ) {
			foreach ( $manifest['src/js/editor.ts']['css'] as $css_file ) {
				add_editor_style( 'dist/' . $css_file );
			}
		}
	}

	/**
	 * Enqueue front-end assets
	 */
	public function enqueue_assets(): void {
		$manifest = $this->get_manifest();

		if ( ! $manifest ) {
			return;
		}

		// Enqueue main theme script
		if ( isset( $manifest['src/js/main.ts'] ) ) {
			$this->enqueue_from_manifest( 'stratawp-main', 'src/js/main.ts' );
		}

		// Enqueue main theme styles
		if ( isset( $manifest['src/css/main.css'] ) ) {
			$this->enqueue_from_manifest( 'stratawp-styles', 'src/css/main.css', 'style' );
		}
	}

	/**
	 * Enqueue editor assets
	 */
	public function enqueue_editor_assets(): void {
		$manifest = $this->get_manifest();

		if ( ! $manifest ) {
			return;
		}

		// Standalone CSS entry, for themes that list src/css/editor.css as a Vite input.
		if ( isset( $manifest['src/css/editor.css'] ) ) {
			$this->enqueue_from_manifest( 'stratawp-editor', 'src/css/editor.css', 'style' );
		}

		// The scaffolded vite.config defines editor as a JS entry, so the compiled
		// CSS lands in the entry's `css` array rather than a standalone manifest
		// key. Styles only — Assets does not load editor JS in admin.
		if ( isset( $manifest['src/js/editor.ts'] ) ) {
			$entry = $manifest['src/js/editor.ts'];
			$this->enqueue_entry_css( 'stratawp-editor', $entry, $this->entry_version( $entry ) );
		}
	}

	/**
	 * Enqueue asset from manifest
	 *
	 * @param string $handle Asset handle.
	 * @param string $src    Source path in manifest.
	 * @param string $type   Asset type (script|style).
	 */
	protected function enqueue_from_manifest( string $handle, string $src, string $type = 'script' ): void {
		$manifest = $this->get_manifest();

		if ( ! isset( $manifest[ $src ] ) ) {
			return;
		}

		$entry   = $manifest[ $src ];
		$url     = get_template_directory_uri() . '/dist/' . $entry['file'];
		$version = $this->entry_version( $entry );

		// Get WordPress dependencies
		$deps = $entry['dependencies'] ?? array();

		if ( 'script' === $type ) {
			wp_enqueue_script( $handle, $url, $deps, $version, true );
			wp_script_add_data( $handle, 'precache', true );
		} else {
			wp_enqueue_style( $handle, $url, $deps, $version );
			// 'precache' is a PWA service-worker convention, not in core stubs.
			// @phpstan-ignore-next-line
			wp_style_add_data( $handle, 'precache', true );
		}

		// Vite splits an entry's CSS into the entry's `css` array; enqueue it
		// so the compiled stylesheet actually loads (it is not a separate
		// manifest key).
		$this->enqueue_entry_css( $handle, $entry, $version );
	}

	/**
	 * Enqueue every stylesheet in a manifest entry's `css` array
	 *
	 * @param string     $handle  Base handle; each file gets an index suffix.
	 * @param array      $entry   Manifest entry.
	 * @param string|int $version Asset version.
	 */
	protected function enqueue_entry_css( string $handle, array $entry, $version ): void {
		if ( empty( $entry['css'] ) ) {
			return;
		}

		foreach ( $entry['css'] as $index => $css_file ) {
			$css_url = get_template_directory_uri() . '/dist/' . $css_file;
			wp_enqueue_style( $handle . '-' . $index, $css_url, array(), $version );
			// 'precache' is a PWA service-worker convention, not in core stubs.
			// @phpstan-ignore-next-line
			wp_style_add_data( $handle . '-' . $index, 'precache', true );
		}
	}

	/**
	 * Version for a manifest entry, from its built file's modification time
	 *
	 * @param array $entry Manifest entry.
	 * @return string|int
	 */
	protected function entry_version( array $entry ) {
		$path = get_template_directory() . '/dist/' . $entry['file'];

		return file_exists( $path ) ? filemtime( $path ) : '1.0.0';
	}

	/**
	 * Get Vite manifest
	 *
	 * @return array|null
	 */
	protected function get_manifest(): ?array {
		if ( null !== $this->manifest ) {
			return $this->manifest;
		}

		$manifest_path = get_template_directory() . '/dist/.vite/manifest.json';

		if ( ! file_exists( $manifest_path ) ) {
			return null;
		}

		$manifest_content = file_get_contents( $manifest_path );
		$this->manifest   = json_decode( $manifest_content, true );

		return $this->manifest;
	}

	/**
	 * Add preconnect hints for Google Fonts via Performance component filter
	 */
	public function add_font_preconnect(): void {
		if ( empty( $this->google_fonts ) ) {
			return;
		}

		add_filter(
			'stratawp_preconnect_hints',
			function ( array $hints ): array {
				$hints[] = 'https://fonts.googleapis.com';
				$hints[] = array(
					'href'        => 'https://fonts.gstatic.com',
					'crossorigin' => true,
				);
				return $hints;
			}
		);
	}

	/**
	 * Enqueue Google Fonts
	 */
	public function enqueue_fonts(): void {
		if ( empty( $this->google_fonts ) ) {
			return;
		}

		$font_url = $this->build_google_fonts_url();

		if ( $font_url ) {
			wp_enqueue_style(
				'stratawp-fonts',
				$font_url,
				array(),
				null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			);
		}
	}

	/**
	 * Build Google Fonts URL
	 *
	 * @return string|false
	 */
	protected function build_google_fonts_url() {
		if ( empty( $this->google_fonts ) ) {
			return false;
		}

		$families = implode( '&family=', $this->google_fonts );

		return add_query_arg(
			array(
				'family'  => $families,
				'display' => 'swap',
			),
			'https://fonts.googleapis.com/css2'
		);
	}

	/**
	 * Set Google Fonts to load
	 *
	 * @param array $fonts Array of font strings (e.g., ['Inter:wght@400;700']).
	 * @return self
	 */
	public function set_google_fonts( array $fonts ): self {
		$this->google_fonts = $fonts;
		return $this;
	}

	/**
	 * Add a Google Font
	 *
	 * @param string $font Font string (e.g., 'Inter:wght@400;700').
	 * @return self
	 */
	public function add_google_font( string $font ): self {
		if ( ! in_array( $font, $this->google_fonts, true ) ) {
			$this->google_fonts[] = $font;
		}
		return $this;
	}
}
