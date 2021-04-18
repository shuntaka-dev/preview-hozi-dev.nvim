import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Head from 'next/head';
import tocbot from 'tocbot';

import 'swagger-ui-react/swagger-ui.css';
import styles from '../styles/index.module.scss';

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
    });

    if (data?.hoziDev?.content) {
      tocbot.init({
        tocSelector: '.toc',
        contentSelector: `.hozi-dev-article-content`,
        headingSelector: 'h1, h2, h3',
        scrollSmooth: false,
        activeLinkClass: styles.isActiveLi,
        listClass: styles.listClass,
        headingsOffset: -110,
        listItemClass: styles.listItemClass,
        collapsibleClass: styles.collapsibleClass,
        isCollapsedClass: styles.isCollapsedClass,
      });
    }
  }, [data]);

  return (
    <>
      {data?.hoziDev?.content
        ? (() => {
            return (
              <div>
                <Head>
                  <title>Live|{data.hoziDev.title}</title>
                  <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                  />
                  <link rel="shortcut icon" href="/assets/icon.png" />
                  <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/destyle.css@2.0.2/destyle.css"
                  />
                </Head>
                <div className={styles.title}>{data?.hoziDev?.title}</div>
                <hr />
                <br />
                <div className={styles.editor}>
                  <div className={styles.content}>
                    <div className="hozi-dev-article-content">
                      <div
                        className="hozi-dev-article-content-light"
                        dangerouslySetInnerHTML={{
                          __html: data.hoziDev.content,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className={styles.rightSideBar}>
                    <div className="toc" id={styles.toc}></div>
                  </div>
                </div>
              </div>
            );
          })()
        : 'データが存在しません'}
    </>
  );
};

export default TopPage;
