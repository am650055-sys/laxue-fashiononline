import https from 'https';
import fs from 'fs';

const rawProductGroups = [
  {
    group: 1,
    id: "luxue_prod_01_emerald_green_suit",
    name: "Emerald Timeless Green Embroidered Suit Set",
    category: "Embroidered Suit Set",
    description: "A graceful emerald green embroidered suit set crafted for an elegant and timeless ethnic look. Beautiful detailing and a refined silhouette make it suitable for festive occasions, celebrations and stylish everyday wear.",
    urls: [
      "https://ibb.co/HTZQMfgM",
      "https://ibb.co/hJZTT7r0",
      "https://ibb.co/HLxDM4zY",
      "https://ibb.co/0pz084sF",
      "https://ibb.co/fGx70Ps2",
      "https://ibb.co/GQQNFb43",
      "https://ibb.co/pBmHmNHK"
    ]
  },
  {
    group: 2,
    id: "luxue_prod_02_navy_pleated_aline_suit",
    name: "Navy Blue Pleated Pearl-Work A-Line Suit",
    category: "A-Line Suit",
    description: "An elegant navy blue A-line suit featuring graceful pleated detailing and delicate pearl-inspired work. A sophisticated choice for festive gatherings, celebrations and premium ethnic styling.",
    urls: [
      "https://ibb.co/zTGSk0bT",
      "https://ibb.co/jP5D7dDX",
      "https://ibb.co/7djvq1sY"
    ]
  },
  {
    group: 3,
    id: "luxue_prod_03_contemporary_ethnic_suit",
    name: "Contemporary Ethnic Elegant Suit Set",
    category: "Ethnic Suit Set",
    description: "A contemporary ethnic suit set designed with a modern silhouette and elegant traditional styling. Perfect for creating a polished look for festive occasions and special gatherings.",
    urls: [
      "https://ibb.co/xqPwqssg",
      "https://ibb.co/ZR343V7L",
      "https://ibb.co/nsm2fZvG",
      "https://ibb.co/v6XYWSrr",
      "https://ibb.co/qMKCVF86",
      "https://ibb.co/mdNHS2J",
      "https://ibb.co/pr6NM5fM",
      "https://ibb.co/jFQk0Rj",
      "https://ibb.co/xK7KQCJq"
    ]
  },
  {
    group: 4,
    id: "luxue_prod_04_contemporary_ethnic_premium",
    name: "Contemporary Ethnic Premium Suit Set",
    category: "Ethnic Suit Set",
    description: "A stylish contemporary ethnic ensemble combining graceful traditional inspiration with a modern fashion-forward silhouette. Designed for effortless elegance during festive and social occasions.",
    urls: [
      "https://ibb.co/TnVC0nH",
      "https://ibb.co/HDsCgkCf",
      "https://ibb.co/5xnxx0fj",
      "https://ibb.co/JjWDsTWd",
      "https://ibb.co/qY8D9Vt5",
      "https://ibb.co/PGPcrTF4"
    ]
  },
  {
    group: 5,
    id: "luxue_prod_05_everyday_printed_coord",
    name: "Everyday Printed Casual Co-ord Set",
    category: "Casual Co-ord Set",
    description: "A comfortable and stylish printed co-ord ensemble designed for effortless everyday fashion. Its versatile look makes it ideal for casual outings, daily wear and relaxed occasions.",
    urls: [
      "https://ibb.co/Z6JxMZtR",
      "https://ibb.co/whKGx8yt",
      "https://ibb.co/M56f213j",
      "https://ibb.co/gb0LzCxK",
      "https://ibb.co/b5vxK5vG",
      "https://ibb.co/HDy3jrCg",
      "https://ibb.co/TMh5hJp0",
      "https://ibb.co/HLVWrT9X",
      "https://ibb.co/ymBSJmm4",
      "https://ibb.co/d4cXGsfV"
    ]
  },
  {
    group: 6,
    id: "luxue_prod_06_minimalist_fusion_suit",
    name: "Minimalist Fusion Solid Suit",
    category: "Fusion Suit",
    description: "A minimalist fusion suit featuring a clean silhouette and sophisticated solid styling. Perfect for women who prefer understated elegance with a modern ethnic touch.",
    urls: [
      "https://ibb.co/6RzvYKCG",
      "https://ibb.co/Pv2bVn87",
      "https://ibb.co/CKSBkcTz",
      "https://ibb.co/j981ZvDV",
      "https://ibb.co/wh1RkvyW",
      "https://ibb.co/Y7QF6Cqn"
    ]
  },
  {
    group: 7,
    id: "luxue_prod_07_festive_light_embroidered_kurta",
    name: "Festive Light Embroidered Kurta Set",
    category: "Kurta Set",
    description: "A beautiful lightly embroidered kurta set created for a graceful festive appearance. Elegant detailing and a comfortable silhouette make it suitable for celebrations and special occasions.",
    urls: [
      "https://ibb.co/zH5C9TxX",
      "https://ibb.co/JjNjKtSw",
      "https://ibb.co/KzzVGZ4C",
      "https://ibb.co/PZ9xk7Nd",
      "https://ibb.co/hFFNvrhf",
      "https://ibb.co/7tHc1rVW",
      "https://ibb.co/0ppSB40w",
      "https://ibb.co/6c97MMFq",
      "https://ibb.co/9kG96Gh8",
      "https://ibb.co/zTCNW2YP",
      "https://ibb.co/xqdYjpQN"
    ]
  },
  {
    group: 8,
    id: "luxue_prod_08_printed_anarkali_flare",
    name: "Printed Anarkali Flare Ensemble",
    category: "Anarkali Suit",
    description: "A graceful printed Anarkali ensemble featuring a flowing flare and elegant ethnic styling. Designed to create a feminine and sophisticated appearance for festive and casual occasions.",
    urls: [
      "https://ibb.co/sJWHy7yD",
      "https://ibb.co/MyPCx8px",
      "https://ibb.co/9mxH3Ysj",
      "https://ibb.co/wFGzYfX9",
      "https://ibb.co/LdZp8PPJ",
      "https://ibb.co/FkpJKHCt"
    ]
  },
  {
    group: 9,
    id: "luxue_prod_09_classic_daily_workwear_kurti",
    name: "Classic Daily Workwear Kurti Set",
    category: "Daily Wear Kurti Set",
    description: "A versatile classic kurti set designed for comfortable workwear and everyday styling. Its refined appearance makes it suitable for office wear, casual outings and daily fashion.",
    urls: [
      "https://ibb.co/YB4S677J",
      "https://ibb.co/KzyDnzq0",
      "https://ibb.co/JjxGxRXq",
      "https://ibb.co/9k3NsQGR",
      "https://ibb.co/ynSCWpvB",
      "https://ibb.co/s8zXkJZ",
      "https://ibb.co/bjdfZZWs",
      "https://ibb.co/DPhWRSNj",
      "https://ibb.co/991pw4Hd",
      "https://ibb.co/23G0SQy1"
    ]
  },
  {
    group: 10,
    id: "luxue_prod_10_summer_cotton_floral_kurti",
    name: "Summer Cotton Floral Kurti",
    category: "Cotton Kurti",
    description: "A fresh summer cotton kurti featuring beautiful floral-inspired styling and a comfortable everyday silhouette. Lightweight and versatile, it is perfect for warm-weather casual and daily wear.",
    urls: [
      "https://ibb.co/TqH4xMSz",
      "https://ibb.co/7x3PHVrt",
      "https://ibb.co/j9qy0BYM",
      "https://ibb.co/YB3Xw47T",
      "https://ibb.co/TDnGLs33",
      "https://ibb.co/B2wgzcTJ",
      "https://ibb.co/NnJvLR7R",
      "https://ibb.co/jkHFPg6y",
      "https://ibb.co/wZvJK0kk"
    ]
  },
  {
    group: 11,
    id: "luxue_prod_11_vibrant_festive_statement_suit",
    name: "Vibrant Festive Statement Suit",
    category: "Festive Suit",
    description: "A vibrant statement suit designed to bring elegance and festive charm to your wardrobe. Its eye-catching styling makes it perfect for celebrations, parties and special occasions.",
    urls: [
      "https://ibb.co/qYRjfQ9N",
      "https://ibb.co/KphzDRRq",
      "https://ibb.co/5WzJK0jP",
      "https://ibb.co/wFgWZgWV",
      "https://ibb.co/6RYYBB8v",
      "https://ibb.co/BHkH59M0",
      "https://ibb.co/TMQPdD9N",
      "https://ibb.co/7t3HKDL3",
      "https://ibb.co/4RB27DFy",
      "https://ibb.co/TBZPsPgj",
      "https://ibb.co/Kc5LGbHw"
    ]
  },
  {
    group: 12,
    id: "luxue_prod_12_premium_silk_chanderi_set",
    name: "Premium Silk Chanderi Occasion Set",
    category: "Silk Suit Set",
    description: "A premium occasion ensemble inspired by the luxurious appeal of silk and Chanderi styling. Designed with an elegant ethnic finish for festive celebrations, functions and special events.",
    urls: [
      "https://ibb.co/fzKTPHPs",
      "https://ibb.co/DfnQ9HKs",
      "https://ibb.co/d40nmNG5",
      "https://ibb.co/1YwLPWSx",
      "https://ibb.co/Kp82mjzL",
      "https://ibb.co/G4L3HWDn",
      "https://ibb.co/BV8sXT82"
    ]
  },
  {
    group: 13,
    id: "luxue_prod_13_elegant_straight_cut_pastel",
    name: "Elegant Straight-Cut Pastel Suit",
    category: "Straight-Cut Suit",
    description: "An elegant straight-cut suit featuring soft pastel-inspired styling and a refined feminine silhouette. A versatile choice for festive occasions, family gatherings and sophisticated everyday wear.",
    urls: [
      "https://ibb.co/d4FfywjQ",
      "https://ibb.co/mVRL5znp",
      "https://ibb.co/S4mgHTtd",
      "https://ibb.co/mVkMycrt",
      "https://ibb.co/VcsFYHqx",
      "https://ibb.co/LDJVDpTM",
      "https://ibb.co/M59qtZPY"
    ]
  },
  {
    group: 14,
    id: "luxue_prod_14_contemporary_tiered_flared",
    name: "Contemporary Tiered Flared Suit",
    category: "Flared Suit",
    description: "A contemporary tiered and flared ensemble designed with a stylish flowing silhouette. Its modern structure adds graceful movement and makes it ideal for festive and social occasions.",
    urls: [
      "https://ibb.co/XrSZXYxB",
      "https://ibb.co/YFDBq0dD",
      "https://ibb.co/SwKgwg3F",
      "https://ibb.co/QFwvFgqW",
      "https://ibb.co/7xhc9ygJ",
      "https://ibb.co/Vc6pG6nG"
    ]
  },
  {
    group: 15,
    id: "luxue_prod_15_monotone_printed_smart_suit",
    name: "Monotone Printed Smart Suit Set",
    category: "Smart Suit Set",
    description: "A modern monotone and printed suit set designed for a polished, effortless fashion look. Its versatile styling works beautifully for everyday wear, workwear and casual occasions.",
    urls: [
      "https://ibb.co/BHzSDxGS",
      "https://ibb.co/rGw93YJ0",
      "https://ibb.co/27PXF4P6",
      "https://ibb.co/1tXJ0smT",
      "https://ibb.co/4Ry548WW",
      "https://ibb.co/d45JkBFR",
      "https://ibb.co/3Y5nyGsQ",
      "https://ibb.co/Kx75Yytq",
      "https://ibb.co/4RhHBdtR"
    ]
  }
];

function fetchDirectImage(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchDirectImage(res.headers.location));
      }
      let html = '';
      res.on('data', (chunk) => { html += chunk; });
      res.on('end', () => {
        const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogMatch && ogMatch[1]) {
          return resolve(ogMatch[1]);
        }
        const imgMatch = html.match(/https:\/\/i\.ibb\.co\/[a-zA-Z0-9_-]+\/[^"'\s<>]+/i);
        if (imgMatch) {
          return resolve(imgMatch[0]);
        }
        resolve(url);
      });
    }).on('error', (err) => {
      console.error(`Error fetching ${url}:`, err.message);
      resolve(url);
    });
  });
}

async function run() {
  console.log('Resolving direct image URLs for all 15 product groups in parallel...');
  const results = await Promise.all(
    rawProductGroups.map(async (p) => {
      const directImages = [];
      const imageResults = await Promise.all(p.urls.map(u => fetchDirectImage(u)));
      for (const direct of imageResults) {
        if (direct && !directImages.includes(direct)) {
          directImages.push(direct);
        }
      }
      return {
        ...p,
        directImages
      };
    })
  );

  fs.writeFileSync('scripts/resolved_products.json', JSON.stringify(results, null, 2));
  console.log('Successfully written scripts/resolved_products.json with all direct URLs!');
}

run();
