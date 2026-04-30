'use strict';

/**
 * ─────────────────────────────────────────────
 * seed_posts.js
 * Inserts dummy feed posts into the `posts` table.
 * Run:  node db/seed_posts.js
 * ─────────────────────────────────────────────
 */

require('dotenv').config();
const pool = require('../config/pool');

// ─── Figma image assets ───
const IMG_6  = 'https://www.figma.com/api/mcp/asset/8a578314-8573-4a99-adad-c0892f6da3df';
const IMG_11 = 'https://www.figma.com/api/mcp/asset/fdd25a6b-0ca4-46c4-bf17-df9c212b4ed1';
const IMG_7  = 'https://www.figma.com/api/mcp/asset/dc398356-b3e1-4922-a30f-7fb2b5133cc0';
const IMG_9  = 'https://www.figma.com/api/mcp/asset/d21dde61-514f-4cf2-a39f-3a5c36d3deaa';
const IMG_10 = 'https://www.figma.com/api/mcp/asset/fe887b70-9989-44de-bdf7-2d205076a312';
const IMG_8  = 'https://www.figma.com/api/mcp/asset/85dbd68b-06ba-4f25-a282-d318590beabc';
const IMG_12 = 'https://www.figma.com/api/mcp/asset/4c25d526-c96f-454b-8ce2-6dd20d94b30c';
const IMG_14 = 'https://www.figma.com/api/mcp/asset/2d1cca4e-a479-4cc7-846d-f2d569a88286';

// ─── Dummy post data ───
const POSTS = [
  {
    category:    'painting',
    medium:      'Oil on Canvas',
    style:       'abstract',
    price_tier:  'premium',
    price:       12500,
    image_url:   IMG_6,
    title:       'Ethereal Bloom',
    height:      380,
    description: 'A mesmerising abstract composition of swirling colours that evoke the first light of dawn breaking over still waters. Created with palette knives and layered oil glazes.',
    tags:        ['abstract', 'oil', 'colorful', 'modern'],
  },
  {
    category:    'digital_art',
    medium:      'Digital Illustration',
    style:       'contemporary',
    price_tier:  'mid',
    price:       4500,
    image_url:   IMG_11,
    title:       'Neon Dreamscape',
    height:      320,
    description: 'A vibrant digital artwork blending futuristic cityscapes with organic patterns. Inspired by the intersection of technology and nature in modern India.',
    tags:        ['digital', 'neon', 'futuristic', 'cityscape'],
  },
  {
    category:    'photography',
    medium:      'Fine Art Print',
    style:       'realism',
    price_tier:  'budget',
    price:       1800,
    image_url:   IMG_7,
    title:       'Golden Hour at the Ghats',
    height:      350,
    description: 'A stunning capture of the golden hour reflecting off the ancient ghats. The interplay of warm light and flowing water creates a serene, almost painterly atmosphere.',
    tags:        ['photography', 'india', 'golden-hour', 'landscape'],
  },
  {
    category:    'sculpture',
    medium:      'Bronze Cast',
    style:       'folk',
    price_tier:  'luxury',
    price:       35000,
    image_url:   IMG_9,
    title:       'Dancing Nataraja',
    height:      400,
    description: 'A handcrafted bronze sculpture depicting the cosmic dance of Shiva. Each detail has been meticulously carved by master artisans from Tamil Nadu using the lost-wax technique.',
    tags:        ['sculpture', 'bronze', 'traditional', 'folk-art'],
  },
  {
    category:    'painting',
    medium:      'Acrylic on Canvas',
    style:       'impressionist',
    price_tier:  'mid',
    price:       7800,
    image_url:   IMG_10,
    title:       'Monsoon Melody',
    height:      360,
    description: 'Soft brushstrokes capture the gentle rhythm of monsoon rains over a lush countryside. The palette of greens and grays evokes the petrichor-laden air of rural India.',
    tags:        ['painting', 'monsoon', 'impressionist', 'landscape'],
  },
  {
    category:    'craft',
    medium:      'Hand-woven Textile',
    style:       'folk',
    price_tier:  'budget',
    price:       2200,
    image_url:   IMG_8,
    title:       'Ikat Weave Wall Hanging',
    height:      300,
    description: 'A beautifully crafted hand-woven Ikat textile piece featuring traditional geometric patterns in indigo and saffron. Perfect as a statement wall hanging or table runner.',
    tags:        ['craft', 'textile', 'handwoven', 'ikat'],
  },
  {
    category:    'prints',
    medium:      'Giclée Print',
    style:       'surrealism',
    price_tier:  'budget',
    price:       1500,
    image_url:   IMG_12,
    title:       'Floating Gardens',
    height:      340,
    description: 'A surreal giclée print depicting gravity-defying botanical gardens suspended in a twilight sky. Limited edition of 50, signed and numbered by the artist.',
    tags:        ['print', 'surreal', 'botanical', 'limited-edition'],
  },
  {
    category:    'mehendi',
    medium:      'Henna Design Template',
    style:       'folk',
    price_tier:  'budget',
    price:       null,
    image_url:   IMG_14,
    title:       'Rajasthani Bridal Mehndi',
    height:      420,
    description: 'An intricate Rajasthani-style bridal mehndi design featuring peacocks, paisleys, and lotus motifs. This digital template can be used as inspiration for your special day.',
    tags:        ['mehendi', 'bridal', 'rajasthani', 'henna'],
  },
];

async function seedPosts() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding posts...\n');

    // ── 1. Ensure the posts table exists ──
    // Run the migration first if needed
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, 'migrations', '003_feed_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSQL);
    console.log('✅ Feed tables ensured\n');

    // ── 2. Fetch artist user IDs ──
    const { rows: artists } = await client.query(
      `SELECT id FROM "User" WHERE role = 'ARTIST' LIMIT 2`
    );

    if (artists.length === 0) {
      console.error('❌ No ARTIST users found. Run `npx prisma db seed` first.');
      process.exit(1);
    }

    console.log(`🎨 Found ${artists.length} artist(s): ${artists.map(a => a.id).join(', ')}\n`);

    // ── 3. Clear existing posts ──
    await client.query('DELETE FROM interactions');
    await client.query('DELETE FROM posts');
    console.log('🧹 Cleared existing posts & interactions\n');

    // ── 4. Insert dummy posts ──
    const insertSQL = `
      INSERT INTO posts (
        artist_id, category, medium, style, price_tier, price,
        image_url, title, height, description,
        likes_count, saves_count, shares_count, comments_count, views_count,
        is_promoted, tags
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17
      ) RETURNING id, title
    `;

    for (let i = 0; i < POSTS.length; i++) {
      const p = POSTS[i];
      // Alternate between available artists
      const artistId = artists[i % artists.length].id;

      // Generate some random engagement numbers
      const likes    = Math.floor(Math.random() * 500) + 10;
      const saves    = Math.floor(Math.random() * 100) + 5;
      const shares   = Math.floor(Math.random() * 50);
      const comments = Math.floor(Math.random() * 80);
      const views    = Math.floor(Math.random() * 5000) + 100;
      const promoted = i === 0 || i === 4; // promote a couple posts

      const { rows } = await client.query(insertSQL, [
        artistId,
        p.category,
        p.medium,
        p.style,
        p.price_tier,
        p.price,
        p.image_url,
        p.title,
        p.height,
        p.description,
        likes,
        saves,
        shares,
        comments,
        views,
        promoted,
        `{${p.tags.join(',')}}`,
      ]);

      console.log(`  📌 Post #${rows[0].id} — "${rows[0].title}" (by artist ${artistId.slice(0, 8)}…)`);
    }

    console.log(`\n🎉 Seeded ${POSTS.length} posts successfully!`);

  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPosts();
