import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Head from 'next/head';

type HoziDevContent = { title: string; content: string };

const TopPage: React.VFC = () => {
  const [socket] = useState(() => io());
  const [dataType, setDataType] = useState<string>('');
  const [data, setData] = useState<HoziDevContent>({
    title: '指定されていません',
    content: '指定されていません',
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connect!');
    });
    socket.on('disconnect', () => {
      console.log('connect!');
    });
    socket.on('refresh_content', (data: HoziDevContent) => {
      setData(data);
    });
  });

  return (
    <>
      <Head>
        <title>Preview|{data.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/assets/icon.png" />
      </Head>
      <div className="title">{data.title}</div>
      <hr />
      <br />
      <div className="editor">
        <div
          className="hozi-dev-article-content"
          dangerouslySetInnerHTML={{
            __html: data.content,
          }}
        ></div>
      </div>
    </>
  );
};

export default TopPage;
