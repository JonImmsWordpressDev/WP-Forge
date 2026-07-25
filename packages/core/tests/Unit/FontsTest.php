<?php

declare(strict_types=1);

namespace StrataWP\Tests\Unit;

use Brain\Monkey;
use Brain\Monkey\Actions;
use Brain\Monkey\Functions;
use PHPUnit\Framework\TestCase;
use StrataWP\Components\Fonts;

final class FontsTest extends TestCase {

    protected function setUp(): void {
        parent::setUp();
        Monkey\setUp();
    }

    protected function tearDown(): void {
        Monkey\tearDown();
        parent::tearDown();
    }

    /**
     * @param array<string, mixed> $options Option name => value; anything else falls back to the default.
     */
    private function mock_options(array $options): void {
        Functions\when('get_option')->alias(
            static function (string $name, $default_value = false) use ($options) {
                return $options[$name] ?? $default_value;
            }
        );
    }

    public function test_mode_defaults_to_disabled_when_never_saved(): void {
        // A fresh scaffold must not phone Google or override theme.json
        // fonts until typography is explicitly configured (issue #28).
        $this->mock_options(array());

        $this->assertSame(Fonts::MODE_DISABLED, (new Fonts())->get_font_loading_mode());
    }

    public function test_explicitly_saved_google_api_mode_is_honored(): void {
        $this->mock_options(array('stratawp_font_loading_mode' => Fonts::MODE_GOOGLE_API));

        $this->assertSame(Fonts::MODE_GOOGLE_API, (new Fonts())->get_font_loading_mode());
    }

    public function test_initialize_on_fresh_install_registers_no_frontend_hooks(): void {
        $this->mock_options(array());

        Actions\expectAdded('wp_enqueue_scripts')->never();
        Actions\expectAdded('wp_head')->never();
        // The admin UI must stay registered so the feature can be enabled.
        Actions\expectAdded('admin_menu')->once();
        Actions\expectAdded('admin_init')->once();
        Actions\expectAdded('admin_enqueue_scripts')->once();

        (new Fonts())->initialize();
        $this->addToAssertionCount(1);
    }

    public function test_initialize_in_google_api_mode_registers_font_hooks(): void {
        $this->mock_options(array('stratawp_font_loading_mode' => Fonts::MODE_GOOGLE_API));

        Actions\expectAdded('wp_enqueue_scripts')->once();
        Actions\expectAdded('wp_head')->once();

        (new Fonts())->initialize();
        $this->addToAssertionCount(1);
    }

    public function test_initialize_in_self_hosted_mode_skips_google_fonts_but_outputs_variables(): void {
        $this->mock_options(array('stratawp_font_loading_mode' => Fonts::MODE_SELF_HOSTED));

        Actions\expectAdded('wp_enqueue_scripts')->never();
        Actions\expectAdded('wp_head')->once();

        (new Fonts())->initialize();
        $this->addToAssertionCount(1);
    }

    public function test_initialize_in_explicitly_disabled_mode_keeps_admin_ui(): void {
        // MODE_DISABLED used to bail before registering the settings page,
        // making it impossible to re-enable the feature from the admin.
        $this->mock_options(array('stratawp_font_loading_mode' => Fonts::MODE_DISABLED));

        Actions\expectAdded('wp_enqueue_scripts')->never();
        Actions\expectAdded('wp_head')->never();
        Actions\expectAdded('admin_menu')->once();

        (new Fonts())->initialize();
        $this->addToAssertionCount(1);
    }

    public function test_sanitize_falls_back_to_disabled_for_invalid_input(): void {
        $this->mock_options(array());

        $this->assertSame(Fonts::MODE_DISABLED, (new Fonts())->sanitize_font_loading_mode('garbage'));
    }
}
