/**
 * arguments:
 * --intOnly - push to int only
 * --tagOnly - disable pushing tags to git
 * --message - appends tag message
 * --suffix - appends suffix to a version, i.e prod_.0.0.0.20_THE_SUFFIX
 * --dry - dry run - logs information about operations with current details
 * 
 * example:
 * node scripts/tagger.js --int --message "say this is testing only" --dry --suffix "test tracking"
 */
const args = require('yargs/yargs')(process.argv.slice(2)).argv;
const isDry = Boolean(args.dry);
const git = createGitClient(isDry);

run();

///////////
// UTILS //
///////////
function run() {
  const version = getPackageVersion();

  addTags(version)
  pushTags(version);

  setTimeout(()=>{
    addTags(version, false)
    pushTags(version);
  }, 10000)

}

function addTags(version, other_regions = true) {
  const tags = other_regions ? ['il_prod', 'au_prod'] : [
    'us_prod',
    'eu_prod',
  ]
  const suffix = args.suffix ? `_${args.suffix.replace(/\s/gim, '_')}` : '';
  tags.forEach(tagPrefix => {
    git.addAnnotatedTag(`${tagPrefix}_0.${version}${suffix}`, args.message || '')
  })
}

function pushTags(version) {
  if (!args.tagOnly) {
    git.pushTags();
    console.log('versions tagged and pushed for version: ', version)
  }
}

function createGitClient (isDry) {
  const simpleGit = !isDry ? require('simple-git') : () => ({ addAnnotatedTag: console.log, pushTags: console.log });
  return simpleGit();
}

function getPackageVersion() {
  const path = require('path');
  const fs = require('fs');
  const packageFilePath = path.resolve(
    __dirname,
    '../package.json'
  );
  const packageJson = fs.readFileSync(packageFilePath, 'utf8');
  const json = JSON.parse(packageJson);
  return json.version;
}