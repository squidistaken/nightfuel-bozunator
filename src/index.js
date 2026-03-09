export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("text/html")) {
      const url = new URL(request.url);
      const prefillValue = url.searchParams.get('entry');

      // If there's an 'entry' in the URL, inject it into the input field
      if (prefillValue) {
        return new HTMLRewriter()
          .on('input[name="entry"]', {
            element(el) {
              el.setAttribute('value', prefillValue);
            }
          })
          .transform(response);
      }
    }

    return response;
  },
};