<?php
/**
 * Footer template
 *
 * @package ForgeBasic
 */
?>

    <footer id="colophon" class="site-footer">
        <div class="site-info">
            <p>
                <?php
                printf(
                    /* translators: 1: Theme name, 2: Theme author link */
                    esc_html__( '%1$s by %2$s', 'forge-basic' ),
                    '<a href="' . esc_url( 'https://github.com/JonImmsWordpressDev/WP-Forge' ) . '">WP-Forge</a>',
                    '<a href="' . esc_url( 'https://github.com/JonImmsWordpressDev' ) . '">Jon Imms</a>'
                );
                ?>
            </p>
            <p class="forge-badge">
                ⚒️ Built with <strong>WP-Forge</strong>
            </p>
        </div>

        <?php
        if ( has_nav_menu( 'footer' ) ) :
            ?>
            <nav class="footer-navigation">
                <?php
                wp_nav_menu([
                    'theme_location' => 'footer',
                    'menu_class'     => 'footer-menu',
                    'depth'          => 1,
                ]);
                ?>
            </nav>
            <?php
        endif;
        ?>
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
