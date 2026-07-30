const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const videos = [
  "public/rebuild.mp4",
  "public/interactive-3d-orb-recording.mp4",
  "public/playground/slide-5.mp4",
  "public/playground/slide-7-elegant.mp4",
];

console.log("Starting video conversions using ffmpeg-static...");

for (const videoPath of videos) {
  const absPath = path.resolve(process.cwd(), videoPath);
  if (!fs.existsSync(absPath)) {
    console.log(`Skipping missing file: ${videoPath}`);
    continue;
  }

  const webmPath = absPath.replace(/\.mp4$/, ".webm");
  const tempMp4Path = absPath.replace(/\.mp4$/, ".opt.mp4");

  console.log(`Processing: ${videoPath}...`);

  // 1. Generate WebM (VP9, no audio)
  try {
    console.log(`  -> Generating WebM: ${webmPath}`);
    execFileSync(ffmpegPath, [
      "-y",
      "-i", absPath,
      "-c:v", "libvpx-vp9",
      "-b:v", "0",
      "-crf", "32",
      "-an",
      webmPath,
    ], { stdio: "inherit" });
  } catch (err) {
    console.error(`  Error creating WebM for ${videoPath}:`, err.message);
  }

  // 2. Optimize MP4 (H.264, no audio, faststart)
  try {
    console.log(`  -> Optimizing MP4: ${tempMp4Path}`);
    execFileSync(ffmpegPath, [
      "-y",
      "-i", absPath,
      "-c:v", "libx264",
      "-crf", "26",
      "-preset", "medium",
      "-movflags", "+faststart",
      "-an",
      tempMp4Path,
    ], { stdio: "inherit" });

    // Replace original MP4 with optimized version
    fs.renameSync(tempMp4Path, absPath);
    console.log(`  -> Optimized MP4 replaced successfully.`);
  } catch (err) {
    console.error(`  Error optimizing MP4 for ${videoPath}:`, err.message);
    if (fs.existsSync(tempMp4Path)) fs.unlinkSync(tempMp4Path);
  }
}

console.log("All video conversions completed!");
