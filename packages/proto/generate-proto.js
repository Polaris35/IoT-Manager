// packages/proto/generate-proto.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs'); // <--- Добавляем модуль fs

// Определяем, находимся ли мы на Windows
const isWindows = process.platform === 'win32';

// 1. Строим пути, которые будут работать везде
const protoPath = path.resolve(__dirname, 'proto');
const outPath = path.resolve(__dirname, 'src', 'generated'); 
const pluginPath = path.resolve(
  __dirname,
  'node_modules',
  '.bin',
  isWindows ? 'protoc-gen-ts_proto.cmd' : 'protoc-gen-ts_proto'
);

// СОЗДАЕМ ПАПКУ DIST, ЕСЛИ ЕЕ НЕТ
if (!fs.existsSync(outPath)) {
  fs.mkdirSync(outPath, { recursive: true });
}

// 2. Собираем финальную команду
const command = [
  'protoc',
  `--plugin=protoc-gen-ts_proto="${pluginPath}"`,
  `--ts_proto_out="${outPath}"`,
  '--ts_proto_opt=nestJs=true,outputClientImpl=true',
  `-I "${protoPath}"`,
  `"${path.join(protoPath, '*.proto')}"`
].join(' ');

console.log('Running command:');
console.log(command);

try {
  // 3. Запускаем команду
  execSync(command, { stdio: 'inherit' });
  console.log('Proto files generated successfully!');
} catch (error) {
  console.error('Failed to generate proto files.');
  process.exit(1); 
}