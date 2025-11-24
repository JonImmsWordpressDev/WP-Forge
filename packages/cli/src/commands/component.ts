import chalk from 'chalk'

interface ComponentOptions {
  type: string
}

export async function componentCommand(name: string, options: ComponentOptions) {
  console.log(chalk.cyan('🧩 Creating component:'), name)
  console.log(chalk.yellow('⚠️  Coming soon!'))
}
