import { Bot } from 'grammy';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function fmtDate(ms: number): string {
  const d = new Date(ms);
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const day = pad(d.getDate());

  return `${h}:${m}:${s} ${day}.${month}.${year}`;
}

function fmtDur(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return `${h}:${pad(m)}:${pad(sec)}`;
}

function percent(n: number, total: number): string {
  return total ? ((n / total) * 100).toFixed(2) : '0.00';
}

export async function sendTelegramReport(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_ACCESS_TOKEN;
  const chatId = process.env.TELEGRAM_BOT_CHAT_ID;

  if (!token || !chatId) return;

  const bot = new Bot(token);
  const root = path.resolve(__dirname, '../..');
  const summaryPath = path.join(root, 'allure-report', 'widgets', 'summary.json');

  let data: any;

  try {
    data = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  } catch {
    await bot.api.sendMessage(chatId, '❌ Не удалось прочитать Allure summary.json');
    return;
  }

  const st = data.statistic || {};
  const time = data.time || {};
  const total = st.total ?? st.passed + st.failed + st.skipped + st.broken + st.unknown;
  const failedAll = (st.failed || 0) + (st.broken || 0);

  const lines = [
    '---------- Test report ----------',
    '🕘 Datetime start testing:',
    fmtDate(time.start),
    '🕙 Datetime end testing:',
    fmtDate(time.stop),
    '🕙 Test duration:',
    fmtDur((time.stop || 0) - (time.start || 0)),
    '',
    `🎮 Count tests: ${total}`,
    `🔴 Tests failed: ${failedAll}`,
    `🟢 Tests passed: ${st.passed || 0}`,
    `🟢 Tests skipped: ${st.skipped || 0}`,
    '',
    `# Percentage of tests passed: ${percent(st.passed || 0, total)}%`,
    `# Percentage of tests failed: ${percent(failedAll, total)}%`,
    `# Percentage of tests skipped: ${percent(st.skipped || 0, total)}%`,
    '',
    '',
    '------- Additional fields -------',
    'report: https://flower1power.github.io/API_TS_PW/',
  ];

  if (process.env.REPORT_ENV) lines.push(`▪ enviroment: ${process.env.REPORT_ENV}`);
  if (process.env.REPORT_URL) lines.push(`▪ report: ${process.env.REPORT_URL}`);

  lines.push('', 'I CALL: -');

  const stickerOk = 'CAACAgIAAxkBAAEHLwhuj9603ykDs1koRNLhtXScXBl-ygACNwADxrpkA4PqaByeU1kyLQQ';
  const stickerFail = 'CAACAgIAAxkBAAEHLwzju96jPuGKRaneTpNOu-Rh0jtiAACMgADxrpkA-VxdzgJnnpLQQ';
  await bot.api.sendSticker(chatId, failedAll > 0 ? stickerFail : stickerOk);
  await bot.api.sendMessage(chatId, lines.join('\n'));
}

if (require.main === module) {
  void sendTelegramReport();
}
