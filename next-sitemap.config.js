/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ventexx.com',
  generateRobotsTxt: false,
  exclude: [
    '/admin',
    '/admin/*',
    '/dashboard',
    '/dashboard/*',
    '/settings',
    '/settings/*',
    '/my-pitches',
    '/my-pitches/*',
    '/my-store',
    '/my-store/*',
    '/messages',
    '/messages/*',
    '/booster-packs',
    '/booster-packs/*',
    '/api',
    '/api/*'
  ],
  changefreq: 'weekly',
  priority: 0.8,
  transform: async (config, path) => {
    // Custom priority for legal pages
    const legalPages = ['/terms', '/privacy', '/seller-agreement', '/refunds', '/delivery', '/refund-policy', '/delivery-policy'];
    if (legalPages.includes(path)) {
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: 0.5,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        alternateRefs: config.alternateRefs ?? [],
      }
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
}
