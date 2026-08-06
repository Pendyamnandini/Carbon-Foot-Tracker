const { spawn } = require('child_process');

console.log('Starting Bubblewrap Doctor with pre-configured JDK path...');

const child = spawn('cmd.exe', ['/c', 'npx', '-y', '@bubblewrap/cli', 'doctor']);

child.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);

  // Check for prompts
  if (output.includes('Do you want Bubblewrap to install the Android SDK')) {
    console.log('\n[Automator] Answering Yes to Android SDK install prompt...');
    child.stdin.write('Y\n');
  }

  if (output.includes('Do you accept the license agreement') || output.includes('Do you accept the license')) {
    console.log('\n[Automator] Answering Yes to License agreement prompt...');
    child.stdin.write('Y\n');
  }
  
  if (output.includes('Do you want Bubblewrap to install the JDK')) {
    console.log('\n[Automator] Answering Yes to JDK install prompt...');
    child.stdin.write('Y\n');
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  console.log(`\nBubblewrap Doctor process exited with code ${code}`);
});
