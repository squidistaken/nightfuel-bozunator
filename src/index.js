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
  async fetch(request, env, ctx) {
    const targetUrl = "https://empty.svcover.nl/";

    if (request.method === "POST") {
      const body = await request.formData();
      const postResponse = await fetch(targetUrl, {
        method: "POST",
        body: body,
        headers: {
          "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
      });

      return handleRewrite(postResponse);
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
      },
    });

    return handleRewrite(response);
  },
};
