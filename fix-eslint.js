const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const { search, replace } of replacements) {
    if (search instanceof RegExp) {
      content = content.replace(search, replace);
    } else {
      content = content.split(search).join(replace);
    }
  }
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${filePath}`);
}

// 1. app/admin/pitches/[id]/page.tsx
replaceInFile('app/admin/pitches/[id]/page.tsx', [
  { search: /Calendar,\s*DollarSign,\s*TrendingUp,\s*Target,\s*/g, replace: '' },
  { search: /ChevronRight,\s*/g, replace: '' }
]);

// 2. app/admin/products/page.tsx
replaceInFile('app/admin/products/page.tsx', [
  { search: /ExternalLink,\s*/g, replace: '' }
]);

// 3. app/admin/users/page.tsx
replaceInFile('app/admin/users/page.tsx', [
  { search: /Shield,\s*Eye,\s*/g, replace: '' },
  { search: /Shield,\s*/g, replace: '' },
  { search: /Eye,\s*/g, replace: '' }
]);

// 4. app/api/emails/route.ts
replaceInFile('app/api/emails/route.ts', [
  { search: /console\.log\(\`\[EMAIL LOG\]/g, replace: 'console.warn(`[EMAIL LOG]' },
  { search: /console\.log\(\`\[EMAIL SENT\]/g, replace: 'console.warn(`[EMAIL SENT]' }
]);

// 5. app/api/emails/trigger/route.ts
replaceInFile('app/api/emails/trigger/route.ts', [
  { search: /console\.log\(\`\[EMAIL TRIGGER LOG\]/g, replace: 'console.warn(`[EMAIL TRIGGER LOG]' },
  { search: /console\.log\(\`\[EMAIL TRIGGER LOG\]/g, replace: 'console.warn(`[EMAIL TRIGGER LOG]' },
  { search: /console\.log\(\`\[EMAIL TRIGGER SENT\]/g, replace: 'console.warn(`[EMAIL TRIGGER SENT]' },
  { search: /console\.log\(/g, replace: 'console.warn(' } // fallback
]);

// 6. app/api/pitch-deck/[pitchId]/route.ts
replaceInFile('app/api/pitch-deck/[pitchId]/route.ts', [
  { search: /error: pitchError/g, replace: 'error: _pitchError' }
]);

// 7. app/api/stripe/webhook/route.ts
replaceInFile('app/api/stripe/webhook/route.ts', [
  { search: /console\.log\('Unhandled event type:'/g, replace: 'console.warn(\'Unhandled event type:\'' }
]);

// 8. app/catalyst/page.tsx
replaceInFile('app/catalyst/page.tsx', [
  { search: /Star,\s*Shield,\s*/g, replace: '' },
  { search: /Star,\s*/g, replace: '' },
  { search: /Shield,\s*/g, replace: '' }
]);

// 9. app/deal-room/[interestId]/page.tsx
replaceInFile('app/deal-room/[interestId]/page.tsx', [
  { search: /import Link from 'next\/link';/g, replace: '' },
  { search: /const { data, error: conversationError }/g, replace: 'const { data: _data, error: conversationError }' }
]);

// 10. app/founder/become-seller/page.tsx
replaceInFile('app/founder/become-seller/page.tsx', [
  { search: /const { data: userProfile/g, replace: 'const { data: _userProfile' }
]);

// 11. app/founder/create-pitch/page.tsx
replaceInFile('app/founder/create-pitch/page.tsx', [
  { search: /ChevronDown,\s*/g, replace: '' },
  { search: /MessageSquare,\s*/g, replace: '' },
  { search: /ExternalLink,\s*/g, replace: '' },
  { search: /const { data: _updateData, error }/g, replace: 'const { data: _updateData, error: _error }' },
  { search: /const { data, error }/g, replace: 'const { data, error: _error }' }, // need to be careful here
  { search: /custom_qa\s*=/g, replace: '_custom_qa =' },
  { search: /console\.log\('Creating pitch/g, replace: 'console.warn(\'Creating pitch' },
  { search: /console\.log\('Uploading/g, replace: 'console.warn(\'Uploading' },
  { search: /<img src=\{customLogoUrl\}/g, replace: '<img src={customLogoUrl} alt="" ' }
]);

// 12. app/founder/dashboard/page.tsx
replaceInFile('app/founder/dashboard/page.tsx', [
  { search: /const { data: investorProfile }/g, replace: 'const { data: _investorProfile }' },
  { search: /const { data: investorAuth }/g, replace: 'const { data: _investorAuth }' },
  { search: /const { data: recentActivity }/g, replace: 'const { data: _recentActivity }' }
]);

// 13. app/founder/pitches/page.tsx
replaceInFile('app/founder/pitches/page.tsx', [
  { search: /Filter,\s*/g, replace: '' }
]);

// 14. app/founder/settings/page.tsx
replaceInFile('app/founder/settings/page.tsx', [
  { search: /ArrowRight,\s*/g, replace: '' },
  { search: /Bell,\s*/g, replace: '' },
  { search: /const { data: userProfile/g, replace: 'const { data: _userProfile' }
]);

// 15. app/founder/store/deals/page.tsx
replaceInFile('app/founder/store/deals/page.tsx', [
  { search: /ArrowRight,\s*/g, replace: '' },
  { search: /CheckCircle2,\s*/g, replace: '' }
]);

// 16. app/founder/store/new-product/page.tsx
replaceInFile('app/founder/store/new-product/page.tsx', [
  { search: /ImageIcon,\s*/g, replace: '' },
  { search: /DollarSign,\s*/g, replace: '' },
  { search: /Tag,\s*/g, replace: '' },
  { search: /HelpCircle,\s*/g, replace: '' },
  { search: /Maximize2,\s*/g, replace: '' },
  { search: /const finalFileUrl /g, replace: 'const _finalFileUrl ' },
  { search: /const { data: newProd/g, replace: 'const { data: _newProd' }
]);

// 17. app/founder/store/page.tsx
replaceInFile('app/founder/store/page.tsx', [
  { search: /Eye,\s*/g, replace: '' },
  { search: /ArrowRight,\s*/g, replace: '' },
  { search: /AlertCircle,\s*/g, replace: '' },
  { search: /\(url, idx\)/g, replace: '(url, _idx)' },
  { search: /\(url: string, idx: number\)/g, replace: '(url: string, _idx: number)' }
]);

// 18. app/investor/portal/page.tsx
replaceInFile('app/investor/portal/page.tsx', [
  { search: /useRef,\s*/g, replace: '' },
  { search: /ArrowRight,\s*/g, replace: '' },
  { search: /Filter,\s*/g, replace: '' }
]);

// 19. app/marketplace/page.tsx
replaceInFile('app/marketplace/page.tsx', [
  { search: /const \[listingTab, setListingTab\]/g, replace: 'const [listingTab, _setListingTab]' },
  { search: /const TYPES =/g, replace: 'const _TYPES =' }
]);

// 20. app/onboarding/page.tsx
replaceInFile('app/onboarding/page.tsx', [
  { search: /Check,\s*/g, replace: '' },
  { search: /import Link from 'next\/link';\s*/g, replace: '' }
]);

// 21. app/order-confirmation/page.tsx
replaceInFile('app/order-confirmation/page.tsx', [
  { search: /User,\s*/g, replace: '' },
  { search: /const router = useRouter\(\);/g, replace: 'const _router = useRouter();' }
]);

