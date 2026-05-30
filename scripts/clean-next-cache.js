const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const target = path.join(workspace, '.next');
const resolvedTarget = path.resolve(target);

if (!resolvedTarget.startsWith(workspace + path.sep)) {
  throw new Error(`Refusing to delete outside workspace: ${resolvedTarget}`);
}

if (fs.existsSync(resolvedTarget)) {
  fs.rmSync(resolvedTarget, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 200,
  });
  console.log('Cleared .next cache');
}
