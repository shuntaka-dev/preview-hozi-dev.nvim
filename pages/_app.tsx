import { AppProps } from 'next/app';
import '../styles/style.css';
import '@hozi-dev/content-css';

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return <Component {...pageProps} />;
};

export default MyApp;
