import { attach, NeovimClient } from 'neovim';
import { Attach } from 'neovim/lib/attach/attach';

import { getModuleLogger } from '../util/logger';

const logger = getModuleLogger();

interface Action {
  openBrowser: (url: string) => void;
  refreshContent: (bufnr: number) => void;
}

export interface Plugin {
  init: (action: Action) => void;
  nvim: NeovimClient;
}

export const createPlugin = async (options: Attach): Promise<Plugin> => {
  const nvim: NeovimClient = attach(options);
  const channelId = await nvim.channelId;
  await nvim.setVar('hozidev_node_channel_id', channelId);

  let action: Action;
  nvim.on('notification', async (method: string) => {
    if (method === 'open_browser') {
      logger.debug(`call method: ${method}`);
      const host = await nvim.getVar('hozidev_lunch_ip');
      const port = await nvim.getVar('hozidev_lunch_port');

      action.openBrowser(`http://${host}:${port}`);
    } else if (method === 'refresh_content') {
      const bufnr = await nvim.call('bufnr', '%');
      logger.debug(`call method: ${method}, bufnr: ${bufnr}`);
      action.refreshContent(bufnr);
    }
  });

  return {
    init: (param: Action): void => {
      action = param;
    },
    nvim: nvim,
  };
};
