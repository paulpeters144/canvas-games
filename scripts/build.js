import { execSync } from "node:child_process";
import fs from "node:fs";

function processBuildOutput() {
   const buildDir = "build";
   const clientDir = `${buildDir}/client`;

   console.info('1. Running "npm run build" (this might take a while)...');
   try {
      execSync("npm run build", { stdio: "inherit" });
      console.info('"npm run build" completed.');

      if (fs.existsSync(clientDir)) {
         console.info(`2. Moving contents from "${clientDir}" to "${buildDir}"...`);

         const itemsToMove = fs.readdirSync(clientDir);

         for (const item of itemsToMove) {
            const sourcePath = `${clientDir}/${item}`;
            const destinationPath = `${buildDir}/${item}`;

            const stats = fs.statSync(sourcePath);

            if (stats.isFile()) {
               fs.copyFileSync(sourcePath, destinationPath);
               fs.unlinkSync(sourcePath);
               console.info(`   - Moved file: ${item}`);
            } else if (stats.isDirectory()) {
               fs.renameSync(sourcePath, destinationPath);
               console.info(`   - Moved directory: ${item}`);
            }
         }

         console.info(`3. Deleting empty "${clientDir}" folder...`);
         fs.rmSync(clientDir, { recursive: true, force: true });
         console.info('Cleanup complete. Build output is now directly in the "build" folder.');
      } else {
         console.info(
            `"${clientDir}" not found. Assuming build output is already directly in "build".`,
         );
      }

      console.info("Script finished successfully!");
   } catch (error) {
      console.error("An error occurred during the process:");
      console.error(error.message);
      if (error.stderr) {
         console.error("Stderr:", error.stderr.toString());
      }
      process.exit(1);
   }
}

processBuildOutput();
