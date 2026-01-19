---
name: seo
description: Use when creating web pages, adding metadata, optimizing Core Web Vitals, implementing structured data, or when pages aren't ranking or showing rich snippets in Google
---

# SEO Optimization

## Overview

SEO requires three pillars: technical performance (Core Web Vitals), proper metadata, and structured data for rich snippets. All three matter for ranking.

## When to Use

- Creating any public-facing page
- Adding metadata to Next.js pages
- Implementing structured data (JSON-LD)
- Optimizing page load performance
- Debugging missing rich snippets in Google

## The Iron Rules

### 1. Core Web Vitals Are Ranking Factors

| Metric | Target | What It Measures |
|--------|--------|------------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Main content load time |
| **INP** (Interaction to Next Paint) | < 200ms | Responsiveness |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |

```typescript
// ❌ BAD: Unoptimized image kills LCP
<img src="/hero.jpg" alt="Hero" />

// ✅ GOOD: Next.js Image with priority for LCP
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority // Preloads for LCP
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

```typescript
// ❌ BAD: CLS - no dimensions on dynamic content
<div className="product-list">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>

// ✅ GOOD: Reserve space with aspect-ratio or fixed height
<div className="product-list min-h-[400px]">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

### 2. Use Next.js Metadata API Correctly

```typescript
// app/products/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);

  return {
    title: `${product.name} | Brand - $${product.price}`,
    description: truncate(product.description, 155), // Max 155 chars

    alternates: {
      canonical: `https://site.com/products/${product.slug}`,
    },

    // OpenGraph - use 'product' for e-commerce
    openGraph: {
      type: 'product', // NOT 'website' for products
      title: product.name,
      description: truncate(product.description, 155),
      images: [{
        url: product.image,
        width: 1200,
        height: 630,
        alt: product.name,
      }],
    },

    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: truncate(product.description, 155),
      images: [product.image],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}
```

### 3. Product Structured Data for Rich Snippets

Google shows price, availability, and reviews in search results. You MUST include:

```typescript
// Minimum required fields for Product rich snippet
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images,
  description: product.description,
  sku: product.sku,
  brand: {
    '@type': 'Brand',
    name: product.brand,
  },
  offers: {
    '@type': 'Offer',
    url: `https://site.com/products/${product.slug}`,
    price: product.price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock', // or OutOfStock
    priceValidUntil: '2025-12-31', // Required for validity
  },
  // Optional but highly recommended:
  aggregateRating: product.rating ? {
    '@type': 'AggregateRating',
    ratingValue: product.rating.value,
    reviewCount: product.rating.count,
  } : undefined,
};
```

### 4. JSON-LD Rendering Pattern

Use the Next.js recommended pattern for safe JSON-LD rendering:

```typescript
// NOTE: This pattern is safe because JSON.stringify escapes content
// and the replace() prevents script tag injection
function JsonLd({ data }: { data: object }) {
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
```

### 5. Essential Structured Data Types

| Page Type | Required Schema | Rich Result |
|-----------|-----------------|-------------|
| Product | Product + Offer | Price, availability in search |
| Article | Article + Author | Article snippet |
| FAQ | FAQPage | Expandable Q&A in search |
| Recipe | Recipe | Recipe card with image |
| Local Business | LocalBusiness | Knowledge panel |
| Breadcrumbs | BreadcrumbList | Breadcrumb trail in results |

## Quick Reference: Metadata Checklist

Every page needs:
- [ ] `title` - Unique, < 60 chars, includes primary keyword
- [ ] `description` - Compelling, < 155 chars, includes CTA
- [ ] `canonical` URL - Prevents duplicate content
- [ ] `openGraph` - For social sharing (1200x630 images)
- [ ] `twitter` card - For Twitter/X sharing
- [ ] `robots` - index/noindex directive

For e-commerce:
- [ ] OpenGraph `type: 'product'` (not 'website')
- [ ] Product JSON-LD with offers
- [ ] Breadcrumb JSON-LD

## Validation Tools

Test structured data BEFORE deploying:
- [Rich Results Test](https://search.google.com/test/rich-results) - Google's official tool
- [Schema Markup Validator](https://validator.schema.org/) - schema.org validator
- Chrome DevTools → Lighthouse → SEO audit

## Red Flags - STOP and Fix

| Thought | Reality |
|---------|---------|
| "SEO is just meta tags" | Core Web Vitals are ranking factors. Optimize performance. |
| "I'll add structured data later" | No rich snippets = lower CTR. Add from day one. |
| "LCP doesn't matter for this page" | Every page's performance affects site-wide ranking. |
| "Using img tag is fine" | Next.js Image handles optimization. Always use it. |
| "OpenGraph type='website' is fine" | Use 'product' for products, 'article' for articles. |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| HTML img instead of Next.js Image | Use `next/image` with priority for LCP |
| Missing `width`/`height` on images | Always specify to prevent CLS |
| Description > 160 chars | Truncate to 155 with ellipsis |
| No canonical URL | Add `alternates.canonical` |
| Missing `priceValidUntil` in Offer | Required for Product rich snippets |
| OpenGraph type='website' for products | Use type='product' |
| No structured data validation | Test with Rich Results Test before deploy |