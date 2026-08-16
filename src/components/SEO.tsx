import React, { useEffect } from 'react';
import { Product } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  imageUrl?: string;
  product?: Product;
}

export const SEO: React.FC<SEOProps> = ({
  title = "LUXUE FASHION ONLINE | Premium Designer Kurtis & Festive Ethnic Wear",
  description = "Shop exquisite Women's Kurtis, Designer Kurtis, Cotton Kurtis, Anarkali Kurtis, Festive Kurtis, and Embroidered Kurtis at LUXUE. Celebrate Rakhi with ₹1,000 free fashion gifts on ₹2,500 shopping.",
  keywords = [
    "Women's Kurtis",
    "Designer Kurtis",
    "Cotton Kurtis",
    "Anarkali Kurtis",
    "Festive Kurtis",
    "Embroidered Kurtis",
    "LUXUE Fashion",
    "Rakhi Gifts",
    "Indian Ethnic Wear"
  ],
  canonicalUrl,
  imageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200",
  product,
}) => {
  const currentUrl = canonicalUrl || typeof window !== 'undefined' ? window.location.href : 'https://luxue.com';

  useEffect(() => {
    // 1. Dynamic Title
    document.title = title;

    // 2. Helper to set meta tags
    const setMetaTag = (nameAttr: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords.join(', '));

    // Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', product?.image || imageUrl);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', product ? 'product' : 'website');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', product?.image || imageUrl);

    // 3. Product JSON-LD Structured Data
    let schemaScript = document.getElementById('json-ld-structured-data');
    if (product) {
      const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: [product.image, ...(product.gallery || [])],
        description: product.description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: 'LUXUE FASHION',
        },
        offers: {
          '@type': 'Offer',
          url: currentUrl,
          priceCurrency: 'INR',
          price: product.price,
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewsCount,
        },
      };

      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'json-ld-structured-data';
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(productSchema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, keywords, currentUrl, imageUrl, product]);

  return null;
};
