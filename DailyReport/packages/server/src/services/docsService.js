const fs = require("fs/promises");
const path = require("path");
const { config } = require("../config");

const ALLOWED_EXTENSIONS = new Set([".md", ".txt"]);

const getPersonalSources = async () => {
  const sourcesDir = config.content.sourcesDir;

  try {
    const entries = await fs.readdir(sourcesDir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()));

    const sources = [];
    for (const fileName of files) {
      const filePath = path.join(sourcesDir, fileName);
      const content = await fs.readFile(filePath, "utf-8");
      if (content.trim()) {
        sources.push({ name: fileName, content });
      }
    }

    return sources;
  } catch (error) {
    return [];
  }
};

module.exports = { getPersonalSources };
