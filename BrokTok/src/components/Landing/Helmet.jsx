import { Helmet } from 'react-helmet-async'
export default function SEO({
  title,
  description,
  image,
  url = "https://finan-cino.vercel.app"
}) {
  return (
    <Helmet>
      {/* Title */}
      <title>{title}</title>
      {/* Basic SEO */}
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      {/* Open Graph (WhatsApp, LinkedIn, Facebook) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {/* Canonical */}
      <link rel="canonical" href={url} />
      {/* Favicon */}
      <link rel="icon" href="/financino.svg" />
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Financino",
          "url": url,
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "description": description,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          }
        })}
      </script>
    </Helmet>
  )
}