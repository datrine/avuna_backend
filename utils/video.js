import { spawn } from 'child_process';
import path from 'path';

function getVideoCodecInfo(filePath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=codec_name',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);

    let stdout = '';
    let stderr = '';

    ffprobe.stdout.on('data', (data) => {
      stdout += data;
    });

    ffprobe.stderr.on('data', (data) => {
      stderr += data;
    });

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFprobe exited with code ${code}. ${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

const filePath =path.join(process.cwd(), "video.mp4");

getVideoCodecInfo(filePath)
  .then((codecName) => {
    console.log(`The video codec is ${codecName}.`);
  })
  .catch((error) => {
    console.error(`Error getting video codec info: ${error}`);
  });


  export default getVideoCodecInfo