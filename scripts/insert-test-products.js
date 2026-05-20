const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
  const trimLine = line.trim();
  if (trimLine && !trimLine.startsWith('#')) {
    const splitIndex = trimLine.indexOf('=');
    if (splitIndex > -1) {
      const key = trimLine.substring(0, splitIndex).trim();
      let value = trimLine.substring(splitIndex + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching users and pitches...");
  const { data: users, error: uErr } = await supabase.from('users').select('id, full_name').limit(1);
  const { data: pitches, error: pErr } = await supabase.from('pitches').select('id, title').limit(1);

  const seller_id = (users && users.length > 0) ? users[0].id : null;
  const pitch_id = (pitches && pitches.length > 0) ? pitches[0].id : null;

  console.log(`Using seller_id: ${seller_id}, pitch_id: ${pitch_id}`);

  // Calculate dates for deals
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + 3); // 3 days from now
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - 1); // 1 day ago

  const testProducts = [
    {
      seller_id,
      pitch_id,
      name: "SaaS Starter Kit Pro",
      description: "A complete Next.js SaaS boilerplate with authentication, payments, and dashboard.",
      images_urls: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"],
      price: 25000,
      discount_price: 15000, // Active Deal
      type: "fixed_price",
      category: "Templates",
      sector: "SaaS",
      status: "live",
      deal_end_date: futureDate.toISOString(),
      sales_count: 42,
      average_rating: 4.8,
      review_count: 15,
      featured: true
    },
    {
      seller_id,
      pitch_id,
      name: "Custom API Integration",
      description: "We will build custom API integrations for your platform with robust error handling.",
      images_urls: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000"],
      price: 50000,
      discount_price: null,
      type: "custom_work",
      category: "Services",
      sector: "Enterprise",
      status: "live",
      deal_end_date: null,
      sales_count: 5,
      average_rating: 5.0,
      review_count: 3,
      featured: false
    },
    {
      seller_id,
      pitch_id,
      name: "Marketing Automation Flow",
      description: "Pre-configured marketing email sequences and automation templates.",
      images_urls: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"],
      price: 5000,
      discount_price: 2500, // Active Deal
      type: "fixed_price",
      category: "Software",
      sector: "Marketing",
      status: "live",
      deal_end_date: futureDate.toISOString(),
      sales_count: 120,
      average_rating: 4.5,
      review_count: 34,
      featured: true
    },
    {
      seller_id,
      pitch_id,
      name: "Hardware Prototype Design",
      description: "Custom PCB design and enclosure prototyping services.",
      images_urls: ["https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=1000"],
      price: 150000,
      discount_price: null,
      type: "custom_work",
      category: "Hardware",
      sector: "Consumer Tech",
      status: "live",
      deal_end_date: null,
      sales_count: 2,
      average_rating: 4.0,
      review_count: 1,
      featured: false
    },
    {
      seller_id,
      pitch_id,
      name: "Founder Fundraising Course",
      description: "Comprehensive guide and course on raising your seed round successfully.",
      images_urls: ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000"],
      price: 10000,
      discount_price: null,
      type: "fixed_price",
      category: "Courses",
      sector: "Edtech",
      status: "live",
      deal_end_date: null,
      sales_count: 300,
      average_rating: 4.9,
      review_count: 85,
      featured: false
    },
    {
      seller_id,
      pitch_id,
      name: "UI/UX Audit",
      description: "Get a comprehensive audit of your platform's design and user experience.",
      images_urls: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000"],
      price: 20000,
      discount_price: 18000, // Expired deal
      type: "custom_work",
      category: "Services",
      sector: "SaaS",
      status: "live",
      deal_end_date: pastDate.toISOString(),
      sales_count: 15,
      average_rating: 4.7,
      review_count: 12,
      featured: false
    }
  ];

  const { data, error } = await supabase.from('products').insert(testProducts).select();

  if (error) {
    console.error("Error inserting products:", error);
  } else {
    console.log(`Successfully inserted ${data.length} test products.`);
  }
}

run();
