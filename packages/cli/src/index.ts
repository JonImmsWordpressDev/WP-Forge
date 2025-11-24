#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { devCommand } from './commands/dev'
import { buildCommand } from './commands/build'
import { blockCommand } from './commands/block'
import { componentCommand } from './commands/component'
import { testCommand } from './commands/test'

const program = new Command()

program
  .name('wp-forge')
  .description('⚒️  A modern WordPress theme framework')
  .version('0.1.0')

// Development server
program
  .command('dev')
  .description('Start development server with hot reload')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .action(devCommand)

// Production build
program
  .command('build')
  .description('Build theme for production')
  .option('--analyze', 'Analyze bundle size')
  .action(buildCommand)

// Generate block
program
  .command('block:new <name>')
  .description('Create a new Gutenberg block')
  .option('-t, --type <type>', 'Block type (static|dynamic)', 'dynamic')
  .option('--category <category>', 'Block category', 'common')
  .action(blockCommand)

// Generate component
program
  .command('component:new <name>')
  .description('Create a new theme component')
  .option('-t, --type <type>', 'Component type', 'default')
  .action(componentCommand)

// Testing
program
  .command('test')
  .description('Run tests')
  .option('--unit', 'Run unit tests only')
  .option('--e2e', 'Run E2E tests only')
  .option('--watch', 'Watch mode')
  .action(testCommand)

// Component explorer
program
  .command('storybook')
  .description('Launch component explorer')
  .action(() => {
    console.log(chalk.cyan('🎭 Launching component explorer...'))
    console.log(chalk.dim('Coming soon!'))
  })

// AI-powered commands (optional)
program
  .command('ai:block <description>')
  .description('Generate block from description using AI')
  .action((description: string) => {
    console.log(chalk.magenta('🤖 AI Block Generator'))
    console.log(chalk.dim(`Description: ${description}`))
    console.log(chalk.yellow('⚠️  Coming soon!'))
  })

program
  .command('ai:optimize')
  .description('AI-powered performance optimization')
  .action(() => {
    console.log(chalk.magenta('🤖 AI Optimizer'))
    console.log(chalk.yellow('⚠️  Coming soon!'))
  })

program.parse()
