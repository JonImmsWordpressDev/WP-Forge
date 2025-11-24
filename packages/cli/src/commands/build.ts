import chalk from 'chalk'
import ora from 'ora'
import { execa } from 'execa'

interface BuildOptions {
  analyze?: boolean
}

export async function buildCommand(options: BuildOptions) {
  console.log(chalk.bold.cyan('⚒️  Building for Production\n'))

  const spinner = ora('Building theme...').start()

  try {
    const args = ['build']
    if (options.analyze) {
      args.push('--mode', 'analyze')
    }

    await execa('vite', args, { stdio: 'inherit' })

    spinner.succeed(chalk.green('Build complete!'))

    console.log()
    console.log(chalk.cyan('📦 Output:') + ' dist/')
    console.log(chalk.dim('  Ready for production deployment'))
    console.log()
  } catch (error) {
    spinner.fail('Build failed')
    console.error(error)
    process.exit(1)
  }
}
