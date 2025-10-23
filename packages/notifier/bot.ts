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

  console.log('🔍 Переменные окружения:');
  console.log('- DEPLOYMENT_STATUS:', process.env.DEPLOYMENT_STATUS || 'не установлен');
  console.log('- REPORT_ENV:', process.env.REPORT_ENV || 'не установлен');
  console.log('- PROJECT:', process.env.PROJECT || 'не установлен');
  console.log('- WORKERS:', process.env.WORKERS || 'не установлен');
  console.log('- GITHUB_ACTOR:', process.env.GITHUB_ACTOR || 'не установлен');

  if (!token || !chatId) {
    console.error('❌ TELEGRAM_BOT_ACCESS_TOKEN или TELEGRAM_BOT_CHAT_ID не установлены');
    return;
  }

  const bot = new Bot(token);
  const root = path.resolve(__dirname, '../..');
  const summaryPath = path.join(root, 'allure-report', 'widgets', 'summary.json');

  let data: any;

  try {
    data = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  } catch (error) {
    console.error('❌ Ошибка чтения summary.json:', error);
    await bot.api.sendMessage(
      chatId,
      '❌ Не удалось прочитать Allure summary.json\n' +
        `Возможно, тесты не завершились или отчет не сгенерировался.\n\n` +
        (process.env.WORKFLOW_URL ? `🔗 Workflow: ${process.env.WORKFLOW_URL}` : ''),
    );
    return;
  }

  const st = data.statistic || {};
  const time = data.time || {};
  const total = st.total ?? st.passed + st.failed + st.skipped + st.broken + st.unknown;
  const failedAll = (st.failed || 0) + (st.broken || 0);

  // Определяем статус и эмодзи
  const status = process.env.DEPLOYMENT_STATUS || 'completed';
  const statusEmoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : '✅';
  const isSuccess = failedAll === 0 && total > 0;

  const lines = [
    `${statusEmoji} ========== Test Report ==========`,
    '',
    '📊 **Результаты тестирования:**',
    `🎮 Всего тестов: ${total}`,
    `${isSuccess ? '✅' : '❌'} Passed: ${st.passed || 0} (${percent(st.passed || 0, total)}%)`,
    `${failedAll > 0 ? '🔴' : '⚪'} Failed: ${failedAll} (${percent(failedAll, total)}%)`,
    `⏭️ Skipped: ${st.skipped || 0} (${percent(st.skipped || 0, total)}%)`,
    '',
    '⏱️ **Время выполнения:**',
    `📅 Начало: ${fmtDate(time.start)}`,
    `📅 Конец: ${fmtDate(time.stop)}`,
    `⏳ Длительность: ${fmtDur((time.stop || 0) - (time.start || 0))}`,
    '',
    '🔧 **Конфигурация:**',
  ];

  if (process.env.REPORT_ENV) lines.push(`▪️ Environment: ${process.env.REPORT_ENV}`);
  if (process.env.PROJECT) lines.push(`▪️ Project: ${process.env.PROJECT}`);
  if (process.env.WORKERS) lines.push(`▪️ Workers: ${process.env.WORKERS}`);
  if (process.env.GITHUB_ACTOR) lines.push(`▪️ Запустил: @${process.env.GITHUB_ACTOR}`);

  lines.push('', '🔗 **Ссылки:**');
  if (process.env.REPORT_URL) lines.push(`📊 Отчет: ${process.env.REPORT_URL}`);
  if (process.env.WORKFLOW_URL) lines.push(`🔄 Workflow: ${process.env.WORKFLOW_URL}`);

  lines.push('');
  if (status === 'success' || status === 'failed') {
    lines.push(`${statusEmoji} Статус: ${status.toUpperCase()}`);
  }

  const stickerOk = 'CAACAgIAAxkBAAEHLwhuj9603ykDs1koRNLhtXScXBl-ygACNwADxrpkA4PqaByeU1kyLQQ';
  const stickerFail = 'CAACAgIAAxkBAAEHLwzju96jPuGKRaneTpNOu-Rh0jtiAACMgADxrpkA-VxdzgJnnpLQQ';

  try {
    await bot.api.sendSticker(chatId, isSuccess ? stickerOk : stickerFail);
    await bot.api.sendMessage(chatId, lines.join('\n'), { parse_mode: 'Markdown' });
    console.log('✅ Уведомление отправлено в Telegram');
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error);
    throw error;
  }
}

if (require.main === module) {
  void sendTelegramReport();
}
