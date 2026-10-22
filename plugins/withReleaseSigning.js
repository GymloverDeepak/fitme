// Expo config plugin: signs release builds with FITME's private release key.
//
// The generated android/ folder is recreated on every `npx expo prebuild --clean`, so the signing setup
// lives here instead. No secrets are stored in the project — values come from Gradle properties
// (e.g. %USERPROFILE%\.gradle\gradle.properties) or environment variables:
//   FITME_UPLOAD_STORE_FILE, FITME_UPLOAD_KEY_ALIAS, FITME_UPLOAD_STORE_PASSWORD, FITME_UPLOAD_KEY_PASSWORD
// scripts/build-release.ps1 provides the passwords at build time.
// If they are missing, the release build falls back to the debug key and prints a loud warning.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// FITME release signing';

const SIGNING_CONFIG = `
        release {
            ${MARKER}
            def fitmeStore = findProperty('FITME_UPLOAD_STORE_FILE') ?: System.getenv('FITME_UPLOAD_STORE_FILE')
            if (fitmeStore) {
                storeFile file(fitmeStore)
                storePassword findProperty('FITME_UPLOAD_STORE_PASSWORD') ?: System.getenv('FITME_UPLOAD_STORE_PASSWORD')
                keyAlias findProperty('FITME_UPLOAD_KEY_ALIAS') ?: System.getenv('FITME_UPLOAD_KEY_ALIAS')
                keyPassword findProperty('FITME_UPLOAD_KEY_PASSWORD') ?: System.getenv('FITME_UPLOAD_KEY_PASSWORD') ?: findProperty('FITME_UPLOAD_STORE_PASSWORD') ?: System.getenv('FITME_UPLOAD_STORE_PASSWORD')
            }
        }`;

const READY_EXPRESSION =
  "((findProperty('FITME_UPLOAD_STORE_FILE') ?: System.getenv('FITME_UPLOAD_STORE_FILE')) && " +
  "(findProperty('FITME_UPLOAD_STORE_PASSWORD') ?: System.getenv('FITME_UPLOAD_STORE_PASSWORD')))";

const WARNING_HOOK = `
${MARKER}: warn loudly when a release build is not signed with the FITME release key.
afterEvaluate {
    if (!${READY_EXPRESSION}) {
        logger.warn("WARNING: FITME release signing is NOT configured - this release APK uses the public DEBUG key and must not be distributed. Use scripts/build-release.ps1.")
    }
}
`;

function addReleaseSigning(contents) {
  if (contents.includes(MARKER)) return contents;

  const debugConfig = /(signingConfigs \{\s*debug \{[^}]*\})/;
  if (!debugConfig.test(contents)) throw new Error('withReleaseSigning: could not find signingConfigs.debug in app/build.gradle');
  let next = contents.replace(debugConfig, `$1${SIGNING_CONFIG}`);

  const releaseBlock = /(release \{\s*(?:\/\/[^\n]*\n\s*)*)signingConfig signingConfigs\.debug/;
  if (!releaseBlock.test(next)) throw new Error('withReleaseSigning: could not find the release build type signingConfig in app/build.gradle');
  // Parentheses around the whole ternary: Groovy would otherwise read `signingConfig (a) ? b : c` as `signingConfig(a)`.
  next = next.replace(releaseBlock, `$1signingConfig(${READY_EXPRESSION} ? signingConfigs.release : signingConfigs.debug)`);

  return next + WARNING_HOOK;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language !== 'groovy') {
      throw new Error('withReleaseSigning: expected a Groovy app/build.gradle');
    }
    modConfig.modResults.contents = addReleaseSigning(modConfig.modResults.contents);
    return modConfig;
  });
};
