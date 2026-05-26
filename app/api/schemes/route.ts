import { NextResponse } from 'next/server';

const FALLBACK_SCHEMES = [
  {
    name: 'DPIIT Recognition',
    benefit: 'Startup recognition, easier government access, and eligibility for multiple support programs.',
    eligibility: 'Indian startup under 10 years old with an innovative product or scalable service.',
    apply_url: 'https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html',
  },
  {
    name: 'Startup India Seed Fund Scheme',
    benefit: 'Seed support for proof of concept, prototype, product trials, and market entry.',
    eligibility: 'DPIIT-recognised startups generally under 2 years old at application time.',
    apply_url: 'https://seedfund.startupindia.gov.in/',
  },
  {
    name: 'MeitY TIDE 2.0',
    benefit: 'Incubation and grant support for ICT-enabled startups and emerging tech ventures.',
    eligibility: 'Technology startups working in ICT, deeptech, AI, IoT, or related digital sectors.',
    apply_url: 'https://www.meitystartuphub.in/tide-2-0/',
  },
  {
    name: 'Atal Innovation Mission',
    benefit: 'Incubation network, mentoring, and ecosystem support through Atal Incubation Centres.',
    eligibility: 'Early-stage Indian startups seeking incubation and structured support.',
    apply_url: 'https://aim.gov.in/',
  },
  {
    name: 'State Startup Mission',
    benefit: 'State-specific grants, incubation, credits, and founder support.',
    eligibility: 'Depends on state policy, sector, stage, and local registration requirements.',
    apply_url: 'https://www.startupindia.gov.in/content/sih/en/reources/state-startup-policies.html',
  },
];

export async function POST(req: Request) {
  try {
    const input = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ schemes: FALLBACK_SCHEMES, source: 'fallback' });
    }

    const prompt = `For Indian startup: sector=${input.sector}, stage=${input.stage}, state=${input.state}, team=${input.teamSize}, revenue=${input.revenue}. List top 5 government schemes they qualify for. Include: Startup India, DPIIT Recognition, SISFS, TIDE 2.0, state schemes. Return JSON array: [{name, benefit, eligibility, apply_url}]`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) {
      return NextResponse.json({ schemes: FALLBACK_SCHEMES, source: 'fallback' });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const jsonText = text.replace(/```json|```/g, '').trim();
    const schemes = JSON.parse(jsonText);

    return NextResponse.json({ schemes, source: 'gemini' });
  } catch {
    return NextResponse.json({ schemes: FALLBACK_SCHEMES, source: 'fallback' });
  }
}
