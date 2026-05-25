const path = require("node:path");

const backendDirectory = path.join(__dirname, "backend");

module.exports = {
  apps: [
    {
      name: "prism-backend",
      cwd: backendDirectory,
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      out_file: "logs/prism-out.log",
      error_file: "logs/prism-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3000",
        MONGODB_URI: process.env.MONGODB_URI || "<SET_MONGODB_URI>",
        FRONTEND_URL: process.env.FRONTEND_URL || "<SET_FRONTEND_URL>",
        PUBLIC_API_URL: process.env.PUBLIC_API_URL || "<SET_PUBLIC_API_URL>",
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "<SET_GITHUB_CLIENT_ID>",
        GITHUB_CLIENT_SECRET:
          process.env.GITHUB_CLIENT_SECRET || "<SET_GITHUB_CLIENT_SECRET>",
        GITHUB_CALLBACK_URL:
          process.env.GITHUB_CALLBACK_URL || "<SET_GITHUB_CALLBACK_URL>",
        GITHUB_WEBHOOK_SECRET:
          process.env.GITHUB_WEBHOOK_SECRET || "<SET_GITHUB_WEBHOOK_SECRET>",
        OPENROUTER_API_KEY:
          process.env.OPENROUTER_API_KEY || "<SET_OPENROUTER_API_KEY>",
        JWT_SECRET: process.env.JWT_SECRET || "<SET_JWT_SECRET>",
      },
    },
  ],
};

