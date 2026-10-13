import brand from '../data/brand.json';

type Node = Record<string, unknown>;

const { seo, business, socialProof, menu } = brand;

const site: string = import.meta.env.SITE;
export const siteUrl = site.replace(/\/$/, '');
const origin = new URL(site).origin;

// Only the production host is indexable; any other host (e.g. the GitHub Pages preview) is noindex.
export const isProduction = new URL(site).hostname.replace(/^www\./, '') === seo.productionHost;

export const withBase = (p = ''): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, '');

export const absolute = (p: string): string => (/^https?:\/\//.test(p) ? p : new URL(p, origin).toString());

export const pageUrl = (slug = ''): string => `${siteUrl}/${slug ? slug.replace(/^\/|\/$/g, '') + '/' : ''}`;

export const restaurantId = `${siteUrl}/#restaurant`;
export const websiteId = `${siteUrl}/#website`;

const price = (s: string): string => s.replace(/[^\d,.]/g, '').replace(',', '.');

const DAYS: Record<string, string> = {
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
};

const openingHoursSpecification = (): Node[] =>
  business.openingHours.schema.map((line) => {
    const [days, range] = line.split(' ');
    const [opens, closes] = range.split('-');
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.split(',').map((d) => DAYS[d]),
      opens,
      closes,
    };
  });

const menuNode = (): Node => ({
  '@type': 'Menu',
  '@id': `${siteUrl}/#menu`,
  name: `Carta de ${brand.brandName.split(' · ')[0]}`,
  url: `${pageUrl()}#carta`,
  inLanguage: seo.lang,
  hasMenuSection: [
    {
      '@type': 'MenuSection',
      name: 'Menús completos',
      hasMenuItem: menu.highlights.map((h) => ({
        '@type': 'MenuItem',
        name: h.title,
        description: h.description,
        image: absolute(h.image),
        offers: { '@type': 'Offer', price: price(h.price), priceCurrency: 'EUR' },
      })),
    },
    ...menu.categories.map((c) => ({
      '@type': 'MenuSection',
      name: c.name,
      hasMenuItem: c.items.map((i) => ({
        '@type': 'MenuItem',
        name: i.name,
        description: [i.description, i.note].filter(Boolean).join(' · '),
        offers: { '@type': 'Offer', price: price(i.price), priceCurrency: 'EUR' },
      })),
    })),
  ],
});

export function restaurantNode({ withMenu = false } = {}): Node {
  const node: Node = {
    '@type': seo.schemaType,
    '@id': restaurantId,
    name: brand.brandName.split(' · ')[0],
    alternateName: business.alternateName,
    legalName: business.legalName,
    description: seo.description,
    url: pageUrl(),
    logo: absolute(withBase('logo-512.png')),
    image: [seo.ogImage, brand.assets.storyImage, brand.assets.heroImage, ...brand.gallery.items.slice(0, 3).map((g) => g.image)].map(
      absolute,
    ),
    telephone: business.phone,
    priceRange: business.priceRange,
    servesCuisine: business.servesCuisine,
    acceptsReservations: business.acceptsReservations,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.streetAddress,
      postalCode: business.address.postalCode,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      addressCountry: business.address.addressCountry,
    },
    geo: { '@type': 'GeoCoordinates', latitude: business.geo.latitude, longitude: business.geo.longitude },
    hasMap: business.mapUrl,
    openingHoursSpecification: openingHoursSpecification(),
    areaServed: { '@type': 'City', name: business.address.addressLocality },
    maximumAttendeeCapacity: business.seatingCapacity,
    sameAs: business.social.map((s) => s.href),
    potentialAction: business.orderUrls.map((u) => ({
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: u,
        actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'],
      },
    })),
  };
  if (business.email) node.email = business.email;
  if (withMenu) {
    node.hasMenu = { '@id': `${siteUrl}/#menu` };
    node.menu = `${pageUrl()}#carta`;
  }
  // brand.socialProof.rating is the client's own data; omitted whenever flagged as placeholder
  if (!socialProof.rating._placeholder) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: socialProof.rating.value,
      bestRating: socialProof.rating.max,
      reviewCount: socialProof.rating.count,
    };
  }
  return node;
}

export const websiteNode = (): Node => ({
  '@type': 'WebSite',
  '@id': websiteId,
  url: pageUrl(),
  name: brand.brandName.split(' · ')[0],
  inLanguage: seo.locale.replace('_', '-'),
  publisher: { '@id': restaurantId },
});

export const webPageNode = (opts: { path?: string; name: string; description: string; image: string }): Node => {
  const url = pageUrl(opts.path);
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: seo.locale.replace('_', '-'),
    isPartOf: { '@id': websiteId },
    about: { '@id': restaurantId },
    primaryImageOfPage: { '@type': 'ImageObject', url: absolute(opts.image) },
  };
};

export const faqNode = (items: { q: string; a: string }[], path = ''): Node => ({
  '@type': 'FAQPage',
  '@id': `${pageUrl(path)}#faq`,
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.q,
    acceptedAnswer: { '@type': 'Answer', text: i.a },
  })),
});

export const breadcrumbNode = (crumbs: { name: string; path: string }[]): Node => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: pageUrl(c.path),
  })),
});

export const graph = (nodes: Node[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

export const menuGraphNode = menuNode;

export const jsonLdString = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
