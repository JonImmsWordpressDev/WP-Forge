import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'

interface BlockOptions {
  type: 'static' | 'dynamic'
  category: string
}

export async function blockCommand(name: string, options: BlockOptions) {
  console.log(chalk.bold.cyan('⚒️  Creating Block\n'))
  console.log(chalk.dim(`Name: ${name}`))
  console.log(chalk.dim(`Type: ${options.type}`))
  console.log(chalk.dim(`Category: ${options.category}\n`))

  const spinner = ora('Generating block...').start()

  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const blockDir = path.join(process.cwd(), 'src/blocks', slug)

    await fs.ensureDir(blockDir)

    // Generate block files
    await generateBlockConfig(blockDir, name, slug, options)
    await generateBlockEdit(blockDir, name, slug)
    await generateBlockRender(blockDir, name, slug, options.type)
    await generateBlockStyles(blockDir, slug)

    spinner.succeed(chalk.green(`Block "${name}" created!`))

    console.log()
    console.log(chalk.cyan('📁 Files created:'))
    console.log(chalk.dim(`  src/blocks/${slug}/block.json`))
    console.log(chalk.dim(`  src/blocks/${slug}/edit.tsx`))
    console.log(chalk.dim(`  src/blocks/${slug}/render.${options.type === 'dynamic' ? 'php' : 'tsx'}`))
    console.log(chalk.dim(`  src/blocks/${slug}/style.css`))
    console.log()
  } catch (error) {
    spinner.fail('Failed to create block')
    console.error(error)
    process.exit(1)
  }
}

async function generateBlockConfig(
  blockDir: string,
  name: string,
  slug: string,
  options: BlockOptions
) {
  const config = {
    $schema: 'https://schemas.wp.org/trunk/block.json',
    apiVersion: 3,
    name: `wp-forge/${slug}`,
    title: name,
    category: options.category,
    icon: 'smiley',
    description: `${name} block`,
    supports: {
      html: false,
      align: true,
    },
    attributes: {},
    editorScript: 'file:./edit.tsx',
    ...(options.type === 'dynamic' && { render: 'file:./render.php' }),
    style: 'file:./style.css',
  }

  await fs.writeJson(path.join(blockDir, 'block.json'), config, { spaces: 2 })
}

async function generateBlockEdit(blockDir: string, name: string, slug: string) {
  const content = `import { useBlockProps } from '@wordpress/block-editor'

export default function Edit() {
  const blockProps = useBlockProps()

  return (
    <div {...blockProps}>
      <h3>${name}</h3>
      <p>Edit your block here...</p>
    </div>
  )
}
`

  await fs.writeFile(path.join(blockDir, 'edit.tsx'), content)
}

async function generateBlockRender(
  blockDir: string,
  name: string,
  slug: string,
  type: 'static' | 'dynamic'
) {
  if (type === 'dynamic') {
    const content = `<?php
/**
 * ${name} Block Render
 *
 * @param array $attributes Block attributes
 * @param string $content Block content
 * @return string Rendered block
 */

$block_wrapper_attributes = get_block_wrapper_attributes();
?>

<div <?php echo $block_wrapper_attributes; ?>>
  <h3><?php echo esc_html__( '${name}', 'wp-forge' ); ?></h3>
  <!-- Add your dynamic content here -->
</div>
`

    await fs.writeFile(path.join(blockDir, 'render.php'), content)
  }
}

async function generateBlockStyles(blockDir: string, slug: string) {
  const content = `.wp-block-wp-forge-${slug} {
  /* Add your styles here */
}
`

  await fs.writeFile(path.join(blockDir, 'style.css'), content)
}
