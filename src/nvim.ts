import { getModuleLogger } from './util/logger';
import * as attach from './attach';

const address = process.env.NVIM_LISTEN_ADDRESS || '/tmp/nvim';
const logger = getModuleLogger();

export const initPlugin = async (): Promise<attach.Plugin> => {
  const plugin: attach.Plugin = await attach.createPlugin({
    socket: address,
  });

  const MSG_PREFIX = '[hozidev.vim]';

  process.on('uncaughtException', function (err) {
    const msg = `${MSG_PREFIX} uncaught exception: ` + err.stack;
    if (plugin.nvim) {
      plugin.nvim.call('hozidev#util#echo_messages', [
        'Error',
        msg.split('\n'),
      ]);
    }
    logger.error('uncaughtException', err.stack);
  });

  process.on('unhandledRejection', function (reason, p) {
    if (plugin.nvim) {
      plugin.nvim.call('hozidev#util#echo_messages', [
        'Error',
        [`${MSG_PREFIX} UnhandledRejection`, `${reason}`],
      ]);
    }
    logger.error('unhandledRejection ', p, reason);
  });

  return plugin;
};
