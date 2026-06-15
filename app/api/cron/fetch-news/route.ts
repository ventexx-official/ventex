import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { generateAIContent } from '@/lib/ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max duration

export async function GET(req: Request) {
  // Simple auth to prevent public triggering (Vercel Cron provides a header, or use a secret key)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';
  
  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createSupabaseAdmin();

    // 1. Fetch from HackerNews API (Top stories)
    const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
    const hnStoryIds = await hnRes.json();
    
    // Grab top 5 stories for processing to avoid rate limits / timeouts
    const storiesToProcess = hnStoryIds.slice(0, 5);
    const addedArticles = [];

    for (const id of storiesToProcess) {
      const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
      const story = await storyRes.json();

      if (!story.url || story.type !== 'story') continue;

      // Check if we already have this article
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('source_url', story.url)
        .single();
      
      if (existing) continue;

      // 2. Use AI to generate a Ventex-focused summary and tags
      let summary = "A popular new story in the tech ecosystem.";
      let tags = ['startup'];
      
      try {
        const aiResponse = await generateAIContent({
          systemPrompt: `You are a startup news editor. Analyze this article title and create a 2-3 sentence engaging summary for founders and investors. Extract 2-4 relevant tags (e.g., ai, saas, funding). Return ONLY JSON: {"summary": "...", "tags": ["..."]}`,
          userPrompt: `Title: ${story.title}\nURL: ${story.url}`,
          responseFormat: 'json_object'
        });
        
        const parsed = JSON.parse(aiResponse);
        if (parsed.summary) summary = parsed.summary;
        if (parsed.tags) tags = parsed.tags;
      } catch (aiErr) {
        console.warn('AI summary failed for story:', story.id, aiErr);
      }

      // Generate a slug
      const slug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + id;

      // 3. Insert into DB
      const { data, error } = await supabase.from('articles').insert({
        title: story.title,
        slug,
        summary,
        source_url: story.url,
        source_name: 'Hacker News',
        tags,
        published_at: new Date(story.time * 1000).toISOString()
      }).select().single();

      if (!error && data) {
        addedArticles.push(data.title);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: storiesToProcess.length,
      added: addedArticles.length,
      articles: addedArticles
    });

  } catch (err: any) {
    console.error('Fetch News Cron Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
