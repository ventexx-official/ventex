/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.ventexx.com',
  generateRobotsTxt: false, // We created a custom robots.txt
  exclude: [
    '/admin*',
    '/dashboard*',
    '/settings*',
    '/my-pitches*',
    '/my-store*',
    '/messages*',
    '/api*',
    '/founder*',
    '/investor*',
    '/login',
    '/signup'
  ],
  transform: async (config, path) => {
    // Custom priorities
    let priority = config.priority;
    if (path === '/') {
      priority = 1.0;
    } else if (path === '/discover' || path === '/marketplace' || path === '/intelligence') {
      priority = 0.9;
    } else if (path === '/events' || path === '/investors') {
      priority = 0.8;
    } else if (path === '/about' || path === '/catalyst' || path === '/pricing' || path === '/contact') {
      priority = 0.7;
    } else {
      priority = 0.6;
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
