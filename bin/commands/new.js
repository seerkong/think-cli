const program = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const helper = require('think-helper');
const os = require('os');
const Run = require('../../lib/run');
const logger = require('../../lib/logger');
const argv = require('minimist')(process.argv.slice(2));

/**
 * Usage.
 */

program
  .usage('<project-name> [template-name]')
  .option('-c, --clone', 'use git clone')
  .option('-m, --module', 'creating projects using multiple module mode');

/**
 * Help.
 */

program.on('--help', function() {
  console.log();
  console.log('  Examples:');
  console.log();
  console.log(chalk.gray('    # create a new project with an official template'));
  console.log('    $ thinkjs new my-project template');
  console.log();
  console.log(chalk.gray('    # create a new project straight from a github template'));
  console.log('    $ thinkjs new my-project username/repo');
  console.log();
  console.log(chalk.gray('    # create a new project straight from a local template'));
  console.log('    $ thinkjs new my-project ~/fs/path/to-custom-template');
  console.log();
});

program.parse(process.argv);

/**
 * Padding.
 */

console.log();
process.on('exit', function() {
  console.log();
});

/**
 * Start.
 */

const rawName = program.args[0];
const template = program.args[1] || path.join(__dirname, '../../default_template');
const isHere = !rawName || rawName === '.';
const name = isHere ? path.relative('../../', process.cwd()) : rawName;
const targetPath = path.join(process.cwd(), rawName || '.');
const clone = program.clone || false;
const isMultiModule = program.module || false;

const maps = isMultiModule
  ? 'new.multiModule'
  : 'new.default';

const context = Object.assign(argv, {
  actionPrefix: './',
  ROOT_PATH: targetPath,
  APP_NAME: name
});

const run = new Run({
  template,
  targetPath,
  options: { name, command: 'new', maps, clone, isMultiModule, context },
  done(err, files, options) {
    console.log();
    if (err) return logger.error(err);
    logger.success('Generated %s', name);
    if (options.metadata.completeMessage) {
      logger.message(options.metadata.completeMessage, {
        destDirName: name,
        inPlace: targetPath === process.cwd()
      });
    }
  }
});

if (helper.isExist(targetPath)) {
  inquirer.prompt([{
    type: 'confirm',
    message: isHere
      ? 'Generate project in current directory?'
      : 'Target directory exists. Continue?',
    name: 'ok'
  }]).then(function(answers) {
    if (answers.ok) {
      run.start();
    }
  });
} else {
  run.start();
}
