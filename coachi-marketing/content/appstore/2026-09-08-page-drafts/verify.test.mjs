import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {GlobalFonts} from '@napi-rs/canvas';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFile(path.join(dir,name));
const data=async name=>JSON.parse(await read(name));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const brief=await data('brief.json');
const exports=await data('exports.json');
const inventory=await data('inventory.json');

test('every page and localization has an ordered export set',()=>{
  assert.equal(exports.sets.length,4);
  for(const page of brief.pages)for(const [locale,info] of Object.entries(page.localizations)){
    const set=exports.sets.find(s=>s.page_id===page.id&&s.locale===locale);
    assert.ok(set);
    assert.equal(set.cards.length,info.cards.length);
    assert.deepEqual(set.cards.map(c=>c.position),set.cards.map((_,i)=>i+1));
    assert.ok(set.cards.length>=1&&set.cards.length<=10);
  }
});

test('all iPhone PNGs meet size/opacity and recorded checksum requirements',async()=>{
  for(const set of exports.sets)for(const c of set.cards){
    const b=await read(c.file),m=await sharp(b).metadata();
    assert.equal(m.width,1320);assert.equal(m.height,2868);
    assert.equal(m.hasAlpha,false);assert.equal(m.format,'png');
    assert.equal(sha(b),c.sha256);
  }
});

test('source copies are unchanged, current selections; outdated cards excluded',async()=>{
  assert.equal(inventory.assets.length,124);
  for(const s of inventory.selected_sources){
    assert.equal(sha(await read(s.file)),s.sha256);
    assert.match(s.kind,/genuine|native.*simulator/i);
    assert.doesNotMatch(s.original||'',/fastlane\/screenshots|app-store-cards/);
  }
  for(const set of exports.sets)for(const c of set.cards){
    assert.ok(inventory.selected_sources.some(s=>s.id===c.source_id));
    assert.ok(!Object.hasOwn(brief.blocked_sources,c.source_id));
  }
});

test('crop bounds preserve actual UI and keep active source map out',async()=>{
  for(const set of exports.sets)for(const c of set.cards){
    if(!c.crop)continue;
    const s=inventory.selected_sources.find(s=>s.id===c.source_id);
    const [x,y,w,h]=c.crop;
    assert.ok(x>=0&&y>=0&&x+w<=s.width&&y+h<=s.height);
    if(c.source_id==='C097')assert.ok(y>=470);
  }
});

test('paid benefits and metadata boundaries remain explicit',()=>{
  assert.equal(brief.publication_authorized,false);
  assert.equal(exports.published,false);
  assert.equal(exports.upload_cleared,false);
  assert.equal(exports.default_metadata_unchanged,true);
  for(const set of exports.sets){
    assert.ok([...set.promotional_text].length<=170);
    assert.match(set.promotional_text,/Coachi\+/);
    assert.match(set.promotional_text,/3/);
    assert.match(set.promotional_text,/subscription|abonnement/i);
  }
});

test('every source collection entry has a reuse decision',()=>{
  assert.equal(new Set(inventory.assets.map(a=>a.id)).size,124);
  assert.ok(inventory.assets.every(a=>a.disposition.use&&a.disposition.reason));
  assert.equal(inventory.assets.find(a=>a.id==='C072').disposition.use,'exclude');
  assert.equal(inventory.assets.find(a=>a.id==='C117').disposition.use,'exclude');
});

test('all review HTML assets and local links resolve',async()=>{
  for(const name of (await fs.readdir(dir)).filter(f=>f.endsWith('.html'))){
    const text=(await read(name)).toString();
    assert.match(text,/Local review/i);
    for(const m of text.matchAll(/(?:src|href)="([^"#]+)"/g)){
      if(/^https?:/.test(m[1]))continue;
      const target=path.resolve(dir,m[1]);
      assert.ok(target.startsWith(dir+path.sep));
      await fs.access(target);
    }
  }
});

test('measured typography remains inside the export safe bounds',()=>{
  for(const item of exports.text_bounds){
    assert.ok(item.x>=70);
    assert.ok(item.x+item.width<=1240,`Overflow: ${item.text}`);
    assert.ok(item.y<2800);
  }
});

const mockups=await data('phone-mockups.json');

test('four premium renders retain original full UI and editable scene provenance',async()=>{
  assert.equal(mockups.renders.length,4);
  for(const r of mockups.renders){
    const b=await read(r.file),m=await sharp(b).metadata();
    assert.deepEqual([m.width,m.height],[1320,2400]);
    assert.equal(m.hasAlpha,true);assert.equal(m.bitsPerSample,16);
    assert.equal(sha(b),r.sha256);
    assert.equal(r.engine,'CYCLES');assert.equal(r.samples,256);
    assert.equal(r.source_ui_redrawn,false);
    assert.equal(sha(await fs.readFile(r.source_path)),r.source_sha256);
    assert.equal(sha(await fs.readFile(r.base_scene)),r.base_scene_sha256);
    const folder=path.dirname(r.file);
    assert.equal(folder,mockups.render_directory);
    assert.equal(sha(await read(path.join(folder,r.editable_scene))),r.editable_scene_sha256);
    assert.equal(sha(await read(path.join(folder,'inventory-at-render.json'))),r.inventory_sha256);
  }
});

test('phone projection is upright, subtle and never enlarges source pixels',()=>{
  assert.deepEqual(mockups.renders.map(r=>r.yaw_degrees),[-8,0,8,0]);
  for(const r of mockups.renders){
    assert.equal(r.pitch_degrees,0);assert.equal(r.camera_roll_degrees,0);
    assert.ok(Math.abs(r.source_aspect-r.screen_aspect)<1e-10);
    assert.ok(r.projection.max_output_pixels_per_source_pixel<=1);
    for(const [x,y] of r.projection.corners_tl_tr_br_bl){
      assert.ok(x>0&&x<r.size[0]&&y>0&&y<r.size[1]);
    }
    const b=r.visible_bounds;
    assert.ok(b.width>800&&b.height>1750);
    assert.ok(b.x>0&&b.y>0&&b.x+b.width<r.size[0]&&b.y+b.height<r.size[1]);
  }
});

test('all eighteen flat Store exports remain byte-identical to before the 3D revision',async()=>{
  const before=await data('phone-mockups-v3/flat-exports-before.json');
  assert.equal(before.sets.flatMap(s=>s.cards).length,18);
  for(const c of before.sets.flatMap(s=>s.cards))assert.equal(sha(await read(c.file)),c.sha256);
});

test('rounded hardware encloses the unchanged source screen geometry and UVs',async()=>{
  for(const r of mockups.renders){
    const h=r.hardware_refinement;
    assert.equal(h.source_screen_mask_unchanged,true);
    assert.equal(h.source_screen_fully_enclosed,true);
    assert.match(h.ui_geometry_before,/^[a-f0-9]{64}$/);
    assert.equal(h.ui_geometry_after,h.ui_geometry_before);
    assert.equal(h.body_corner_radius,1.02);
    assert.equal(h.front_glass_corner_radius,.885);
    assert.equal(sha(await fs.readFile(h.geometry_helper)),h.geometry_helper_sha256);
  }
});

test('the previous V3 renders and editable scenes remain byte-identical',async()=>{
  assert.equal(mockups.render_directory,'phone-mockups-v4');
  const previous=await data(mockups.previous_review);
  assert.equal(previous.renders.length,4);
  for(const old of previous.renders){
    assert.equal(sha(await read(old.file)),old.sha256);
    assert.equal(sha(await read(path.join(path.dirname(old.file),old.editable_scene))),old.editable_scene_sha256);
    const current=mockups.renders.find(r=>r.id===old.id);
    assert.equal(current.source_sha256,old.source_sha256);
    assert.equal(current.base_scene_sha256,old.base_scene_sha256);
    assert.notEqual(current.sha256,old.sha256);
  }
});

test('mineral-green backdrop has readable ink and is present in both review outputs',async()=>{
  const p=mockups.palette;
  const rgb=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16));
  const luminance=hex=>rgb(hex).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  assert.equal(p.name,'pale mineral green');
  for(const foreground of [p.ink,p.label,p.muted,p.accent])for(const background of [p.top,p.middle,p.bottom]){
    const values=[luminance(foreground),luminance(background)].sort((a,b)=>a-b);
    assert.ok((values[1]+.05)/(values[0]+.05)>=4.5,`Contrast below 4.5:1: ${foreground} on ${background}`);
  }
  const css=(await read('phone-mockups.css')).toString();
  assert.match(css,/color-scheme:light/);
  assert.match(css,/drop-shadow/);
  for(const color of [p.top,p.middle,p.bottom])assert.ok(css.includes(color));
  for(const locale of ['en','no']){
    const file=await read(`${mockups.presentation_directory}/overview-${locale}.jpg`);
    for(const [y,color] of [[4,p.top],[2555,p.bottom]]){
      const pixel=await sharp(file).extract({left:4,top:y,width:1,height:1}).raw().toBuffer();
      rgb(color).forEach((value,i)=>assert.ok(Math.abs(pixel[i]-value)<=3));
    }
  }
});

test('localized review and 4K overviews keep mockup and publication boundaries explicit',async()=>{
  assert.equal(mockups.published,false);assert.equal(mockups.generated_ui,false);
  assert.equal(mockups.flat_exports_unchanged,true);
  for(const locale of ['en','no']){
    const html=(await read(`phone-mockups-${locale}.html`)).toString();
    assert.match(html,/aria-current="page"/);
    assert.match(html,/Local review/);
    assert.match(html,/qa\/watch-design-source.md/);
    assert.match(html,/original|Original|originalopptak/);
    const m=await sharp(await read(`${mockups.presentation_directory}/overview-${locale}.jpg`)).metadata();
    assert.deepEqual([m.width,m.height],[3840,2560]);
  }
});

test('six new portrait designs retain full hardware, original sampling and safe typography',async()=>{
  assert.equal(mockups.presentations.length,6);
  for(const locale of ['en','no'])assert.deepEqual(mockups.presentations.filter(p=>p.locale===locale).map(p=>p.position),[1,2,3]);
  for(const p of mockups.presentations){
    const bytes=await read(p.file),m=await sharp(bytes).metadata();
    assert.deepEqual([m.width,m.height],[1320,2868]);assert.equal(m.hasAlpha,false);
    assert.equal(sha(bytes),p.sha256);assert.equal(p.upload_cleared,false);
    assert.equal(p.headline.length,2);assert.ok(p.headline.join(' ').split(/\s+/).length<=7);
    assert.ok(p.max_output_pixels_per_source_pixel<=1);assert.ok(p.render_scale<=1);
    const phone=p.phone_bounds;
    assert.ok(phone.x>=72&&phone.y>=716&&phone.x+phone.width<=1248&&phone.y+phone.height<=2740);
    for(const t of p.text_bounds){
      assert.ok(t.x>=96&&t.x+t.width<=1224,`Text width: ${t.text}`);
      assert.ok(t.y>80&&t.y+t.height<phone.y-64,`Text/phone spacing: ${t.text}`);
      if(t.role==='headline'){assert.equal(t.size,124);assert.equal(t.weight,700);}
      if(t.role==='support'){assert.equal(t.size,48);assert.equal(t.weight,500);}
    }
  }
});

test('the selected brand fonts are real static Bold and Medium faces with retained licensing',async()=>{
  assert.deepEqual(mockups.fonts.map(f=>f.weight),[700,500]);
  for(const f of mockups.fonts){
    const bytes=await read(f.file);assert.equal(sha(bytes),f.sha256);
    assert.ok(GlobalFonts.register(bytes,f.family));
    assert.ok(GlobalFonts.families.find(face=>face.family===f.family).styles.some(style=>style.weight===f.weight));
  }
  assert.match((await read('fonts/LICENSES.txt')).toString(),/SIL OPEN FONT LICENSE/);
  const css=(await read('phone-mockups.css')).toString();
  assert.match(css,/scroll-snap-type:x proximity/);
  assert.match(css,/flex:0 0 min\(84vw,380px\)/);
  assert.doesNotMatch(css,/order:-1/);
});

test('typography-only V5 keeps the refined V4 handset renders and thumbnail checks intact',async()=>{
  assert.equal(mockups.presentation_directory,'phone-mockups-v5');
  const previous=await data(mockups.previous_presentation);
  for(const old of previous.renders){
    const current=mockups.renders.find(r=>r.id===old.id);
    assert.equal(current.sha256,old.sha256);
    assert.equal(current.editable_scene_sha256,old.editable_scene_sha256);
  }
  for(const locale of ['en','no']){
    const m=await sharp(await read(`${mockups.presentation_directory}/thumbnail-check-${locale}.png`)).metadata();
    assert.deepEqual([m.width,m.height],[1062,753]);
  }
});

const conversion = brief.conversion_plan;
const conversionReview = await data('conversion-review.json');
const escapeHTML = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

test('release context separates owner confirmation from public lookup and creative publication',async()=>{
  assert.deepEqual(conversionReview.release_context,brief.release_context);
  assert.equal(brief.release_context.version,'4.0.2');
  assert.equal(brief.release_context.status,'OWNER_CONFIRMED_LIVE');
  assert.equal(brief.release_context.public_lookup.version,'4.0.1');
  assert.equal(brief.release_context.public_lookup.country,'no');
  assert.equal(conversionReview.published,false);
  assert.equal(conversionReview.upload_cleared,false);
  const handoff=(await read('CONVERSION-HANDOFF.md')).toString();
  assert.ok(handoff.includes(brief.release_context.note));
});

test('conversion story is generated from the current brief and does not claim publication',async()=>{
  assert.equal(conversionReview.brief_sha256,sha(await read('brief.json')));
  assert.equal(conversionReview.status,'STORYBOARD_ONLY');
  for(const key of ['published','upload_cleared','experiment_started'])assert.equal(conversionReview[key],false);
  assert.equal(conversion.publication_authorized,false);
  assert.deepEqual(conversionReview.sequences,conversion.sequences);
  assert.equal(conversionReview.copy_verified_against,conversion.copy_verified_against);
  assert.match(conversion.copy_verified_against,/testflight-4\.0\.2-130 \/ 7ca4c8ddb17a27e724078dd2ee33e345ca1689f4/);
  assert.match(conversion.copy_verified_against,/Source verification only/);
});

test('all conversion sequences cover real card IDs and lead with the intended benefit',()=>{
  const ids=conversion.cards.map(card=>card.id);
  assert.equal(ids.length,7);assert.equal(new Set(ids).size,7);
  for(const order of Object.values(conversion.sequences)){
    assert.ok(order.length>=1&&order.length<=10);
    assert.equal(new Set(order).size,order.length);
    assert.ok(order.every(id=>ids.includes(id)));
  }
  assert.deepEqual(conversion.sequences['main-listing'].slice(0,3),['live-guidance','realtime','voices']);
  assert.equal(conversion.sequences['watch-coaching'][0],'watch-guidance');
  assert.deepEqual([...conversion.capture_order].sort(),[...ids].sort());
  assert.ok(conversion.capture_record_fields.includes('source_sha256'));
  assert.ok(conversion.capture_record_fields.includes('real_session_or_labelled_demo'));
  assert.ok(conversion.capture_record_fields.includes('privacy_checked'));
});

test('candidate readiness is locale-specific and cannot clear missing or stale imagery',async()=>{
  for(const card of conversionReview.cards){
    const original=conversion.cards.find(item=>item.id===card.id);
    assert.equal(card.upload_cleared,false);
    for(const locale of ['en-US','no']){
      const candidate=card.candidates.find(item=>item.locale===locale);
      assert.equal(card.localizations[locale].capture_state,candidate?original.capture_state:'missing');
      assert.equal(card.localizations[locale].upload_cleared,false);
      if(!candidate)continue;
      assert.equal(candidate.release_verified,false);
      const source=inventory.selected_sources.find(item=>item.id===candidate.source_id);
      assert.ok(source);
      assert.equal(candidate.source_sha256,source.sha256);
      assert.equal(sha(await read(candidate.file)),source.sha256);
      assert.ok(!Object.hasOwn(brief.blocked_sources,candidate.source_id));
      assert.ok(!['C062','C072'].includes(candidate.source_id));
    }
  }
  const intervals=conversionReview.cards.find(card=>card.id==='intervals');
  assert.equal(intervals.localizations['en-US'].capture_state,'verify');
  assert.equal(intervals.localizations.no.capture_state,'missing');
  assert.equal(conversionReview.cards.find(card=>card.id==='learn').localizations.no.capture_state,'recapture');
});

test('fourteen localized benefits retain concise copy and accurate paid-access qualifications',()=>{
  for(const card of conversion.cards)for(const locale of ['en-US','no']){
    const copy=card[locale];
    assert.equal(copy.title.length,2);
    assert.ok(copy.title.every(line=>line.trim().length>0&&line.length<=26));
    assert.ok(copy.title.join(' ').split(/\s+/).length<=8);
    assert.ok(copy.body.length>0&&copy.body.length<=100);
    const publicCopy=[...copy.title,copy.body,copy.disclosure||''].join(' ');
    assert.doesNotMatch(publicCopy,/unlimited|ubegrenset|phone-free|Shared Workouts|Tren sammen|guaranteed/i);
    if(card.paid){
      assert.match(copy.disclosure,/Coachi\+/);
      assert.match(copy.disclosure,/subscription|abonnement/i);
    }
  }
  const realtime=conversion.cards.find(card=>card.id==='realtime');
  assert.match(realtime['en-US'].body,/Realtime AI coaching before, during and after/);
  assert.match(realtime.no.body,/AI-coaching i sanntid før, under og etter/);
  assert.match(realtime['en-US'].disclosure,/Usage limits/);
  assert.match(realtime.no.disclosure,/Bruksgrenser/);
  const voices=conversion.cards.find(card=>card.id==='voices');
  assert.match(voices['en-US'].disclosure,/All three/);
  assert.match(voices.no.disclosure,/Alle tre/);
  assert.match(voices.acceptance,/One default voice is free/);
});

test('localized storyboard strips preserve order, subscription copy and honest capture placeholders',async()=>{
  for(const locale of ['en-US','no']){
    const html=(await read(`conversion-${locale}.html`)).toString();
    assert.match(html,new RegExp(`<html lang="${locale==='no'?'nb':'en'}">`));
    assert.match(html,/aria-current="page"/);
    assert.match(html,/class="story-strip" tabindex="0" aria-label=/);
    assert.match(html,/scroll-snap-type:x proximity/);
    assert.match(html,/max-width:420px/);
    const cards=[...html.matchAll(/<article class="story-card" data-card="([^"]+)">([\s\S]*?)<\/article>/g)];
    assert.deepEqual(cards.map(match=>match[1]),conversion.sequences['main-listing']);
    for(const [,id,markup] of cards){
      const card=conversion.cards.find(item=>item.id===id),proof=conversionReview.cards.find(item=>item.id===id);
      const copy=card[locale],candidate=proof.candidates.find(item=>item.locale===locale);
      for(const text of [...copy.title,copy.body,...(copy.disclosure?[copy.disclosure]:[])])assert.ok(markup.includes(escapeHTML(text)),`${id}/${locale}: ${text}`);
      if(candidate){
        assert.ok(markup.includes(`src="${candidate.file}"`));
        assert.match(markup,/reference, not release-verified|referanse, ikke verifisert/);
      }else{
        assert.doesNotMatch(markup,/<img/);
        assert.match(markup,/This is not the app UI|Dette er ikke appens UI/);
      }
    }
  }
});

test('experiment is one unstarted treatment with the same assets and no implied spend',()=>{
  const experiment=conversionReview.experiment;
  assert.equal(experiment.status,'NOT_STARTED');
  assert.equal(experiment.treatments,1);
  assert.equal(experiment.proposed_treatment_traffic_percent,50);
  assert.equal(experiment.spend_authorized,false);
  assert.deepEqual([...experiment.control_order].sort(),[...experiment.treatment_order].sort());
  assert.equal(new Set(experiment.control_order).size,7);
  assert.notDeepEqual(experiment.control_order,experiment.treatment_order);
  assert.deepEqual(experiment.treatment_order,conversion.sequences['main-listing']);
  assert.match(experiment.isolate,/not today's live listing/);
  assert.match(experiment.isolate,/all image bytes fixed/);
  assert.match(experiment.measurement,/sandbox Premium/);
  assert.match(experiment.decision,/inconclusive/);
  assert.ok(conversionReview.distribution.every(item=>Object.hasOwn(conversion.sequences,item.destination)));
});

test('preview timing is a continuous 24-second proposal and stays separate from an exported movie',()=>{
  const preview=conversionReview.preview;
  assert.equal(preview.status,'NOT_RENDERABLE_MISSING_FOOTAGE');
  assert.equal(preview.duration_seconds,24);
  let previousEnd=0;
  for(const segment of preview.segments){
    assert.equal(segment.start,previousEnd);
    assert.ok(segment.end>segment.start);
    assert.ok(conversion.cards.some(card=>card.id===segment.card));
    previousEnd=segment.end;
  }
  assert.equal(previousEnd,preview.duration_seconds);
  assert.match(preview.note,/not a rendered video/);
  assert.match(preview.note,/muted/);
});
