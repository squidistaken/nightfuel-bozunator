export default {
  async fetch(request, env, ctx) {
    const targetUrl = "https://empty.svcover.nl/";
    const url = new URL(request.url);

    // 1. Handle Form Submission (POST)
    // If the user clicks "Report", we catch the POST and forward it to the real server
    if (request.method === "POST") {
      const body = await request.formData();
      
      // We forward the POST request to the original server
      const postResponse = await fetch(targetUrl, {
        method: "POST",
        body: body,
        headers: {
          "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
          // We don't forward the Host header to avoid security blocks
        }
      });

      // After the real server processes the post, we return its response 
      // but we still need to run the rewriter to keep the styling and prefill
      return this.rewriteResponse(postResponse);
    }

    // 2. Handle Page Load (GET)
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
      }
    });

    return this.rewriteResponse(response);
  },

  // Helper function to clean up the HTML and inject the prefill
  rewriteResponse(response) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      return new HTMLRewriter()
        // Prefill the value
        .on('input[name="entry"]', {
          element(el) {
            el.setAttribute('value', 'BOZU Night Fuel');
          }
        })
        // Remove the action so it posts back to YOUR domain (handled in step 1 above)
        .on('form', {
          element(el) {
            el.setAttribute('action', '');
          }
        })
        // Fix relative links (CSS/JS/Images)
        .on('link, script, img, a', {
          element(el) {
            const attributes = ['src', 'href'];
            for (const attr of attributes) {
              const val = el.getAttribute(attr);
              if (val && val.startsWith('/') && !val.startsWith('//')) {
                el.setAttribute(attr, `https://empty.svcover.nl${val}`);
              }
            }
          }
        })
        .transform(response);
    }
    return response;
  }
};