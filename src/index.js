/**
 * Processes the response from the target server and injects custom HTML modifications
 * using Cloudflare's HTMLRewriter.
 * * @param {Response} response - The original response from the target server.
 * @returns {Promise<Response>} The modified response with injected content and rewritten paths.
 */
async function handleRewrite(response) {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("text/html")) {
    return new HTMLRewriter()
      .on('input[name="entry"]', {
        element(el) {
          el.setAttribute("value", "BOZU Night Fuel");
        },
      })
      .on("form", {
        element(el) {
          el.setAttribute("action", "");
        },
      })
      .on("link, script, img, a", {
        element(el) {
          const attributes = ["src", "href"];
          for (const attr of attributes) {
            const val = el.getAttribute(attr);
            // Match relative paths starting with / but not protocol-relative //
            if (val && val.startsWith("/") && !val.startsWith("//")) {
              el.setAttribute(attr, `https://empty.svcover.nl${val}`);
            }
          }
        },
      })
      .transform(response);
  }
  return response;
}

export default {
  /**
   * Main fetch handler for the Cloudflare Worker.
   * Intercepts requests to givemebozunightfuel.com and proxies them to empty.svcover.nl.
   * * @param {Request} request - Incoming browser request.
   * @param {Object} env - Cloudflare environment variables/bindings.
   * @param {ExecutionContext} ctx - Worker execution context for background tasks.
   * @returns {Promise<Response>} The proxied and modified response.
   */
  async fetch(request, env, ctx) {
    const targetUrl = "https://empty.svcover.nl/";

    // Standard headers for proxying
    const commonHeaders = {
      "User-Agent":
        request.headers.get("User-Agent") ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    let response;

    // Handle Form Submission (POST)
    if (request.method === "POST") {
      const body = await request.formData();
      response = await fetch(targetUrl, {
        method: "POST",
        body: body,
        headers: {
          ...commonHeaders,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
        redirect: "follow",
      });
    }

    // Handle Standard Page Load (GET)
    else {
      response = await fetch(targetUrl, {
        method: "GET",
        headers: commonHeaders,
        redirect: "follow",
      });
    }

    // Process the fetch result through the HTMLRewriter
    const rewrittenResponse = await handleRewrite(response);

    // Wrap the response to add modern security headers.
    const finalResponse = new Response(
      rewrittenResponse.body,
      rewrittenResponse,
    );

    finalResponse.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    finalResponse.headers.set("X-Content-Type-Options", "nosniff");
    finalResponse.headers.set("X-Frame-Options", "SAMEORIGIN");

    return finalResponse;
  },
};
