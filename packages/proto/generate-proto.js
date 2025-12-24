// packages/proto/generate-proto.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';

const protoPath = path.resolve(__dirname, 'proto');
const outPath = path.resolve(__dirname, 'src', 'generated'); 
const pluginPath = path.resolve(
  __dirname,
  'node_modules',
  '.bin',
  isWindows ? 'protoc-gen-ts_proto.cmd' : 'protoc-gen-ts_proto'
);

if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath, { recursive: true });
}


const protoFiles = fs.readdirSync(protoPath)
  .filter(file => file.endsWith('.proto'))
  .map(file => `"${path.join(protoPath, file)}"`)
  .join(' ');

if (!protoFiles) {
  console.error('No .proto files found in ' + protoPath);
  process.exit(1);
}

const command = [
  'protoc',
  `--plugin=protoc-gen-ts_proto="${pluginPath}"`,
  `--ts_proto_out="${outPath}"`,
  '--ts_proto_opt=nestJs=true,outputClientImpl=true',
  `-I "${protoPath}"`,
  protoFiles
].join(' ');

console.log('Running command:');
console.log(command);

try {
  execSync(command, { stdio: 'inherit' });
  console.log('Proto files generated successfully!');
} catch (error) {
  console.error('Failed to generate proto files.');
  process.exit(1); 
}