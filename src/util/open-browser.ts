import * as childProcess from 'child_process';

export class OpenBrowserError extends Error {
  public constructor() {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenBrowserError);
    }
    this.name = this.constructor.name;
  }
}

export class OpenBrowserUnsupportedPlatformError extends OpenBrowserError {
  public constructor(platform: string) {
    super();
    this.message = platform;
    this.name = this.constructor.name;
  }
}

export const openBrowser = (url: string): void => {
  const platform = process.platform;
  const args = [];
  args.push(url);

  const executeCmd = (() => {
    if (platform === 'darwin') {
      return 'open';
    } else {
      throw new OpenBrowserUnsupportedPlatformError(platform);
    }
  })();

  childProcess.spawn(executeCmd, args, {
    detached: true,
  });
};
