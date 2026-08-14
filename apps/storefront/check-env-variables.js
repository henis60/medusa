const c = require("ansi-colors");

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
];

// Not fatal, but a missing value has a confusing symptom worth naming up front
// rather than leaving someone to debug it from a blank page.
const recommendedEnvs = [
  {
    key: "NEXT_PUBLIC_MEDIA_URL",
    description:
      "Public base URL of this environment's media bucket — set it to the same value as the backend's S3_FILE_URL. " +
      "Without it, next/image and the CSP only allow the media.thehunter.ro custom domain, so any product image " +
      "served straight from a bucket URL will fail to load.",
  },
];

function checkEnvVariables() {
  const missingRecommended = recommendedEnvs.filter(function (env) {
    return !process.env[env.key];
  });

  if (missingRecommended.length > 0) {
    console.warn(
      c.yellow.bold("\n⚠️  Warning: Missing recommended environment variables\n")
    );
    missingRecommended.forEach(function (env) {
      console.warn(c.yellow(`  ${c.bold(env.key)}`));
      if (env.description) {
        console.warn(c.dim(`    ${env.description}\n`));
      }
    });
  }

  const missingEnvs = requiredEnvs.filter(function (env) {
    c;
    return !process.env[env.key];
  });

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    );

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`));
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`));
      }
    });

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    );

    process.exit(1);
  }
}

module.exports = checkEnvVariables;
