const fs = require('fs');
const path = require('path');

console.log('Clearing Next.js cache...');

// Try to remove .next directory
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ .next directory removed');
  } else {
    console.log('ℹ️ .next directory not found');
  }
} catch (error) {
  console.log('⚠️ Could not remove .next directory:', error.message);
}

// Try to remove node_modules/.cache
try {
  const cacheDir = path.join('node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ node_modules/.cache removed');
  } else {
    console.log('ℹ️ node_modules/.cache not found');
  }
} catch (error) {
  console.log('⚠️ Could not remove node_modules/.cache:', error.message);
}

console.log('Cache clearing complete!');

