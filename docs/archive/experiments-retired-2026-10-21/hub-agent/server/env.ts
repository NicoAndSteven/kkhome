import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, '..', '.env');

/**
 * 极简 .env 加载器：避免为了读一个文件引入 dotenv 依赖。
 *
 * - 只读取项目根目录的 .env
 * - 已经存在的环境变量优先（命令行/CI 注入的值不会被覆盖）
 * - 支持 # 注释、KEY=VALUE、以及可选的引号包裹
 */
export function loadEnvFile(): void {
  if (!fs.existsSync(ENV_PATH)) return;

  let raw: string;
  try {
    raw = fs.readFileSync(ENV_PATH, 'utf-8');
  } catch (error) {
    console.warn('[Env] 读取 .env 失败:', error);
    return;
  }

  let loaded = 0;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // 去掉配对的引号
    if (value.length >= 2) {
      const first = value[0];
      const last = value[value.length - 1];
      if ((first === '"' || first === "'") && first === last) {
        value = value.slice(1, -1);
      }
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
      loaded++;
    }
  }

  if (loaded > 0) {
    console.log(`[Env] 已从 .env 载入 ${loaded} 个环境变量`);
  }
}
