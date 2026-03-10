# nightfuel-bozunator
Shitpost repository that made me learn how Cloudflare Workers operate.

Wraps [empty.svcover.nl](https://empty.svcover.nl) under [givemebozunightfuel.com](https://givemebozunightfuel.com) for the sole purpose of rewriting the HTML entry attribute in the form to automatically populate it with "BOZU Night Fuel." The page proxies the POST request so that it is communicated to the original website.

# Setup
1. Fork the project.
2. Modify [`wrangler.toml`](wrangler.toml) and replace the following:
   * Name;
   * Routes.
3. Deploy on Cloudflare Workers.
