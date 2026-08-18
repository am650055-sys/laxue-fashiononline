import { CustomerReviewHighlight } from '../types';

export const INITIAL_CUSTOMER_REVIEWS: CustomerReviewHighlight[] = [
  {
    id: 'rev-priya-sharma',
    customerName: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    reviewText: 'The fitting of the Embroidered Green Suit is absolutely breathtaking! The fabric feels so rich and pure. Received endless compliments at my brother’s engagement.',
    rating: 5,
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    published: true,
    displayOrder: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    media: [
      {
        id: 'm-1-1',
        type: 'image',
        url: 'https://i.ibb.co/jktFxP4x/Made-for-moments-worth-celebrating-A-timeless-green-silhouette-with-intricate-embroidery-delica.jpg',
        caption: 'Embroidered festive green suit - unreal finish!',
        order: 1,
      },
      {
        id: 'm-1-2',
        type: 'image',
        url: 'https://i.ibb.co/0RhfwdZR/Pleats-pearls-a-whole-lot-of-elegance-A-premium-A-line-suit-in-a-timeless-navy-blue-beautiful.jpg',
        caption: 'Look at the neat pearl lace detailing on the sleeves and dupatta',
        order: 2,
      },
      {
        id: 'm-1-3',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-a-stylish-dress-39845-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        caption: 'Video unboxing & drape test - pure luxury!',
        order: 3,
      }
    ],
  },
  {
    id: 'rev-anjali-mehta',
    customerName: 'Anjali Mehta',
    location: 'New Delhi',
    reviewText: 'Super fast delivery within 3 days. The Banaras Anarkali suit has such a royal sheen. ₹799 is an unbeatable price for this quality!',
    rating: 5,
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    published: true,
    displayOrder: 2,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    media: [
      {
        id: 'm-2-1',
        type: 'image',
        url: 'https://i.ibb.co/wrcsMtMb/Instagram-1786879580064-WEBP.webp',
        caption: 'Navy Blue Anarkali with Golden Zari Weave',
        order: 1,
      },
      {
        id: 'm-2-2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-her-outfit-39879-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        caption: 'Flare and flow video review ✨',
        order: 2,
      },
      {
        id: 'm-2-3',
        type: 'image',
        url: 'https://i.ibb.co/5gzJfLfP/Instagram-1786879759769-WEBP.webp',
        caption: 'Pure Silk Kurti Set paired with statement jhumkas',
        order: 3,
      }
    ],
  },
  {
    id: 'rev-neha-verma',
    customerName: 'Neha Verma',
    location: 'Bengaluru, Karnataka',
    reviewText: 'Ordered 3 suit sets for Raksha Bandhan gifting. Packaging was luxurious and the fabric is extremely soft cotton blend. Will order again!',
    rating: 5,
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    published: true,
    displayOrder: 3,
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    media: [
      {
        id: 'm-3-1',
        type: 'image',
        url: 'https://i.ibb.co/bg3XKfqj/Instagram-1786879430337-WEBP.webp',
        caption: 'Co-ord set perfect for airport & office festive looks',
        order: 1,
      },
      {
        id: 'm-3-2',
        type: 'image',
        url: 'https://i.ibb.co/QFL89Wwh/Instagram-1786879498573-WEBP.webp',
        caption: 'Stunning neck embroidery close-up',
        order: 2,
      }
    ],
  },
  {
    id: 'rev-simran-kaur',
    customerName: 'Simran Kaur',
    location: 'Chandigarh',
    reviewText: 'The Punjabi suit silhouette and dupatta drape are 10/10. Thank you Luxue team for prioritizing my order before the festival!',
    rating: 5,
    coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    published: true,
    displayOrder: 4,
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    media: [
      {
        id: 'm-4-1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-in-traditional-dress-smiling-41584-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
        caption: 'Real-time look & festival styling',
        order: 1,
      },
      {
        id: 'm-4-2',
        type: 'image',
        url: 'https://i.ibb.co/nMDmvJf7/Instagram-1786879713852-WEBP.webp',
        caption: 'Royal Festive Maroon straight suit set with organza dupatta',
        order: 2,
      }
    ],
  },
  {
    id: 'rev-riya-patel',
    customerName: 'Riya Patel',
    location: 'Ahmedabad, Gujarat',
    reviewText: 'Exact match with pictures shown on the website. Color is vibrant and stitch quality is top tier. 100% recommended.',
    rating: 5,
    coverImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    published: true,
    displayOrder: 5,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    media: [
      {
        id: 'm-5-1',
        type: 'image',
        url: 'https://i.ibb.co/F42htLmB/Instagram-1786879783984-WEBP.webp',
        caption: 'Straight cut mustard festive suit with golden border',
        order: 1,
      },
      {
        id: 'm-5-2',
        type: 'image',
        url: 'https://i.ibb.co/DH5D4rfX/Instagram-1786879807457-WEBP.webp',
        caption: 'Flared anarkali with delicate zari work',
        order: 2,
      }
    ],
  },
  {
    id: 'rev-kavita-sen',
    customerName: 'Kavita Sen',
    location: 'Kolkata, West Bengal',
    reviewText: 'The organza dupatta with intricate borders elevated the whole ethnic look. Luxue has become my go-to store for festive collections.',
    rating: 5,
    coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    published: true,
    displayOrder: 6,
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    media: [
      {
        id: 'm-6-1',
        type: 'image',
        url: 'https://i.ibb.co/qLyPGfCP/Instagram-1786879832978-WEBP.webp',
        caption: 'Pastel festive kurta set with pearl tassels',
        order: 1,
      },
      {
        id: 'm-6-2',
        type: 'image',
        url: 'https://i.ibb.co/Qj6P3vRs/Instagram-1786879652360-WEBP.webp',
        caption: 'Pure cotton everyday kurti set',
        order: 2,
      }
    ],
  }
];
