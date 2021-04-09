/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

const fs = require("fs");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");
const path = require("path");
const mkdirp = require("mkdirp");

module.exports = (on) => {
  on("before:browser:launch", (browser = {}, launchOptions) => {
    if (browser.name === "chrome") {
      launchOptions.args.push("--disable-dev-shm-usage");
      return launchOptions;
    }
    return launchOptions;
  }),
    on("task", {
      pixelMatch: (options) => {
        const {
          receivedImageBuffer,
          snapshotImageBuffer,
          snapshotIdentifier,
          snapshotsDir,
          customDiffConfig = {},
          failureThreshold,
          failureThresholdType,
        } = options;

        //const { original, screenshot, snapshotIdentifier, failureThresholdType, threshold } = options;
        /**
         * Helper function to create reusable image resizer
         */
        const createImageResizer = (width, height) => (source) => {
          const resized = new PNG({ width, height, fill: true });
          PNG.bitblt(source, resized, 0, 0, source.width, source.height, 0, 0);
          return resized;
        };

        /**
         * Fills diff area with black transparent color for meaningful diff
         */
        /* eslint-disable no-plusplus, no-param-reassign, no-bitwise */
        const fillSizeDifference = (width, height) => (image) => {
          const inArea = (x, y) => y > height || x > width;
          for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
              if (inArea(x, y)) {
                const idx = (image.width * y + x) << 2;
                image.data[idx] = 0;
                image.data[idx + 1] = 0;
                image.data[idx + 2] = 0;
                image.data[idx + 3] = 64;
              }
            }
          }
          return image;
        };
        /* eslint-enabled */

        /**
         * Aligns images sizes to biggest common value
         * and fills new pixels with transparent pixels
         */
        const alignImagesToSameSize = (firstImage, secondImage) => {
          // Keep original sizes to fill extended area later
          const firstImageWidth = firstImage.width;
          const firstImageHeight = firstImage.height;
          const secondImageWidth = secondImage.width;
          const secondImageHeight = secondImage.height;
          // Calculate biggest common values
          const resizeToSameSize = createImageResizer(
            Math.max(firstImageWidth, secondImageWidth),
            Math.max(firstImageHeight, secondImageHeight)
          );
          // Resize both images
          const resizedFirst = resizeToSameSize(firstImage);
          const resizedSecond = resizeToSameSize(secondImage);
          // Fill resized area with black transparent pixels
          return [
            fillSizeDifference(firstImageWidth, firstImageHeight)(resizedFirst),
            fillSizeDifference(
              secondImageWidth,
              secondImageHeight
            )(resizedSecond),
          ];
        };

        function diffImageToSnapshot(options) {
          const {
            receivedImageBuffer,
            snapshotImageBuffer,
            snapshotIdentifier,
            snapshotsDir,
            customDiffConfig = {},
            failureThreshold,
            failureThresholdType,
          } = options;

          let result = {};
          const outputDir = path.join(snapshotsDir, "__diff_output__");
          const diffOutputPath = path.join(
            outputDir,
            `${snapshotIdentifier}-diff.png`
          );

          const defaultDiffConfig = {
            threshold: 0.01,
          };

          const diffConfig = Object.assign(
            {},
            defaultDiffConfig,
            customDiffConfig
          );

          const rawReceivedImage = PNG.sync.read(
            fs.readFileSync(receivedImageBuffer)
          );
          const rawBaselineImage = PNG.sync.read(
            fs.readFileSync(snapshotImageBuffer)
          );
          const hasSizeMismatch =
            rawReceivedImage.height !== rawBaselineImage.height ||
            rawReceivedImage.width !== rawBaselineImage.width;
          // Align images in size if different
          const [receivedImage, baselineImage] = hasSizeMismatch
            ? alignImagesToSameSize(rawReceivedImage, rawBaselineImage)
            : [rawReceivedImage, rawBaselineImage];
          const imageWidth = receivedImage.width;
          const imageHeight = receivedImage.height;
          const diffImage = new PNG({ width: imageWidth, height: imageHeight });

          const diffPixelCount = pixelmatch(
            receivedImage.data,
            baselineImage.data,
            diffImage.data,
            imageWidth,
            imageHeight,
            diffConfig
          );

          const totalPixels = imageWidth * imageHeight;
          const diffRatio = diffPixelCount / totalPixels;

          let pass = false;
          if (hasSizeMismatch) {
            // Always fail test on image size mismatch
            pass = false;
          } else if (failureThresholdType === "pixel") {
            pass = diffPixelCount <= failureThreshold;
          } else if (failureThresholdType === "percent") {
            pass = diffRatio <= failureThreshold;
          } else {
            throw new Error(
              `Unknown failureThresholdType: ${failureThresholdType}. Valid options are "pixel" or "percent".`
            );
          }

          if (!pass) {
            mkdirp.sync(outputDir);
            const compositeResultImage = new PNG({
              width: imageWidth * 3,
              height: imageHeight,
            });
            // Copy baseline, diff, and received images into composite result image
            PNG.bitblt(
              baselineImage,
              compositeResultImage,
              0,
              0,
              imageWidth,
              imageHeight,
              0,
              0
            );
            PNG.bitblt(
              diffImage,
              compositeResultImage,
              0,
              0,
              imageWidth,
              imageHeight,
              imageWidth,
              0
            );
            PNG.bitblt(
              receivedImage,
              compositeResultImage,
              0,
              0,
              imageWidth,
              imageHeight,
              imageWidth * 2,
              0
            );

            // Write diff file
            fs.writeFileSync(
              diffOutputPath,
              PNG.sync.write(compositeResultImage)
            );
          }

          result = {
            pass,
            diffOutputPath,
            diffRatio,
            diffPixelCount,
          };

          return result;
        }

        return diffImageToSnapshot({
          receivedImageBuffer,
          snapshotImageBuffer,
          snapshotIdentifier,
          snapshotsDir,
          customDiffConfig,
          failureThreshold,
          failureThresholdType,
        });
      },
      readFileMaybe: (filename) => {
        if (fs.existsSync(filename)) {
          return fs.readFileSync(filename, "utf8");
        } else {
          return null;
        }
      },
    });
};
