import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import sharp from 'sharp';
import {buildPhoneMockupReview} from './phone-mockup-review.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, '../../..');
const brief = JSON.parse(await fs.readFile(path.join(DIR, 'brief.json'), 'utf8'));
const collectionFile = path.join(ROOT, brief.source_collection);
const collection = JSON.parse(await fs.readFile(collectionFile, 'utf8'));
const collectionDir = path.dirname(collectionFile);
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const abs = p => path.isAbsolute(p) ? p : path.join(ROOT, p);
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save = async (name, value) => {
  await fs.mkdir(path.dirname(path.join(DIR, name)), {recursive: true});
  await fs.writeFile(path.join(DIR, name), value);
};
const json = (name, value) => save(name, JSON.stringify(value, null, 2) + '\n');
const sources = new Map();

function disposition(a) {
  if (brief.blocked_sources[a.id]) return {use:'exclude', reason:brief.blocked_sources[a.id]};
  if (/historical|older/i.test(a.kind + ' ' + a.category)) return {use:'exclude', reason:'Historical UI; not current product proof.'};
  if (/generated|Blender|3D/i.test(a.kind)) return {use:'social-reference-only', reason:'Artwork or device composition; use the native source for App Store proof. Not cleared for screenshot or preview upload.'};
  if (a.variant) return {use:'source-variant', reason:'Keep linked to the higher-resolution original; no duplicate export.'};
  if (brief.selected_sources.includes(a.id)) return {use:'collected-native-source', reason:'Genuine capture; inspect item-specific notes and release/localization gaps before upload.'};
  return {use:'reference-hold', reason:'Not selected; needs frame, freshness or duplication review before use.'};
}

for (const id of brief.selected_sources) {
  const source = collection.assets.find(a => a.id === id);
  if (!source || !/^genuine/i.test(source.kind)) throw new Error(`Not a genuine source: ${id}`);
  const original = path.join(collectionDir, source.file);
  const bytes = await fs.readFile(original);
  if (digest(bytes) !== source.sha256) throw new Error(`Source changed: ${id}`);
  const file = `sources/${id}${path.extname(original).toLowerCase()}`;
  await save(file, bytes);
  sources.set(id, {...source, file, original, use:disposition(source)});
}

await fs.mkdir(path.join(DIR, 'sources'), {recursive:true});
const target = brief.video_sources.find(v => v.id === 'native-target');
const targetFile = path.join(DIR, 'sources/target-en.png');
execFileSync('ffmpeg', ['-v','error','-y','-ss','1.72','-i',abs(target.path),'-frames:v','1','-update','1',targetFile]);
const targetBytes = await fs.readFile(targetFile);
const targetMeta = await sharp(targetBytes).metadata();
sources.set('target-en', {id:'target-en', file:'sources/target-en.png', original:abs(target.path), kind:'genuine iOS video frame', title:'Native English Target Run distance picker', width:targetMeta.width, height:targetMeta.height, sha256:digest(targetBytes), note:'Exact decoded frame at requested seek1.72s; no text redrawn. Installed build unspecified.'});

const textBounds = [];
function line(ctx, value, x, y, size, color, weight='700') {
  ctx.font = `${weight} ${size}px Arial`;
  ctx.fillStyle = color;
  const m = ctx.measureText(value);
  if (m.width > 1152) throw new Error(`Text overflows: ${value} (${m.width})`);
  ctx.fillText(value, x, y);
  textBounds.push({text:value,x,y,size,width:m.width});
}

async function renderCard(page, locale, card, index) {
  const [width,height] = brief.output_size;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#101014'; ctx.fillRect(0,0,width,height);
  const accent = '#ff6a32';
  line(ctx,'coachi',84,124,62,'#fff');
  line(ctx,locale==='no'?'VEILEDNING UNDERVEIS':'LIVE RUNNING GUIDANCE',430,119,30,'#b8b7bd','500');
  ctx.fillStyle=accent;ctx.fillRect(84,170,88,7);
  for (let i=0;i<card.title.length;i++) line(ctx,card.title[i],84,343+i*143,132,i===1?accent:'#fff');
  for (let i=0;i<card.body.length;i++) line(ctx,card.body[i],88,589+i*68,53,'#d7d6dc','400');
  const qualification = card.evidence_note || (['C032','C042'].includes(card.source) ? (locale==='no'?'Eksempel på personlig pulsmål':'Example of a personal heart-rate target') : card.source==='C119' ? (locale==='no'?'Én ekte økt · Resultater varierer':'One real workout · Results vary') : null);
  if(qualification) line(ctx,qualification,88,733,40,'#b8b7bd','400');
  const source = sources.get(card.source);
  if (!source) throw new Error(`Missing source ${card.source}`);
  const img = await loadImage(path.join(DIR, source.file));
  const [sx,sy,sw,sh] = card.crop || [0,0,img.width,img.height];
  if (sx<0 || sy<0 || sx+sw>img.width || sy+sh>img.height) throw new Error(`Bad crop ${card.id}`);
  const maxW = card.max_image_width || 1092;
  const maxH = 1840;
  const scale = Math.min(maxW/sw,maxH/sh);
  const dw=Math.round(sw*scale),dh=Math.round(sh*scale);
  const dx=Math.round((width-dw)/2),dy=760+Math.round((maxH-dh)/2);
  ctx.fillStyle='#23232c';ctx.fillRect(dx-2,dy-2,dw+4,dh+4);
  // This is a graphic layout of a real app capture, not a rendered handset or reconstructed UI.
  ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
  let footerSize = 42;
  ctx.font=`400 ${footerSize}px Arial`;
  while(ctx.measureText(card.footer).width>1152 && footerSize>36) { footerSize--;ctx.font=`400 ${footerSize}px Arial`; }
  line(ctx,card.footer,84,2738,footerSize,'#b8b7bd','400');
  const file=`screenshots/${page.id}/${locale}/${card.id}.png`;
  const png=await sharp(canvas.toBuffer('image/png')).removeAlpha().png().toBuffer();
  await save(file,png);
  const thumb=`thumbnails/${page.id}/${locale}/${card.id}.jpg`;
  await save(thumb,await sharp(png).resize({width:330}).jpeg({quality:90}).toBuffer());
  return {id:card.id,position:index+1,source_id:source.id,source_sha256:source.sha256,crop:card.crop||null,file,thumbnail:thumb,width,height,sha256:digest(png),body:card.body,title:card.title,footer:card.footer,status:'DRAFT_NOT_UPLOAD_CLEARED',ui_locale:source.id==='C087'?'no':'en-US',source_kind:source.kind};
}

const exports=[];
for(const page of brief.pages) for(const [locale,data] of Object.entries(page.localizations)) {
  if ([...data.promotional_text].length>170) throw new Error(`Promo too long ${page.id}/${locale}`);
  const cards=[];
  for(const [i,card] of data.cards.entries()) cards.push(await renderCard(page,locale,card,i));
  exports.push({page_id:page.id,locale,promotional_text:data.promotional_text,promotional_text_characters:[...data.promotional_text].length,cards});
}

const inventory=collection.assets.map(a=>({...a,disposition:disposition(a),collection_file:path.join(collectionDir,a.file)}));
await json('inventory.json',{created_at:new Date().toISOString(),collection_manifest_sha256:digest(await fs.readFile(collectionFile)),total:inventory.length,selected_sources:[...sources.values()],assets:inventory,excluded_user_pack:'All outdated fastlane/screenshots cards and their copies; none used or copied.'});
await json('exports.json',{status:brief.status,app_id:brief.app_id,default_metadata_unchanged:true,published:false,upload_cleared:false,sets:exports,text_bounds:textBounds});

for(const source of sources.values()) {
  const thumb=`thumbnails/sources/${source.id}.jpg`;
  await save(thumb,await sharp(path.join(DIR,source.file)).resize({width:300,height:560,fit:'inside',withoutEnlargement:true}).jpeg({quality:85}).toBuffer());
  source.thumbnail=thumb;
}

const css=`:root{color-scheme:light;--ink:#17171c;--muted:#686871;--orange:#cf4315;--line:#dededc}*{box-sizing:border-box}body{margin:0;background:#f5f4f0;color:var(--ink);font:16px/1.55 -apple-system,BlinkMacSystemFont,Arial,sans-serif}a{color:var(--orange);text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #d84c1a;outline-offset:5px}header,main,footer{max-width:1460px;margin:auto;padding:28px 40px}header{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);gap:18px;flex-wrap:wrap}header strong{font-size:24px}.kicker{font-size:13px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted)}h1{font-size:clamp(36px,5vw,70px);line-height:1.05;letter-spacing:-.045em;max-width:980px;margin:30px 0 22px}h2{font-size:30px;letter-spacing:-.02em;line-height:1.18;margin:34px 0 18px}p{max-width:900px}.lead{font-size:20px;color:#55555e;max-width:900px}.notice{border-left:4px solid var(--orange);padding:16px 22px;background:#ebe8e0;margin:24px 0}.pairs{display:grid;grid-template-columns:1fr 1fr;gap:38px}.page-panel{border-top:1px solid var(--line);padding-top:18px}.strip{display:flex;gap:14px;overflow:auto;padding:8px 0 20px;scroll-snap-type:x proximity}.strip a{flex:0 0 min(29vw,310px);scroll-snap-align:start}.strip img{display:block;width:100%;height:auto;border-radius:5px}.mini{display:flex;gap:8px;align-items:start}.mini img{width:calc((100% - 16px)/3);height:auto}.links{display:flex;gap:24px;flex-wrap:wrap;margin:18px 0}.metadata{border-top:1px solid var(--line);padding:22px 0;display:grid;grid-template-columns:200px 1fr;gap:20px}.metadata p{margin:0}.assets{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:28px}.asset{border-top:1px solid var(--line);padding-top:12px}.asset img{height:290px;width:100%;object-fit:contain;background:#202026}.asset p{font-size:14px}.asset .kind{color:var(--muted);font-size:12px}.badge{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}details{padding:18px 0;border-top:1px solid var(--line)}summary{cursor:pointer;font-weight:600}li{margin:9px 0}video{max-width:360px;width:100%;background:#101014}footer{border-top:1px solid var(--line);color:var(--muted);font-size:14px}.note{font-size:14px;color:var(--muted)}@media(max-width:720px){header,main,footer{padding:20px}.pairs{grid-template-columns:1fr}.strip a{flex-basis:75vw}.metadata{grid-template-columns:1fr;gap:8px}.assets{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.asset img{height:230px}.lead{font-size:18px}}`;
await save('style.css',css);
function html(title,body,lang='en') {return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Coachi drafts</title><link rel="stylesheet" href="style.css"></head><body><header><strong>coachi</strong><span class="badge">Local review · Not uploaded · 8 September 2026</span><a href="index.html">All drafts</a></header><main>${body}</main><footer>Real source captures, unchanged UI. No new voices, ad edits, paid calls or App Store changes. Local review only.</footer></body></html>`;}
for(const set of exports) {
  const page=brief.pages.find(p=>p.id===set.page_id), data=page.localizations[set.locale];
  const body=`<p class="kicker">Custom product page concept · ${esc(set.locale)}</p><h1>${esc(data.label)}</h1><p class="lead">A message-matched App Store screenshot sequence. These are reviewable graphic exports, not a live App Store page.</p><nav class="links"><a href="${page.id}-en-US.html">English</a><a href="${page.id}-no.html">Norsk</a><a href="assets.html">Collected source library</a></nav><div class="strip">${set.cards.map(c=>`<a href="${c.file}" aria-label="Open full-size screenshot ${c.position}: ${esc(c.title.join(' '))}"><img src="${c.thumbnail}" width="330" height="717" alt="${esc(c.title.join(' '))}"></a>`).join('')}</div><div class="metadata"><strong>Promotional text</strong><p>${esc(set.promotional_text)}<br><span class="note">${set.promotional_text_characters}/170 characters. This is the page-specific copy; app name, subtitle and description are unchanged.</span></p></div><div class="metadata"><strong>Candidate search intent</strong><p>${data.keyword_candidates.map(esc).join(' · ')}<br><span class="note">Research hypotheses, not verified search volume or assigned keywords.</span></p></div><div class="notice"><strong>Before upload</strong><p>${set.locale==='no'?'Norwegian headlines and promotional copy are drafted. Most embedded app screens remain English; a fully Norwegian screenshot set needs native recaptures. ':''}The first card shows a genuine stationary warmup example, not a runner’s live session. The real score source is low-resolution. No old fastlane screenshot cards or generated device imagery are used.</p></div><details open><summary>Capture gaps for this page</summary><ul>${page.capture_gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></details><details><summary>Exact source mapping</summary><ul>${set.cards.map(c=>`<li>${esc(c.id)} → ${esc(c.source_id)} · ${c.crop?'Documented app detail crop':'Full source view'} · <a href="${sources.get(c.source_id).file}">Unchanged source</a></li>`).join('')}</ul></details>`;
  const watchNotice=page.id==='watch-coaching'?'<aside class="notice"><strong>Watch hero still needs its current screenshot.</strong><p>The 4.0.2 (127) native build passed, but Simulator startup blocked capture. The approved local HTML design could not be opened under browser security policy. This sequence is provisional iPhone material, not a finished Watch page. <a href="qa/watch-capture-status.md">Capture status and next input</a>.</p></aside>':'';
  await save(`${page.id}-${set.locale}.html`,html(data.label,watchNotice+body,set.locale==='no'?'nb':'en'));
}
const index=`<p class="kicker">App Store creative collection</p><h1>Two pages.<br>Real product proof.</h1><p class="lead">Reusing the recent ads, CTA sources and Target Run footage. Old screenshot cards are excluded. Pick a page, compare the story, then open any card at its full export size.</p><div class="pairs">${brief.pages.map(p=>{const set=exports.find(e=>e.page_id===p.id&&e.locale==='en-US');return `<section class="page-panel"><h2>${esc(p.localizations['en-US'].label)}</h2><p>${esc(p.audience)}</p><div class="mini">${set.cards.slice(0,3).map(c=>`<img src="${c.thumbnail}" width="330" height="717" alt="${esc(c.title.join(' '))}">`).join('')}</div><nav class="links"><a href="${p.id}-en-US.html">Review English page</a><a href="${p.id}-no.html">Se norsk utkast</a></nav></section>`;}).join('')}</div><div class="notice"><strong>Drafts, not approved upload assets.</strong><p>18 screenshot exports at 1320×2868, English/Norwegian copy, and ${sources.size} curated genuine sources. Current native Apple Watch, active conversational-coach and higher-resolution result captures are still needed for a stronger final package. No synthetic watch screen stands in for missing evidence.</p></div><nav class="links"><a href="assets.html">Browse all collected sources</a><a href="inventory.json">Full ${inventory.length}-asset disposition inventory</a><a href="exports.json">Export and source checksums</a><a href="README.md">Handoff / upload checklist</a></nav>`;
await buildPhoneMockupReview(DIR);
const mockupLink='<section class="notice"><strong>Updated: premium 3D phone presentation.</strong><p>Refined studio-lit hardware with genuine app screens. The original flat exports below remain unchanged.</p><nav class="links"><a href="phone-mockups-en.html">Review the 3D phones</a><a href="phone-mockups-no.html">Se 3D-utkastet på norsk</a></nav></section>';
const conversion = brief.conversion_plan;
if (conversion.status !== 'STORYBOARD_ONLY' || conversion.publication_authorized !== false || conversion.experiment_started !== false) {
  throw new Error('The local conversion storyboard is not an upload or experiment launcher.');
}
const conversionCards = new Map(conversion.cards.map(card => [card.id, card]));
if (conversionCards.size !== conversion.cards.length) throw new Error('Duplicate conversion card ID');
for (const sequence of Object.values(conversion.sequences)) {
  if (sequence.length < 1 || sequence.length > 10 || new Set(sequence).size !== sequence.length || sequence.some(id => !conversionCards.has(id))) {
    throw new Error('Invalid conversion screenshot sequence');
  }
}
const readiness = conversion.cards.map(card => {
  if (!['missing', 'recapture', 'verify'].includes(card.capture_state)) throw new Error(`Unreviewed capture state: ${card.id}`);
  for (const locale of ['en-US', 'no']) {
    const copy = card[locale];
    if (!copy || copy.title.length !== 2 || copy.title.join(' ').split(/\s+/).length > 8 || copy.body.length > 100) {
      throw new Error(`Conversion copy needs a short two-line benefit: ${card.id}/${locale}`);
    }
    if (card.paid && (!copy.disclosure?.includes('Coachi+') || !/subscription|abonnement/i.test(copy.disclosure))) {
      throw new Error(`Missing subscription qualification: ${card.id}/${locale}`);
    }
  }
  const candidates = Object.entries(card.candidate_sources || {}).map(([locale, id]) => {
    const source = sources.get(id);
    if (!['en-US', 'no'].includes(locale) || !source || brief.blocked_sources[id] || ['C062', 'C072'].includes(id)) throw new Error(`Ineligible conversion source: ${id}`);
    return {locale, source_id: id, source_sha256: source.sha256, file: source.file, release_verified: false};
  });
  const localizations = Object.fromEntries(['en-US', 'no'].map(locale => [locale, {
    capture_state: candidates.some(candidate => candidate.locale === locale) ? card.capture_state : 'missing',
    upload_cleared: false
  }]));
  return {id: card.id, capture_state: card.capture_state, upload_cleared: false, candidates, localizations};
});
const experiment = conversion.experiment;
if (experiment.status !== 'NOT_STARTED' || experiment.spend_authorized !== false || experiment.treatments !== 1 || experiment.proposed_treatment_traffic_percent !== 50) {
  throw new Error('This package only prepares the proposed, unstarted one-treatment test.');
}
for (const order of [experiment.control_order, experiment.treatment_order, conversion.capture_order]) {
  if (order.length !== conversionCards.size || new Set(order).size !== order.length || order.some(id => !conversionCards.has(id))) {
    throw new Error('Capture and experiment orders must cover the same complete card set.');
  }
}
let previewEnd = 0;
for (const segment of conversion.preview.segments) {
  if (segment.start !== previewEnd || segment.end <= segment.start || !conversionCards.has(segment.card)) throw new Error('Invalid preview timeline');
  previewEnd = segment.end;
}
if (previewEnd !== conversion.preview.duration_seconds || previewEnd < 15 || previewEnd > 30) throw new Error('Preview timing must be continuous and 15–30 seconds');
await json('conversion-review.json', {
  status: conversion.status, published: false, upload_cleared: false, experiment_started: false,
  release_context: brief.release_context,
  brief_sha256: digest(await fs.readFile(path.join(DIR, 'brief.json'))),
  copy_verified_against: conversion.copy_verified_against, capture_record_fields: conversion.capture_record_fields,
  sequences: conversion.sequences, cards: readiness, global_gates: conversion.global_gates,
  preview: conversion.preview, experiment: conversion.experiment, distribution: conversion.distribution
});
const conversionCSS = `<style>
@font-face{font-family:Sora;src:url('fonts/sora-bold.ttf');font-weight:700;font-display:swap}
@font-face{font-family:Manrope;src:url('fonts/manrope-medium.ttf');font-weight:500;font-display:swap}
.conversion{font-family:Manrope,system-ui,sans-serif;font-weight:500;color:#17382b}
.conversion h1,.conversion h2,.conversion h3{font-family:Sora,system-ui,sans-serif;font-weight:700}
.conversion h1{font-size:clamp(32px,4vw,58px);max-width:850px;line-height:1.12}
.conversion h3{font-size:clamp(22px,2.4vw,30px);line-height:1.2;margin:12px 0}
.conversion h3 span{color:#a83a1c}.conversion .story-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:38px;padding:30px 0;border-top:1px solid #ccd7ce}
.conversion .evidence{border-left:3px solid #a83a1c;padding-left:22px}.conversion .story-row p{margin:10px 0}
.conversion .eyebrow{font-size:13px;letter-spacing:.07em;text-transform:uppercase}.conversion .proof-state{font-size:14px;color:#674636}
.conversion .disclosure{font-size:14px;font-weight:500}.conversion .links a{min-height:44px;display:inline-flex;align-items:center}
.conversion .story-nav{display:flex;flex-wrap:wrap;gap:12px 24px;padding:0;list-style:none}.conversion .story-nav a{min-height:44px;display:inline-flex;align-items:center}
.conversion .sequence{overflow-wrap:anywhere}.conversion .notice{background:#e9eee3;border-color:#a83a1c}
.conversion .story-strip{display:flex;overflow-x:auto;gap:18px;scroll-snap-type:x proximity;scroll-padding:2px;padding:10px 2px 22px;margin:24px 0 36px}
.conversion .story-card{flex:0 0 290px;scroll-snap-align:start;background:linear-gradient(#f3f5eb,#dee8d8);border:1px solid #c2d0c2;border-radius:12px;padding:22px;display:flex;flex-direction:column;min-width:0}
.conversion .story-card h2{font-size:26px;line-height:1.22;margin:12px 0;letter-spacing:-.025em}.conversion .story-card h2 span{color:#9e381b}
.conversion .story-card p{font-size:14px;line-height:1.5;margin:8px 0}.conversion .story-card .disclosure{font-size:13px;color:#173228}
.conversion .proof-slot{margin-top:auto;padding-top:18px}.conversion .proof-slot img{display:block;width:100%;height:280px;object-fit:contain;background:#14281f;border-radius:6px}
.conversion .proof-placeholder{min-height:280px;border:1px dashed #64786a;border-radius:6px;padding:24px;display:flex;flex-direction:column;justify-content:center;gap:12px;color:#425b4d}
.conversion .proof-placeholder strong{font-family:Sora,system-ui,sans-serif;font-size:20px;line-height:1.3}.conversion .story-card .proof-state{font-size:13px;min-height:40px}
.conversion .proof-link{display:inline-flex;align-items:center;min-height:44px;font-size:14px}.conversion .story-strip:focus-visible{outline:3px solid #9e381b;outline-offset:4px}
@media(max-width:720px){.conversion .story-row{grid-template-columns:minmax(0,1fr);gap:12px}.conversion .evidence{padding-left:16px}}
@media(max-width:420px){.conversion .story-card{flex-basis:calc(100vw - 58px)}}
</style>`;
for (const locale of ['en-US', 'no']) {
  const norwegian = locale === 'no';
  const stateLabels = norwegian ? {missing:'Opptak mangler',recapture:'Nytt opptak kreves',verify:'Kilde finnes · må verifiseres'} : {missing:'Capture missing',recapture:'Recapture required',verify:'Source exists · verification required'};
  const storyStrip = `<section class="story-strip" tabindex="0" aria-label="${norwegian?'Bla gjennom foreslått rekkefølge':'Scroll through the proposed screenshot order'}">${conversion.sequences['main-listing'].map((id, i) => {
    const card = conversionCards.get(id), copy = card[locale], proof = readiness.find(item => item.id === id);
    const candidate = proof.candidates.find(item => item.locale === locale);
    const media = candidate
      ? `<a href="${candidate.file}"><img src="${candidate.file}" loading="lazy" alt="${esc(candidate.source_id)} — ${norwegian?'referanse, ikke verifisert mot versjonen':'reference, not release-verified'}"></a>`
      : `<div class="proof-placeholder"><strong>${norwegian?'Ekte appopptak mangler':'Actual app capture needed'}</strong><span>${norwegian?'Plassholder for opptak. Dette er ikke appens UI.':'Capture placeholder. This is not the app UI.'}</span></div>`;
    return `<article class="story-card" data-card="${id}"><p class="eyebrow">${String(i+1).padStart(2,'0')} / 07 · ${card.paid?'Coachi+':(norwegian?'Coachi · Utkast':'Coachi · Draft')}</p><h2>${esc(copy.title[0])}<br><span>${esc(copy.title[1])}</span></h2><p>${esc(copy.body)}</p>${copy.disclosure?`<p class="disclosure">${esc(copy.disclosure)}</p>`:''}<div class="proof-slot">${media}<p class="proof-state">${esc(stateLabels[proof.localizations[locale].capture_state])} · ${norwegian?'Ikke klar for opplasting':'Not upload-cleared'}</p><a class="proof-link" href="#${id}">${norwegian?'Se opptakskrav':'See capture requirements'}</a></div></article>`;
  }).join('')}</section>`;
  const rows = conversion.sequences['main-listing'].map((id, i) => {
    const card = conversionCards.get(id), copy = card[locale];
    const proof = readiness.find(item => item.id === id), candidate = proof.candidates.find(item => item.locale === locale);
    return `<section class="story-row" id="${esc(id)}"><div><p class="eyebrow">${String(i + 1).padStart(2,'0')} / 07 · ${norwegian?'Foreslått skjermbilde':'Proposed screenshot'}</p><h3>${esc(copy.title[0])}<br><span>${esc(copy.title[1])}</span></h3><p>${esc(copy.body)}</p>${copy.disclosure?`<p class="disclosure">${esc(copy.disclosure)}</p>`:''}<p class="proof-state">${esc(stateLabels[proof.localizations[locale].capture_state])} · ${norwegian?'Ikke klar for opplasting':'Not upload-cleared'}</p></div><div class="evidence" lang="en"><strong>Capture requirement</strong><p>${esc(card.capture)}</p><details><summary>Acceptance check</summary><p>${esc(card.acceptance)}</p></details>${candidate?`<p><a href="${candidate.file}">Existing source ${esc(candidate.source_id)}</a> · reference only; not release-verified.</p>`:'<p>No matching localized native source is approved. No invented screen is displayed.</p>'}</div></section>`;
  }).join('');
  const planBody = `${conversionCSS}<div class="conversion"><p class="kicker">${norwegian?'Historie og opptaksplan':'Story and capture plan'}</p><h1>${norwegian?'Vis coachingen først.\nLa oppsettet komme etterpå.':'Show the coaching first.\nLet setup come later.'}</h1><p class="lead">${norwegian?'Foreslått rekkefølge og norsk salgstekst. Dette er en arbeidsplan, ikke nye appbilder.':'Proposed screenshot order and English copy. This is a production storyboard, not new app screenshots.'}</p><nav class="links"><a href="conversion-en-US.html"${!norwegian?' aria-current="page"':''}>English</a><a href="conversion-no.html"${norwegian?' aria-current="page"':''}>Norsk</a><a href="phone-mockups-${norwegian?'no':'en'}.html">${norwegian?'Godkjenn visuell retning':'Review existing visual direction'}</a><a href="CONVERSION-HANDOFF.md">Capture and test handoff</a></nav><aside class="notice"><strong>${norwegian?'Ingen nye opptak, opplasting eller publisering.':'No new captures, uploads or publication.'}</strong><p>${norwegian?'Coachi+-verdien er tydelig: AI-coaching i sanntid og valget mellom 3 unike coachstemmer. Eksisterende V5-bilder og originalopptak er bevart. Opptaksinstruksjonene nedenfor er på engelsk.':'Coachi+ value is explicit: realtime AI coaching and the full choice of 3 unique coach voices. Existing V5 artwork and original captures are preserved.'}</p></aside><nav aria-label="Screenshot story"><ol class="story-nav">${conversion.sequences['main-listing'].map((id,i)=>`<li><a href="#${id}">${i+1}. ${esc(conversionCards.get(id)[locale].title.join(' '))}</a></li>`).join('')}</ol></nav>${rows}<h2>${norwegian?'Varianter til riktig målgruppe':'Audience-matched variants'}</h2>${Object.entries(conversion.sequences).filter(([id])=>id!=='main-listing').map(([id,sequence])=>`<p class="sequence"><strong>${esc(brief.pages.find(page=>page.id===id).localizations[locale].label)}</strong><br>${sequence.map(card=>esc(conversionCards.get(card)[locale].title.join(' '))).join(' → ')}</p>`).join('')}<div class="notice"><strong>Not started: one controlled screenshot-order test</strong><p lang="en">${esc(conversion.experiment.hypothesis)} Keep the asset set and traffic allocation fixed; no causal claim about fonts or colours from a package-level change. <a href="CONVERSION-HANDOFF.md">Read the exact gates and measurement plan</a>.</p></div><p><a href="conversion-review.json">Machine-readable source and readiness report</a></p></div>`;
  await save(`conversion-${locale}.html`, html(norwegian?'Coaching først':'Coaching-first story', planBody.replace('<nav aria-label="Screenshot story">', storyStrip+'<nav aria-label="Screenshot story">'), norwegian?'nb':'en'));
}
const handoff = `# Coachi conversion finishing plan

Local review only. No new screen capture, voice generation, upload, submission, experiment or paid traffic change. The V5 phones/background/type and all original exports remain unchanged.

## Release context — ${brief.release_context.owner_confirmation_date}

${brief.release_context.note} [Recorded Apple lookup](${brief.release_context.public_lookup.url}), checked ${brief.release_context.public_lookup.checked_at}. The immutable build130 source remains the copy-verification reference; it is not proof of which binary is publicly distributed.

## Capture these first

${conversion.capture_order.map((id,i)=>{const card=conversionCards.get(id);return `${i+1}. **${card['en-US'].title.join(' ')}** — ${card.capture}\n\n   Accept when: ${card.acceptance}`;}).join('\n\n')}

Record for every selected capture: ${conversion.capture_record_fields.join(', ')}. Keep source originals unchanged; do not treat this source-code verification as evidence of the installed capture build.

The first three proposed main-page images are the live coach, realtime AI coaching and the three voice choices. The Watch-specific page still leads with the Watch benefit. Missing imagery stays visibly marked, not substituted with generated UI.

## English and Norwegian screenshot copy

${conversion.cards.map(card=>`### ${card.id}\n\nEN: ${card['en-US'].title.join(' ')} ${card['en-US'].body}${card['en-US'].disclosure?' '+card['en-US'].disclosure:''}\n\nNO: ${card.no.title.join(' ')} ${card.no.body}${card.no.disclosure?' '+card.no.disclosure:''}`).join('\n\n')}

## Native preview proposal — ${conversion.preview.duration_seconds} seconds, not rendered

${conversion.preview.segments.map(segment=>`- ${segment.start}–${segment.end}s: ${segment.card}. ${segment.note}`).join('\n')}

${conversion.preview.note}

## Test only after capture and approval

Proposed experiment: ${conversion.experiment.treatments} treatment, ${conversion.experiment.proposed_treatment_traffic_percent}% of traffic to the treatment; original control receives the rest. Not configured or started.

Proposed matched control: ${conversion.experiment.control_order.join(' → ')}.

Proposed treatment: ${conversion.experiment.treatment_order.join(' → ')}.

${conversion.experiment.isolate}

${conversion.experiment.measurement}

${conversion.experiment.decision}

Apple recommends focused first images and one main benefit per later screenshot. [Product-page guidance](https://developer.apple.com/app-store/product-page/).

Apple's test tool randomizes treatment exposure and reports conversion and confidence. It supports a duration estimate and a maximum 90-day test; do not declare a winner from a few installs. [Product-page optimization](https://developer.apple.com/app-store/product-page-optimization/).

Custom pages have their own reviewed media/promotional text and returned URLs. Their source-specific results are not a randomized default-page test. [Custom pages](https://developer.apple.com/app-store/custom-product-pages/).

## Distribution mapping — no campaign changes

${conversion.distribution.map(item=>`- ${item.source} → ${item.destination}: ${item.action}`).join('\n')}

Use existing campaign-link tooling after a real approved page URL exists. No guessed page IDs, new campaigns, increased budgets or outreach. Reuse genuine ads and creator content only with appropriate rights and disclosure.

## Final gates

${conversion.global_gates.map(gate=>`- [ ] ${gate}`).join('\n')}

Copy evidence: ${conversion.copy_verified_against}

Current browser boundary: browser initialization failed; the fallback reported the Mac locked. Responsive review and the blocked Watch design capture remain unresolved. No workaround attempted.
`;
await save('CONVERSION-HANDOFF.md', handoff);
const conversionLink='<section class="notice"><strong>Next: a coaching-first App Store story.</strong><p>Proposed first images, clear Coachi+ value, exact missing captures and a controlled test plan. This is a storyboard—not seven new app screenshots.</p><nav class="links"><a href="conversion-en-US.html">Review English story</a><a href="conversion-no.html">Se norsk historie</a><a href="CONVERSION-HANDOFF.md">Capture checklist</a></nav></section>';
await save('index.html',html('Creative review',index.replace('<div class="pairs">',conversionLink+mockupLink+'<div class="pairs">')));
const assetBody=`<p class="kicker">Source library</p><h1>What we can reuse.</h1><p class="lead">${sources.size} genuine source images collected locally. ${inventory.length} existing collection entries classified. Originals and master ads are preserved; generated scenes stay outside native App Store proof.</p><div class="assets">${[...sources.values()].map(s=>`<article class="asset"><a href="${s.file}"><img src="${s.thumbnail}" loading="lazy" alt="${esc(s.title)}"></a><h3>${esc(s.id)} · ${esc(s.title)}</h3><p class="kind">${esc(s.kind)} · ${s.width}×${s.height}</p><p>${esc(s.note||'Genuine app capture; verify against release before upload.')}</p></article>`).join('')}</div><h2>Video reuse</h2>${brief.video_sources.map(v=>`<details><summary>${esc(v.id)} · ${esc(v.role)}</summary><p>${esc(v.note)}</p><p class="note">${esc(abs(v.path))}</p></details>`).join('')}<h2>Native preview ingredient</h2><p>The 2.6-second Target Run excerpt is usable within a 15–30-second native App Store preview. On its own it is too short. The three finished cinematic ads must not be uploaded unchanged as previews.</p><video controls playsinline preload="metadata" src="sources/target-run-website.mp4"></video><h2>Excluded and reference-only</h2><p>The <a href="inventory.json">full inventory</a> distinguishes source variants, social-only artwork, historical assets and unsettled UI. User-rejected old App Store cards are not copied into this package.</p>`;
const website=brief.video_sources.find(v=>v.id==='website-target');
await save('sources/target-run-website.mp4',await fs.readFile(abs(website.path)));
await save('assets.html',html('Asset library',assetBody));

for(const set of exports){
  const thumbs=await Promise.all(set.cards.map(c=>loadImage(path.join(DIR,c.thumbnail))));
  const w=350*thumbs.length+40,h=870,c=createCanvas(w,h),ctx=c.getContext('2d');
  ctx.fillStyle='#f5f4f0';ctx.fillRect(0,0,w,h);ctx.fillStyle='#17171c';ctx.font='700 24px Arial';
  ctx.fillText(`Coachi · ${set.page_id} · ${set.locale} · LOCAL DRAFT`,30,42);
  for(const [i,img] of thumbs.entries())ctx.drawImage(img,30+350*i,80,330,717);
  ctx.font='16px Arial';ctx.fillText('Recent genuine source UI. Current mid-run, conversational-coach and Watch proof still required. Not uploaded.',30,838);
  await save(`contact-${set.page_id}-${set.locale}.jpg`,await sharp(c.toBuffer('image/png')).jpeg({quality:92}).toBuffer());
}
console.log(JSON.stringify({pages:brief.pages.length,screenshot_sets:exports.length,screenshots:exports.reduce((n,s)=>n+s.cards.length,0),native_sources:sources.size,inventory:inventory.length,status:brief.status}));
