import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&display=swap"
          rel="stylesheet"
        />
        <script
          defer
          src="https://umami.clemann.app/script.js"
          data-website-id="80cbc138-1917-4a84-a271-2075b6a0c288"
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
