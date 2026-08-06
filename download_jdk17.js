const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.11%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.11_9.zip';
const destFolder = 'C:\\Users\\Nandi\\.bubblewrap\\jdk';
const destPath = path.join(destFolder, 'jdk-17.zip');

if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

console.log('Downloading JDK 17 from:', url);
console.log('Saving to:', destPath);

const file = fs.createWriteStream(destPath);

function download(downloadUrl) {
  https.get(downloadUrl, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      console.log('Redirecting to:', response.headers.location);
      download(response.headers.location);
      return;
    }

    if (response.statusCode !== 200) {
      console.error(`Failed to download. Status code: ${response.statusCode}`);
      process.exit(1);
    }

    const totalBytes = parseInt(response.headers['content-length'], 10);
    let downloadedBytes = 0;
    let lastLoggedPercent = 0;

    response.pipe(file);

    response.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes) {
        const percent = Math.floor((downloadedBytes / totalBytes) * 100);
        if (percent >= lastLoggedPercent + 10) {
          console.log(`Downloaded ${percent}% (${(downloadedBytes / (1024 * 1024)).toFixed(1)} MB / ${(totalBytes / (1024 * 1024)).toFixed(1)} MB)`);
          lastLoggedPercent = percent;
        }
      }
    });

    file.on('finish', () => {
      file.close(() => {
        console.log('JDK 17 zip download completed successfully!');
        process.exit(0);
      });
    });
  }).on('error', (err) => {
    fs.unlink(destPath, () => {});
    console.error('Download error:', err.message);
    process.exit(1);
  });
}

download(url);
