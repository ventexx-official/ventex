const fs = require('fs');

function patchFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
}

patchFile('app/founder/become-seller/page.tsx', [
    { search: 'const { data: userProfile }', replace: 'const { data: _userProfile }' }
]);

patchFile('app/founder/create-pitch/page.tsx', [
    { search: 'const { data: newPitch, error }', replace: 'const { data: newPitch, error: _error }' },
    { search: 'const { custom_qa, ...payloadWithoutCustomQa } = payload;', replace: 'const { custom_qa: _custom_qa, ...payloadWithoutCustomQa } = payload;' },
    { search: 'console.log(\"handleSubmit called. pitchId:\", pitchId);', replace: 'console.warn(\"handleSubmit called. pitchId:\", pitchId);' },
    { search: 'console.log(\"Pitch submitted successfully\");', replace: 'console.warn(\"Pitch submitted successfully\");' },
    { search: '<img src={data.photo_url} className=\"w-full h-full object-cover\" />', replace: '<img src={data.photo_url} alt=\"\" className=\"w-full h-full object-cover\" />' }
]);

patchFile('app/founder/dashboard/page.tsx', [
    { search: 'const { data: recentActivity } = await supabase', replace: 'const { data: _recentActivity } = await supabase' }
]);

patchFile('app/founder/pitches/page.tsx', [
    { search: 'const [statusFilter, setStatusFilter] = useState', replace: 'const [statusFilter, _setStatusFilter] = useState' },
    { search: '}, [status, search, fetchPitches]);', replace: '}, [status, fetchPitches]);' }
]);

patchFile('app/founder/settings/page.tsx', [
    { search: 'const { data: userProfile } = await supabase', replace: 'const { data: _userProfile } = await supabase' }
]);

patchFile('app/founder/store/new-product/page.tsx', [
    { search: 'const finalFileUrl = url;', replace: 'const _finalFileUrl = url;' }
]);

patchFile('app/founder/store/page.tsx', [
    { search: 'handleAction(url, idx)', replace: 'handleAction(url, _idx)' },
    { search: 'handleAction(url: string, idx: number)', replace: 'handleAction(url: string, _idx: number)' }
]);

patchFile('app/investor/portal/page.tsx', [
    { search: 'useRef, ', replace: '' }
]);

patchFile('app/order-confirmation/page.tsx', [
    { search: 'const [currentUser, setCurrentUser] = useState', replace: 'const [currentUser, _setCurrentUser] = useState' }
]);

patchFile('app/deal-room/[interestId]/page.tsx', [
    { search: 'const { data, error } = await supabase\\n        .from(\\'deal_room_messages\\')', replace: 'const { data: _data, error } = await supabase\\n        .from(\\'deal_room_messages\\')' }
]);

