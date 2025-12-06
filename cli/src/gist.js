/**
 * Fetch and parse a GitHub Gist
 */

export async function fetchGist(gistId) {
  const url = `https://api.github.com/gists/${gistId}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'vibeship-cli'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Gist not found: ${gistId}`);
    }
    throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
  }

  const gist = await response.json();
  return gist;
}

export function parseGistConfig(gist) {
  // Find the config file in the gist
  const files = Object.values(gist.files);

  // Look for vibeship-config.json or any .json file
  let configFile = files.find(f => f.filename === 'vibeship-config.json');
  if (!configFile) {
    configFile = files.find(f => f.filename.endsWith('.json'));
  }

  if (!configFile) {
    throw new Error('No config file found in gist. Expected vibeship-config.json');
  }

  try {
    const config = JSON.parse(configFile.content);
    return validateConfig(config);
  } catch (e) {
    throw new Error(`Invalid JSON in config file: ${e.message}`);
  }
}

export function validateConfig(config) {
  const required = ['project_name', 'agents'];

  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required field in config: ${field}`);
    }
  }

  // Ensure arrays
  config.agents = config.agents || [];
  config.mcps = config.mcps || [];
  config.behaviors = config.behaviors || { mandatory: [], selected: [] };
  config.custom_skills_needed = config.custom_skills_needed || [];

  return config;
}
