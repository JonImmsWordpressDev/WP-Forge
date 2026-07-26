<?php

declare(strict_types=1);

namespace StrataWP\Tests\Unit;

use Brain\Monkey;
use Brain\Monkey\Functions;
use PHPUnit\Framework\TestCase;
use StrataWP\Components\Assets;

final class FakeManifestAssets extends Assets {
    public array $fakeManifest = array();
    protected function get_manifest(): ?array {
        return $this->fakeManifest;
    }
    public function callEnqueue(string $handle, string $src, string $type = 'script'): void {
        $this->enqueue_from_manifest($handle, $src, $type);
    }
}

final class AssetsTest extends TestCase {
    protected function setUp(): void { parent::setUp(); Monkey\setUp(); }
    protected function tearDown(): void { Monkey\tearDown(); parent::tearDown(); }

    public function test_editor_canvas_styles_registered_from_js_entry_css_array(): void {
        // admin_enqueue_scripts styles never reach the iframed apiVersion 3
        // editor canvas — the built editor CSS must also be registered via
        // add_editor_style(), which WordPress injects into the canvas
        // (issue #41).
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/js/editor.ts' => array(
                'file' => 'js/editor.ABC.js',
                'css'  => array('css/editor.DEF.css'),
            ),
        );

        Functions\expect('add_editor_style')->once()->with('dist/css/editor.DEF.css');

        $assets->register_editor_styles();
        $this->addToAssertionCount(1);
    }

    public function test_editor_canvas_styles_registered_from_legacy_standalone_key(): void {
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/css/editor.css' => array('file' => 'css/editor.OLD.css'),
        );

        Functions\expect('add_editor_style')->once()->with('dist/css/editor.OLD.css');

        $assets->register_editor_styles();
        $this->addToAssertionCount(1);
    }

    public function test_editor_canvas_styles_skip_when_no_editor_entries(): void {
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/js/main.ts' => array('file' => 'js/main.ABC.js'),
        );

        Functions\expect('add_editor_style')->never();

        $assets->register_editor_styles();
        $this->addToAssertionCount(1);
    }

    public function test_initialize_hooks_editor_canvas_style_registration(): void {
        Monkey\Actions\expectAdded('after_setup_theme')->once();
        Monkey\Actions\expectAdded('wp_enqueue_scripts')->twice();
        Monkey\Actions\expectAdded('admin_enqueue_scripts')->once();

        (new FakeManifestAssets())->initialize();
        $this->addToAssertionCount(1);
    }

    public function test_script_entry_also_enqueues_its_css_siblings(): void {
        Functions\when('get_template_directory_uri')->justReturn('https://example.test/wp-content/themes/t');
        Functions\when('get_template_directory')->justReturn('/srv/themes/t');
        // file_exists is a PHP internal — can't be mocked via Brain Monkey without patchwork config.
        // '/srv/themes/t/dist/...' doesn't exist on this machine, so it naturally returns false,
        // triggering the '1.0.0' version fallback. No mock needed.
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/js/main.ts' => array(
                'file' => 'js/main.ABC.js',
                'css'  => array('css/main.DEF.css'),
            ),
        );

        Functions\expect('wp_enqueue_script')->once()
            ->with('stratawp-main', 'https://example.test/wp-content/themes/t/dist/js/main.ABC.js', array(), '1.0.0', true);
        Functions\expect('wp_enqueue_style')->once()
            ->with('stratawp-main-0', 'https://example.test/wp-content/themes/t/dist/css/main.DEF.css', array(), '1.0.0');
        // wp_script_add_data and wp_style_add_data are called by the implementation (Task 5);
        // stub them so they don't cause "undefined function" errors in this Task-1 test.
        Functions\when('wp_script_add_data')->justReturn(true);
        Functions\when('wp_style_add_data')->justReturn(true);

        $assets->callEnqueue('stratawp-main', 'src/js/main.ts', 'script');
        $this->addToAssertionCount(1);
    }

    public function test_editor_css_loads_from_js_entry_css_array(): void {
        Functions\when('get_template_directory_uri')->justReturn('https://example.test/t');
        Functions\when('get_template_directory')->justReturn('/srv/t');
        Functions\when('wp_style_add_data')->justReturn(true);
        // The scaffolded vite.config defines editor as a JS entry, so the
        // compiled CSS lives in the entry's `css` array — no standalone
        // src/css/editor.css manifest key exists (issue #26).
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/js/editor.ts' => array(
                'file' => 'js/editor.ABC.js',
                'css'  => array('css/editor.DEF.css'),
            ),
        );

        Functions\expect('wp_enqueue_style')->once()
            ->with('stratawp-editor-0', 'https://example.test/t/dist/css/editor.DEF.css', array(), '1.0.0');
        // Styles only: Assets has never loaded editor JS in admin, and this
        // fix must not start to.
        Functions\expect('wp_enqueue_script')->never();

        $assets->enqueue_editor_assets();
        $this->addToAssertionCount(1);
    }

    public function test_editor_legacy_standalone_css_key_still_loads(): void {
        Functions\when('get_template_directory_uri')->justReturn('https://example.test/t');
        Functions\when('get_template_directory')->justReturn('/srv/t');
        Functions\when('wp_style_add_data')->justReturn(true);
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/css/editor.css' => array('file' => 'css/editor.OLD.css'),
        );

        Functions\expect('wp_enqueue_style')->once()
            ->with('stratawp-editor', 'https://example.test/t/dist/css/editor.OLD.css', array(), '1.0.0');

        $assets->enqueue_editor_assets();
        $this->addToAssertionCount(1);
    }

    public function test_editor_enqueues_nothing_when_no_editor_entries_exist(): void {
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/js/main.ts' => array('file' => 'js/main.ABC.js'),
        );

        Functions\expect('wp_enqueue_style')->never();
        Functions\expect('wp_enqueue_script')->never();

        $assets->enqueue_editor_assets();
        $this->addToAssertionCount(1);
    }

    public function test_script_and_css_get_precache_data(): void {
        Functions\when('get_template_directory_uri')->justReturn('https://example.test/t');
        Functions\when('get_template_directory')->justReturn('/srv/t');
        Functions\when('wp_enqueue_script')->justReturn(null);
        Functions\when('wp_enqueue_style')->justReturn(null);
        $assets = new FakeManifestAssets();
        $assets->fakeManifest = array(
            'src/js/main.ts' => array('file' => 'js/main.ABC.js', 'css' => array('css/main.DEF.css')),
        );
        Functions\expect('wp_script_add_data')->once()->with('stratawp-main', 'precache', true);
        Functions\expect('wp_style_add_data')->once()->with('stratawp-main-0', 'precache', true);

        $assets->callEnqueue('stratawp-main', 'src/js/main.ts', 'script');
        $this->addToAssertionCount(1);
    }
}
