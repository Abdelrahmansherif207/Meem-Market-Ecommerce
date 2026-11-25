import Script from "next/script";

/**
 * GTM loader — mounted once in the locale root layout.
 *
 * - The container id comes from `NEXT_PUBLIC_GTM_ID`. When it is missing or
 *   malformed, nothing is rendered and the app behaves as analytics-free.
 * - Standard GTM bootstrap via `next/script` inline script. `afterInteractive`
 *   (the default) keeps GTM out of the critical path while still firing
 *   before user interactions complete; `id` is required for inline scripts.
 * - The `<noscript>` iframe is the standard GTM fallback for bots/blocked JS.
 * - Consent: intentionally not implemented (not required for this store).
 */

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

export function GtmScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();

  if (!gtmId) return null;
  if (!GTM_ID_PATTERN.test(gtmId)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[analytics] Ignoring malformed NEXT_PUBLIC_GTM_ID: ${gtmId}`);
    }
    return null;
  }

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
