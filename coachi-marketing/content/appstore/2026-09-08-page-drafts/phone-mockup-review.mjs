import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createCanvas, loadImage, GlobalFonts} from '@napi-rs/canvas';
import sharp from 'sharp';

const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const names = ['workouts-en', 'target-en', 'intervals-sets-en', 'target-no'];
const folder = 'phone-mockups-v4';
const presentationFolder = 'phone-mockups-v5';
const fontSource = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../video/generated/2026-09-04-coachi-ios-four-ads/assets/fonts');
const palette = {
  name: 'pale mineral green',
  top: '#f3f5eb',
  middle: '#dee8d8',
  bottom: '#cadac9',
  ink: '#173228',
  label: '#22372d',
  muted: '#425b4d',
  accent: '#9e381b',
};
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

function background(ctx,width,height) {
  const gradient=ctx.createLinearGradient(0,0,0,height);
  gradient.addColorStop(0,palette.top);gradient.addColorStop(.55,palette.middle);gradient.addColorStop(1,palette.bottom);
  ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
}

async function loadBrandFonts(dir) {
  await fs.mkdir(path.join(dir,'fonts'),{recursive:true});
  const fonts=[];
  const faces=[
    {name:'sora-bold',family:'Coachi Display',weight:700,source:'https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSe1mX-K.ttf',sha256:'a50f5d254fc0fb83125fceffb72a95d036b8ce964a77fb8cc42ecb9ce16b0427'},
    {name:'manrope-medium',family:'Coachi Text',weight:500,source:'https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk7PFO_F.ttf',sha256:'f433e5d333be1128d8ec8a28b8aadd0314d10e14e4105406076666bc830fc15d'},
  ];
  for(const {name,family,weight,source,sha256} of faces) {
    const file=`fonts/${name}.ttf`,local=path.join(dir,file);
    let bytes;
    if(existsSync(local)) bytes=await fs.readFile(local);
    else {
      const response=await fetch(source);
      if(!response.ok) throw new Error(`Static font download failed: ${name}, HTTP ${response.status}`);
      bytes=Buffer.from(await response.arrayBuffer());
      if(digest(bytes)!==sha256) throw new Error(`Unexpected font bytes: ${name}`);
      await fs.writeFile(local,bytes,{flag:'wx'});
    }
    if(digest(bytes)!==sha256) throw new Error(`Cached font changed: ${name}`);
    if(!GlobalFonts.register(bytes,family)) throw new Error(`Brand font failed to load: ${name}`);
    if(!GlobalFonts.families.find(face=>face.family===family)?.styles.some(style=>style.weight===weight)) throw new Error(`Font weight unavailable: ${name}`);
    fonts.push({name,family,weight,source,file,sha256});
  }
  await fs.copyFile(path.join(fontSource,'LICENSES.txt'),path.join(dir,'fonts/LICENSES.txt'));
  return fonts;
}

function line(ctx,text,x,y,size,weight,family,color,role,bounds) {
  ctx.font=`${weight} ${size}px "${family}"`;ctx.fillStyle=color;
  ctx.letterSpacing=role==='headline'?'-3px':'0px';
  const m=ctx.measureText(text);
  if(m.width>1128) throw new Error(`Typography overflow: ${text}`);
  ctx.fillText(text,x,y);
  bounds.push({text,role,family,size,weight,x,y:y-m.actualBoundingBoxAscent,width:m.width,height:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent});
}

async function portrait(dir,row,text,index,locale) {
  const canvas=createCanvas(1320,2868),ctx=canvas.getContext('2d'),bounds=[];
  background(ctx,1320,2868);
  line(ctx,'coachi',96,146,46,700,'Coachi Display',palette.accent,'brand',bounds);
  line(ctx,`${String(index+1).padStart(2,'0')} / 03`,1056,146,36,500,'Coachi Text',palette.muted,'sequence',bounds);
  text.headlines[index].forEach((value,i)=>line(ctx,value,96,320+i*138,124,700,'Coachi Display',i?palette.accent:palette.ink,'headline',bounds));
  text.support[index].forEach((value,i)=>line(ctx,value,100,566+i*64,48,500,'Coachi Text',palette.muted,'support',bounds));
  ctx.letterSpacing='0px';
  const img=await loadImage(path.join(dir,row.file)),b=row.visible_bounds;
  const scale=Math.min(1128/b.width,1992/b.height,1),w=b.width*scale,h=b.height*scale;
  const x=(1320-w)/2,y=716+(1992-h)/2;
  ctx.save();ctx.translate(x+w/2,y+h-10);ctx.scale(w*.54,64);
  const contact=ctx.createRadialGradient(0,0,0,0,0,1);
  contact.addColorStop(0,'#2943332e');contact.addColorStop(.42,'#29433317');contact.addColorStop(1,'#29433300');
  ctx.fillStyle=contact;ctx.fillRect(-1,-1,2,2);ctx.restore();
  ctx.save();ctx.shadowColor='#192e2229';ctx.shadowBlur=44;ctx.shadowOffsetY=22;
  ctx.drawImage(img,b.x,b.y,b.width,b.height,x,y,w,h);ctx.restore();
  const bytes=await sharp(canvas.toBuffer('image/png')).removeAlpha().png().toBuffer();
  const file=`${presentationFolder}/card-${locale}-${index+1}.png`;
  await fs.writeFile(path.join(dir,file),bytes);
  return {locale,position:index+1,source_id:row.source_id,render_id:row.id,file,sha256:digest(bytes),size:[1320,2868],headline:text.headlines[index],support:text.support[index],text_bounds:bounds,phone_bounds:{x,y,width:w,height:h},render_scale:scale,max_output_pixels_per_source_pixel:row.projection.max_output_pixels_per_source_pixel*scale,upload_cleared:false};
}

function visibleBounds(data, width, height, channels) {
  let left=width, top=height, right=-1, bottom=-1;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    if(data[(y*width+x)*channels+channels-1] > 2) {
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
  }
  if(right<left) throw new Error('Rendered handset is empty');
  const pad=24;
  left=Math.max(0,left-pad);top=Math.max(0,top-pad);
  right=Math.min(width-1,right+pad);bottom=Math.min(height-1,bottom+pad);
  return {x:left,y:top,width:right-left+1,height:bottom-top+1};
}

export async function buildPhoneMockupReview(dir) {
  const previousBytes=await fs.readFile(path.join(dir,'phone-mockups.json'));
  const previous=JSON.parse(previousBytes);
  if(previous.render_directory===folder&&!previous.presentation_directory) {
    const snapshot=path.join(dir,folder,'review-manifest.json');
    if(existsSync(snapshot)) {
      if(digest(await fs.readFile(snapshot))!==digest(previousBytes)) throw new Error('Previous review snapshot differs; refusing to replace it');
    } else await fs.writeFile(snapshot,previousBytes,{flag:'wx'});
  }
  await fs.mkdir(path.join(dir,presentationFolder),{recursive:true});
  const fonts=await loadBrandFonts(dir),presentations=[];
  const inventory=JSON.parse(await fs.readFile(path.join(dir,'inventory.json'),'utf8'));
  const rows=[];
  for(const name of names) {
    const record=JSON.parse(await fs.readFile(path.join(dir,folder,`${name}.json`),'utf8'));
    const bytes=await fs.readFile(path.join(dir,folder,record.render));
    const source=inventory.selected_sources.find(item=>item.id===record.source_id);
    if(!source || record.source_sha256!==source.sha256 || digest(await fs.readFile(path.join(dir,source.file)))!==source.sha256) throw new Error(`UI provenance changed: ${name}`);
    if(digest(bytes)!==record.sha256 || record.source_ui_redrawn || record.projection.max_output_pixels_per_source_pixel>1) throw new Error(`Render contract failed: ${name}`);
    const hardware=record.hardware_refinement;
    if(!hardware?.source_screen_mask_unchanged || !hardware.source_screen_fully_enclosed || hardware.ui_geometry_before!==hardware.ui_geometry_after) throw new Error(`Original screen geometry changed: ${name}`);
    const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const bounds=visibleBounds(data,info.width,info.height,info.channels);
    rows.push({...record,file:`${folder}/${record.render}`,visible_bounds:bounds});
  }

  const copy={
    en:{lang:'en',title:'Your run. Your way.',eyebrow:'Coachi · Product presentation',intro:'Genuine Coachi screens. A refined 3D device treatment.',labels:['Choose your workout','Set your distance','Build your intervals'],details:['Timed, free, intervals and Target Run.','Choose a distance to work towards.','Set work and recovery for your session.'],heading:'The same phone. More polish.',explanation:'Studio-lit metal, precise edges and a restrained angle. The middle phone stays front-on; the app content comes from the original captures.',review:'Local review · Not uploaded',warning:'These are unbranded 3D design mockups, not native device screenshots or upload-cleared Apple artwork. The flat Store exports remain unchanged.',watch:'Watch design located',watchBody:'The approved August 26 Watch HTML exists and is linked in the source record. Native capture is still blocked by simulator startup failures; no old Watch image has been substituted.',all:'Back to page drafts',render:'Full-resolution render',sources:'Source and render record'},
    no:{lang:'nb',title:'Ditt løp. På din måte.',eyebrow:'Coachi · Produktpresentasjon',intro:'Ekte Coachi-skjermer. En mer gjennomført 3D-presentasjon.',labels:['Velg økten din','Velg distansen din','Bygg intervalløkten'],details:['Tidsløp, fri løping, intervaller og Target Run.','Velg en distanse å jobbe mot.','Sett arbeid og pauser for økten.'],heading:'Samme telefon. Mer finesse.',explanation:'Metall med studiobelysning, presise kanter og en rolig vinkel. Telefonen i midten vises rett forfra. Appinnholdet er hentet fra originalopptakene.',review:'Local review · Ikke lastet opp',warning:'Dette er 3D-designutkast uten maskinvaremerke, ikke native skjermbilder eller opplastingsklar Apple-grafikk. De flate Store-eksportene er uendret. Noen appskjermer er fortsatt på engelsk.',watch:'Watch-designet er funnet',watchBody:'Den godkjente Watch-HTML-en fra 26. august finnes og er dokumentert i kilderegisteret. Simulatoren feiler fortsatt ved oppstart. Ingen gamle Watch-bilder er satt inn.',all:'Tilbake til sideutkast',render:'Render i full oppløsning',sources:'Kilde- og renderregister'},
  };
  Object.assign(copy.en,{
    title:'Your run comes first.',
    intro:'Shorter headlines. Clearer benefits. Genuine Coachi screens.',
    headlines:[['Your run.','Your rules.'],['Set a goal.','Go for it.'],['Run. Recover.','Repeat.']],
    support:[['Timed, free, intervals or distance.','Choose the run that fits you.'],['Pick your distance.','Make it your next finish line.'],['Set your work and recovery.','Build the session your way.']],
    heading:'One image. One reason to keep looking.',
    explanation:'Sora headlines and Manrope supporting text now share one consistent scale. The benefit comes before the phone, with deliberate line breaks and more breathing room. Each image makes sense on its own.',
    render:'Open full-size image',
  });
  Object.assign(copy.no,{
    title:'Ditt løp kommer først.',
    intro:'Kortere overskrifter. Tydeligere fordeler. Ekte Coachi-skjermer.',
    headlines:[['Ditt løp.','Dine valg.'],['Sett et mål.','Gå for det.'],['Løp. Hvil.','Gjenta.']],
    support:[['Tid, fri løping, intervaller eller distanse.','Velg økten som passer deg.'],['Velg distansen din.','Gjør den til ditt neste mål.'],['Still inn drag og pauser.','Bygg økten på din måte.']],
    heading:'Ett bilde. Én grunn til å se videre.',
    explanation:'Sora i overskriftene og Manrope i støtteteksten gir et tydeligere hierarki. Fordelen står over telefonen, med bevisste linjeskift og mer luft. Hvert bilde fungerer også alene.',
    render:'Åpne bildet i full størrelse',
  });
  const css=`
@font-face{font-family:"Coachi Display";src:url("fonts/sora-bold.ttf") format("truetype");font-style:normal;font-weight:700;font-display:swap}
@font-face{font-family:"Coachi Text";src:url("fonts/manrope-medium.ttf") format("truetype");font-style:normal;font-weight:500;font-display:swap}
:root{color-scheme:light;font-family:"Coachi Text",-apple-system,BlinkMacSystemFont,sans-serif;background:${palette.top};color:${palette.ink}}
*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,${palette.top} 0%,${palette.middle} 55%,${palette.bottom} 100%)}
a{color:inherit;text-underline-offset:5px}a:focus-visible{outline:3px solid ${palette.accent};outline-offset:6px}
header,main,footer{max-width:1440px;margin:auto;padding:28px 6vw}
header{display:flex;align-items:center;justify-content:space-between;gap:22px;border-bottom:1px solid #17322820;flex-wrap:wrap}
header strong{font-family:"Coachi Display",sans-serif;font-size:29px;letter-spacing:-1px}nav{display:flex;gap:22px;flex-wrap:wrap}nav a[aria-current]{color:${palette.accent}}
h1,h2,h3{font-family:"Coachi Display",sans-serif}h1{font-size:clamp(40px,5vw,72px);letter-spacing:-.045em;line-height:1.08;margin:28px 0;max-width:1000px}
h2{font-size:clamp(28px,3.4vw,43px);letter-spacing:-.03em;line-height:1.16}
p{line-height:1.6;color:${palette.muted};max-width:800px}.eyebrow{font-size:13px;letter-spacing:.13em;text-transform:uppercase;color:${palette.accent}}.intro{font-size:clamp(17px,2vw,22px)}
.devices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin:40px 0 64px;align-items:start}
.device-card{min-width:0;margin:0}.device-card img{display:block;width:100%;height:auto;aspect-ratio:1320/2868;border-radius:8px;filter:drop-shadow(0 12px 22px #192e2212)}
.device-card h3{font-size:clamp(19px,2vw,27px);letter-spacing:-.025em;margin:28px 0 8px;color:${palette.label}}
.device-card p{font-size:15px;margin:0}.view{display:inline-flex;min-height:44px;align-items:center;font-size:14px;color:${palette.accent};margin-top:12px}
.detail{border-top:1px solid #17322825;padding:20px 0 34px}.details{display:grid;grid-template-columns:1fr 1fr;gap:60px}.note{font-size:14px;max-width:900px}
footer{border-top:1px solid #17322825;font-size:14px;color:${palette.muted}}
@media(max-width:760px){header,main,footer{padding:22px}.devices{display:flex;overflow-x:auto;scroll-snap-type:x proximity;gap:18px;margin:32px -22px;padding:0 22px 20px;scroll-padding:22px}.device-card{flex:0 0 min(84vw,380px);scroll-snap-align:start}.device-card h3{margin-top:24px}.details{grid-template-columns:1fr;gap:6px}h1{max-width:360px}.intro{max-width:330px}.note{font-size:14px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
`;
  await fs.writeFile(path.join(dir,'phone-mockups.css'),css);

  for(const [locale,text] of Object.entries(copy)) {
    const selected=[rows[0],locale==='no'?rows[3]:rows[1],rows[2]];
    const shots=[];
    for(const [index,row] of selected.entries()) shots.push(await portrait(dir,row,text,index,locale));
    presentations.push(...shots);
    const thumbnails=[];
    for(const [index,shot] of shots.entries()) {
      thumbnails.push({input:await sharp(path.join(dir,shot.file)).resize({width:330}).toBuffer(),left:18+index*348,top:18});
    }
    await sharp({create:{width:1062,height:753,channels:3,background:palette.top}}).composite(thumbnails).png().toFile(path.join(dir,presentationFolder,`thumbnail-check-${locale}.png`));
    const cards=shots.map((shot,index)=>{
      const alt=[...shot.headline,...shot.support].join(' ');
      return `<figure class="device-card"><a href="${shot.file}"><img src="${shot.file}" alt="${escape(alt)} — ${shot.source_id}" width="1320" height="2868" ${index===0?'fetchpriority="high"':'loading="lazy"'}></a><figcaption><a class="view" href="${shot.file}">${escape(text.render)} ${index+1}</a></figcaption></figure>`;
    }).join('');
    const html=`<!doctype html><html lang="${text.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coachi — ${escape(text.title)}</title><link rel="stylesheet" href="phone-mockups.css"></head><body><header><strong>coachi</strong><nav aria-label="Language"><a href="phone-mockups-en.html" ${locale==='en'?'aria-current="page"':''}>English</a><a href="phone-mockups-no.html" ${locale==='no'?'aria-current="page"':''}>Norsk</a><a href="index.html">${text.all}</a></nav></header><main><p class="eyebrow">${text.eyebrow}</p><h1>${text.title}</h1><p class="intro">${text.intro}</p><section class="devices" aria-label="Coachi phone mockups">${cards}</section><section class="detail"><h2>${text.heading}</h2><p>${text.explanation}</p></section><div class="details"><section class="detail"><p class="eyebrow">${text.review}</p><p class="note">${text.warning}</p><a class="view" href="phone-mockups.json">${text.sources}</a></section><section class="detail"><h2>${text.watch}</h2><p class="note">${text.watchBody}</p><a class="view" href="qa/watch-design-source.md">Watch HTML / capture status</a></section></div></main><footer>${text.review} · <a href="${folder}/overview-${locale}.jpg">4K overview</a> · <a href="assets.html">Original UI sources</a></footer></body></html>`;
    await fs.writeFile(path.join(dir,`phone-mockups-${locale}.html`),html.replace(`${folder}/overview-${locale}.jpg`,`${presentationFolder}/overview-${locale}.jpg`));

    const canvas=createCanvas(3840,2560),ctx=canvas.getContext('2d');
    background(ctx,3840,2560);
    for(const [index,shot] of shots.entries()) {
      const img=await loadImage(path.join(dir,shot.file));
      ctx.drawImage(img,128+index*1238,32,1108.8,2409.12);
    }
    ctx.fillStyle=palette.muted;ctx.font='500 32px "Coachi Text"';
    ctx.fillText(locale==='no'?'3D-designutkast · Ekte appskjermer · Ikke lastet opp':'3D design review · Genuine app screens · Not uploaded',192,2500);
    const image=await sharp(canvas.toBuffer('image/png')).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toBuffer();
    await fs.writeFile(path.join(dir,presentationFolder,`overview-${locale}.jpg`),image);
  }
  await fs.writeFile(path.join(dir,'phone-mockups.json'),JSON.stringify({status:'LOCAL_3D_DESIGN_REVIEW_NOT_UPLOAD_CLEARED',render_directory:folder,presentation_directory:presentationFolder,palette,fonts,typography:{headline:124,support:48,headline_weight:700,support_weight:500,left_margin:96,headline_lines:2,source_screens_unchanged:true},flat_exports_unchanged:true,generated_ui:false,published:false,previous_review:'phone-mockups-v3/review-manifest.json',previous_presentation:'phone-mockups-v4/review-manifest.json',renders:rows,presentations},null,2)+'\n');
  return rows;
}
