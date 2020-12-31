import * as http from 'http';

import { Server } from 'socket.io';

import { getModuleLogger } from './util/logger';
import { initPlugin } from './nvim';
import { openBrowser } from './util/open-browser';
import { routes } from './route';
import * as ConvertHtml from './util/convert-html';

const logger = getModuleLogger();

const main = async (): Promise<void> => {
  const server = http.createServer((req, res) => {
    routes(req, res);
  });

  const defaultHost = '127.0.0.1';
  const defaultPort = 9126;

  let host = defaultHost;
  let port = defaultPort;

  const plugin = await initPlugin();
  const hozidevLunchIp = await plugin.nvim.getVar('hozidev_lunch_ip');
  const hozidevLunchPort = await plugin.nvim.getVar('hozidev_lunch_port');

  if (hozidevLunchIp != null) host = hozidevLunchIp as string;
  if (hozidevLunchPort != null) port = hozidevLunchPort as number;

  await plugin.nvim.setVar('hozidev_lunch_ip', host);
  await plugin.nvim.setVar('hozidev_lunch_port', port);

  const connections: { [key: number]: string[] } = {};

  const io = new Server(server);
  io.on('connection', async (socket) => {
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

  server.listen(
    port,
    host,
    async (): Promise<void> => {
      plugin.init({
        openBrowser: async (url) => {
          openBrowser(url);
        },
        refreshContent: async (bufnr) => {
          const fileFullPath = await plugin.nvim.call('expand', '%:p');
          const bufferRows = await plugin.nvim.buffer.getLines();
          const html = ConvertHtml.convertHoziDevContent({
            bufferRows: bufferRows,
            fileFullPath: fileFullPath,
          });
          connections[bufnr].forEach((id) => {
            logger.debug(`refresh_content:${id}`);
            logger.debug(`get_html;${html}`);

            io.to(id).emit('refresh_content', html);
          });
        },
      });

      plugin.nvim.call('hozidev#rpc#open_browser');
    },
  );
};

main()
  .then(() => logger.debug('process finish'))
  .catch((err) => logger.debug(`process error: ${err}`));
