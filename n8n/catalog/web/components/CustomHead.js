import Head from 'next/head';

export default function CustomHead({ title, description }) {
  return (
    <Head>
      <title>{title ? `${title} | Catálogo Web` : 'Catálogo Web'}</title>
      <meta name="description" content={description || 'Catálogo de produtos online, fácil e rápido!'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      {/* SEO e OpenGraph */}
      <meta property="og:title" content={title || 'Catálogo Web'} />
      <meta property="og:description" content={description || 'Catálogo de produtos online, fácil e rápido!'} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/banner.png" />
    </Head>
  );
}
