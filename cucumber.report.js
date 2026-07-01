const report = require('multiple-cucumber-html-reporter');
attacheVideos();

report.generate({
  jsonDir: 'cypress/cucumber-json/',
  reportPath: './report/',
  ...createReportNameByPr(),
  displayReportTime: true,
  saveCollectedJSON: true,
  staticFilePath: true,
  useCDN: true,
  metadata: {
    browser: {
      name: 'electron',
      version: 'latest',
    },
    device: 'Local test machine',
    platform: {
      name: 'ubuntu',
      version: 'github actions',
    },
  },
  customData: {
    title: 'Run info',
    data: [
      { label: 'Project', value: 'Rivery.io Front End' },
      { label: 'Videos', value: '<a href="./videos">Video Recordings</a>' },
      {
        label: 'Screenshots',
        value: '<a href="./screenshots">Screenshots</a>',
      },
      { label: 'Reference', value: process.env?.GITHUB_REF },
      { label: 'OS', value: process.env?.RUNNER_OS },
    ],
  },
});

// UTILS
function createReportNameByPr() {
  // Check for PR number
  const githubRef = process?.env?.GITHUB_REF
    ? process.env.GITHUB_REF?.replace('refs/pull/', '')
    : '';
  const reportName = githubRef
    ? {
        reportName: `Test Results for Pull Request #${process.env.GITHUB_REF?.replace(
          'refs/pull/',
          '',
        )}`,
      }
    : {};
  return reportName;
}

function getFileList(folder = './cypress/videos') {
  const fs = require('fs');
  const path = require('path');
  const getAllFiles = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
      const name = path.join(dir, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, []);
  return getAllFiles(folder);
}

function attacheVideos() {
  // const videosPath = 'videos/features';
  const fs = require('fs');
  // const screenshotsMap = mapFilesByName();
  const videosMap = mapFilesByName('cypress/videos');
  const cucumberJsons = getFileList('./cypress/cucumber-json');
  cucumberJsons.forEach(jsonPath => {
    const fileName = jsonPath
      .split('/')
      .pop()
      .replace('.cucumber', '')
      .replace('.json', '');
    const videoPath = videosMap.get(fileName);
    const data = fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' });
    let json = JSON.parse(data);
    json[0].description =
      json[0].description +
      `<details>
        <summary class="btn btn-primary">Video Recording</summary>
        <video controls src="../${videoPath}" class="thumbnail" style="display: flex; width: 100%; max-width: 70vw; margin: 0 auto;"></video>
        </details>
        `;
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
  });
}
// function getImage(fileName, screenshotsMap) {
//   const imageName = screenshotsMap.get(fileName);
//   return imageName
//     ? `<img class="thumbnail" style="margin: auto" src="../${imageName}">`
//     : '';
// }
function mapFilesByName(folder = 'cypress/screenshots') {
  try {
    const videos = getFileList(folder);
    const filesMap = videos.reduce((map, videoPath) => {
      if (!videoPath.includes('.DS_Store')) {
        const fullPath = videoPath.split('cypress/').pop();
        const featureFileName = videoPath
          .split('.feature')
          .shift()
          .split('/')
          .pop();
        map.set(featureFileName, fullPath);
      }
      return map;
    }, new Map());
    return filesMap;
  } catch (error) {
    console.log('error:', error);
    return new Map();
  }
}
