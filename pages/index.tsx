import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Head from 'next/head';
import SwaggerUI from 'swagger-ui-react';
import jsYaml from 'js-yaml';
import 'swagger-ui-react/swagger-ui.css';

type RefreshContent = {
  dataType: 'hoziDev' | 'swagger' | 'html';
  hoziDev?: {
    title: string;
    content: string;
  };
  swagger?: {
    content: string;
  };
  html?: {
    content: string;
  };
};

const TopPage: React.VFC = () => {
  const [socket] = useState(() => io());
  const [data, setData] = useState<RefreshContent>();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connect!');
    });
    socket.on('disconnect', () => {
      console.log('connect!');
    });
    socket.on('refresh_content', (refreshContent: RefreshContent) => {
      setData(refreshContent);
      if (data?.dataType === 'swagger') {
        console.log(`saggerdata: ${JSON.stringify(data)}`);
      }
    });
  });

  return (
    <>
      {(() => {
        if (data?.dataType === 'hoziDev') {
          return (
            <div>
              <Head>
                <title>Preview| {data.hoziDev.title}</title>
                <meta
                  name="viewport"
                  content="initial-scale=1.0, width=device-width"
                />
                <link rel="shortcut icon" href="/assets/icon.png" />
              </Head>
              <div className="title">{data.hoziDev.title}</div>
              <hr />
              <br />
              <div className="editor">
                <div
                  className="hozi-dev-article-content"
                  dangerouslySetInnerHTML={{
                    __html: data.hoziDev.content,
                  }}
                ></div>
              </div>
            </div>
          );
        } else if (data?.dataType === 'swagger') {
          return <SwaggerUI spec={jsYaml.safeLoad(data.swagger.content)} />;
        } else if (data?.dataType === 'html') {
          return (
            <div
              dangerouslySetInnerHTML={{
                __html: data.html.content,
              }}
            />
          );
        } else {
          <div>適切なプレビューが出来ませんでした</div>;
        }
      })()}
    </>
  );
};

export default TopPage;
