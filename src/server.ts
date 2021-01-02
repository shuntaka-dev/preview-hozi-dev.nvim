import { Server } from 'socket.io';
import next from 'next';
import express, { Request, Response } from 'express';

import { getModuleLogger } from './util/logger';
import * as nvim from './nvim';
import { openBrowser } from './util/open-browser';
import * as ConvertUseCase from './use-case/convert-use-case';

const logger = getModuleLogger();

const defaultHost = '127.0.0.1';
const defaultPort = 9126;
const lunchIpVimValue = 'hozidev_lunch_ip';
const lunchPortVimValue = 'hozidev_lunch_port';
const pluginRootVimValue = 'hozidev_root_dir';

const main = async (): Promise<void> => {
  const plugin = await nvim.initPlugin();
  const host = await (async () => {
    const hozidevLunchIp = await plugin.nvim.getVar(lunchIpVimValue);
    return hozidevLunchIp ?? defaultHost;
  })();
  const port = await (async () => {
    const hozidevLunchPort = await plugin.nvim.getVar(lunchPortVimValue);
    return hozidevLunchPort ?? defaultPort;
  })();
  const pluginRootDir = (await plugin.nvim.getVar(
    pluginRootVimValue,
  )) as string;

  await plugin.nvim.setVar(lunchIpVimValue, host);
  await plugin.nvim.setVar(lunchPortVimValue, port);

  const connections: { [key: number]: string[] } = {};
  const server = express();

  const nextApp = next({
    dir: pluginRootDir,
    dev: false,
  });
  nextApp.prepare();

  const handle = nextApp.getRequestHandler();
  server.all('*', async (req: Request, res: Response) => {
    return handle(req, res);
  });

  const httpServer = server.listen(port, () => {
    plugin.init({
      openBrowser: async (url) => {
        openBrowser(url);
      },
      refreshContent: async (bufnr) => {
        const fileFullPath = await plugin.nvim.call('expand', '%:p');
        const bufferRows = await plugin.nvim.buffer.getLines();
        logger.debug(`fileFullPath ${fileFullPath}`);

        const hoziDevContent = ConvertUseCase.convertHoziDevHtmlFromMd(
          bufferRows.join('\n'),
        );

        connections[bufnr].forEach((id) => {
          io.to(id).emit('refresh_content', hoziDevContent);
        });
      },
    });

    plugin.nvim.call('hozidev#rpc#open_browser');
  });

  const io = new Server(httpServer);

  io.on('connection', async (socket) => {
    console.log('id: ' + socket.id + ' is connected');
    const bufnr = (await plugin.nvim.call('bufnr', '%')) as number;
    connections[bufnr]
      ? connections[bufnr].push(socket.id)
      : (connections[bufnr] = [socket.id]);

    logger.debug(`connected: ${JSON.stringify(connections)}`);
    await plugin.nvim.call('hozidev#rpc#refresh_content');

    socket.on('disconnect', () => {
      logger.debug('disconnected');
    });
  });
};

main()
  .then(() => logger.debug('process finish'))
  .catch((err) => logger.debug(`process error: ${err}`));
