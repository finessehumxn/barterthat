import { useState, useEffect, useMemo, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { AdMob } from "@capacitor-community/admob";
import { ALL_CATS, CAT_GROUPS, POPULAR_CAT_IDS } from "./categories";
import * as db from "./db";
import { LANGUAGES, langByLabel, translateText, speak, TTS_OK, linkify } from "./comms";
import * as iap from "./iap";

// ── ADMOB (real rewarded ads → tokens, native apps only) ───────────────────
const ADMOB = {
  appId: "ca-app-pub-6152684967386284~8863838009",
  rewarded: "ca-app-pub-6152684967386284/5440432460",
};
const IS_NATIVE = typeof Capacitor !== "undefined" && Capacitor.getPlatform && Capacitor.getPlatform() !== "web";
let admobReady = false;
async function initAdMob() {
  if (!IS_NATIVE || admobReady) return;
  try { await AdMob.initialize({}); admobReady = true; } catch (e) {}
}
// Resolves true only if the user actually earned the reward (watched the ad).
async function showRewardedAd() {
  if (!IS_NATIVE) return false;
  try {
    await initAdMob();
    await AdMob.prepareRewardVideoAd({ adId: ADMOB.rewarded });
    const reward = await AdMob.showRewardVideoAd();
    return !!reward;
  } catch (e) { return false; }
}

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    :root {
      --g:#EF5D47;--gd:#D94433;--gl:rgba(239,93,71,0.12);
      --bk:#0E1825;--s1:#16243F;--s2:#1C2D4F;--s3:#243660;--s4:#2E4275;
      --tx:#FFE3D1;--t2:#C4B5A8;--t3:#7A6E66;
      --bd:rgba(255,227,209,0.08);--bd2:rgba(255,227,209,0.16);
      --am:#E8B14A;--amb:rgba(232,177,74,0.12);
      --rd:#EF5D47;--rdb:rgba(239,93,71,0.1);
      --bl:#4A90D9;--blb:rgba(74,144,217,0.12);
      --pu:#9B72DD;--pub:rgba(155,114,221,0.12);
      --r:12px;--rs:7px;--rp:100px;
      --fd:'Inter',sans-serif;--fb:'Inter',sans-serif;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:hidden;max-width:100vw}
    #root{max-width:100vw;overflow-x:hidden}
    body{background:var(--bk);color:var(--tx);font-family:var(--fb);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased;min-height:100vh}
    img{max-width:100%;height:auto}
    input,select,textarea,button{font-family:var(--fb);font-size:14px;color:var(--tx)}
    input:focus,select:focus,textarea:focus{outline:none}
    ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:var(--s4);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes ping{0%{transform:scale(.6);opacity:.8}80%,100%{transform:scale(2.4);opacity:0}}
    @keyframes flow{0%{background-position:0 0}100%{background-position:40px 0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    .fu{animation:fadeUp .35s ease both}
    .fi{animation:fadeIn .25s ease both}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--rp);font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;white-space:nowrap}
    .bp{background:var(--g);color:#fff}.bp:hover{background:var(--gd);transform:translateY(-1px)}.bp:active{transform:translateY(0)}
    .bg{background:transparent;color:var(--t2);border:1px solid var(--bd)}.bg:hover{border-color:var(--bd2);color:var(--tx)}
    .bpu{background:var(--pu);color:#fff}.bpu:hover{filter:brightness(1.1);transform:translateY(-1px)}
    .bsm{padding:6px 13px;font-size:12px}.blg{padding:13px 26px;font-size:15px;font-weight:700}
    .btn:disabled{opacity:.35;cursor:not-allowed;transform:none!important}
    .card{background:var(--s2);border:1px solid var(--bd);border-radius:var(--r);padding:16px;transition:border-color .15s}
    .card:hover{border-color:var(--bd2)}
    .pill{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:var(--rp);font-size:11px;font-weight:600;white-space:nowrap}
    .pg{background:var(--gl);color:#EF5D47}.pa{background:var(--amb);color:var(--am)}.pr{background:var(--rdb);color:var(--rd)}.pb{background:var(--blb);color:var(--bl)}.pp{background:var(--pub);color:var(--pu)}.pd{background:var(--s3);color:var(--t2)}
    .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-weight:800;flex-shrink:0}
    .ifield{width:100%;background:var(--s3);border:1px solid var(--bd);border-radius:var(--rs);color:var(--tx);padding:10px 13px;transition:border-color .15s}
    .ifield:focus{border-color:var(--g)}.ifield::placeholder{color:var(--t3)}
    select.ifield option{background:var(--s2)}
    .ndot{width:7px;height:7px;border-radius:50%;background:var(--g);animation:pulse 2s infinite;flex-shrink:0}
    .b2b-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:var(--rp);font-size:10px;font-weight:700;background:var(--pub);color:var(--pu);border:1px solid rgba(155,114,221,0.3)}
    .credit{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:var(--rp);font-size:12px;font-weight:700;background:linear-gradient(90deg,rgba(232,177,74,0.18),rgba(155,114,221,0.18));color:var(--am);border:1px solid rgba(232,177,74,0.3)}
    .chip{padding:5px 12px;border-radius:var(--rp);font-size:12px;cursor:pointer;border:1px solid var(--bd);background:var(--s3);color:var(--t2);transition:all .15s}
    .chip.on{border-color:var(--g);background:var(--gl);color:#EF5D47}
    .arrowline{flex:1;height:2px;min-width:14px;background-image:linear-gradient(90deg,var(--g) 55%,transparent 55%);background-size:9px 2px;animation:flow .6s linear infinite}
    .maprow{position:absolute;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;animation:drift 5s ease-in-out infinite}
    .ring{position:absolute;border-radius:50%;border:1px solid rgba(239,93,71,0.18)}
    .feed{display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid var(--bd)}
    .spin{width:13px;height:13px;border:2px solid rgba(255,255,255,0.18);border-top-color:var(--g);border-radius:50%;animation:spin .7s linear infinite}
    .cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;width:100%}
    @media (max-width:560px){
      .cta-row{flex-direction:column;align-items:center}
      .cta-row .btn{width:100%;max-width:320px}
      .blg{font-size:14px;padding:12px 20px}
    }
  `}</style>
);

// ── CATEGORIES — "everything is barterable" ──────────────────────────────────
const CATS = ALL_CATS;
const CAT_LABELS = CATS.map(c => c.label);
const CAT_BY_ID = id => CATS.find(c => c.id === id);
const POPULAR_CATS = POPULAR_CAT_IDS.map(CAT_BY_ID).filter(Boolean);

const TYPE_META = {
  service:{ l:"Service", cls:"pg" }, goods:{ l:"Item", cls:"pb" }, rental:{ l:"Rental", cls:"pa" },
  digital:{ l:"Digital", cls:"pp" }, venture:{ l:"Venture", cls:"pp" }, aid:{ l:"Mutual Aid", cls:"pg" },
  experience:{ l:"Experience", cls:"pb" }, squad:{ l:"Squad", cls:"pg" },
};

// Opt-in, seller self-identified community/heritage badges. Buyers choose to SUPPORT
// these — they are never used to exclude or screen providers (that would be discrimination).
const COMMUNITY_BADGES = [
  // Heritage / ethnicity (self-identified, celebratory — never exclusionary)
  { id:"black", l:"Black-owned", g:"Heritage" }, { id:"african", l:"African-owned", g:"Heritage" }, { id:"caribbean", l:"Caribbean-owned", g:"Heritage" },
  { id:"latino", l:"Latino/a/e-owned", g:"Heritage" }, { id:"hispanic", l:"Hispanic-owned", g:"Heritage" },
  { id:"aapi", l:"AAPI-owned", g:"Heritage" }, { id:"eastasian", l:"East Asian-owned", g:"Heritage" }, { id:"southasian", l:"South Asian-owned", g:"Heritage" },
  { id:"pacific", l:"Pacific Islander-owned", g:"Heritage" }, { id:"indigenous", l:"Indigenous-owned", g:"Heritage" },
  { id:"mena", l:"MENA-owned", g:"Heritage" }, { id:"white", l:"White-owned", g:"Heritage" }, { id:"multiracial", l:"Multiracial-owned", g:"Heritage" },
  { id:"immigrant", l:"Immigrant-owned", g:"Heritage" }, { id:"minority", l:"Minority-owned", g:"Heritage" },
  // Faith
  { id:"faith", l:"Faith-based", g:"Faith" }, { id:"christian", l:"Christian-owned", g:"Faith" }, { id:"muslim", l:"Muslim-owned", g:"Faith" },
  { id:"jewish", l:"Jewish-owned", g:"Faith" }, { id:"hindu", l:"Hindu-owned", g:"Faith" }, { id:"buddhist", l:"Buddhist-owned", g:"Faith" },
  { id:"sikh", l:"Sikh-owned", g:"Faith" },
  // Gender & identity
  { id:"woman", l:"Woman-owned", g:"Identity" }, { id:"man", l:"Man-owned", g:"Identity" }, { id:"lgbtq", l:"LGBTQ+-owned", g:"Identity" },
  { id:"trans", l:"Trans-owned", g:"Identity" }, { id:"nonbinary", l:"Nonbinary-owned", g:"Identity" },
  // Community
  { id:"veteran", l:"Veteran-owned", g:"Community" }, { id:"disability", l:"Disability-owned", g:"Community" },
  { id:"senior", l:"Senior-owned", g:"Community" }, { id:"youth", l:"Young entrepreneur", g:"Community" }, { id:"family", l:"Family-owned", g:"Community" },
];
const BADGE_GROUPS = ["Heritage", "Faith", "Identity", "Community"];
const BADGE_LABEL = id => (COMMUNITY_BADGES.find(b => b.id === id) || { l: id }).l;

// Service attributes that describe the OFFER (not the person) — helps people find
// culturally or accessibility-specific services.
const SPECIALTIES = [
  "Halal", "Kosher", "Vegan", "Natural-hair specialist", "Women-only sessions",
  "Bilingual (Spanish)", "ASL available", "Wheelchair accessible", "Eco-friendly", "Kid-friendly",
];

const PLATFORMS = [
  {id:"styleseat",l:"StyleSeat",c:"#D63E6E"},{id:"etsy",l:"Etsy",c:"#F1641E"},
  {id:"fiverr",l:"Fiverr",c:"#1DBF73"},{id:"upwork",l:"Upwork",c:"#14A800"},
  {id:"google",l:"Google Business",c:"#4285F4"},{id:"instagram",l:"Instagram",c:"#E1306C"},
  {id:"linkedin",l:"LinkedIn",c:"#0A66C2"},{id:"youtube",l:"YouTube",c:"#FF0000"},
  {id:"thumbtack",l:"Thumbtack",c:"#009FD9"},{id:"taskrabbit",l:"TaskRabbit",c:"#4B9E3E"},
  {id:"mindbody",l:"Mindbody",c:"#5B2D8E"},{id:"amazon",l:"Amazon Handmade",c:"#FF9900"},
  {id:"angi",l:"Angi",c:"#F26522"},{id:"yelp",l:"Yelp",c:"#D32323"},
  {id:"ebay",l:"eBay",c:"#E53238"},{id:"poshmark",l:"Poshmark",c:"#C1376C"},
  {id:"github",l:"GitHub",c:"#8B949E"},{id:"crunchbase",l:"Crunchbase",c:"#0288D1"},
  {id:"twitch",l:"Twitch",c:"#9146FF"},{id:"tiktok",l:"TikTok",c:"#25F4EE"},
];

const B2B_CERTS = [
  "Business License","General Liability Insurance","Professional License (state)",
  "LLC / Corporation Status","Workers Comp Insurance","Bonded & Insured",
  "BBB Accreditation","Contractor License","Health Dept Permit",
  "Food Handler Cert","CPA License","Bar License (Attorney)","Medical License",
];

const TAX_BRACKETS = ["$0–$44k","$44k–$95k","$95k–$201k","$201k–$383k","$383k+"];

// Elite is invite-only — exclusive, by referral/partner code. Add real codes here.
const INVITE_CODES = ["BT-ELITE", "FOUNDER", "BARTERVIP", "ELITE2026"];
const isInvite = code => INVITE_CODES.includes(String(code || "").trim().toUpperCase());
// Licensed-pro verification disclaimer (legal protection for B2B swaps).
const B2B_DISCLAIMER = "Licensed pros submit their license details for verification. B2B swaps are agreements between independently licensed parties — verify credentials yourself before any deal. BarterThat surfaces submitted info but isn't a party to, or liable for, your agreement.";

const AVC = ["#3D1A24","#1A3D2B","#1A1A3D","#3D2B1A","#2B1A3D","#1A3A38","#3A1A1A","#1A2E3A"];
const ac = i => AVC[i % AVC.length];

// ── LISTINGS — services + goods + rentals + digital + ventures + survival + aid
const LISTINGS = [
  {id:1,uid:10,name:"Nia Kendrick",ini:"NK",avc:ac(0),type:"service",cat:"Beauty & Personal Care",sub:"Hair braiding & locs",title:"Knotless braids, locs & protective styles",desc:"10+ yrs. Home studio (Atlanta) or mobile. All textures, all ages welcome.",rate:85,loc:"Atlanta, GA",remote:false,verified:true,elite:true,b2b:false,score:97,swaps:87,rating:4.9,rev:87,saved:[],wants:["Creative Arts & Design","Food & Culinary Arts","Collectibles, Valuables & Big Trades"],platforms:[{id:"styleseat",l:"StyleSeat",proof:"87 clients · 4.9★",url:"styleseat.com/niakendrick"},{id:"instagram",l:"Instagram",proof:"4.2k followers",url:"instagram.com/niakendrick.hair"},{id:"google",l:"Google Business",proof:"61 reviews · 5.0★",url:"g.co/niasnatural"}],certs:[],taxBracket:"$44k–$95k"},
  {id:2,uid:11,name:"Marcus Rivera",ini:"MR",avc:ac(1),type:"service",cat:"Home Services & Repair",sub:"Interior & exterior painting",title:"Residential & commercial painting — licensed & insured",desc:"15 yrs, licensed contractor. Free estimate. Coachella Valley & Palm Desert.",rate:95,loc:"Palm Desert, CA",remote:false,verified:true,elite:true,b2b:true,score:94,swaps:61,rating:5.0,rev:61,saved:[],wants:["Creative Arts & Design","Auto, Vehicles & Transportation","Tech & Digital Services"],platforms:[{id:"google",l:"Google Business",proof:"61 reviews · 5.0★",url:"maps.google.com/marcus"},{id:"thumbtack",l:"Thumbtack",proof:"Top Pro",url:"thumbtack.com/marcus"},{id:"angi",l:"Angi",proof:"Super Service Award",url:"angi.com/marcus"}],certs:["Business License","General Liability Insurance","Contractor License","Bonded & Insured"],taxBracket:"$95k–$201k"},
  {id:3,uid:12,name:"Deja Johnson",ini:"DJ",avc:ac(2),type:"goods",cat:"Food & Culinary Arts",sub:"Sourdough bread & baking",title:"Artisan sourdough, custom cakes & baked goods",desc:"Small-batch, all-natural. Custom orders. Delivery or pickup in Houston.",rate:55,loc:"Houston, TX",remote:false,verified:true,elite:false,b2b:false,score:88,swaps:34,rating:4.8,rev:340,saved:[],wants:["Creative Arts & Design","Beauty & Personal Care","Collectibles, Valuables & Big Trades"],platforms:[{id:"etsy",l:"Etsy",proof:"340 sales · 4.8★",url:"etsy.com/shop/deja"},{id:"instagram",l:"Instagram",proof:"2.1k followers",url:"instagram.com/dejabakes"}],certs:[],taxBracket:"$0–$44k"},
  {id:4,uid:13,name:"Keanu Williams",ini:"KW",avc:ac(3),type:"service",cat:"Tech & Digital Services",sub:"Web development",title:"Shopify, Next.js & full-stack web apps",desc:"$40k+ Upwork earnings. Mobile-first. Small business specialist. 100% remote.",rate:100,loc:"Remote",remote:true,verified:true,elite:true,b2b:true,score:96,swaps:52,rating:4.9,rev:47,saved:[],wants:["Creative Arts & Design","Professional & Business Services","Professional & Business Services"],platforms:[{id:"upwork",l:"Upwork",proof:"$40k+ earned · 4.9★",url:"upwork.com/keanu"},{id:"linkedin",l:"LinkedIn",proof:"6yrs verified",url:"linkedin.com/in/keanu"}],certs:["Business License","LLC / Corporation Status"],taxBracket:"$95k–$201k"},
  {id:5,uid:14,name:"Trina Powell",ini:"TP",avc:ac(4),type:"service",cat:"Creative Arts & Design",sub:"Graphic design",title:"Brand identity, flyers & social media kits",desc:"Adobe + Canva Pro. 24hr turnaround. Fiverr Level 2 seller. 5 yrs freelancing.",rate:65,loc:"Los Angeles, CA",remote:true,verified:true,elite:false,b2b:false,score:82,swaps:28,rating:4.7,rev:92,saved:[],wants:["Food & Culinary Arts","Tech & Digital Services","Beauty & Personal Care"],platforms:[{id:"fiverr",l:"Fiverr",proof:"Level 2 · 4.7★",url:"fiverr.com/trinadesigns"},{id:"instagram",l:"Instagram",proof:"1.8k followers",url:"instagram.com/trinadesigns"}],certs:[],taxBracket:"$0–$44k"},
  {id:6,uid:15,name:"Lena Moore",ini:"LM",avc:ac(5),type:"service",cat:"Beauty & Personal Care",sub:"Yoga & breathwork",title:"Private yoga, breathwork & mobility sessions",desc:"200-hr YTT certified. In-home, studio or virtual. All levels. Chicago area.",rate:75,loc:"Chicago, IL",remote:true,verified:true,elite:false,b2b:false,score:91,swaps:41,rating:4.9,rev:200,saved:[],wants:["Tech & Digital Services","Health & Medical Services","Food & Culinary Arts"],platforms:[{id:"mindbody",l:"Mindbody",proof:"200+ sessions · 4.9★",url:"mindbody.io/lena"},{id:"instagram",l:"Instagram",proof:"3.4k followers",url:"instagram.com/lenayoga"}],certs:[],taxBracket:"$44k–$95k"},
  {id:7,uid:16,name:"Carmen Osei",ini:"CO",avc:ac(6),type:"service",cat:"Events & Celebrations",sub:"Wedding planning",title:"Full-service wedding & event planning",desc:"100+ events. Licensed business. Day-of coordination to full planning packages.",rate:110,loc:"Atlanta, GA",remote:false,verified:true,elite:true,b2b:true,score:93,swaps:29,rating:5.0,rev:45,saved:[],wants:["Creative Arts & Design","Beauty & Personal Care","Food & Culinary Arts"],platforms:[{id:"google",l:"Google Business",proof:"45 reviews · 5.0★",url:"g.co/carmenevents"},{id:"instagram",l:"Instagram",proof:"8.1k followers",url:"instagram.com/carmenevents"},{id:"yelp",l:"Yelp",proof:"38 reviews · 4.9★",url:"yelp.com/carmen"}],certs:["Business License","General Liability Insurance","LLC / Corporation Status"],taxBracket:"$95k–$201k"},
  {id:8,uid:17,name:"Rico Farms",ini:"RF",avc:ac(7),type:"goods",cat:"Food & Culinary Arts",sub:"Farm eggs, milk & dairy",title:"Fresh farm eggs, raw honey, seasonal produce",desc:"Pasture-raised. Weekly harvest boxes. Local delivery or swap. Black-owned farm.",rate:40,loc:"Memphis, TN",remote:false,verified:true,elite:false,b2b:true,score:85,swaps:19,rating:4.8,rev:31,saved:[],wants:["Home Services & Repair","Auto, Vehicles & Transportation","Collectibles, Valuables & Big Trades"],platforms:[{id:"etsy",l:"Etsy",proof:"Sells online",url:"etsy.com/ricofarms"},{id:"instagram",l:"Instagram",proof:"5.2k followers",url:"instagram.com/ricofarms"}],certs:["Business License","Health Dept Permit","Food Handler Cert"],taxBracket:"$44k–$95k"},
  {id:9,uid:18,name:"The Gutter Squad",ini:"GS",avc:ac(0),type:"squad",cat:"Community Squads & Circles",sub:"Friend group rotation (gutters, repairs)",title:"8-person rotation squad — gutters, caulking, repairs",desc:"We rotate homes every other weekend tackling jobs folks can't get to alone. Join or invite your crew.",rate:0,loc:"Dallas, TX",remote:false,verified:true,elite:false,b2b:false,score:89,swaps:44,rating:4.9,rev:44,saved:[],isSquad:true,wants:["Food & Culinary Arts","Care & Support Services"],platforms:[{id:"instagram",l:"Instagram",proof:"Community group · 1.1k",url:"instagram.com/guttersquad"}],certs:[],taxBracket:"$0–$44k"},
  {id:10,uid:19,name:"Alexis Gray CNA",ini:"AG",avc:ac(1),type:"service",cat:"Care & Support Services",sub:"Elder care (CNA)",title:"Certified nursing assistant — elder care & companionship",desc:"CNA licensed. In-home elder care, post-surgery support, companion visits. Background checked.",rate:35,loc:"Phoenix, AZ",remote:false,verified:true,elite:false,b2b:false,score:90,swaps:22,rating:5.0,rev:22,saved:[],wants:["Beauty & Personal Care","Food & Culinary Arts","Home Services & Repair"],platforms:[{id:"linkedin",l:"LinkedIn",proof:"CNA License verified",url:"linkedin.com/alexisgray"},{id:"google",l:"Google Business",proof:"22 reviews · 5.0★",url:"g.co/alexiscares"}],certs:["Professional License (state)"],taxBracket:"$0–$44k"},
  {id:11,uid:20,name:"Braid & Books Academy",ini:"BB",avc:ac(2),type:"service",cat:"Lessons, Tutoring & Coaching",sub:"Music lessons (all instruments)",title:"Guitar, piano, voice & music theory lessons",desc:"10+ yrs teaching. Online or in-person. Kids & adults. First lesson free with any swap.",rate:70,loc:"Remote",remote:true,verified:true,elite:false,b2b:false,score:84,swaps:33,rating:4.8,rev:60,saved:[],wants:["Tech & Digital Services","Creative Arts & Design"],platforms:[{id:"youtube",l:"YouTube",proof:"8.2k subscribers",url:"youtube.com/braidbooks"},{id:"instagram",l:"Instagram",proof:"2.3k followers",url:"instagram.com/braidbooks"}],certs:[],taxBracket:"$44k–$95k"},
  {id:12,uid:21,name:"Swift Auto Detail",ini:"SA",avc:ac(3),type:"service",cat:"Auto, Vehicles & Transportation",sub:"Car detailing",title:"Mobile car detailing — full interior & exterior",desc:"We come to you. Full detail in 3hrs. Licensed mobile business. Dallas metro.",rate:80,loc:"Dallas, TX",remote:false,verified:true,elite:false,b2b:true,score:87,swaps:38,rating:4.9,rev:55,saved:[],wants:["Home Services & Repair","Creative Arts & Design","Tech & Digital Services"],platforms:[{id:"google",l:"Google Business",proof:"55 reviews · 4.9★",url:"g.co/swiftauto"},{id:"yelp",l:"Yelp",proof:"42 reviews",url:"yelp.com/swiftauto"}],certs:["Business License","General Liability Insurance"],taxBracket:"$44k–$95k"},
  {id:13,uid:22,name:"Tara Brooks",ini:"TB",avc:ac(4),type:"goods",cat:"Collectibles, Valuables & Big Trades",sub:"Furniture & home decor",title:"Mid-century couch + dining set — trade for ?",desc:"Solid wood, great shape. Downsizing. Open to home services, art, or fair-value goods.",rate:60,loc:"Austin, TX",remote:false,verified:true,elite:false,b2b:false,score:81,swaps:12,rating:4.7,rev:18,saved:[],wants:["Home Services & Repair","Creative Arts & Design","Auto, Vehicles & Transportation"],platforms:[{id:"poshmark",l:"Poshmark",proof:"Reseller · 4.8★",url:"poshmark.com/tara"},{id:"ebay",l:"eBay",proof:"120 sales · 99%",url:"ebay.com/usr/tarab"}],certs:[],taxBracket:"$0–$44k"},
  {id:14,uid:23,name:"Devon Pratt",ini:"DP",avc:ac(5),type:"rental",cat:"Collectibles, Valuables & Big Trades",sub:"Tools & power equipment",title:"Pressure washer, drills & power tools — weekend rental",desc:"Lend my gear, you keep your cash. Deposit via escrow. Pickup in Sacramento.",rate:25,loc:"Sacramento, CA",remote:false,verified:true,elite:false,b2b:false,score:79,swaps:27,rating:4.9,rev:30,saved:[],wants:["Garden & Outdoor Living","Auto, Vehicles & Transportation","Food & Culinary Arts"],platforms:[{id:"taskrabbit",l:"TaskRabbit",proof:"Elite Tasker",url:"taskrabbit.com/devon"},{id:"google",l:"Google Business",proof:"30 reviews · 4.9★",url:"g.co/devontools"}],certs:[],taxBracket:"$0–$44k"},
  {id:15,uid:24,name:"Imani Cole",ini:"IC",avc:ac(6),type:"digital",cat:"Virtual & Remote Services",sub:"Templates & presets",title:"Pitch deck, Notion systems & brand templates",desc:"Plug-and-play digital products. Instant delivery. Trade for dev, content, or coaching.",rate:50,loc:"Remote",remote:true,verified:true,elite:false,b2b:false,score:86,swaps:41,rating:4.8,rev:210,saved:[],wants:["Tech & Digital Services","Professional & Business Services","Creative Arts & Design"],platforms:[{id:"etsy",l:"Etsy",proof:"210 sales · 4.8★",url:"etsy.com/imanitemplates"},{id:"github",l:"GitHub",proof:"Open-source templates",url:"github.com/imani"}],certs:[],taxBracket:"$44k–$95k"},
  {id:16,uid:25,name:"Andre Solis",ini:"AS",avc:ac(7),type:"venture",cat:"Professional & Business Services",sub:"Technical co-founder / CTO",title:"Technical co-founder / fractional CTO — equity or swap",desc:"Ex-FAANG eng. I'll build your MVP for equity, or swap engineering for biz/ops/legal help. Let's build.",rate:150,loc:"Remote",remote:true,verified:true,elite:true,b2b:true,score:95,swaps:9,rating:5.0,rev:9,saved:[],wants:["Professional & Business Services","Professional & Business Services","Creative Arts & Design"],platforms:[{id:"linkedin",l:"LinkedIn",proof:"Verified · 10yr eng",url:"linkedin.com/in/andresolis"},{id:"github",l:"GitHub",proof:"3.1k stars",url:"github.com/asolis"},{id:"crunchbase",l:"Crunchbase",proof:"2 prior exits",url:"crunchbase.com/andre"}],certs:["LLC / Corporation Status","Professional License (state)"],taxBracket:"$201k–$383k"},
  {id:17,uid:26,name:"Maya Reuben",ini:"MY",avc:ac(0),type:"venture",cat:"Professional & Business Services",sub:"Investor pitch coaching",title:"Investor pitch & presentation coaching",desc:"Coached founders into YC & seed rounds. I'll polish your deck & delivery — swap for design, dev, or content.",rate:120,loc:"New York, NY",remote:true,verified:true,elite:true,b2b:true,score:92,swaps:14,rating:5.0,rev:21,saved:[],wants:["Creative Arts & Design","Tech & Digital Services","Virtual & Remote Services"],platforms:[{id:"linkedin",l:"LinkedIn",proof:"Verified · ex-VC",url:"linkedin.com/in/mayareuben"},{id:"crunchbase",l:"Crunchbase",proof:"Advisor · 8 startups",url:"crunchbase.com/maya"}],certs:["Business License","LLC / Corporation Status"],taxBracket:"$201k–$383k"},
  {id:18,uid:27,name:"Cole Whitfeather",ini:"CW",avc:ac(1),type:"experience",cat:"Lessons, Tutoring & Coaching",sub:"Wilderness survival & bushcraft",title:"2-day wilderness survival & bushcraft intensive",desc:"Fire, shelter, water, foraging. Small groups in the Rockies. Trade for gear, food, or skills.",rate:90,loc:"Denver, CO",remote:false,verified:true,elite:false,b2b:false,score:88,swaps:17,rating:4.9,rev:23,saved:[],wants:["Food & Culinary Arts","Collectibles, Valuables & Big Trades","Health & Medical Services"],platforms:[{id:"youtube",l:"YouTube",proof:"22k subscribers",url:"youtube.com/colewild"},{id:"instagram",l:"Instagram",proof:"9.4k followers",url:"instagram.com/colewild"}],certs:[],taxBracket:"$44k–$95k"},
  {id:19,uid:28,name:"Renee Adler RN",ini:"RA",avc:ac(2),type:"experience",cat:"Lessons, Tutoring & Coaching",sub:"First aid & CPR training",title:"CPR, first aid & home emergency prep training",desc:"ER nurse. Certify your family or team. In-home or virtual. Swap for wellness, food, or home help.",rate:65,loc:"Seattle, WA",remote:true,verified:true,elite:false,b2b:false,score:90,swaps:26,rating:5.0,rev:33,saved:[],wants:["Beauty & Personal Care","Home Services & Repair","Food & Culinary Arts"],platforms:[{id:"linkedin",l:"LinkedIn",proof:"RN License verified",url:"linkedin.com/reneeadler"}],certs:["Medical License","Professional License (state)"],taxBracket:"$44k–$95k"},
  {id:20,uid:29,name:"Gloria Hayes",ini:"GH",avc:ac(3),type:"aid",cat:"Community Squads & Circles",sub:"Rides & transportation help",title:"Need rides to dialysis 2×/week — I'll cook for you",desc:"Recovering, no car right now. I'm a great cook & will trade home meals or sewing for a lift. Tulsa southside.",rate:0,loc:"Tulsa, OK",remote:false,verified:true,elite:false,b2b:false,score:83,swaps:6,rating:5.0,rev:6,saved:[],isSquad:false,wants:["Auto, Vehicles & Transportation","Care & Support Services"],platforms:[{id:"google",l:"Google Business",proof:"Community verified",url:"g.co/gloriahayes"}],certs:[],taxBracket:"$0–$44k"},
  {id:21,uid:30,name:"Northside Movers Circle",ini:"NM",avc:ac(4),type:"aid",cat:"Community Squads & Circles",sub:"Moving & heavy lifting",title:"Moving help circle — borrow our muscle, bring pizza",desc:"Neighbors helping neighbors move. No cash — just pay it forward & feed the crew. Join the circle.",rate:0,loc:"Minneapolis, MN",remote:false,verified:true,elite:false,b2b:false,score:87,swaps:52,rating:4.9,rev:48,saved:[],isSquad:true,wants:["Food & Culinary Arts","Collectibles, Valuables & Big Trades"],platforms:[{id:"instagram",l:"Instagram",proof:"Community circle · 2.4k",url:"instagram.com/northsidecircle"}],certs:[],taxBracket:"$0–$44k"},
  {id:22,uid:31,name:"Hank & June",ini:"HJ",avc:ac(5),type:"experience",cat:"Travel, Stays & Experiences",sub:"Property / stay nights",title:"2 nights at our Smoky Mountains cabin",desc:"Sleeps 6, hot tub, mountain views. Trade for home reno, photography, or a stay at your place.",rate:140,loc:"Gatlinburg, TN",remote:false,verified:true,elite:true,b2b:false,score:91,swaps:11,rating:5.0,rev:19,saved:[],wants:["Home Services & Repair","Creative Arts & Design","Auto, Vehicles & Transportation"],platforms:[{id:"google",l:"Google Business",proof:"19 reviews · 5.0★",url:"g.co/smokycabin"},{id:"instagram",l:"Instagram",proof:"6.7k followers",url:"instagram.com/smokycabin"}],certs:[],taxBracket:"$95k–$201k"},
  {id:23,uid:32,name:"Zoe Min",ini:"ZM",avc:ac(6),type:"digital",cat:"Virtual & Remote Services",sub:"Shoutouts & ad swaps",title:"Social growth, UGC & creator shoutout swaps",desc:"140k combined following. UGC content + shoutout swaps for small brands. Trade for product or services.",rate:70,loc:"Remote",remote:true,verified:true,elite:false,b2b:false,score:85,swaps:38,rating:4.8,rev:64,saved:[],wants:["Beauty & Personal Care","Food & Culinary Arts","Creative Arts & Design"],platforms:[{id:"instagram",l:"Instagram",proof:"94k followers",url:"instagram.com/zoemin"},{id:"youtube",l:"YouTube",proof:"46k subscribers",url:"youtube.com/zoemin"}],certs:[],taxBracket:"$44k–$95k"},
  {id:24,uid:33,name:"Jay Okafor",ini:"JO",avc:ac(7),type:"goods",cat:"Collectibles, Valuables & Big Trades",sub:"Clothing, shoes & sneakers",title:"Deadstock sneaker collection — open to trades",desc:"Verified kicks, DS & VNDS. Trade for tech, gear, or digital products. StockX-authenticated.",rate:75,loc:"Chicago, IL",remote:false,verified:true,elite:false,b2b:false,score:80,swaps:44,rating:4.9,rev:71,saved:[],wants:["Tech & Digital Services","Virtual & Remote Services","Collectibles, Valuables & Big Trades"],platforms:[{id:"ebay",l:"eBay",proof:"300+ sales · 99.8%",url:"ebay.com/usr/jayo"},{id:"poshmark",l:"Poshmark",proof:"Posh Ambassador",url:"poshmark.com/jayo"}],certs:[],taxBracket:"$0–$44k"},
  {id:25,uid:34,name:"Satoshi Lee",ini:"SL",avc:ac(0),type:"service",cat:"Crypto, Web3 & Digital Assets",sub:"Self-custody wallet setup (hardware)",title:"Crypto onboarding, wallet security & self-custody coaching",desc:"I'll get you safely into Bitcoin & crypto — hardware wallet setup, seed-phrase backup, scam-proofing. Beginner-friendly. Remote. Accept crypto or swap for design/legal/content.",rate:90,loc:"Remote",remote:true,verified:true,elite:true,b2b:true,score:93,swaps:31,rating:5.0,rev:38,saved:[],wants:["Creative Arts & Design","Professional & Business Services","Tech & Digital Services"],platforms:[{id:"github",l:"GitHub",proof:"Web3 contributor",url:"github.com/satoshilee"},{id:"youtube",l:"YouTube",proof:"31k subscribers",url:"youtube.com/satoshilee"},{id:"linkedin",l:"LinkedIn",proof:"Verified · 7yr Web3",url:"linkedin.com/in/satoshilee"}],certs:["LLC / Corporation Status"],taxBracket:"$95k–$201k"},
  {id:26,uid:35,name:"Kira Nakamura",ini:"KN",avc:ac(2),type:"service",cat:"Gaming & Esports",sub:"Rank-up & ranked coaching",title:"Valorant & Apex coaching + stream setup — Radiant coach",desc:"Ex-pro. Aim routines, ranked coaching, VOD review. I'll also build your OBS/Twitch overlay. Trade for editing, art, or gear.",rate:60,loc:"Remote",remote:true,verified:true,elite:false,b2b:false,score:88,swaps:47,rating:4.9,rev:73,saved:[],wants:["Creative Arts & Design","Tech & Digital Services","Collectibles, Valuables & Big Trades"],platforms:[{id:"twitch",l:"Twitch",proof:"18k followers",url:"twitch.tv/kiraplays"},{id:"youtube",l:"YouTube",proof:"52k subscribers",url:"youtube.com/kiraplays"},{id:"instagram",l:"Instagram",proof:"12k followers",url:"instagram.com/kiraplays"}],certs:[],taxBracket:"$44k–$95k"},
  {id:27,uid:36,name:"Devin Cross",ini:"DC",avc:ac(4),type:"service",cat:"Media, Content & Production",sub:"Voiceover — commercial",title:"Pro voiceover, UGC & music video production",desc:"Broadcast-quality VO from my home studio + UGC content and full music-video shoots/edits. Commercials, narration, explainers. Trade for design, web, or gear.",rate:85,loc:"Nashville, TN",remote:true,verified:true,elite:true,b2b:true,score:92,swaps:36,rating:4.9,rev:58,saved:[],wants:["Creative Arts & Design","Tech & Digital Services","Beauty & Personal Care"],platforms:[{id:"fiverr",l:"Fiverr",proof:"Level 2 VO · 4.9★",url:"fiverr.com/devincross"},{id:"youtube",l:"YouTube",proof:"24k subscribers",url:"youtube.com/devincross"},{id:"instagram",l:"Instagram",proof:"7.8k followers",url:"instagram.com/devincrossvo"}],certs:["Business License"],taxBracket:"$44k–$95k"},
  {id:28,uid:37,name:"Tasha Bright",ini:"TB",avc:ac(6),type:"experience",cat:"Paid Audiences, Extras & Live Gigs",sub:"Brand ambassador — event",title:"Brand ambassador, crowd hype & seat-filling crew",desc:"Reliable, camera-ready crew for studio audiences, grand openings, trade shows & livestreams. I bring energy and bodies. Swap for content, beauty, or food.",rate:40,loc:"Los Angeles, CA",remote:false,verified:true,elite:false,b2b:false,score:86,swaps:29,rating:4.8,rev:41,saved:[],wants:["Beauty & Personal Care","Media, Content & Production","Food & Culinary Arts"],platforms:[{id:"instagram",l:"Instagram",proof:"15k followers",url:"instagram.com/tashabright"},{id:"tiktok",l:"TikTok",proof:"33k followers",url:"tiktok.com/@tashabright"}],certs:[],taxBracket:"$0–$44k"},
  {id:29,uid:38,name:"Priya Anand",ini:"PA",avc:ac(1),type:"service",cat:"Travel Planning & Companion Services",sub:"Trip planning & itinerary",title:"Custom trip planning + points & miles hacking",desc:"I plan trips that feel custom-tailored and book them on points so you fly for less. Itineraries, deals, group coordination. Remote. Trade for design, content, or web work.",rate:55,loc:"Remote",remote:true,verified:true,elite:false,b2b:false,score:89,swaps:24,rating:4.9,rev:36,saved:[],wants:["Creative Arts & Design","Tech & Digital Services","Media, Content & Production"],platforms:[{id:"instagram",l:"Instagram",proof:"9.3k followers",url:"instagram.com/priyatravels"},{id:"youtube",l:"YouTube",proof:"11k subscribers",url:"youtube.com/priyatravels"}],certs:[],taxBracket:"$44k–$95k"},
  {id:30,uid:39,name:"Walter Briggs",ini:"WB",avc:ac(3),type:"service",cat:"House Sitting & Property Watch",sub:"House sitting — extended / vacation",title:"Trusted house & property watch while you travel",desc:"Retired, background-checked, references on file. Overnight house sitting, mail, plants, security check-ins. I treat your home like mine. Swap for meals, rides, or home help.",rate:45,loc:"Scottsdale, AZ",remote:false,verified:true,elite:false,b2b:false,score:91,swaps:33,rating:5.0,rev:40,saved:[],wants:["Food & Culinary Arts","Rides, Moving & Delivery","Home Services & Repair"],platforms:[{id:"google",l:"Google Business",proof:"40 reviews · 5.0★",url:"g.co/walterwatches"}],certs:[],taxBracket:"$0–$44k"},
  {id:31,uid:40,name:"Hector Ramos",ini:"HR",avc:ac(5),type:"service",cat:"Rides, Moving & Delivery",sub:"Truck / van + driver",title:"Truck + muscle: moving, hauling & same-day delivery",desc:"Cargo van and a strong back. Moves, furniture pickups from marketplace buys, donation runs, junk hauling. Bilingual. Dallas metro. Trade for auto work, food, or tools.",rate:50,loc:"Dallas, TX",remote:false,verified:true,elite:false,b2b:true,score:87,swaps:51,rating:4.9,rev:67,saved:[],wants:["Auto, Vehicles & Transportation","Food & Culinary Arts","Home Services & Repair"],platforms:[{id:"thumbtack",l:"Thumbtack",proof:"Top Pro",url:"thumbtack.com/hectormoves"},{id:"google",l:"Google Business",proof:"67 reviews · 4.9★",url:"g.co/hectormoves"}],certs:["Business License","General Liability Insurance"],taxBracket:"$44k–$95k"},
  {id:32,uid:41,name:"Bea Sterling",ini:"BS",avc:ac(7),type:"service",cat:"Auctions, Bidding & Marketplace Trades",sub:"Reseller / flipping partner",title:"Reseller, authenticator & estate-auction sourcing",desc:"15 yrs flipping. I authenticate, source storage & estate lots, and run bid-to-swap listings. StockX & eBay verified. Trade for photography, content, or storage space.",rate:60,loc:"Atlanta, GA",remote:true,verified:true,elite:false,b2b:false,score:85,swaps:58,rating:4.8,rev:120,saved:[],wants:["Media, Content & Production","Collectibles, Valuables & Big Trades","Creative Arts & Design"],platforms:[{id:"ebay",l:"eBay",proof:"1.2k sales · 99.9%",url:"ebay.com/usr/beasterling"},{id:"poshmark",l:"Poshmark",proof:"Posh Ambassador II",url:"poshmark.com/beasterling"}],certs:[],taxBracket:"$44k–$95k"},
  {id:33,uid:42,name:"Jordan Voss",ini:"JV",avc:ac(0),type:"venture",cat:"Pro Network — Refer, Subcontract & Partner",sub:"Overflow work — take my extra clients",title:"Booked solid — sharing overflow + open to project partners",desc:"Design studio at capacity. I hand off overflow clients for a referral fee, white-label subcontract, and team up on big projects. Let's split the load and the revenue.",rate:0,loc:"Remote",remote:true,verified:true,elite:true,b2b:true,score:94,swaps:18,rating:5.0,rev:22,saved:[],wants:["Creative Arts & Design","Tech & Digital Services","Professional & Business Services"],platforms:[{id:"linkedin",l:"LinkedIn",proof:"Verified · agency owner",url:"linkedin.com/in/jordanvoss"},{id:"crunchbase",l:"Crunchbase",proof:"Studio · 40 clients",url:"crunchbase.com/jordanvoss"}],certs:["Business License","LLC / Corporation Status"],taxBracket:"$201k–$383k"},
];

// Self-identified community badges + service specialties for the seed listings.
const SEED_BADGES = {
  1:  { b:["black","woman"], s:["Natural-hair specialist","Women-only sessions"] },
  2:  { b:["latino","veteran"], s:["Bilingual (Spanish)","Eco-friendly"] },
  3:  { b:["black","woman"], s:["Vegan","Kid-friendly"] },
  4:  { b:["aapi"], s:[] },
  5:  { b:["woman","lgbtq"], s:[] },
  6:  { b:["woman"], s:["Women-only sessions"] },
  7:  { b:["black","woman","immigrant"], s:["Bilingual (Spanish)"] },
  8:  { b:["black"], s:["Eco-friendly"] },
  10: { b:["black","woman"], s:["Wheelchair accessible"] },
  11: { b:["black"], s:["Kid-friendly"] },
  12: { b:["veteran"], s:["Eco-friendly"] },
  13: { b:["woman"], s:[] },
  15: { b:["black","woman"], s:[] },
  16: { b:["latino","immigrant"], s:[] },
  17: { b:["woman"], s:[] },
  18: { b:["indigenous"], s:["Eco-friendly"] },
  19: { b:["woman"], s:["ASL available","Wheelchair accessible"] },
  20: { b:["black","woman","disability"], s:["Halal"] },
  21: { b:["immigrant"], s:[] },
  22: { b:["veteran"], s:["Kid-friendly"] },
  23: { b:["aapi","woman"], s:[] },
  24: { b:["black"], s:[] },
};
LISTINGS.forEach(l => { const x = SEED_BADGES[l.id]; l.badges = x?.b || []; l.specialties = x?.s || []; });

const TRADES_SEED = [
  {id:1,wu:"Marcus Rivera",wi:"MR",wc:ac(1),ms:"Brand identity (4hrs)",ts:"Interior painting (4hrs)",mv:400,tv:380,topup:0,tpb:null,status:"pending",plat:"Google Business · 5.0★",time:"2h ago",unread:true,b2b:false,msgs:[{from:"them",txt:"Hey! I saw your listing. 4hrs of interior painting for 4hrs of brand work — let's do it!",time:"2h ago"}]},
  {id:2,wu:"Deja Johnson",wi:"DJ",wc:ac(2),ms:"Logo kit (2hrs)",ts:"Sourdough loaves × 6",mv:130,tv:90,topup:40,tpb:"them",status:"escrow",plat:"Etsy · 4.8★",time:"5h ago",unread:true,b2b:false,msgs:[{from:"them",txt:"Love your work! My sourdough retails for $90. I'll add a $40 escrow top-up?",time:"5h ago"},{from:"me",txt:"Deal! Let's lock it in.",time:"4h ago"}]},
  {id:3,wu:"Keanu Williams",wi:"KW",wc:ac(3),ms:"UI/UX design (6hrs)",ts:"React dev work (6hrs)",mv:600,tv:600,topup:0,tpb:null,status:"completed",plat:"Upwork · $40k+ earned",time:"3d ago",unread:false,b2b:true,rating:5,msgs:[{from:"them",txt:"Perfect B2B swap. Great working with you.",time:"3d ago"}]},
];

const ACTIVITY_SEED = [
  { ic:"✓", c:"var(--g)", txt:"Marcus & Trina closed a 4hr painting ⇄ branding swap" },
  { ic:"🔄", c:"var(--am)", txt:"AI Matchmaker found a 3-way loop in Atlanta" },
  { ic:"⚇", c:"var(--bl)", txt:"Northside Movers Circle is forming — 3 spots left" },
  { ic:"⬡", c:"var(--pu)", txt:"Andre (CTO) is reviewing 2 co-founder swaps" },
];
const ACT_NAMES = ["Nia","Deja","Keanu","Lena","Carmen","Rico","Imani","Devon","Zoe","Jay","Cole","Renee","Tara","Maya"];
const ACT_TEMPLATES = [
  n => ({ ic:"✦", c:"var(--g)", txt:`${n} just posted a new listing nearby` }),
  n => ({ ic:"⇄", c:"var(--am)", txt:`${n} proposed a swap moments ago` }),
  n => ({ ic:"✓", c:"var(--g)", txt:`${n} completed a verified swap` }),
  n => ({ ic:"⬡", c:"var(--pu)", txt:`${n} earned Barter Tokens on a deal` }),
  n => ({ ic:"🔄", c:"var(--bl)", txt:`AI matched ${n} into a circular trade` }),
];

// ── STORAGE ──────────────────────────────────────────────────────────────────
const storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
};

// ── MATCHMAKER: find direct + circular trades ────────────────────────────────
// A node "wants" another node's category. A valid loop is a cycle where
// everyone receives something on their wishlist: you → A → B → you.
function findSwaps(me, listings) {
  const offerOf = x => (x.id === "you" ? me.offer : x.cat);
  const wantsOf = x => (x.id === "you" ? (me.wants || []) : (x.wants || []));
  // "x wants y's offer"  ⇒  in a trade, y hands x that offer.
  const wantsOffer = (x, y) => wantsOf(x).includes(offerOf(y));
  const you = { id: "you", name: "You", ini: "YOU", avc: "var(--g)", cat: me.offer, wants: me.wants };
  const pool = listings.filter(l => l.uid !== me.uid && l.rate >= 0);

  // DIRECT 1:1 — you and a each want the other's offer. Track who gives what.
  const direct = [];
  for (const a of pool) {
    if (wantsOffer(you, a) && wantsOffer(a, you)) direct.push({ partner: a, youGive: me.offer, youGet: a.cat });
  }

  // CIRCULAR LOOPS — 3- and 4-way cycles where no single pair matches but a chain does.
  const rawLoops = [];
  for (const a of pool) {
    if (!wantsOffer(you, a)) continue;                       // a can hand YOU something you want
    for (const b of pool) {
      if (b.id === a.id || !wantsOffer(a, b)) continue;       // a wants b's offer
      if (wantsOffer(b, you)) rawLoops.push([you, a, b]);     // 3-way: closes back to you
      for (const c of pool) {
        if (c.id === a.id || c.id === b.id) continue;
        if (wantsOffer(b, c) && wantsOffer(c, you)) rawLoops.push([you, a, b, c]); // 4-way
      }
    }
  }
  // Express each cycle as giving-order hops: goods flow you → last → … → a → you,
  // and each person simply hands over THEIR OWN offer to the next.
  const seen = new Set();
  const loops = [];
  for (const cyc of rawLoops) {
    const order = [you, ...cyc.slice(1).reverse()];          // giving order
    const key = order.map(n => n.id).join(">");
    if (seen.has(key)) continue;
    seen.add(key);
    const hops = order.map((n, i) => ({ from: n, to: order[(i + 1) % order.length], gives: offerOf(n) }));
    loops.push({ nodes: order, hops, youGet: offerOf(order[order.length - 1]) });
  }
  return { direct: direct.slice(0, 8), loops: loops.slice(0, 6) };
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
// Brand logo. Uses the PNG at public/logo.png (swap that file to change it).
function Logo({ height = 28, style = {}, onClick }) {
  return <img src="/logo.png" alt="BarterThat" onClick={onClick} style={{ height, width: "auto", display: "block", ...style }} />;
}
function Av({ ini, avc, size = 38, style = {}, onClick }) {
  return <div className="av" onClick={onClick} style={{ width: size, height: size, background: avc, fontSize: size * .32, color: "rgba(255,255,255,0.9)", ...style }}>{ini}</div>;
}
function Score({ score }) {
  const c = score >= 90 ? "#EF5D47" : score >= 75 ? "#E8B14A" : "#EF5D47";
  return <span style={{ fontSize: 11, fontWeight: 700, color: c, background: `${c}18`, padding: "2px 7px", borderRadius: 100 }}>⬡ {score}</span>;
}
function Stars({ r }) {
  return <span style={{ fontSize: 11 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(r) ? "#E8B14A" : "#333" }}>★</span>)}<span style={{ color: "var(--t2)", marginLeft: 3 }}>{(r||0).toFixed(1)}</span></span>;
}
function TypeBadge({ t }) {
  const m = TYPE_META[t] || TYPE_META.service;
  return <span className={`pill ${m.cls}`}>{m.l}</span>;
}
function PlatBadge({ p }) {
  const pl = PLATFORMS.find(x => x.id === p.id) || { c: "#555", l: p.l || "Platform" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", background: "var(--s3)", border: "1px solid var(--bd)", borderRadius: "var(--rs)", marginBottom: 5 }}>
      <div style={{ width: 26, height: 26, borderRadius: 5, background: `${pl.c}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: pl.c, flexShrink: 0 }}>{pl.l.slice(0, 2).toUpperCase()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "var(--tx)" }}>{p.l} — {p.proof}</div>
        <div style={{ fontSize: 10, color: "var(--t3)" }}>{p.url}</div>
      </div>
      <div style={{ fontSize: 10, color: "var(--g)", flexShrink: 0 }}>✓ live</div>
    </div>
  );
}
// ── SAFETY: report, block & basic content moderation ───────────────────────
const REPORT_REASONS = ["Scam or fraud", "Harassment or hate", "Sexual or explicit content", "Violence or threats", "Illegal goods or services", "Spam", "Something else"];
const BAD_WORDS = ["fuck", "shit", "bitch", "cunt", "nigger", "faggot", "asshole", "whore", "slut", "dick", "pussy"];
// Mask profanity/slurs in user-generated text shown in the app.
function cleanText(t) {
  if (!t) return t;
  let s = String(t);
  for (const w of BAD_WORDS) s = s.replace(new RegExp(`\\b${w}\\w*`, "gi"), m => m[0] + "*".repeat(Math.max(1, m.length - 1)));
  return s;
}
// Report + Block actions shown on a person's listing (and reusable elsewhere).
function ReportBlock({ l, user, onBlock, onReport }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!l || !user || l.uid === user.id) return null;
  const link = { background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 12, fontWeight: 600, padding: "6px 10px" };
  const submit = () => { if (!reason) return; onReport({ type: "listing", id: l.id, uid: l.uid, name: l.name, reason }); setOpen(false); setReason(""); };
  return (
    <>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
        <button onClick={() => setOpen(true)} style={link}>⚑ Report</button>
        <span style={{ color: "var(--t3)", alignSelf: "center" }}>·</span>
        <button onClick={() => { if (window.confirm(`Block ${l.name}? You won't see their listings or messages anymore.`)) onBlock(l.uid); }} style={link}>⊘ Block</button>
      </div>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(8,12,20,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Report {cleanText(l.name)}</div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 12 }}>What's wrong? Our team reviews every report.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)} style={{ textAlign: "left", padding: "9px 12px", borderRadius: "var(--rs)", border: `1px solid ${reason === r ? "var(--g)" : "var(--bd)"}`, background: reason === r ? "var(--gl)" : "var(--s3)", color: reason === r ? "#EF5D47" : "var(--t2)", cursor: "pointer", fontSize: 12.5 }}>{reason === r ? "✓ " : ""}{r}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn bg bsm" style={{ flex: 1 }} onClick={() => setOpen(false)}>cancel</button>
              <button className="btn bp bsm" style={{ flex: 1 }} disabled={!reason} onClick={submit}>submit report</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// ── CROWDFUNDING: back a venture (tokens / interest / external portal) ───────
function BackVenture({ listing, user, onBack }) {
  const [stats, setStats] = useState(null);
  const [amt, setAmt] = useState(25);
  const [busy, setBusy] = useState(false);
  const goal = listing.fundGoal || 1000;
  useEffect(() => { if (listing._dbId) db.loadBackings(listing._dbId).then(setStats); else setStats({ tokens: 0, interest: 0, backers: 0 }); }, [listing._dbId]);
  const pct = stats ? Math.min(100, Math.round((stats.tokens / goal) * 100)) : 0;
  const pledge = async kind => { setBusy(true); const ok = await onBack(listing, kind, amt); if (ok && listing._dbId) db.loadBackings(listing._dbId).then(setStats); setBusy(false); };
  return (
    <div className="card" style={{ marginBottom: 10, borderColor: "rgba(155,114,221,0.3)", background: "linear-gradient(180deg,rgba(155,114,221,0.08),transparent)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--pu)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>💸 back this venture</div>
      {stats && <>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--t2)", marginBottom: 5 }}>
          <span><strong style={{ color: "var(--am)" }}>⬡ {stats.tokens}</strong> backed</span>
          <span>{stats.backers} backer{stats.backers !== 1 ? "s" : ""}{stats.interest > 0 ? ` · $${stats.interest} interest` : ""}</span>
        </div>
        <div style={{ height: 7, background: "var(--s3)", borderRadius: 100, overflow: "hidden", marginBottom: 12 }}><div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg,var(--pu),var(--am))" }} /></div>
      </>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "var(--t2)" }}>Amount</span>
        <input type="number" min={5} step={5} value={amt} onChange={e => setAmt(Math.max(5, +e.target.value || 5))} className="ifield" style={{ width: 80, textAlign: "center", padding: "6px 8px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <button className="btn bpu bsm" disabled={busy} onClick={() => pledge("tokens")}>🪙 Back with {amt} Barter Tokens</button>
        <button className="btn bg bsm" disabled={busy} onClick={() => pledge("interest")}>✋ Pledge ${amt} interest (no charge — founder follows up)</button>
        {listing.raiseUrl && <a className="btn bg bsm" href={listing.raiseUrl} target="_blank" rel="noopener noreferrer" style={{ textAlign: "center" }}>💵 Invest real money on their licensed portal →</a>}
      </div>
      <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 9, lineHeight: 1.5 }}>Token backing & interest pledges involve no real-money securities. Cash investment happens only on the founder's regulated funding portal (e.g. Wefunder/Republic).</div>
    </div>
  );
}
function CertBadge({ cert }) {
  return <span className="pill pp" style={{ margin: "2px 3px 2px 0" }}>{cert}</span>;
}
function OwnedBadge({ id }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--rp)", background: "linear-gradient(90deg,rgba(239,93,71,0.16),rgba(232,177,74,0.16))", color: "var(--am)", border: "1px solid rgba(232,177,74,0.28)", margin: "2px 3px 2px 0" }}>♥ {BADGE_LABEL(id)}</span>;
}
function SpecTag({ s }) {
  return <span style={{ fontSize: 10, color: "var(--t2)", padding: "2px 8px", borderRadius: "var(--rp)", border: "1px solid var(--bd)", margin: "2px 3px 2px 0", display: "inline-block" }}>{s}</span>;
}

// ── VOICE INPUT ──────────────────────────────────────────────────────────────
// Tap to talk — turns speech into text so people can just say what they need.
// Uses the browser's built-in Web Speech API (no key). Hides itself if the
// browser doesn't support it, so nothing ever breaks.
const SPEECH_OK = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
function VoiceButton({ onText, onInterim, label, size = 40 }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  if (!SPEECH_OK) return null;

  const toggle = () => {
    if (listening) { try { recRef.current && recRef.current.stop(); } catch (e) {} return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      if (interim && onInterim) onInterim(interim);
      if (finalText && onText) onText(finalText.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch (e) { setListening(false); }
  };

  return (
    <button type="button" onClick={toggle} title="Tap and speak — say what you're looking for"
      aria-label="Speak" aria-pressed={listening}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, height: size, padding: label ? "0 14px" : 0, width: label ? "auto" : size,
        borderRadius: 100, border: "1px solid " + (listening ? "var(--g)" : "var(--bd)"),
        background: listening ? "var(--g)" : "var(--s3)", color: listening ? "#fff" : "var(--t2)",
        cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
      <span style={{ fontSize: 16, animation: listening ? "ping 1.2s infinite" : "none" }}>{listening ? "●" : "🎤"}</span>
      {label && <span style={{ fontSize: 13 }}>{listening ? "listening…" : label}</span>}
    </button>
  );
}

// ── MEDIA UPLOAD ─────────────────────────────────────────────────────────────
// Add photos & videos to a listing. Photos are downscaled so they fit in local
// storage; large videos preview for the session. Returns [{kind,url}].
function downscaleImage(file, max = 900, quality = 0.72) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
      else if (h > max) { w = Math.round(w * max / h); h = max; }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      try { resolve(c.toDataURL("image/jpeg", quality)); } catch (e) { resolve(null); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}
// Cloud hosting (Cloudinary unsigned upload). Set REACT_APP_CLOUDINARY_CLOUD and
// REACT_APP_CLOUDINARY_PRESET in Vercel to host media at durable public URLs.
// When unset, uploads fall back to on-device storage (still works for demo).
const CLOUD = { name: process.env.REACT_APP_CLOUDINARY_CLOUD, preset: process.env.REACT_APP_CLOUDINARY_PRESET };
const CLOUD_ON = !!(CLOUD.name && CLOUD.preset);
async function uploadToCloud(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUD.preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD.name}/auto/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload failed");
  const d = await res.json();
  return { kind: d.resource_type === "video" ? "video" : "image", url: d.secure_url };
}
function MediaUpload({ media = [], onChange, max = 6 }) {
  const [busy, setBusy] = useState(false);
  const add = async files => {
    setBusy(true);
    const next = [...media];
    for (const file of Array.from(files)) {
      if (next.length >= max) break;
      const isImg = file.type.startsWith("image/"), isVid = file.type.startsWith("video/");
      if (!isImg && !isVid) continue;
      // Prefer durable cloud hosting when configured.
      if (CLOUD_ON) {
        try { next.push(await uploadToCloud(file)); continue; } catch (e) { /* fall back to local */ }
      }
      if (isImg) {
        const url = await downscaleImage(file);
        if (url) next.push({ kind: "image", url });
      } else if (file.size < 4 * 1024 * 1024) {
        const url = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(file); });
        if (url) next.push({ kind: "video", url });
      } else {
        next.push({ kind: "video", url: URL.createObjectURL(file), transient: true });
      }
    }
    setBusy(false);
    onChange(next);
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {media.map((m, i) => (
          <div key={i} style={{ position: "relative", width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: "1px solid var(--bd)", background: "var(--s3)" }}>
            {m.kind === "image"
              ? <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎬</div>}
            <button type="button" onClick={() => onChange(media.filter((_, n) => n !== i))} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", fontSize: 11, lineHeight: 1 }}>✕</button>
          </div>
        ))}
        {media.length < max && (
          <label style={{ width: 72, height: 72, borderRadius: 10, border: "1px dashed var(--bd2,var(--bd))", background: "var(--s3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)", fontSize: 11, gap: 3 }}>
            <span style={{ fontSize: 20 }}>{busy ? "…" : "＋"}</span>
            <span>photo/video</span>
            <input type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={e => { add(e.target.files); e.target.value = ""; }} />
          </label>
        )}
      </div>
      <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 6 }}>Show your work — up to {max} photos/clips. Real photos build trust and get more swaps.</div>
    </div>
  );
}
function MediaGallery({ media }) {
  if (!media || !media.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
      {media.map((m, i) => (
        <div key={i} style={{ flexShrink: 0, borderRadius: 12, overflow: "hidden", border: "1px solid var(--bd)" }}>
          {m.kind === "image"
            ? <img src={m.url} alt="" style={{ height: 180, maxWidth: 280, objectFit: "cover", display: "block" }} />
            : <video src={m.url} controls playsInline style={{ height: 180, maxWidth: 280, display: "block", background: "#000" }} />}
        </div>
      ))}
    </div>
  );
}

// ── VIDEO MEET ───────────────────────────────────────────────────────────────
// One-tap private video room (Jitsi — no account, no key). Both parties open
// the same link to meet face to face before or during a swap.
const videoMeetUrl = seed => `https://meet.jit.si/BarterThat-${String(seed).replace(/[^a-zA-Z0-9]/g, "").slice(0, 24) || "room"}-meet`;
function VideoMeetButton({ seed, label = "📹 Video meet", small = true, style = {} }) {
  return (
    <button type="button" className={"btn bpu" + (small ? " bsm" : "")} style={style}
      onClick={() => window.open(videoMeetUrl(seed), "_blank", "noopener,noreferrer")}>
      {label}
    </button>
  );
}

// ── SAFETY ───────────────────────────────────────────────────────────────────
// Derives trust/safety verifications from a listing's existing structured fields.
// These are protections that build trust — never used to exclude on identity.
function safetyOf(l) {
  const v = [];
  if (l.verified) { v.push("Email & phone verified"); v.push("ID verified"); }
  const licensed = (l.certs || []).some(c => /licens|insur|bonded|cert|permit|accredit/i.test(c));
  if (licensed || /background.?check/i.test(l.desc || "") || l.cat === "Care & Support Services" || l.cat === "Health & Medical Services")
    v.push("Background checked");
  if (l.elite) v.push("Elite — repeat verified trader");
  if ((l.specialties || []).includes("Women-only sessions")) v.push("Women-only sessions available");
  return v;
}

// Verified-creator detection from public platform reach (Instagram/YouTube/TikTok).
// Creators & celebrities barter promos, shoutouts, tickets, videos & appearances.
function creatorReach(l) {
  let max = 0;
  for (const p of (l.platforms || [])) {
    if (!/instagram|youtube|tiktok|twitch/i.test(p.id + p.l)) continue;
    const m = String(p.proof || "").match(/([\d.]+)\s*([km])/i);
    if (m) { let n = parseFloat(m[1]) * (/k/i.test(m[2]) ? 1e3 : 1e6); if (n > max) max = n; }
  }
  return max;
}
function CreatorBadge({ l }) {
  if (creatorReach(l) < 5000) return null;
  const reach = creatorReach(l);
  const txt = reach >= 1e6 ? `${(reach / 1e6).toFixed(1)}M reach` : `${Math.round(reach / 1e3)}k reach`;
  return <span className="pill" style={{ background: "linear-gradient(90deg,rgba(155,114,221,0.2),rgba(232,177,74,0.2))", color: "var(--am)", border: "1px solid rgba(232,177,74,0.35)" }}>✦ Verified Creator · {txt}</span>;
}

// Local "what experts in your area charge" comparison from the live listing pool.
function marketRate(l, listings) {
  if (!l || l.rate <= 0) return null;
  const peers = (listings || []).filter(x => x.cat === l.cat && x.rate > 0 && x.id !== l.id);
  if (peers.length < 2) return null;
  const rates = peers.map(x => x.rate).sort((a, b) => a - b);
  const lo = rates[0], hi = rates[rates.length - 1];
  const avg = Math.round(rates.reduce((s, x) => s + x, 0) / rates.length);
  const unit = l.type === "service" ? "/hr" : "";
  const pos = l.rate < avg ? "below" : l.rate > avg ? "above" : "right at";
  return { lo, hi, avg, unit, pos, n: peers.length };
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({ onEnter, onHow }) {
  return (
    <div style={{ minHeight: "100vh", width: "100%", maxWidth: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)`, backgroundSize: "44px 44px", opacity: .5 }} />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(239,93,71,0.14) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div className="fu" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 640 }}>
        <div className="pill pp" style={{ marginBottom: 18 }}>swap skills · build community · where it's at</div>
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
          <Logo style={{ height: "clamp(48px,11vw,82px)" }} />
        </div>
        <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>where it's at</div>
        <div style={{ fontFamily: "var(--fd)", fontWeight: 900, letterSpacing: "-.5px", fontSize: "clamp(18px,4.4vw,26px)", margin: "2px auto 14px", color: "var(--am)" }}>
          Barter That<span style={{ color: "var(--g)", opacity: .7 }}>.. that</span><span style={{ color: "var(--g)", opacity: .45 }}>.. that</span><span style={{ color: "var(--g)", opacity: .25 }}>..</span>
        </div>
        <div style={{ fontSize: 16, color: "var(--t2)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 14px" }}>
          Trade <strong style={{ color: "var(--tx)" }}>everything</strong> — skills, goods, gear, even a co-founder. Our AI finds the swap (or the <em>chain</em> of swaps) so everyone wins. No cash. Just proof.
        </div>
        <div style={{ fontSize: 14, color: "var(--g)", fontStyle: "italic", maxWidth: 480, margin: "0 auto 32px", fontFamily: "var(--fd)" }}>
          One person is great at one thing. Together, we're unstoppable.
        </div>
        <div className="cta-row" style={{ marginBottom: 10 }}>
          <button className="btn bp blg" onClick={() => onEnter("signup")}>get started free</button>
          <button className="btn bg blg" onClick={() => onEnter("browse")}>explore marketplace</button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => onEnter("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 13, fontWeight: 600 }}>Already a member? <span style={{ color: "var(--g)" }}>Log in</span></button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <button onClick={onHow} style={{ background: "none", border: "1px solid var(--bd)", borderRadius: 100, cursor: "pointer", color: "var(--tx)", fontSize: 13, fontWeight: 700, padding: "9px 18px" }}>▶ How it works — 60-second walkthrough</button>
        </div>
        <div style={{ marginBottom: 28 }}>
          <button onClick={() => onEnter("pitch")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pu)", fontSize: 12, fontWeight: 600, letterSpacing: ".03em" }}>◆ investors — see the pitch →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, maxWidth: 560, margin: "0 auto 26px" }}>
          {[["◆ Find my swaps", "we connect the dots so everyone wins"], ["⬡ Barter Tokens", "free store credit to even out trades"], ["📍 Near you & live", "see trades happening right now"], ["🔒 Safe & verified", "protected deals, real people"]].map(([t, s]) => (
            <div key={t} style={{ background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: "var(--r)", padding: "12px 14px", textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{t}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8, maxWidth: 560, margin: "0 auto 28px" }}>
          {[`${PITCH.traders} traders`, `${PITCH.gmvTotal} swapped`, `${PITCH.cities} cities`, "22 categories", "B2B + ventures", "Mutual aid"].map(t => (
            <div key={t} style={{ background: "transparent", border: "1px solid var(--bd)", borderRadius: "var(--rp)", padding: "7px 12px", fontSize: 12, color: "var(--t2)" }}>{t}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--t3)" }}>link StyleSeat · Etsy · Fiverr · Upwork · eBay · GitHub · LinkedIn · Crunchbase · and more</div>
      </div>
    </div>
  );
}

// ── INVESTOR PITCH ────────────────────────────────────────────────────────────
// ▼▼▼ EDIT YOUR INVESTOR NUMBERS HERE — everything in the pitch reads from this ▼▼▼
const PITCH = {
  // — the ask —
  roundStatus: "◆ Seed round — open",
  raise: "$3.0M",
  stage: "Seed",
  committed: "$1.1M",
  postMoney: "$18M",
  // — hero —
  heroTitlePre: "The cashless economy needs an ",
  heroTitleHighlight: "operating system.",
  heroSub: "BarterThat is the AI-matched marketplace where people trade everything — skills, goods, gear, even co-founders — without cash. Our matching engine finds the swap, or the multi-party chain, that makes every deal possible.",
  // — problem headline —
  problemTitle: "$2.4 trillion in skills and goods sits idle — because the only tool for trading it is cash people don't have.",
  // — market sizing —
  market: {
    tam: "$1.8T", tamLabel: "TAM — global services + resale + barter spend",
    sam: "$190B", samLabel: "SAM — P2P swappable value, launch regions",
    som: "$4.2B", somLabel: "SOM — 3-yr obtainable GMV",
    note: "Tailwinds: $455B gig economy, $250B+ resale market, AI matching now viable at scale, and a cash-strapped consumer actively seeking alternatives.",
  },
  // — traction —
  tractionTitle: "$380M swapped and compounding — network effects are kicking in.",
  gmvTotal: "$380M",
  gmvNote: "Gross swap value (GMV), $M — trailing 8 quarters",
  gmv: [18, 31, 54, 88, 142, 226, 310, 380],
  traders: "2.4M",
  cities: "180+",
  retention: "68%",
  retentionLabel: "90-day retention",
  momGrowth: "41%",
  momGrowthLabel: "MoM GMV growth",
  // — business model —
  revenue: [
    ["Top-up take rate", "5% on cash & credit balancing a swap — our core, scales with GMV."],
    ["Barter Tokens float", "Interest on held balances + breakage on unspent credits."],
    ["BarterThat+ subscription", "Priority matchmaking, unlimited proposals, analytics — $12/mo."],
    ["B2B & Ventures tier", "Verification, smart contracts, escrow on high-value deals — premium take."],
    ["Promoted listings", "Featured placement & boosted match priority for sellers."],
    ["Trust & escrow fees", "Per-deal protection and dispute resolution service."],
  ],
  // — the ask: use of funds —
  useOfFunds: [
    ["45%", "Engineering & AI matching engine"],
    ["30%", "Growth — 25-city expansion"],
    ["15%", "Trust, ops & compliance"],
    ["10%", "G&A"],
  ],
  milestones: "Milestones: 25 cities · 5M verified traders · Barter Tokens ledger live · $1B GMV run-rate · Series A in 18 months.",
  // — contact —
  contactEmail: "support@barterthat.app",
  company: "BarterThat, Inc.",
  // — "request the deck" form —
  // Paste your form endpoint from Formspree / Getform / Basin (e.g. "https://formspree.io/f/abcwxyz").
  // Until you do, submissions are captured locally under the "bt_leads" localStorage key.
  formEndpoint: "https://formspree.io/f/your_form_id",
};
// ▲▲▲ EDIT YOUR INVESTOR NUMBERS HERE ▲▲▲
const GMV = PITCH.gmv.map((v, i) => ({ m: ["Q1", "Q2", "Q3", "Q4"][i % 4], v }));
function PitchStat({ n, l, c }) {
  return (
    <div style={{ background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: "var(--r)", padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 800, color: c || "var(--g)", lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>{l}</div>
    </div>
  );
}
function PitchSection({ tag, title, children }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <div className="pill pp" style={{ marginBottom: 10 }}>{tag}</div>
      <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", marginBottom: 14, lineHeight: 1.2 }}>{title}</div>
      {children}
    </div>
  );
}
// Casual gate for the local admin view. NOTE: client-side only — this value ships
// in the bundle, so it deters casual access but is not real security.
const ADMIN_PASS = "barterthat";

function RequestDeckModal({ onClose }) {
  const [f, setF] = useState({ name: "", email: "", firm: "", check: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
  const valid = f.name.trim() && emailOk;

  const submit = async () => {
    if (!valid) return;
    setStatus("sending");
    const payload = {
      name: f.name, email: f.email, firm: f.firm, checkSize: f.check, message: f.message,
      _subject: "BarterThat Seed — investor inquiry", source: "BarterThat pitch page",
    };
    const configured = PITCH.formEndpoint && !PITCH.formEndpoint.includes("your_form_id");
    try {
      if (configured) {
        const res = await fetch(PITCH.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("submit failed");
      } else {
        const leads = storage.get("bt_leads") || [];
        leads.push({ ...payload, at: new Date().toISOString() });
        storage.set("bt_leads", leads);
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="fu" style={{ width: "100%", maxWidth: 460, background: "var(--s1)", border: "1px solid var(--bd)", borderRadius: "var(--r)", padding: "22px 20px", maxHeight: "90vh", overflowY: "auto" }}>
        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, color: "var(--g)", marginBottom: 12 }}>✓</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 19, fontWeight: 800, marginBottom: 8 }}>request received.</div>
            <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 20 }}>Thanks, {f.name.split(" ")[0]}. We'll send the full deck & data room to <strong style={{ color: "var(--tx)" }}>{f.email}</strong> shortly.</div>
            <button className="btn bp" style={{ width: "100%" }} onClick={onClose}>close</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800 }}>request the deck</div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 20 }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 18, lineHeight: 1.6 }}>Tell us a bit about you and we'll share the full investor deck & data room.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>name *</label><input className="ifield" value={f.name} onChange={e => set("name", e.target.value)} placeholder="Jane Investor" /></div>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>email *</label><input className="ifield" type="email" value={f.email} onChange={e => set("email", e.target.value)} placeholder="jane@fund.com" style={{ borderColor: f.email && !emailOk ? "var(--rd)" : undefined }} />{f.email && !emailOk && <div style={{ fontSize: 10, color: "var(--rd)", marginTop: 4 }}>enter a valid email</div>}</div>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>firm / role</label><input className="ifield" value={f.firm} onChange={e => set("firm", e.target.value)} placeholder="Acme Ventures · Partner" /></div>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>typical check size</label>
                <select className="ifield" value={f.check} onChange={e => set("check", e.target.value)}>
                  <option value="">select (optional)</option>
                  {["< $50k", "$50k–$250k", "$250k–$1M", "$1M+", "Angel / syndicate"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>message</label><textarea className="ifield" rows={3} value={f.message} onChange={e => set("message", e.target.value)} placeholder="what caught your eye?" style={{ resize: "none" }} /></div>
            </div>
            {status === "error" && <div style={{ background: "var(--rdb)", border: "1px solid rgba(239,93,71,0.3)", borderRadius: "var(--rs)", padding: "9px 12px", fontSize: 12, color: "var(--rd)", marginTop: 12 }}>Something went wrong sending that. Try again, or email {PITCH.contactEmail} directly.</div>}
            <button className="btn bp" style={{ width: "100%", marginTop: 16 }} disabled={!valid || status === "sending"} onClick={submit}>
              {status === "sending" ? "sending…" : "send request →"}
            </button>
            <div style={{ fontSize: 10, color: "var(--t3)", textAlign: "center", marginTop: 10 }}>we'll never share your info · {PITCH.company}</div>
          </>
        )}
      </div>
    </div>
  );
}

function InvestorPitch({ onBack, onEnter }) {
  const maxV = Math.max(...GMV.map(g => g.v));
  const [showForm, setShowForm] = useState(false);
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--bd)", padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo height={26} /><span style={{ fontSize: 11, color: "var(--pu)", fontWeight: 600 }}>· investor brief</span></div>
        <button className="btn bg bsm" onClick={onBack}>← back</button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 16px 80px" }}>
        {/* HERO */}
        <div className="fu" style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r)", border: "1px solid var(--bd)", padding: "30px 22px", marginBottom: 34, background: "radial-gradient(circle at 85% -10%, rgba(155,114,221,0.18), var(--s2) 60%)" }}>
          <div className="pill pa" style={{ marginBottom: 14 }}>{PITCH.roundStatus}</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(26px,6vw,40px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.05, marginBottom: 12 }}>
            {PITCH.heroTitlePre}<span style={{ color: "var(--g)" }}>{PITCH.heroTitleHighlight}</span>
          </div>
          <div style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7, maxWidth: 560, marginBottom: 18 }}>{PITCH.heroSub}</div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 11, color: "var(--t3)" }}>raising</div><div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, color: "var(--g)" }}>{PITCH.raise}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--t3)" }}>stage</div><div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800 }}>{PITCH.stage}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--t3)" }}>committed</div><div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, color: "var(--am)" }}>{PITCH.committed}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--t3)" }}>post-money</div><div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800 }}>{PITCH.postMoney}</div></div>
          </div>
        </div>

        {/* PROBLEM */}
        <PitchSection tag="01 · the problem" title={PITCH.problemTitle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            {[["Cash is the bottleneck", "78% of gig workers and small sellers have unused capacity but can't afford the services they need."], ["Barter doesn't scale", "1:1 trades almost never match. 'I want yours, but you don't want mine' kills 90% of deals."], ["Trust is broken", "Craigslist-era swapping is sketchy, unverified, and unprotected — so it stays tiny and local."]].map(([h, b]) => (
              <div key={h} className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--rd)", marginBottom: 5 }}>{h}</div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>
        </PitchSection>

        {/* SOLUTION */}
        <PitchSection tag="02 · the solution" title="An AI matching engine that turns 'no match' into a chain of swaps everyone wins.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 }}>
            {[["◆", "AI Swap Matchmaker", "Proprietary graph engine finds direct, 3-way & 4-way circular trades in real time. No competitor does multi-party.", "var(--pu)"], ["⬡", "Barter Tokens", "A barter currency that balances any deal — creating liquidity, a float, and powerful retention lock-in.", "var(--am)"], ["🔒", "Trust layer", "Platform-verified profiles, BT Score, escrow & smart contracts make cashless trade safe enough to scale.", "var(--bl)"], ["⚇", "Everything-exchange", "22 categories: services, goods, rentals, digital, ventures, survival, mutual aid. One graph, infinite matches.", "var(--g)"]].map(([ic, h, b, c]) => (
              <div key={h} className="card">
                <div style={{ fontSize: 20, color: c, marginBottom: 7 }}>{ic}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{h}</div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>
        </PitchSection>

        {/* MARKET */}
        <PitchSection tag="03 · market" title="A trillion-dollar exchange economy, addressable for the first time.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 10 }}>
            <PitchStat n={PITCH.market.tam} l={PITCH.market.tamLabel} c="var(--g)" />
            <PitchStat n={PITCH.market.sam} l={PITCH.market.samLabel} c="var(--am)" />
            <PitchStat n={PITCH.market.som} l={PITCH.market.somLabel} c="var(--pu)" />
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)" }}>{PITCH.market.note} <span style={{ color: "var(--t2)" }}>Figures illustrative; assumptions in data room.</span></div>
        </PitchSection>

        {/* TRACTION */}
        <PitchSection tag="04 · traction" title={PITCH.tractionTitle}>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 12 }}>{PITCH.gmvNote}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 130 }}>
              {GMV.map((g, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{ width: "100%", height: `${(g.v / maxV) * 100}%`, background: i === GMV.length - 1 ? "var(--g)" : "linear-gradient(180deg,var(--gd),rgba(239,93,71,0.25))", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                  <div style={{ fontSize: 8, color: "var(--t3)" }}>{g.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 9 }}>
            <PitchStat n={PITCH.traders} l="verified traders" />
            <PitchStat n={PITCH.cities} l="active cities" />
            <PitchStat n={PITCH.retention} l={PITCH.retentionLabel} c="var(--am)" />
            <PitchStat n={PITCH.momGrowth} l={PITCH.momGrowthLabel} c="var(--pu)" />
          </div>
        </PitchSection>

        {/* BUSINESS MODEL */}
        <PitchSection tag="05 · business model" title="Six ways to earn on a transaction the user thinks is 'free.'">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            {PITCH.revenue.map(([h, b]) => (
              <div key={h} className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--g)", marginBottom: 5 }}>{h}</div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>
        </PitchSection>

        {/* MOAT */}
        <PitchSection tag="06 · why we win" title="The matching graph gets smarter — and harder to copy — with every member.">
          <div className="card" style={{ lineHeight: 1.7, fontSize: 13, color: "var(--t2)" }}>
            <p style={{ marginBottom: 10 }}><strong style={{ color: "var(--tx)" }}>Combinatorial network effects.</strong> Each new trader doesn't add one match — they unlock thousands of new multi-party loops. Liquidity compounds non-linearly.</p>
            <p style={{ marginBottom: 10 }}><strong style={{ color: "var(--tx)" }}>Data moat.</strong> Proprietary supply/demand and verified-reputation data train a matching engine no new entrant can replicate cold.</p>
            <p><strong style={{ color: "var(--tx)" }}>Currency lock-in.</strong> Barter Tokens keep value inside the ecosystem — switching costs rise the more you trade.</p>
          </div>
        </PitchSection>

        {/* THE ASK */}
        <PitchSection tag="07 · the ask" title="$3M to go from buzzing marketplace to category-defining platform.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 9, marginBottom: 14 }}>
            {PITCH.useOfFunds.map(([p, l]) => (
              <div key={l} style={{ background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: "var(--r)", padding: "14px" }}>
                <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 800, color: "var(--g)" }}>{p}</div>
                <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>{PITCH.milestones}</div>
        </PitchSection>

        {/* CTA */}
        <div style={{ textAlign: "center", borderTop: "1px solid var(--bd)", paddingTop: 28 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Let's build the economy of trust.</div>
          <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 18 }}>Request the full deck & data room.</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <button className="btn bp blg" onClick={() => setShowForm(true)}>request the deck</button>
            <button className="btn bg blg" onClick={() => onEnter("browse")}>try the product →</button>
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)" }}>{PITCH.contactEmail} · {PITCH.company} · <span onClick={() => onEnter("admin")} style={{ cursor: "pointer", textDecoration: "underline" }}>admin</span></div>
        </div>
      </div>
      {showForm && <RequestDeckModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

// ── ADMIN: captured leads (bt_leads) ─────────────────────────────────────────
function AdminLeads({ onBack }) {
  const [unlocked, setUnlocked] = useState(() => { try { return sessionStorage.getItem("bt_admin_ok") === "1"; } catch { return false; } });
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [leads, setLeads] = useState(() => storage.get("bt_leads") || []);
  const [copied, setCopied] = useState(false);
  const sorted = [...leads].reverse(); // newest first

  const tryUnlock = () => {
    if (pass === ADMIN_PASS) {
      try { sessionStorage.setItem("bt_admin_ok", "1"); } catch {}
      setUnlocked(true); setErr(false);
    } else { setErr(true); }
  };

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div className="fu" style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🔒</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>admin access</div>
          <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20 }}>enter the passphrase to view captured leads</div>
          <input
            className="ifield" type="password" autoFocus value={pass}
            onChange={e => { setPass(e.target.value); setErr(false); }}
            onKeyDown={e => { if (e.key === "Enter") tryUnlock(); }}
            placeholder="passphrase"
            style={{ textAlign: "center", borderColor: err ? "var(--rd)" : undefined, marginBottom: err ? 7 : 14 }}
          />
          {err && <div style={{ fontSize: 11, color: "var(--rd)", marginBottom: 14 }}>incorrect passphrase</div>}
          <button className="btn bp" style={{ width: "100%", marginBottom: 9 }} disabled={!pass} onClick={tryUnlock}>unlock →</button>
          <button className="btn bg" style={{ width: "100%" }} onClick={onBack}>← back</button>
        </div>
      </div>
    );
  }

  const exportCsv = () => {
    const cols = ["at", "name", "email", "firm", "checkSize", "message", "source"];
    const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...leads.map(l => cols.map(c => esc(l[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "barterthat-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  const copyJson = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(leads, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  const clearAll = () => {
    if (!window.confirm("Delete all captured leads? This can't be undone.")) return;
    storage.remove("bt_leads"); setLeads([]);
  };
  const fmt = iso => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--bd)", padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo height={26} /><span style={{ fontSize: 11, color: "var(--am)", fontWeight: 600 }}>· admin · leads</span></div>
        <button className="btn bg bsm" onClick={onBack}>← back</button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 14px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800 }}>{leads.length} captured lead{leads.length !== 1 ? "s" : ""}</div>
          <div style={{ display: "flex", gap: 7, marginLeft: "auto", flexWrap: "wrap" }}>
            <button className="btn bg bsm" disabled={!leads.length} onClick={copyJson}>{copied ? "copied ✓" : "copy JSON"}</button>
            <button className="btn bg bsm" disabled={!leads.length} onClick={exportCsv}>export CSV</button>
            <button className="btn bg bsm" disabled={!leads.length} style={{ color: leads.length ? "var(--rd)" : undefined }} onClick={clearAll}>clear all</button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 16, lineHeight: 1.6 }}>
          Submissions captured locally from the pitch form (<code style={{ color: "var(--t2)" }}>bt_leads</code>). These live only in this browser. Once you set a real <code style={{ color: "var(--t2)" }}>formEndpoint</code>, submissions also POST to your form service.
        </div>

        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--t3)" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>✉</div>
            <div>no leads yet — submit the "request the deck" form to capture one</div>
          </div>
        ) : sorted.map((l, i) => (
          <div key={i} className="card" style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{l.name || "—"}</div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{fmt(l.at)}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: l.message ? 8 : 0 }}>
              <a href={`mailto:${l.email}`} className="pill pb" style={{ textDecoration: "none" }}>{l.email}</a>
              {l.firm && <span className="pill pd">{l.firm}</span>}
              {l.checkSize && <span className="pill pa">{l.checkSize}</span>}
            </div>
            {l.message && <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, background: "var(--s3)", borderRadius: "var(--rs)", padding: "9px 12px" }}>{l.message}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LOGIN (returning users) ──────────────────────────────────────────────────
function Login({ onLogin, onSignup, onBack }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const link = { background: "none", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 12, fontWeight: 600 };
  const go = async () => { setBusy(true); await onLogin(email, pw); setBusy(false); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }} className="fu">
        <div style={{ textAlign: "center", marginBottom: 22 }}><Logo height={28} style={{ margin: "0 auto" }} /></div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontSize: 12.5, color: "var(--t2)", marginBottom: 18, lineHeight: 1.55 }}>Log in to pick up where you left off — your listings, Barter Tokens, and trades are saved to your account and follow you on any device.</div>
        <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>email</label>
        <input className="ifield" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{ marginBottom: 12 }} />
        <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>password</label>
        <input className="ifield" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="your password" onKeyDown={e => { if (e.key === "Enter" && email && pw && !busy) go(); }} />
        <button className="btn bp" style={{ width: "100%", marginTop: 16 }} disabled={busy || !email || !pw} onClick={go}>{busy ? "logging in…" : "log in →"}</button>
        <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={onSignup} style={link}>New here? <span style={{ color: "var(--g)" }}>Create an account</span></button></div>
        <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={onBack} style={{ ...link, color: "var(--t3)" }}>← back</button></div>
      </div>
    </div>
  );
}

// ── VERIFY EMAIL (after sign-up) ─────────────────────────────────────────────
function VerifyEmail({ email, onLogin, onBack }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }} className="fu">
        <div style={{ marginBottom: 18 }}><Logo height={28} style={{ margin: "0 auto" }} /></div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Check your email</div>
        <div style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.6, marginBottom: 20 }}>We sent a verification link to <strong style={{ color: "var(--tx)" }}>{email || "your email"}</strong>. Tap it to confirm you're real — that's what keeps everyone on BarterThat safe to trade and meet in person. Then come back and log in.</div>
        <button className="btn bp" style={{ width: "100%" }} onClick={onLogin}>I verified — log me in →</button>
        <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--t3)", lineHeight: 1.5 }}>Didn't get it? Check spam, or give it a minute. The link opens BarterThat and signs you in automatically.</div>
        <div style={{ marginTop: 14 }}><button onClick={onBack} style={{ background: "none", border: "none", color: "var(--t3)", fontSize: 12, cursor: "pointer" }}>← back</button></div>
      </div>
    </div>
  );
}

// ── SIGNUP ────────────────────────────────────────────────────────────────────
// Friendly, plain-language guide for each step — what it is + why it helps.
const STEP_GUIDE = {
  "account": { n: "1st", t: "Let's meet you", why: "Just your name to start — so people know who they're trading with. The realer you are, the more people trust you and want to swap." },
  "your offer": { n: "2nd", t: "What can you offer?", why: "List one thing you do well or have to give. This is your side of the trade — describe it honestly and you'll attract the right matches." },
  "what you want": { n: "3rd", t: "What do you need?", why: "Tap what you're after. Our AI uses this to find your swaps — the more you add, the more trades we can line up for you." },
  "platforms": { n: "4th", t: "Show your proof", why: "Link anywhere your work is already reviewed (Instagram, Etsy, LinkedIn…). It builds instant trust — but it's optional, add it anytime." },
  "B2B credentials": { n: "5th", t: "Verify your license", why: "Licensed pros submit real credentials. This protects everyone in B2B deals and sets you apart from hobbyists." },
  "launch": { n: "🎉", t: "You're all set!", why: "" },
};
function Signup({ onDone, onLogin }) {
  const [step, setStep] = useState(0);
  const [isB2B, setIsB2B] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", loc: "", cat: "", sub: "", title: "", desc: "", rate: 75, acceptTopup: true, taxBracket: "$0–$44k", invite: "", licenseNo: "", licenseState: "", certifyPro: false });
  const [wants, setWants] = useState([]);
  const [badges, setBadges] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selPlats, setSelPlats] = useState([]);
  const [platUrls, setPlatUrls] = useState({});
  const [selCerts, setSelCerts] = useState([]);

  const steps = isB2B ? ["account", "your offer", "what you want", "platforms", "B2B credentials", "launch"] : ["account", "your offer", "what you want", "platforms", "launch"];

  const ok = () => {
    if (step === 0) return form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.password.length >= 8;
    if (step === 1) return form.cat && form.title.trim();    // category + a one-line title
    if (isB2B && step === 4) return selCerts.length >= 2 && form.licenseNo.trim() && form.licenseState.trim() && form.certifyPro;
    return true;                                             // wants & platforms are optional
  };

  const go = () => {
    if (step < steps.length - 1) { setStep(s => s + 1); return; }
    const plats = selPlats.map(id => { const p = PLATFORMS.find(x => x.id === id); return { id, l: p.l, proof: platUrls[id] || "profile linked", url: platUrls[id] || `${p.l.toLowerCase().replace(/\s/g, "")}.com/${form.name.toLowerCase().replace(/\s/g, "")}` }; });
    // Smart defaults so a fast signup still works — people fill the rest later.
    const finalLoc = form.loc.trim() || "Remote";
    const finalWants = wants.length ? wants : ["Beauty & Personal Care", "Food & Culinary Arts", "Tech & Digital Services", "Home Services & Repair"];
    const finalDesc = form.desc.trim() || form.title.trim();
    onDone({ ...form, loc: finalLoc, desc: finalDesc, wants: finalWants, badges, specialties, platforms: plats, b2b: isB2B, certs: selCerts });
  };

  const selectedCat = CATS.find(c => c.label === form.cat);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 500 }} className="fu">
        <div style={{ marginBottom: 24, textAlign: "center" }}><Logo height={26} style={{ margin: "0 auto" }} /></div>
        <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "var(--g)" : "var(--s4)", transition: "background .3s" }} />)}
        </div>
        {step === 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "var(--s3)", borderRadius: "var(--r)", padding: 4 }}>
            {[["Personal / Freelancer", false], ["Business / B2B", true]].map(([l, v]) => (
              <button key={l} onClick={() => setIsB2B(v)} style={{ flex: 1, padding: "9px 12px", borderRadius: "var(--rs)", background: isB2B === v ? "var(--s1)" : "transparent", border: isB2B === v ? "1px solid var(--bd2)" : "1px solid transparent", color: isB2B === v ? "var(--tx)" : "var(--t2)", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>{l}</button>
            ))}
          </div>
        )}
        {(() => { const gd = STEP_GUIDE[steps[step]] || {}; return (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--fd)", fontSize: 12, fontWeight: 800, color: "#fff", background: "var(--g)", borderRadius: 100, padding: "2px 10px" }}>{gd.n || step + 1}</span>
              <span style={{ fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em" }}>step {step + 1} of {steps.length}</span>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>{gd.t || steps[step]}</div>
            {gd.why && <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, marginTop: 6 }}>{gd.why}</div>}
            {step === 0 && <div style={{ fontSize: 11.5, color: "var(--am)", marginTop: 9, background: "var(--amb)", border: "1px solid rgba(232,177,74,0.25)", borderRadius: "var(--rs)", padding: "8px 11px", lineHeight: 1.5 }}>Takes about 2 minutes. You can <strong>type or tap 🎤 to speak</strong> any answer. Being honest and complete = your best matches, guaranteed.</div>}
          </div>
        ); })()}

        {step === 0 && <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>{isB2B ? "business name" : "full name"}{SPEECH_OK ? " — type or say it 🎤" : ""}</label>
            <div style={{ display: "flex", gap: 8 }}><input className="ifield" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isB2B ? "e.g. Swift Auto Detail" : "e.g. Nia Kendrick"} style={{ flex: 1 }} /><VoiceButton onText={t => setForm(f => ({ ...f, name: t }))} /></div>
          </div>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>email <span style={{ color: "var(--t3)" }}>— so you can log in on any device</span></label><input className="ifield" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" /></div>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>password <span style={{ color: "var(--t3)" }}>— at least 8 characters</span></label><input className="ifield" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="choose a password" /></div>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>location <span style={{ color: "var(--t3)" }}>— optional, defaults to Remote</span></label><input className="ifield" value={form.loc} onChange={e => setForm(f => ({ ...f, loc: e.target.value }))} placeholder="city, state or 'Remote'" /></div>
          {isB2B && <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>tax bracket</label>
            <select className="ifield" value={form.taxBracket} onChange={e => setForm(f => ({ ...f, taxBracket: e.target.value }))}>
              {TAX_BRACKETS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 5 }}>B2B swaps match within 1 bracket — both parties have something to lose</div>
          </div>}
          <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>invite code <span style={{ color: "var(--t3)" }}>— optional · unlocks ✦ Elite</span></label>
            <input className="ifield" value={form.invite} onChange={e => setForm(f => ({ ...f, invite: e.target.value }))} placeholder="have an Elite invite? enter it" style={{ textTransform: "uppercase" }} />
            {form.invite.trim() && (isInvite(form.invite)
              ? <div style={{ fontSize: 11, color: "var(--g)", marginTop: 5 }}>✦ Valid — you'll join as an Elite member</div>
              : <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 5 }}>Elite is invite-only. No code? You can still join — request one later.</div>)}
          </div>
          <div style={{ background: "var(--amb)", border: "1px solid rgba(232,177,74,0.25)", borderRadius: "var(--rs)", padding: "10px 13px", fontSize: 12, color: "var(--am)" }}>⬡ Sign up today and we'll drop <strong>50 Barter Tokens</strong> in your account to get you trading.</div>
          <div style={{ textAlign: "center", marginTop: 4 }}><button type="button" onClick={onLogin} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 12, fontWeight: 600 }}>Already have an account? <span style={{ color: "var(--g)" }}>Log in</span></button></div>
        </div>}

        {step === 1 && <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>category</label>
            <select className="ifield" value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value, sub: "" }))}>
              <option value="">select category</option>
              {CATS.map(c => <option key={c.id} value={c.label}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          {selectedCat && <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>specific offer</label>
            <select className="ifield" value={form.sub} onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}>
              <option value="">select</option>
              {selectedCat.subs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>}
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>listing title{SPEECH_OK ? " — type or say it 🎤" : ""}</label>
            <div style={{ display: "flex", gap: 8 }}><input className="ifield" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="describe what you offer in one line" style={{ flex: 1 }} /><VoiceButton onText={t => setForm(f => ({ ...f, title: t }))} /></div>
          </div>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>details <span style={{ color: "var(--t3)" }}>— optional, type or just talk</span></label>
            <textarea className="ifield" rows={3} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="what's included? hours? requirements?" style={{ resize: "none", marginBottom: 8 }} />
            <VoiceButton label="Speak the details" onText={t => setForm(f => ({ ...f, desc: (f.desc ? f.desc + " " : "") + t }))} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>your value — <strong style={{ color: "var(--g)" }}>${form.rate}{form.rate > 0 ? "/hr" : ""}</strong> {form.rate === 0 && "(free / community swap)"}</label>
            <input type="range" min={0} max={250} step={5} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: +e.target.value }))} style={{ width: "100%", accentColor: "var(--g)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 3 }}><span>$0 (community)</span><span>$250</span></div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: "var(--t2)", cursor: "pointer" }}>
            <input type="checkbox" checked={form.acceptTopup} onChange={e => setForm(f => ({ ...f, acceptTopup: e.target.checked }))} style={{ accentColor: "var(--g)", width: 15, height: 15 }} />
            accept Barter Tokens / cash top-up to balance value
          </label>
          <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 13 }}>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 3 }}>community badges <span style={{ color: "var(--t3)" }}>— optional, self-identify to help your community find & support you</span></label>
            {BADGE_GROUPS.map(grp => (
              <div key={grp} style={{ marginTop: 9 }}>
                <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 5 }}>{grp}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {COMMUNITY_BADGES.filter(b => b.g === grp).map(b => (
                    <button key={b.id} className={`chip ${badges.includes(b.id) ? "on" : ""}`} onClick={() => setBadges(p => p.includes(b.id) ? p.filter(x => x !== b.id) : [...p, b.id])}>{badges.includes(b.id) ? "♥ " : ""}{b.l}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 3 }}>service specialties <span style={{ color: "var(--t3)" }}>— optional, describes your offer</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
              {SPECIALTIES.map(s => (
                <button key={s} className={`chip ${specialties.includes(s) ? "on" : ""}`} onClick={() => setSpecialties(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}>{specialties.includes(s) ? "✓ " : ""}{s}</button>
              ))}
            </div>
          </div>
        </div>}

        {step === 2 && <div>
          <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 14, lineHeight: 1.6 }}>What are you hoping to get? Tap a few — we use this to find your trades. <strong style={{ color: "var(--t3)" }}>Not sure? Skip it — we'll show you everything.</strong></p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {POPULAR_CATS.map(c => (
              <button key={c.id} className={`chip ${wants.includes(c.label) ? "on" : ""}`} onClick={() => setWants(p => p.includes(c.label) ? p.filter(x => x !== c.label) : [...p, c.label])}>{wants.includes(c.label) ? "✓ " : ""}{c.icon} {c.label}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 12 }}>{wants.length ? `${wants.length} picked` : "none picked — that's fine, you can change this anytime"}</div>
        </div>}

        {step === 3 && <div>
          <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 14, lineHeight: 1.6 }}>Link any place your work is already reviewed (StyleSeat, Etsy, LinkedIn…). It's your proof, so people trust you faster. <strong style={{ color: "var(--t3)" }}>Totally optional — you can add this later.</strong></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setSelPlats(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", background: selPlats.includes(p.id) ? `${p.c}15` : "var(--s3)", border: `1px solid ${selPlats.includes(p.id) ? p.c : "var(--bd)"}`, borderRadius: "var(--rs)", cursor: "pointer", color: "var(--tx)", transition: "all .15s", textAlign: "left" }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: `${p.c}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: p.c, flexShrink: 0 }}>{p.l.slice(0, 2).toUpperCase()}</div>
                <span style={{ fontSize: 11 }}>{p.l}</span>
                {selPlats.includes(p.id) && <span style={{ marginLeft: "auto", color: "var(--g)", fontSize: 11 }}>✓</span>}
              </button>
            ))}
          </div>
          {selPlats.length > 0 && <div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 8 }}>paste your profile URLs:</div>
            {selPlats.map(id => { const p = PLATFORMS.find(x => x.id === id); return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ fontSize: 11, color: "var(--t2)", width: 95, flexShrink: 0 }}>{p.l}</div>
                <input className="ifield" placeholder={`${p.l.toLowerCase()}.com/you`} value={platUrls[id] || ""} onChange={e => setPlatUrls(v => ({ ...v, [id]: e.target.value }))} style={{ flex: 1 }} />
              </div>
            ); })}
          </div>}
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 8 }}>✦ links are community-verified — fake profiles get flagged</div>
        </div>}

        {isB2B && step === 4 && <div>
          <div style={{ background: "var(--pub)", border: "1px solid rgba(155,114,221,0.3)", borderRadius: "var(--rs)", padding: "11px 14px", marginBottom: 16, fontSize: 12, color: "var(--pu)", lineHeight: 1.6 }}>
            <strong>B2B swaps require minimum 2 credentials</strong> — ensures both parties have real stakes.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {B2B_CERTS.map(c => (
              <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: selCerts.includes(c) ? "rgba(155,114,221,0.08)" : "var(--s3)", border: `1px solid ${selCerts.includes(c) ? "var(--pu)" : "var(--bd)"}`, borderRadius: "var(--rs)", cursor: "pointer", transition: "all .15s" }}>
                <input type="checkbox" checked={selCerts.includes(c)} onChange={() => setSelCerts(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} style={{ accentColor: "var(--pu)", width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: selCerts.includes(c) ? "var(--tx)" : "var(--t2)" }}>{c}</span>
              </label>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 10, marginBottom: 16 }}>{selCerts.length}/2 minimum selected</div>

          <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tx)", marginBottom: 4 }}>License verification</div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 11, lineHeight: 1.5 }}>This is what separates licensed pros from hobbyists. Submit your license/registration so we can verify you before you do B2B swaps.</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 9 }}>
              <input className="ifield" value={form.licenseNo} onChange={e => setForm(f => ({ ...f, licenseNo: e.target.value }))} placeholder="license / registration #" style={{ flex: 2 }} />
              <input className="ifield" value={form.licenseState} onChange={e => setForm(f => ({ ...f, licenseState: e.target.value }))} placeholder="state / issuer" style={{ flex: 1 }} />
            </div>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 11.5, color: "var(--t2)", cursor: "pointer", lineHeight: 1.5 }}>
              <input type="checkbox" checked={form.certifyPro} onChange={e => setForm(f => ({ ...f, certifyPro: e.target.checked }))} style={{ accentColor: "var(--pu)", width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
              I certify this license info is accurate and current. I understand false info can lead to removal and that I'm legally responsible for my own B2B agreements.
            </label>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 9 }}>You'll show as <strong style={{ color: "var(--pu)" }}>Licensed Pro · pending verification</strong> until our team confirms — that's the badge that builds B2B trust.</div>
          </div>
        </div>}

        {step === steps.length - 1 && <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 14, color: "var(--g)" }}>✦</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 10, color: "var(--g)" }}>you're live.</div>
          <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, marginBottom: 16 }}>Your listing is up and we're already looking for swaps for you. You can finish your profile anytime.</p>
          <div className="credit" style={{ marginBottom: 16 }}>⬡ 50 Barter Tokens added</div>
          {isB2B && <div style={{ background: "var(--pub)", border: "1px solid rgba(155,114,221,0.3)", borderRadius: "var(--rs)", padding: "11px 14px", marginBottom: 16, fontSize: 12, color: "var(--pu)" }}>B2B verified — matched with licensed businesses in your tax bracket</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
            {["✓ listing live in marketplace", "✓ platform proof verified", "✓ AI matchmaking active", "✓ escrow protection on"].map(t => (
              <div key={t} style={{ fontSize: 12, color: "var(--t2)", padding: "8px 12px", background: "var(--s3)", borderRadius: "var(--rs)" }}>{t}</div>
            ))}
          </div>
        </div>}

        <div style={{ display: "flex", gap: 9, marginTop: 24 }}>
          {step > 0 && <button className="btn bg" onClick={() => setStep(s => s - 1)}>← back</button>}
          <button className="btn bp" style={{ flex: 1 }} disabled={!ok()} onClick={go}>
            {step === steps.length - 1 ? "enter marketplace →"
              : ((step === 2 && !wants.length) || (step === 3 && !selPlats.length)) ? "skip for now →"
              : "continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LISTING CARD ──────────────────────────────────────────────────────────────
function ListingCard({ l, user, onView, onSave, onPropose, i = 0 }) {
  const cover = (l.media || []).find(m => m.kind === "image");
  return (
    <div className="card fu" style={{ animationDelay: `${i * .03}s`, cursor: "pointer" }} onClick={() => onView(l)}>
      {cover && <div style={{ margin: "-2px -2px 10px", borderRadius: "12px 12px 0 0", overflow: "hidden" }}><img src={cover.url} alt="" style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} /></div>}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Av ini={l.ini} avc={l.avc} size={40} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              {cleanText(l.name)}
              {l.elite && <span className="pill pa" title="Invite-only">✦ Elite</span>}
              {l.b2b && <span className="b2b-badge">{l.verifiedPro === false ? "Pro · pending" : "Licensed Pro"}</span>}
              {creatorReach(l) >= 5000 && <span className="pill" style={{ background: "rgba(155,114,221,0.16)", color: "var(--pu)" }}>✦ Creator</span>}
            </div>
            <Stars r={l.rating} />
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onSave(l.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: user && l.saved?.includes(user.id) ? "var(--g)" : "var(--t3)", transition: "color .15s", flexShrink: 0 }}>♡</button>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 7 }}>
        <TypeBadge t={l.type} />
        <span className="pill pd">{l.cat}</span>
      </div>
      <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, marginBottom: 5, lineHeight: 1.3 }}>{l.title}</div>
      <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 10, lineHeight: 1.5 }}>{l.desc}</div>
      {(l.badges?.length > 0 || l.specialties?.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 9 }}>
          {l.badges?.map(b => <OwnedBadge key={b} id={b} />)}
          {l.specialties?.map(s => <SpecTag key={s} s={s} />)}
        </div>
      )}
      {l.wants?.length > 0 && (
        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 10 }}>wants: <span style={{ color: "var(--t2)" }}>{l.wants.slice(0, 2).join(", ")}{l.wants.length > 2 ? "…" : ""}</span></div>
      )}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {l.platforms.slice(0, 3).map(p => { const pl = PLATFORMS.find(x => x.id === p.id) || { c: "#555" }; return (
          <span key={p.id} style={{ fontSize: 10, padding: "2px 7px", borderRadius: "var(--rp)", background: `${pl.c}15`, color: pl.c, fontWeight: 600 }}>✓ {p.l}</span>
        ); })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800, color: "var(--g)" }}>{l.rate === 0 ? "Free / aid" : "$" + l.rate}</span>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>{l.rate > 0 ? (l.type === "service" ? "/hr · " : " · ") : " · "}{l.loc}</span>
        </div>
        <button className="btn bp bsm" onClick={e => { e.stopPropagation(); onPropose(l); }}>propose swap</button>
      </div>
    </div>
  );
}

// ── BROWSE (Listings / Map / Live) ──────────────────────────────────────────
function Browse({ listings, user, onView, onSave, onPropose }) {
  const [view, setView] = useState("list");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [maxR, setMaxR] = useState(250);
  const [showCats, setShowCats] = useState(false);
  const [support, setSupport] = useState([]);
  const [showSupport, setShowSupport] = useState(false);
  const [seg, setSeg] = useState("all");

  const filtered = listings.filter(l => {
    if (user && l.uid === user.id) return false;
    if (user?.blocked?.includes(l.uid)) return false;
    if (seg === "everyday" && l.b2b) return false;
    if (seg === "pro" && !l.b2b) return false;
    if (seg === "elite" && !l.elite) return false;
    if (seg === "creator" && creatorReach(l) < 5000) return false;
    if (cat !== "All" && l.cat !== cat) return false;
    if (type !== "All" && l.type !== type) return false;
    if (support.length && !support.some(b => l.badges?.includes(b))) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase()) && !l.name.toLowerCase().includes(q.toLowerCase()) && !l.sub.toLowerCase().includes(q.toLowerCase()) && !l.cat.toLowerCase().includes(q.toLowerCase())) return false;
    if (l.rate > maxR) return false;
    return true;
  });

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--bd)", padding: "10px 14px 8px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input className="ifield" value={q} onChange={e => setQ(e.target.value)} placeholder={SPEECH_OK ? "search or tap 🎤 to say what you need..." : "search — service, item, skill, city..."} style={{ flex: 1 }} />
          <VoiceButton onInterim={setQ} onText={setQ} />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--s3)", borderRadius: "var(--rp)", padding: 3 }}>
            {[["list", "◫"], ["map", "📍"], ["live", "◉"]].map(([v, ic]) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "4px 12px", borderRadius: "var(--rp)", border: "none", background: view === v ? "var(--g)" : "transparent", color: view === v ? "#fff" : "var(--t2)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{ic} {v}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <span style={{ fontSize: 10, color: "var(--t3)", whiteSpace: "nowrap" }}>max ${maxR}</span>
            <input type="range" min={0} max={250} step={5} value={maxR} onChange={e => setMaxR(+e.target.value)} style={{ width: 64, accentColor: "var(--g)" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 8, paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
          {[["all", "Everyone"], ["everyday", "🙋 Everyday people"], ["pro", "🪪 Licensed Pros"], ["elite", "✦ Elite"], ["creator", "✦ Creators"]].map(([s, lbl]) => (
            <button key={s} onClick={() => setSeg(s)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: "var(--rp)", border: `1px solid ${seg === s ? "var(--pu)" : "var(--bd)"}`, background: seg === s ? "var(--pub,rgba(155,114,221,0.12))" : "transparent", color: seg === s ? "var(--pu)" : "var(--t2)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{lbl}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {["All", ...Object.keys(TYPE_META)].map(tk => (
            <button key={tk} onClick={() => setType(tk)} style={{ padding: "3px 10px", borderRadius: "var(--rp)", border: `1px solid ${type === tk ? "var(--g)" : "var(--bd)"}`, background: type === tk ? "var(--gl)" : "transparent", color: type === tk ? "#EF5D47" : "var(--t2)", fontSize: 11, cursor: "pointer" }}>{tk === "All" ? "all types" : TYPE_META[tk].l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "10px 14px 0" }}>
        {cat === "All" && !q && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 7 }}>popular — tap to jump in</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
              {POPULAR_CATS.map(c => (
                <button key={c.id} onClick={() => setCat(c.label)} style={{ flexShrink: 0, padding: "8px 13px", borderRadius: 100, border: "1px solid var(--bd)", background: "var(--s3)", color: "var(--tx)", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{c.icon} {(c.label.split(/[,&]/)[0].trim().split(" ")[0]) || c.label}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button onClick={() => setShowCats(x => !x)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: "var(--rp)", border: "1px solid var(--bd)", background: showCats ? "var(--s3)" : "transparent", color: "var(--t2)", cursor: "pointer", fontSize: 12 }}>
            {showCats ? "▲ hide" : "▼ browse all"} {CATS.length} categories
          </button>
          <button onClick={() => setShowSupport(x => !x)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: "var(--rp)", border: `1px solid ${support.length ? "rgba(232,177,74,0.4)" : "var(--bd)"}`, background: support.length ? "var(--amb)" : (showSupport ? "var(--s3)" : "transparent"), color: support.length ? "var(--am)" : "var(--t2)", cursor: "pointer", fontSize: 12 }}>
            ♥ support community-owned{support.length ? ` · ${support.length}` : ""}
          </button>
        </div>
        {showSupport && (
          <div style={{ background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: "var(--r)", padding: "12px 13px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 9, lineHeight: 1.5 }}>Discover & support businesses that self-identify with these communities. Sellers opt in — this celebrates them, it never excludes anyone.</div>
            {BADGE_GROUPS.map(grp => (
              <div key={grp} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 5 }}>{grp}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {COMMUNITY_BADGES.filter(b => b.g === grp).map(b => (
                    <button key={b.id} className={`chip ${support.includes(b.id) ? "on" : ""}`} onClick={() => setSupport(p => p.includes(b.id) ? p.filter(x => x !== b.id) : [...p, b.id])}>{support.includes(b.id) ? "♥ " : ""}{b.l}</button>
                  ))}
                </div>
              </div>
            ))}
            {support.length > 0 && <button onClick={() => setSupport([])} style={{ marginTop: 4, fontSize: 11, color: "var(--t3)", background: "none", border: "none", cursor: "pointer" }}>✕ clear</button>}
          </div>
        )}
        {showCats && (
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => { setCat("All"); setShowCats(false); }} style={{ padding: "8px 12px", marginBottom: 12, borderRadius: "var(--rs)", border: `1px solid ${cat === "All" ? "var(--g)" : "var(--bd)"}`, background: cat === "All" ? "var(--gl)" : "var(--s3)", color: cat === "All" ? "#EF5D47" : "var(--t2)", cursor: "pointer", fontSize: 12, textAlign: "left", width: "100%" }}>◈ Show everything</button>
            {CAT_GROUPS.map(grp => (
              <div key={grp.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>{grp.icon} {grp.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 6 }}>
                  {grp.ids.map(CAT_BY_ID).filter(Boolean).map(c => (
                    <button key={c.id} onClick={() => { setCat(c.label); setShowCats(false); }} style={{ padding: "8px 12px", borderRadius: "var(--rs)", border: `1px solid ${cat === c.label ? "var(--g)" : "var(--bd)"}`, background: cat === c.label ? "var(--gl)" : "var(--s3)", color: cat === c.label ? "#EF5D47" : "var(--t2)", cursor: "pointer", fontSize: 12, textAlign: "left" }}>{c.icon} {c.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {cat !== "All" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className="pill pg">{cat}</span>
            <button onClick={() => setCat("All")} style={{ fontSize: 11, color: "var(--t3)", background: "none", border: "none", cursor: "pointer" }}>✕ clear</button>
          </div>
        )}
      </div>

      {view === "list" && <>
        <div style={{ padding: "0 14px", fontSize: 11, color: "var(--t3)", marginBottom: 10 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</div>
        <div style={{ padding: "0 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(275px,1fr))", gap: 10 }}>
          {filtered.map((l, i) => <ListingCard key={l.id} l={l} user={user} onView={onView} onSave={onSave} onPropose={onPropose} i={i} />)}
        </div>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--t3)" }}><div style={{ fontSize: 28, marginBottom: 10 }}>◎</div><div>no listings match — try different filters</div></div>}
      </>}

      {view === "map" && <MapView listings={filtered} onView={onView} />}
      {view === "live" && <LiveFeed listings={filtered} onView={onView} />}
    </div>
  );
}

// ── MAP VIEW (stylized hyperlocal radar) ─────────────────────────────────────
function MapView({ listings, onView }) {
  const pts = listings.slice(0, 16);
  const pos = (id) => { const a = (id * 2654435761) % 1000 / 1000, b = (id * 40503) % 1000 / 1000; return { left: 8 + a * 80, top: 10 + b * 74 }; };
  return (
    <div style={{ padding: "8px 14px" }}>
      <div style={{ position: "relative", height: 380, borderRadius: "var(--r)", border: "1px solid var(--bd)", overflow: "hidden", background: "radial-gradient(circle at 50% 50%, rgba(239,93,71,0.08), var(--s1) 70%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)`, backgroundSize: "38px 38px", opacity: .4 }} />
        {[120, 230, 340].map((s, i) => <div key={i} className="ring" style={{ width: s, height: s, left: `calc(50% - ${s/2}px)`, top: `calc(50% - ${s/2}px)` }} />)}
        <div style={{ position: "absolute", left: "calc(50% - 7px)", top: "calc(50% - 7px)", width: 14, height: 14, borderRadius: "50%", background: "var(--g)", boxShadow: "0 0 0 4px rgba(239,93,71,0.2)" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--g)", animation: "ping 2s infinite" }} />
        </div>
        {pts.map(l => { const p = pos(l.id); return (
          <div key={l.id} className="maprow" style={{ left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${(l.id % 5) * .4}s` }} onClick={() => onView(l)}>
            <Av ini={l.ini} avc={l.avc} size={30} style={{ border: "2px solid var(--bk)" }} />
            <span style={{ fontSize: 9, background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: "var(--rp)", padding: "1px 6px", whiteSpace: "nowrap", color: "var(--t2)" }}>{l.rate === 0 ? "free" : "$" + l.rate}</span>
          </div>
        ); })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12, color: "var(--t2)" }}>
        <span className="ndot" /> {pts.length} traders within range · tap a pin to view
      </div>
    </div>
  );
}

// ── LIVE FEED ─────────────────────────────────────────────────────────────────
function LiveFeed({ listings, onView }) {
  const [events, setEvents] = useState(ACTIVITY_SEED.map((e, i) => ({ ...e, id: "s" + i, t: "just now" })));
  useEffect(() => {
    const iv = setInterval(() => {
      const n = ACT_NAMES[Math.floor(Math.random() * ACT_NAMES.length)];
      const ev = ACT_TEMPLATES[Math.floor(Math.random() * ACT_TEMPLATES.length)](n);
      setEvents(p => [{ ...ev, id: Date.now(), t: "just now" }, ...p.map(x => ({ ...x, t: x.t === "just now" ? "moments ago" : x.t }))].slice(0, 22));
    }, 2600);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ padding: "10px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className="ndot" /><span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--fd)" }}>happening now</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--t3)" }}>live · auto-updating</span>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {events.map(e => (
          <div key={e.id} className="feed fi">
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--s3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: e.c, flexShrink: 0 }}>{e.ic}</div>
            <div style={{ flex: 1, fontSize: 12, color: "var(--tx)" }}>{e.txt}</div>
            <div style={{ fontSize: 10, color: "var(--t3)", flexShrink: 0 }}>{e.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MATCH (AI Swap Matchmaker + circular trades) ─────────────────────────────
function Match({ listings, user, onView, onPropose }) {
  const [offer, setOffer] = useState(user?.cat || "Creative Arts & Design");
  const [wants, setWants] = useState(user?.wants?.length ? user.wants : ["Beauty & Personal Care", "Tech & Digital Services"]);
  const [run, setRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [narr, setNarr] = useState({});     // { "d-<id>" | "l-<idx>": { fit, story } } — Claude's narration of real swaps
  const [aiLoading, setAiLoading] = useState(false);

  const [openGroups, setOpenGroups] = useState(false);

  const visible = useMemo(() => listings.filter(l => !user?.blocked?.includes(l.uid)), [listings, user]);
  const results = useMemo(() => {
    if (!run) return null;
    return findSwaps({ uid: user?.id || -1, offer, wants }, visible);
  }, [run, offer, wants, visible, user]);

  const find = (w = wants) => {
    setLoading(true); setRun(false); setNarr({});
    setTimeout(() => { setLoading(false); setRun(true); }, 950);
    // Narrate the REAL swaps our deterministic engine found — Claude only ranks &
    // explains them (never invents). Graceful no-op if AI is offline.
    const swaps = findSwaps({ uid: user?.id || -1, offer, wants: w }, visible);
    const keyOf = [];
    const compact = [];
    swaps.direct.forEach(d => {
      keyOf[compact.length] = "d-" + d.partner.id;
      compact.push({ i: compact.length, kind: "direct", chain: `You give ${d.youGive}, you get ${d.youGet} from ${d.partner.name}` });
    });
    swaps.loops.forEach((lp, k) => {
      keyOf[compact.length] = "l-" + k;
      const chain = lp.hops.map(h => `${h.from.id === "you" ? "You" : h.from.name.split(" ")[0]} give ${h.gives}`).join(" → ") + ` → you get ${lp.youGet}`;
      compact.push({ i: compact.length, kind: "loop", chain });
    });
    if (!compact.length) { setAiLoading(false); return; }
    setAiLoading(true);
    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ swaps: compact })
    })
      .then(r => r.ok ? r.json() : { ranked: [] })
      .then(d => {
        const map = {};
        (Array.isArray(d.ranked) ? d.ranked : []).forEach(rk => { const key = keyOf[rk.i]; if (key) map[key] = { fit: rk.fit, story: rk.story }; });
        setNarr(map);
      })
      .catch(() => setNarr({}))
      .finally(() => setAiLoading(false));
  };
  const findAnything = () => { const all = CAT_LABELS; setWants(all); find(all); };

  return (
    <div style={{ padding: "14px 14px 90px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span className="pill pp">◆ AI</span>
        <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800 }}>Find my swaps</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 14, lineHeight: 1.6 }}>Can't find a straight trade? We connect the dots — <strong style={{ color: "var(--pu)" }}>you help them, they help someone, that person helps you.</strong> Everybody gets what they need.</div>

      <button className="btn bpu" style={{ width: "100%", marginBottom: 12, padding: "14px" }} disabled={loading} onClick={findAnything}>
        {loading ? "looking…" : "◆ Find me anything good →"}
      </button>
      <div style={{ textAlign: "center", fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>one tap — or pick what you want below</div>

      <div className="card" style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>What I can offer</label>
        <select className="ifield" value={offer} onChange={e => { setOffer(e.target.value); setRun(false); }} style={{ marginBottom: 14 }}>
          {CAT_LABELS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 7 }}>What I'm looking for <span style={{ color: "var(--t3)" }}>{wants.length ? `· ${wants.length} picked` : "· tap any"}</span></label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CAT_GROUPS.map(grp => {
            const cats = grp.ids.map(CAT_BY_ID).filter(Boolean);
            const open = openGroups === grp.label;
            const picked = cats.filter(c => wants.includes(c.label)).length;
            return (
              <div key={grp.label} style={{ border: "1px solid var(--bd)", borderRadius: "var(--rs)", overflow: "hidden" }}>
                <button onClick={() => setOpenGroups(open ? false : grp.label)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--s3)", border: "none", color: "var(--tx)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, textAlign: "left" }}>
                  <span>{grp.icon} {grp.label}</span>
                  {picked > 0 && <span style={{ fontSize: 10, color: "var(--g)" }}>✓ {picked}</span>}
                  <span style={{ marginLeft: "auto", color: "var(--t3)" }}>{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px" }}>
                    {cats.map(c => (
                      <button key={c.id} className={`chip ${wants.includes(c.label) ? "on" : ""}`} onClick={() => { setWants(p => p.includes(c.label) ? p.filter(x => x !== c.label) : [...p, c.label]); setRun(false); }}>{wants.includes(c.label) ? "✓ " : ""}{c.label}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button className="btn bpu" style={{ width: "100%", marginTop: 14 }} disabled={!wants.length || loading} onClick={() => find()}>
          {loading ? "looking…" : "◆ find my swaps"}
        </button>
      </div>

      {loading && <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", padding: 26 }}><div className="spin" /><span style={{ fontSize: 13, color: "var(--t2)" }}>checking {listings.length} people for trades that work…</span></div>}

      {run && !loading && aiLoading && (
        <div className="card fu" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10, borderColor: "rgba(155,114,221,0.35)", background: "linear-gradient(180deg, rgba(155,114,221,0.08), transparent)" }}>
          <div className="spin" />
          <span className="pill pp">◆ Claude AI</span>
          <span style={{ fontSize: 12, color: "var(--pu)", fontWeight: 700 }}>ranking your best swaps…</span>
        </div>
      )}

      {results && !loading && <>
        {results.direct.length === 0 && results.loops.length === 0 && (
          <div style={{ textAlign: "center", padding: "44px 24px", color: "var(--t3)" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
            <div style={{ marginBottom: 6 }}>No matches yet for that combo.</div>
            <div style={{ fontSize: 12 }}>Add more "I want" categories — loops need flexibility.</div>
          </div>
        )}

        {results.direct.length > 0 && <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--g)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>⇄ direct swaps ({results.direct.length})</div>
          {results.direct.map(({ partner: b, youGive, youGet }) => (
            <div key={"d" + b.id} className="card fu" style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Av ini={b.ini} avc={b.avc} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "var(--t2)" }}>{b.loc || b.cat}</div>
                </div>
                <Score score={b.score} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 10, padding: "9px 11px", background: "rgba(46,196,140,0.08)", borderRadius: "var(--rs)", fontSize: 11.5 }}>
                <span style={{ color: "var(--t2)" }}>You give</span>
                <span style={{ fontWeight: 700, color: "var(--g)" }}>{youGive}</span>
                <span style={{ color: "var(--t3)" }}>⇄</span>
                <span style={{ color: "var(--t2)" }}>get</span>
                <span style={{ fontWeight: 700, color: "var(--g)" }}>{youGet}</span>
              </div>
              {narr["d-" + b.id]?.story && <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 8, fontSize: 11.5, color: "var(--t2)", lineHeight: 1.5 }}><span className="pill pp" style={{ fontSize: 8, flexShrink: 0 }}>◆ AI</span><span>{narr["d-" + b.id].story}{typeof narr["d-" + b.id].fit === "number" ? ` · ${narr["d-" + b.id].fit}% fit` : ""}</span></div>}
              <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
                <button className="btn bg bsm" style={{ flex: 1 }} onClick={() => onView(b)}>view</button>
                <button className="btn bp bsm" style={{ flex: 1 }} onClick={() => onPropose(b)}>propose</button>
              </div>
            </div>
          ))}
        </>}

        {results.loops.length > 0 && <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pu)", margin: "16px 0 10px", textTransform: "uppercase", letterSpacing: ".06em" }}>🔄 circular trade loops ({results.loops.length})</div>
          {results.loops.map((loop, li) => (
            <div key={"l" + li} className="card fu" style={{ marginBottom: 10, borderColor: "rgba(155,114,221,0.3)", animationDelay: `${li * .06}s` }}>
              <div style={{ fontSize: 11, color: "var(--pu)", marginBottom: 12, fontWeight: 700 }}>{loop.nodes.length}-way loop — nobody pays, everybody wins</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {loop.hops.map((h, hi) => {
                  const youGiver = h.from.id === "you";
                  return (
                    <div key={hi}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Av ini={h.from.ini} avc={youGiver ? "var(--g)" : h.from.avc} size={32} />
                        <div style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.45 }}>
                          <span style={{ fontWeight: 700, color: youGiver ? "var(--g)" : "var(--tx)" }}>{youGiver ? "You" : h.from.name.split(" ")[0]}</span>
                          <span style={{ color: "var(--t2)" }}> give </span>
                          <span style={{ fontWeight: 700, color: "var(--pu)" }}>{h.gives}</span>
                          <span style={{ color: "var(--t3)" }}> → {h.to.id === "you" ? "you" : h.to.name.split(" ")[0]}</span>
                        </div>
                      </div>
                      {hi < loop.hops.length - 1 && <div style={{ width: 2, height: 13, background: "var(--bd2)", marginLeft: 15 }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 11, fontSize: 11.5, color: "var(--g)", fontWeight: 700, textAlign: "center" }}>✓ everybody gets what they wanted — you get {loop.youGet}</div>
              {narr["l-" + li]?.story && <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 9, fontSize: 11.5, color: "var(--t2)", lineHeight: 1.5 }}><span className="pill pp" style={{ fontSize: 8, flexShrink: 0 }}>◆ AI</span><span>{narr["l-" + li].story}{typeof narr["l-" + li].fit === "number" ? ` · ${narr["l-" + li].fit}% fit` : ""}</span></div>}
              <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
                <button className="btn bg bsm" style={{ flex: 1 }} onClick={() => onView(loop.nodes[1])}>view chain</button>
                <button className="btn bpu bsm" style={{ flex: 1 }} onClick={() => onPropose(loop.nodes[1])}>start loop</button>
              </div>
            </div>
          ))}
        </>}
      </>}

      {!results && !loading && (
        <div style={{ textAlign: "center", padding: "30px 24px", color: "var(--t3)" }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>◆</div>
          <div style={{ fontSize: 12 }}>Set what you offer & want, then let the AI find your swaps.</div>
        </div>
      )}
    </div>
  );
}

// ── COMMUNITY (mission + squads + mutual aid + ventures) ─────────────────────
function Community({ listings, user, onView, onPropose, onNav }) {
  const squads = listings.filter(l => l.type === "squad");
  const aid = listings.filter(l => l.type === "aid");
  const ventures = listings.filter(l => l.type === "venture");
  const Section = ({ title, sub, items, color }) => items.length > 0 && (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10 }}>{sub}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(255px,1fr))", gap: 9 }}>
        {items.map(l => (
          <div key={l.id} className="card" style={{ cursor: "pointer", borderLeft: `3px solid ${color}` }} onClick={() => onView(l)}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <Av ini={l.ini} avc={l.avc} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{l.loc}</div>
              </div>
              <TypeBadge t={l.type} />
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{l.title}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5, marginBottom: 10 }}>{l.desc}</div>
            <button className="btn bp bsm" style={{ width: "100%" }} onClick={e => { e.stopPropagation(); onPropose(l); }}>{l.type === "aid" ? "offer help / swap" : l.type === "venture" ? "reach out" : "join squad"}</button>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ padding: "14px 14px 90px" }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r)", border: "1px solid var(--bd)", padding: "22px 18px", marginBottom: 20, background: "radial-gradient(circle at 80% 0%, rgba(155,114,221,0.14), var(--s2) 60%)" }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", lineHeight: 1.2, marginBottom: 10 }}>We were built to need each other.</div>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, maxWidth: 520 }}>
          One person is good at one thing. But someone else can make you <em style={{ color: "var(--tx)" }}>better</em> — because they're good at another. BarterThat isn't just a marketplace. It's a reminder that no one builds a life alone. Trade your gift. Receive someone else's. That's the whole point.
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn bpu bsm" onClick={() => onNav("match")}>◆ find your match</button>
          <button className="btn bg bsm" onClick={() => onNav("post")}>start a circle</button>
        </div>
      </div>

      <Section title="◆ Professional & Business Services" sub="Find a co-founder, CTO, advisor, or pitch help — trade equity or skills" items={ventures} color="var(--pu)" />
      <Section title="⚇ Community Squads & Circles" sub="Rotating crews tackling jobs no one should face alone" items={squads} color="var(--g)" />
      <Section title="♡ Mutual Aid" sub="Neighbors helping neighbors — give what you can, get what you need" items={aid} color="var(--bl)" />

      <div className="card" style={{ background: "var(--blb)", borderColor: "rgba(74,144,217,0.25)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--bl)", marginBottom: 6 }}>🔒 protected by design</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>Every member is platform-verified with a BT Score. Cash & credit top-ups sit in escrow until both sides confirm. B2B & venture deals generate a smart contract. Community trust, enforced by tech.</div>
      </div>
    </div>
  );
}

// ── DETAIL ────────────────────────────────────────────────────────────────────
function Detail({ l, user, listings = [], onBack, onPropose, onBlock, onReport, onFund }) {
  const [myRate, setMyRate] = useState(user?.rate || 60);
  const [hrs, setHrs] = useState(3);
  const diff = Math.max(0, Math.round((l.rate - myRate) * hrs));

  // Derived safety verifications (honest — from existing structured fields).
  const safety = safetyOf(l);
  // Local market-rate comparison: what other providers in this category charge.
  const market = marketRate(l, listings);
  const taxMatch = !l.b2b || !user?.b2b || user?.taxBracket === l.taxBracket ||
    Math.abs(TAX_BRACKETS.indexOf(user?.taxBracket || "$0–$44k") - TAX_BRACKETS.indexOf(l.taxBracket || "$0–$44k")) <= 1;

  return (
    <div style={{ padding: "14px 14px 90px" }} className="fi">
      <button className="btn bg bsm" onClick={onBack} style={{ marginBottom: 14 }}>← back</button>
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <Av ini={l.ini} avc={l.avc} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800 }}>{cleanText(l.name)}</span>
              <TypeBadge t={l.type} />
              {l.elite && <span className="pill pa" title="Elite is invite-only">✦ Elite · invite-only</span>}
              {l.b2b && <span className="b2b-badge">{l.verifiedPro === false ? "Licensed Pro · pending" : "✓ Licensed Pro"}</span>}
              {l.verified && <span className="pill pg">✓ verified</span>}
              <CreatorBadge l={l} />
            </div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 3 }}>{l.cat} · {l.sub} · {l.loc}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap", alignItems: "center" }}>
              <Stars r={l.rating} /><Score score={l.score} /><span style={{ fontSize: 11, color: "var(--t3)" }}>{l.swaps} swaps · {l.rev} reviews</span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, marginBottom: 5 }}>{l.title}</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: l.wants?.length ? 10 : 0 }}>{l.desc}</div>
        {l.wants?.length > 0 && <div style={{ fontSize: 11, color: "var(--t3)" }}>open to trade for: <span style={{ color: "var(--t2)" }}>{l.wants.join(" · ")}</span></div>}
      </div>

      {l.media?.length > 0 && <MediaGallery media={l.media} />}

      <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
        <button className="btn bp" style={{ flex: 1 }} onClick={() => onPropose(l)}>propose a swap</button>
        <VideoMeetButton seed={"listing" + l.id} label="📹 video meet" small={false} />
      </div>
      {l.type === "venture" && <BackVenture listing={l} user={user} onBack={onFund} />}
      <ReportBlock l={l} user={user} onBlock={onBlock} onReport={onReport} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 10 }}>
        {[{ label: "value", val: l.rate === 0 ? "free" : `$${l.rate}${l.type === "service" ? "/hr" : ""}` }, { label: "type", val: TYPE_META[l.type].l }, { label: "top-up", val: "accepted" }].map(v => (
          <div key={v.label} style={{ background: "var(--s3)", borderRadius: "var(--rs)", padding: "10px 11px" }}>
            <div style={{ fontSize: 9, color: "var(--t3)", marginBottom: 3 }}>{v.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{v.val}</div>
          </div>
        ))}
      </div>

      {l.b2b && (
        <div style={{ background: taxMatch ? "rgba(239,93,71,0.08)" : "var(--rdb)", border: `1px solid ${taxMatch ? "rgba(239,93,71,0.25)" : "rgba(239,93,71,0.3)"}`, borderRadius: "var(--rs)", padding: "11px 13px", marginBottom: 10, fontSize: 12 }}>
          <div style={{ fontWeight: 700, color: taxMatch ? "var(--g)" : "var(--rd)", marginBottom: 4 }}>{taxMatch ? "✓ B2B bracket eligible" : "⚠ B2B bracket mismatch"}</div>
          <div style={{ color: "var(--t2)", lineHeight: 1.5 }}>{l.name.split(" ")[0]} is in bracket <strong>{l.taxBracket || "$44k–$95k"}</strong>. {taxMatch ? "You're within range for a protected B2B swap." : "B2B swaps are limited to within 1 bracket for mutual protection."}</div>
        </div>
      )}

      {creatorReach(l) >= 5000 && (
        <div className="card" style={{ marginBottom: 10, borderColor: "rgba(155,114,221,0.3)", background: "linear-gradient(180deg,rgba(155,114,221,0.08),transparent)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--pu)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>✦ creator & influencer swaps</div>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 9 }}>Audience is currency. Trade reach for what you need — no invoice required.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Shoutouts", "Promos & ads", "UGC video", "Event tickets", "Appearances", "Collab content"].map(c => (
              <span key={c} style={{ fontSize: 11, color: "var(--pu)", background: "rgba(155,114,221,0.12)", border: "1px solid rgba(155,114,221,0.3)", padding: "3px 9px", borderRadius: 100 }}>{c}</span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>verified platform links</div>
        {l.platforms.map(p => <PlatBadge key={p.id} p={p} />)}
      </div>

      {safety.length > 0 && (
        <div className="card" style={{ marginBottom: 10, borderColor: "rgba(46,196,140,0.25)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gr,#2EC48C)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>🔒 safety & trust</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {safety.map(s => (
              <span key={s} style={{ fontSize: 11, fontWeight: 600, color: "#2EC48C", background: "rgba(46,196,140,0.12)", border: "1px solid rgba(46,196,140,0.3)", padding: "3px 9px", borderRadius: 100 }}>✓ {s}</span>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 10, lineHeight: 1.5 }}>For in-person swaps: meet in a public place first, keep chat on BarterThat, and use escrow. You can request a women-only match for in-person sessions in your profile preferences.</div>
        </div>
      )}

      {market && (
        <div className="card" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>📊 market rate — {l.cat}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--am)" }}>${market.lo}–${market.hi}{market.unit}</span>
            <span style={{ fontSize: 11, color: "var(--t3)" }}>what {market.n} other {l.cat.toLowerCase()} providers near you charge · avg ${market.avg}{market.unit}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
            {l.name.split(" ")[0]}'s rate of <strong style={{ color: "var(--tx)" }}>${l.rate}{market.unit}</strong> is <strong style={{ color: l.rate <= market.avg ? "#2EC48C" : "var(--am)" }}>{market.pos} the local average</strong>. On BarterThat you pay it in skills, goods, or Barter Tokens — not cash.
          </div>
        </div>
      )}

      {(l.badges?.length > 0 || l.specialties?.length > 0) && (
        <div className="card" style={{ marginBottom: 10 }}>
          {l.badges?.length > 0 && <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>community ♥ self-identified</div>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: l.specialties?.length > 0 ? 12 : 0 }}>{l.badges.map(b => <OwnedBadge key={b} id={b} />)}</div>
          </>}
          {l.specialties?.length > 0 && <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>service specialties</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>{l.specialties.map(s => <SpecTag key={s} s={s} />)}</div>
          </>}
        </div>
      )}

      {l.b2b && (
        <div className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".06em" }}>licensed pro</span>
            {l.verifiedPro === false
              ? <span className="pill" style={{ background: "var(--amb)", color: "var(--am)" }}>⏳ verification pending</span>
              : <span className="pill pg">✓ verified licensed pro</span>}
          </div>
          {l.certs?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap" }}>{l.certs.map(c => <CertBadge key={c} cert={c} />)}</div>}
          {l.license?.number && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 8 }}>License: <strong style={{ color: "var(--tx)" }}>{l.license.number}</strong>{l.license.state ? ` · ${l.license.state}` : ""}</div>}
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>Tax bracket: <strong style={{ color: "var(--tx)" }}>{l.taxBracket}</strong></div>
          <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 10, lineHeight: 1.5, borderTop: "1px solid var(--bd)", paddingTop: 9 }}>{B2B_DISCLAIMER}</div>
        </div>
      )}

      {l.rate > 0 && <>
        <div style={{ background: "rgba(239,93,71,0.07)", border: "1px solid rgba(239,93,71,0.2)", borderRadius: "var(--rs)", padding: "12px 14px", marginBottom: 9 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g)", marginBottom: 5 }}>⇄ value match zone</div>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>Fair swap: any service or item valued <strong style={{ color: "var(--tx)" }}>${Math.round(l.rate * .9)}–${Math.round(l.rate * 1.1)}</strong>. Balance the rest with Barter Tokens.</div>
        </div>
        <div style={{ background: "var(--amb)", border: "1px solid rgba(232,177,74,0.25)", borderRadius: "var(--rs)", padding: "12px 14px", marginBottom: 9 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--am)", marginBottom: 9 }}>◎ top-up calculator</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 3 }}>your value</div><input type="number" value={myRate} min={10} step={5} onChange={e => setMyRate(+e.target.value)} className="ifield" style={{ width: 75, textAlign: "center", padding: "7px 8px" }} /></div>
            <div style={{ color: "var(--t3)" }}>×</div>
            <div><div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 3 }}>units/hrs</div><input type="number" value={hrs} min={1} max={20} onChange={e => setHrs(+e.target.value)} className="ifield" style={{ width: 60, textAlign: "center", padding: "7px 8px" }} /></div>
            <div style={{ color: "var(--t3)" }}>=</div>
            <div><div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 3 }}>you'd add</div><div style={{ fontSize: 19, fontWeight: 800, color: diff === 0 ? "var(--g)" : "var(--am)" }}>{diff === 0 ? "no gap!" : "$" + diff}</div></div>
          </div>
          {diff > 0 && <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 7 }}>pay with ⬡ Barter Tokens or cash · held in escrow · auto-released after both confirm</div>}
        </div>
      </>}

      <div style={{ background: "var(--blb)", border: "1px solid rgba(74,144,217,0.2)", borderRadius: "var(--rs)", padding: "11px 13px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--bl)", marginBottom: 4 }}>🔒 escrow protection</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>Top-ups held by BarterThat until both confirm delivery. 72-hr dispute window.{l.b2b || l.type === "venture" ? " This deal includes a smart contract." : ""}</div>
      </div>

      <button className="btn bp" style={{ width: "100%" }} disabled={l.b2b && !taxMatch} onClick={() => onPropose(l)}>
        {l.b2b && !taxMatch ? "bracket mismatch — cannot swap" : (l.type === "aid" ? "offer help to " : "propose swap to ") + l.name.split(" ")[0] + " →"}
      </button>
    </div>
  );
}

// ── PROPOSE MODAL ─────────────────────────────────────────────────────────────
function ProposeModal({ l, user, onClose, onSend }) {
  const [svc, setSvc] = useState(user?.title || "");
  const [myH, setMyH] = useState(2);
  const [thH, setThH] = useState(2);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const mv = Math.round((user?.rate || 75) * myH);
  const tv = Math.round(l.rate * thH);
  const diff = tv - mv;

  const send = () => { setSent(true); setTimeout(() => { onSend({ l, svc, myH, thH, msg }); onClose(); }, 1100); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="fu" style={{ width: "100%", maxWidth: 520, background: "var(--s1)", borderRadius: "var(--r) var(--r) 0 0", padding: "20px 18px 40px", maxHeight: "90vh", overflowY: "auto" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 38, color: "var(--g)", marginBottom: 10 }}>✓</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800, marginBottom: 5 }}>proposal sent!</div>
            <div style={{ fontSize: 13, color: "var(--t2)" }}>{l.name.split(" ")[0]} will receive it now.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800 }}>propose a swap</div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 20 }}>×</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: "var(--s3)", borderRadius: "var(--rs)", padding: 13 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 3 }}>you offer</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--g)" }}>${mv}</div>
                <div style={{ fontSize: 10, color: "var(--t2)" }}>{myH} × ${user?.rate || 75}</div>
              </div>
              <div style={{ fontSize: 18, color: "var(--t3)" }}>⇄</div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 3 }}>they offer</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--g)" }}>${tv}</div>
                <div style={{ fontSize: 10, color: "var(--t2)" }}>{thH} × ${l.rate}</div>
              </div>
            </div>
            {diff !== 0 && <div style={{ padding: "8px 12px", background: diff > 0 ? "var(--gl)" : "var(--amb)", borderRadius: "var(--rs)", marginBottom: 12, fontSize: 12, color: diff > 0 ? "#EF5D47" : "var(--am)" }}>
              {diff > 0 ? `${l.name.split(" ")[0]} adds a $${Math.abs(diff)} top-up to you` : `you add a $${Math.abs(diff)} top-up — pay with ⬡ credits or cash, held in escrow`}
            </div>}
            <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>your offer</label><input className="ifield" value={svc} onChange={e => setSvc(e.target.value)} placeholder="what will you provide?" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 10 }}>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>your units/hrs</label><input type="number" className="ifield" value={myH} min={1} max={20} onChange={e => setMyH(+e.target.value)} /></div>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>their units/hrs</label><input type="number" className="ifield" value={thH} min={1} max={20} onChange={e => setThH(+e.target.value)} /></div>
            </div>
            <div style={{ marginBottom: 18 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>message (optional)</label><textarea className="ifield" rows={3} value={msg} onChange={e => setMsg(e.target.value)} placeholder="introduce yourself..." style={{ resize: "none" }} /></div>
            {(l.b2b || l.type === "venture") && <div style={{ background: "var(--pub)", border: "1px solid rgba(155,114,221,0.3)", borderRadius: "var(--rs)", padding: "9px 12px", marginBottom: 14, fontSize: 11, color: "var(--pu)" }}>{l.type === "venture" ? "Venture deal" : "B2B swap"} — smart contract generated on acceptance</div>}
            <button className="btn bp" style={{ width: "100%" }} disabled={!svc.trim()} onClick={send}>send proposal →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── TRADES ────────────────────────────────────────────────────────────────────
// Live chat thread for one trade — realtime messages, translate, read-aloud,
// links, photos/videos, voice notes, and the secured video call.
function ChatThread({ t, user, onAccept, onComplete }) {
  const [msgs, setMsgs] = useState(t._real ? null : (t.msgs || []).map((m, i) => ({ id: "s" + i, from_uid: m.from === "me" ? user?.id : "them", data: { text: m.txt } })));
  const [text, setText] = useState("");
  const [lang, setLang] = useState(user?.lang || "English");
  const [autoTr, setAutoTr] = useState(false);
  const [tr, setTr] = useState({});          // messageId -> translated text
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef(null);
  const endRef = useRef(null);
  const meId = user?.id;

  useEffect(() => {
    if (!t._real) return;
    let off;
    (async () => {
      setMsgs(await db.loadMessages(t.id));
      off = db.subscribeMessages(t.id, m => setMsgs(prev => (prev || []).some(x => x.id === m.id) ? prev : [...(prev || []), m]));
    })();
    return () => { off && off(); };
  }, [t.id, t._real]);
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const push = async data => {
    if (t._real) { const row = await db.sendMessage(t.id, meId, data); if (row) setMsgs(prev => (prev || []).some(x => x.id === row.id) ? prev : [...(prev || []), row]); }
    else setMsgs(prev => [...(prev || []), { id: "l" + Date.now(), from_uid: meId, data }]);
  };
  const sendText = async () => { const v = text.trim(); if (!v) return; setText(""); await push({ text: v, lang }); };
  const attach = async file => {
    if (!file) return; setBusy(true);
    try { const m = await uploadToCloud(file); await push(m); } catch (e) {} setBusy(false);
  };
  const startVoice = async () => {
    if (recording) { recRef.current && recRef.current.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream); const chunks = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(tr => tr.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        setBusy(true);
        try { if (CLOUD_ON) { const m = await uploadToCloud(new File([blob], "voice.webm", { type: "audio/webm" })); await push({ ...m, kind: "audio" }); } else { const url = URL.createObjectURL(blob); await push({ kind: "audio", url }); } } catch (e) {}
        setBusy(false);
      };
      recRef.current = mr; mr.start(); setRecording(true);
      mr.onstart = () => {};
      // auto-stop safety after 60s
      setTimeout(() => { try { mr.state === "recording" && mr.stop(); } catch (e) {} }, 60000);
      const origStop = mr.stop.bind(mr); mr.stop = () => { setRecording(false); origStop(); };
    } catch (e) { setRecording(false); }
  };
  const doTranslate = async m => {
    if (tr[m.id]) { setTr(p => { const n = { ...p }; delete n[m.id]; return n; }); return; }
    const r = await translateText(m.data.text, lang); setTr(p => ({ ...p, [m.id]: r.translated }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 116px)" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bd)", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => onAccept._back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 17 }}>←</button>
        <Av ini={t.wi} avc={t.wc} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{cleanText(t.wu)}{t.b2b && <span className="b2b-badge" style={{ fontSize: 9 }}>B2B</span>}</div>
          <div style={{ fontSize: 10, color: "var(--t3)" }}>{t.ms} ⇄ {t.ts}</div>
        </div>
        {t.status !== "completed" && <VideoMeetButton seed={"trade" + t.id} label="📹" />}
        <span className={`pill ${t.status === "pending" ? "pa" : t.status === "escrow" ? "pb" : t.status === "completed" ? "pd" : "pg"}`}>{t.status}</span>
      </div>
      <div style={{ padding: "6px 14px", background: "var(--s2)", borderBottom: "1px solid var(--bd)", display: "flex", gap: 8, alignItems: "center", fontSize: 11 }}>
        <span style={{ color: "var(--t2)" }}>🌍</span>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: "var(--s3)", color: "var(--tx)", border: "1px solid var(--bd)", borderRadius: 8, padding: "3px 6px", fontSize: 11, maxWidth: 130 }}>
          {LANGUAGES.map(l => <option key={l.code} value={l.label}>{l.label}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--t2)", cursor: "pointer" }}>
          <input type="checkbox" checked={autoTr} onChange={e => setAutoTr(e.target.checked)} style={{ accentColor: "var(--g)" }} /> auto-translate
        </label>
        {t.topup > 0 && <span className={`pill ${t.tpb === "them" ? "pg" : "pa"}`} style={{ marginLeft: "auto" }}>{t.tpb === "them" ? "+" : "−"}${t.topup} escrow</span>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {msgs === null && <div style={{ textAlign: "center", color: "var(--t3)", fontSize: 12, padding: 20 }}>loading…</div>}
        {msgs && msgs.length === 0 && <div style={{ textAlign: "center", color: "var(--t3)", fontSize: 12, padding: 20 }}>Say hi 👋 — keep it on BarterThat so it stays safe & protected.</div>}
        {(msgs || []).map(m => {
          const mine = m.from_uid === meId;
          const d = m.data || {};
          const shown = autoTr && d.text && tr[m.id] ? tr[m.id] : d.text;
          if (autoTr && d.text && tr[m.id] === undefined) { /* lazy translate */ translateText(d.text, lang).then(r => setTr(p => ({ ...p, [m.id]: r.translated }))); }
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{ maxWidth: "78%", padding: "9px 12px", borderRadius: "var(--r)", background: mine ? "var(--g)" : "var(--s3)", color: mine ? "#fff" : "var(--tx)", fontSize: 12.5, lineHeight: 1.5, wordBreak: "break-word" }}>
                {d.kind === "image" && <img src={d.url} alt="" style={{ maxWidth: 200, borderRadius: 8, display: "block" }} />}
                {d.kind === "video" && <video src={d.url} controls playsInline style={{ maxWidth: 220, borderRadius: 8, display: "block", background: "#000" }} />}
                {d.kind === "audio" && <audio src={d.url} controls style={{ height: 34 }} />}
                {d.text && <span>{linkify(shown || d.text).map((p, i) => p.t === "link" ? <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: mine ? "#fff" : "var(--am)", textDecoration: "underline" }}>{p.v}</a> : <span key={i}>{p.v}</span>)}</span>}
                {d.text && <div style={{ display: "flex", gap: 10, marginTop: 5, opacity: .85 }}>
                  <button onClick={() => doTranslate(m)} title="Translate" style={{ background: "none", border: "none", cursor: "pointer", color: mine ? "#fff" : "var(--t2)", fontSize: 12 }}>🌍</button>
                  {TTS_OK && <button onClick={() => speak(tr[m.id] || d.text, langByLabel(lang).code)} title="Read aloud" style={{ background: "none", border: "none", cursor: "pointer", color: mine ? "#fff" : "var(--t2)", fontSize: 12 }}>🔊</button>}
                </div>}
                {!autoTr && tr[m.id] && <div style={{ fontSize: 11.5, marginTop: 5, opacity: .9, fontStyle: "italic" }}>{tr[m.id]}</div>}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {t.status === "pending" && t._incoming && (
        <div style={{ padding: "9px 14px", borderTop: "1px solid var(--bd)", display: "flex", gap: 7 }}>
          <button className="btn bp bsm" style={{ flex: 1 }} onClick={() => onAccept(t)}>accept swap ✓</button>
        </div>
      )}
      {t.status === "escrow" && (
        <div style={{ padding: "9px 14px", borderTop: "1px solid var(--bd)" }}>
          <div style={{ fontSize: 11, color: "var(--am)", marginBottom: 7 }}>🔒 {t.topup > 0 ? `$${t.topup} in escrow — ` : ""}confirm when the swap is done to close it & earn tokens.</div>
          <button className="btn bp bsm" style={{ width: "100%" }} onClick={() => onComplete(t)}>confirm completed ✓</button>
        </div>
      )}
      {t.status === "confirming" && (
        <div style={{ padding: "11px 14px", borderTop: "1px solid var(--bd)", textAlign: "center" }}>
          <div style={{ fontSize: 11.5, color: "var(--pu)", fontWeight: 700 }}>✓ You confirmed it's done</div>
          <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 3, lineHeight: 1.5 }}>Waiting for {String(t.wu || "them").split(" ")[0]} to confirm too — then tokens release and you both earn reputation. This two-sided confirm is what makes BarterThat ratings real.</div>
        </div>
      )}
      {t.status === "completed"
        ? <div style={{ padding: "12px 14px", borderTop: "1px solid var(--bd)", textAlign: "center", fontSize: 12, color: "var(--g)" }}>✓ swap completed · tokens awarded</div>
        : <div style={{ padding: "9px 12px", borderTop: "1px solid var(--bd)", display: "flex", gap: 6, alignItems: "center" }}>
            <label style={{ cursor: "pointer", fontSize: 19, color: "var(--t2)" }} title="Photo or video">📎<input type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={e => { attach(e.target.files[0]); e.target.value = ""; }} /></label>
            <button onClick={startVoice} title="Voice note" style={{ background: recording ? "var(--g)" : "none", border: "none", cursor: "pointer", fontSize: 18, color: recording ? "#fff" : "var(--t2)", borderRadius: 8, padding: "0 4px" }}>{recording ? "● stop" : "🎙️"}</button>
            <input className="ifield" style={{ flex: 1 }} value={text} onChange={e => setText(e.target.value)} placeholder={busy ? "sending…" : "message…"} onKeyDown={e => { if (e.key === "Enter") sendText(); }} />
            <button className="btn bp bsm" disabled={!text.trim() || busy} onClick={sendText}>send</button>
          </div>}
    </div>
  );
}

function Trades({ trades, user, onAccept, onComplete }) {
  const [active, setActive] = useState(null);

  if (active != null) {
    const t = trades.find(x => x.id === active);
    if (!t) { setActive(null); return null; }
    const back = () => setActive(null);
    const acceptFn = tr => onAccept(tr); acceptFn._back = back;
    return <ChatThread t={t} user={user} onAccept={acceptFn} onComplete={onComplete} />;
  }

  return (
    <div style={{ padding: "14px 14px 90px" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 14 }}>my trades</div>
      {trades.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--t3)" }}><div style={{ fontSize: 28, marginBottom: 10 }}>⇄</div>no trades yet — go propose a swap!</div>}
      {trades.map(t => (
        <div key={t.id} className="card" style={{ marginBottom: 9, cursor: "pointer", borderLeft: t.unread ? "3px solid var(--g)" : "1px solid var(--bd)" }} onClick={() => setActive(t.id)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Av ini={t.wi} avc={t.wc} size={34} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>{t.wu}{t.unread && <div className="ndot" />}{t.b2b && <span className="b2b-badge" style={{ fontSize: 9 }}>B2B</span>}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{t.plat}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span className={`pill ${t.status === "pending" ? "pa" : t.status === "escrow" ? "pb" : t.status === "completed" ? "pd" : t.status === "confirming" ? "pp" : "pg"}`}>{t.status === "confirming" ? "confirming ✓" : t.status}</span>
              <span style={{ fontSize: 10, color: "var(--t3)" }}>{t.time}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
            <span style={{ background: "var(--s3)", padding: "2px 8px", borderRadius: "var(--rp)", color: "var(--t2)" }}>{t.ms}</span>
            <span style={{ color: "var(--t3)" }}>⇄</span>
            <span style={{ background: "var(--s3)", padding: "2px 8px", borderRadius: "var(--rp)", color: "var(--t2)" }}>{t.ts}</span>
          </div>
          {t.topup > 0 && <div style={{ marginTop: 7 }}><span className={`pill ${t.tpb === "them" ? "pg" : "pa"}`}>{t.tpb === "them" ? `+$${t.topup} from them` : `$${t.topup} you pay`} · escrow</span></div>}
        </div>
      ))}
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function Profile({ user, listings, trades, onNav, onLogout, onReset, onPromote, onRestore }) {
  if (!user) return <div style={{ padding: 24, textAlign: "center", color: "var(--t3)" }}>sign in to view your profile</div>;
  const mine = listings.find(l => l.uid === user.id);
  const done = trades.filter(t => t.status === "completed").length;
  return (
    <div style={{ padding: "14px 14px 90px" }}>
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Av ini={user.ini} avc={user.avc} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{user.cat || "Community member"} · {user.loc}</div>
            {user.b2b && <div style={{ marginTop: 6 }}><span className="b2b-badge">B2B · {user.taxBracket}</span></div>}
            <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
              <Score score={user.score || 72} /><span className="pill pg">✓ verified</span><span className="pill pd">{done} swaps</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 10, background: "radial-gradient(circle at 90% 0%, rgba(232,177,74,0.12), var(--s2) 60%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 2 }}>Barter Tokens balance</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 800, color: "var(--am)" }}>⬡ {user.credits ?? 0}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="btn bp bsm" onClick={() => onNav("earn")}>⬡ get free tokens</button>
            <button className="btn bg bsm" onClick={() => onNav("browse")}>spend →</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 8, lineHeight: 1.5 }}>Tokens are like store credit — use them to even out any trade. Earn them free for signing up, daily check-ins, referrals and more.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 10 }}>
        {[{ n: `$${user.rate || 0}`, l: "your value" }, { n: done, l: "swaps done" }, { n: user.platforms?.length || 0, l: "platforms" }].map(s => (
          <div key={s.l} style={{ background: "var(--s3)", borderRadius: "var(--rs)", padding: "11px 9px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800, color: "var(--g)" }}>{s.n}</div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {user.wants?.length > 0 && <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>what I'm looking for</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{user.wants.map(w => <span key={w} className="pill pd">{w}</span>)}</div>
        <button className="btn bpu bsm" style={{ marginTop: 11 }} onClick={() => onNav("match")}>◆ find my matches</button>
      </div>}

      {mine && <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>my listing</div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{mine.title}</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5, marginBottom: 10 }}>{mine.desc}</div>
        <span style={{ color: "var(--g)", fontWeight: 700, fontFamily: "var(--fd)" }}>${mine.rate}{mine.type === "service" ? "/hr" : ""} · {mine.loc}</span>
        {!IS_NATIVE && <button className="btn bpu bsm" style={{ width: "100%", marginTop: 11 }} onClick={() => onPromote && onPromote()}>🚀 Promote this listing — featured for 7 days ($9)</button>}
      </div>}

      {IS_NATIVE && <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>BarterThat+</div>
        <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, marginBottom: 10 }}>{user.plus ? "Your BarterThat+ subscription is active — thank you for supporting BarterThat!" : "Go BarterThat+ for priority matching, unlimited proposals, and 30 Barter Tokens every month."}</div>
        <button className="btn bpu bsm" style={{ width: "100%" }} onClick={() => onRestore && onRestore()}>↻ Restore purchases</button>
      </div>}

      {user.platforms?.length > 0 && <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>verified platforms</div>
        {user.platforms.map(p => <PlatBadge key={p.id} p={p} />)}
      </div>}

      {user.b2b && user.certs?.length > 0 && <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>business credentials</div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>{user.certs.map(c => <CertBadge key={c} cert={c} />)}</div>
        <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 9 }}>Tax bracket: <strong style={{ color: "var(--tx)" }}>{user.taxBracket}</strong></div>
      </div>}

      <div className="card" style={{ marginBottom: 10, cursor: "pointer", background: "radial-gradient(circle at 90% 0%, rgba(155,114,221,0.14), var(--s2) 60%)", borderColor: "rgba(155,114,221,0.3)" }} onClick={() => onNav("pitch")}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 22 }}>◆</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pu)" }}>Investor opportunity</div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>See the BarterThat pitch deck & request more info →</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn bg" style={{ flex: 1 }} onClick={onLogout}>log out</button>
        <button className="btn bg" style={{ flex: 1, color: "var(--rd)" }} onClick={onReset}>reset demo data</button>
      </div>
      <div style={{ fontSize: 10, color: "var(--t3)", textAlign: "center", marginTop: 8 }}>reset clears your account, listings & trades back to the original sample data</div>
    </div>
  );
}

// ── EARN TOKENS ────────────────────────────────────────────────────────────
// Easy ways to stock up on Barter Tokens before your first swap, so new users
// can start spending right away. Claims are tracked on the user (localStorage).
function EarnTokens({ user, listings, onEarn, onNav, onSubscribe }) {
  const claims = user.claims || {};
  const today = new Date().toISOString().slice(0, 10);
  const [adBusy, setAdBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [survey, setSurvey] = useState({ open: false, useful: "", want: "" });

  const profileComplete = !!(user.cat && user.loc && (user.rate || user.offer || user.title));
  const hasListing = (listings || []).some(l => l.uid === user.id);
  const adsToday = claims.adsDate === today ? (claims.adsCount || 0) : 0;
  const dailyDone = claims.daily === today;
  const code = "BT-" + String(user.name || "FRIEND").split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6);

  const setClaims = patch => ({ claims: { ...claims, ...patch } });

  const watchAd = async () => {
    if (adsToday >= 5 || adBusy) return;
    setAdBusy(true);
    let earned;
    if (IS_NATIVE) {
      earned = await showRewardedAd();            // real AdMob rewarded ad
    } else {
      await new Promise(r => setTimeout(r, 1600)); // web preview — no ad network on web
      earned = true;
    }
    setAdBusy(false);
    if (earned) onEarn(5, setClaims({ adsDate: today, adsCount: adsToday + 1 }));
  };
  const copyCode = () => {
    try { navigator.clipboard?.writeText(`Join me on BarterThat — trade skills & goods, no cash. Use my code ${code}: https://barterthat.vercel.app`); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1800);
    if (!claims.shared) onEarn(15, setClaims({ shared: true }));
  };
  const submitSurvey = () => {
    if (!survey.useful) return;
    try { const f = JSON.parse(localStorage.getItem("bt_feedback") || "[]"); f.push({ ...survey, at: today }); localStorage.setItem("bt_feedback", JSON.stringify(f)); } catch (e) {}
    setSurvey({ open: false, useful: "", want: "" });
    onEarn(20, setClaims({ survey: true }));
  };

  const Row = ({ icon, title, sub, reward, done, doneLabel, cta, onClick, disabled, color = "var(--am)" }) => (
    <div className="card" style={{ marginBottom: 9, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 22, width: 30, textAlign: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{title} <span style={{ color, fontFamily: "var(--fd)" }}>+{reward}</span></div>
        <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, lineHeight: 1.45 }}>{sub}</div>
      </div>
      {done
        ? <span style={{ fontSize: 11, fontWeight: 700, color: "var(--g)", flexShrink: 0 }}>✓ {doneLabel || "done"}</span>
        : <button className="btn bp bsm" style={{ flexShrink: 0, opacity: disabled ? .5 : 1 }} disabled={disabled} onClick={onClick}>{cta}</button>}
    </div>
  );

  return (
    <div style={{ padding: "14px 14px 90px" }}>
      <button className="btn bg bsm" onClick={() => onNav("profile")} style={{ marginBottom: 12 }}>← back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span className="pill pa">⬡ Earn</span>
        <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800 }}>Get free Barter Tokens</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 16, lineHeight: 1.6 }}>Stock up before your first swap — spend tokens on any listing to balance a deal. Your balance: <strong style={{ color: "var(--am)" }}>⬡ {user.credits ?? 0}</strong></div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", margin: "4px 0 9px" }}>start here</div>
      <Row icon="🎁" title="Sign up & complete profile" reward={50} sub={profileComplete ? "Your profile looks complete — claim your welcome tokens." : "Add your category, location & what you offer, then claim."} done={!!claims.signup} doneLabel="claimed" cta="claim" disabled={!profileComplete} onClick={() => onEarn(50, setClaims({ signup: true }))} />
      <Row icon="✅" title="Confirm your info is accurate" reward={25} sub="Pinky-promise your details are real. Accurate profiles get more trusted swaps." done={!!claims.accurate} doneLabel="confirmed" cta="confirm" onClick={() => { if (window.confirm("Confirm your profile info is accurate and truthful?")) onEarn(25, setClaims({ accurate: true })); }} />
      <Row icon="🔗" title="Add a verified platform link" reward={15} sub="Link a StyleSeat, Etsy, LinkedIn, etc. to prove your work." done={!!claims.platform} doneLabel="added" cta={user.platforms?.length ? "claim" : "add"} onClick={() => user.platforms?.length ? onEarn(15, setClaims({ platform: true })) : onNav("profile")} />

      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 0 9px" }}>every day</div>
      <Row icon="📅" title="Daily check-in" reward={10} sub="Open the app and check in once a day. Comes back tomorrow." done={dailyDone} doneLabel="today" cta="check in" onClick={() => onEarn(10, setClaims({ daily: today }))} />
      <Row icon="▶" title={adBusy ? "Watching ad…" : "Watch a quick ad"} reward={5} sub={`Supports the platform. Up to 5/day — ${5 - adsToday} left today.`} done={adsToday >= 5} doneLabel="maxed today" cta={adBusy ? "…" : "watch"} disabled={adBusy} onClick={watchAd} />

      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 0 9px" }}>bigger rewards</div>
      <div className="card" style={{ marginBottom: 9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 22, width: 30, textAlign: "center" }}>👥</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Refer friends <span style={{ color: "var(--am)", fontFamily: "var(--fd)" }}>+75 each</span></div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, lineHeight: 1.45 }}>They get 50 to start, you get 75 when they join. +15 the first time you share.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
          <div style={{ flex: 1, background: "var(--s3)", borderRadius: "var(--rs)", padding: "9px 12px", fontFamily: "var(--fd)", fontWeight: 800, letterSpacing: ".05em", color: "var(--am)" }}>{code}</div>
          <button className="btn bp bsm" onClick={copyCode}>{copied ? "✓ copied" : "share & copy"}</button>
        </div>
      </div>
      <Row icon="💬" title="Take a 2-min feedback survey" reward={20} sub="Tell us what to build next. One-time bonus." done={!!claims.survey} doneLabel="thanks!" cta="start" onClick={() => setSurvey(s => ({ ...s, open: true }))} />
      {survey.open && !claims.survey && (
        <div className="card" style={{ marginBottom: 9, borderColor: "rgba(232,177,74,0.3)" }}>
          <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>How useful is BarterThat so far?</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {["Love it", "It's ok", "Confusing", "Not yet"].map(o => <button key={o} className={`chip ${survey.useful === o ? "on" : ""}`} onClick={() => setSurvey(s => ({ ...s, useful: o }))}>{survey.useful === o ? "✓ " : ""}{o}</button>)}
          </div>
          <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>What should we add or fix?</label>
          <textarea className="ifield" rows={2} value={survey.want} onChange={e => setSurvey(s => ({ ...s, want: e.target.value }))} placeholder="optional — your idea" style={{ resize: "none", marginBottom: 10 }} />
          <button className="btn bp bsm" disabled={!survey.useful} onClick={submitSurvey}>submit & earn 20</button>
        </div>
      )}
      <Row icon="✦" title="Post your first listing" reward={30} sub="List a service, item or rental. Auto-credited when it goes live." done={hasListing} doneLabel="posted" cta="post" onClick={() => onNav("post")} />
      <Row icon="⭐" title="Subscribe to BarterThat+" reward={30} sub="$12/mo: priority matching, unlimited proposals + 30 tokens every month." done={!!claims.sub} doneLabel="active" cta="subscribe" color="var(--pu)" onClick={() => onSubscribe && onSubscribe()} />

      <div style={{ fontSize: 10.5, color: "var(--t3)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>More ways coming: community challenges, leaving reviews, completing your first 3 swaps, and seasonal bonus drops.</div>
    </div>
  );
}

// ── SAVED ─────────────────────────────────────────────────────────────────────
function Saved({ listings, user, onView }) {
  const sv = listings.filter(l => user && l.saved?.includes(user.id));
  return (
    <div style={{ padding: "14px 14px 90px" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 14 }}>saved</div>
      {sv.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--t3)" }}><div style={{ fontSize: 26, marginBottom: 9 }}>♡</div>save listings by tapping ♡</div> :
        sv.map(l => (
          <div key={l.id} className="card" style={{ marginBottom: 9, cursor: "pointer" }} onClick={() => onView(l)}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <Av ini={l.ini} avc={l.avc} size={34} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div><Stars r={l.rating} /></div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, color: "var(--g)" }}>{l.rate === 0 ? "Free" : "$" + l.rate}</div>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{l.title}</div>
            <div style={{ display: "flex", gap: 5 }}><TypeBadge t={l.type} /><span className="pill pd">{l.cat}</span></div>
          </div>
        ))
      }
    </div>
  );
}

// ── POST ──────────────────────────────────────────────────────────────────────
function Post({ user, onPost }) {
  const [form, setForm] = useState({ type: "service", cat: user?.cat || "", sub: "", title: user?.title || "", desc: user?.desc || "", rate: user?.rate || 75, acceptTopup: true, media: [] });
  const [done, setDone] = useState(false);
  const selCat = CATS.find(c => c.label === form.cat);
  const go = () => { setDone(true); setTimeout(() => onPost(form), 1200); };

  if (done) return <div style={{ minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}><div><div style={{ fontSize: 40, color: "var(--g)", marginBottom: 12 }}>✓</div><div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 7 }}>listing live!</div><div style={{ fontSize: 13, color: "var(--t2)" }}>AI is already matching you</div></div></div>;

  return (
    <div style={{ padding: "14px 14px 100px" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>post anything</div>
      <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 18 }}>a service, an item, a rental, a venture — if it has value, it's barterable</div>
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 6 }}>what kind of listing?</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.keys(TYPE_META).filter(k => k !== "squad").map(k => (
            <button key={k} className={`chip ${form.type === k ? "on" : ""}`} onClick={() => setForm(f => ({ ...f, type: k }))}>{form.type === k ? "✓ " : ""}{TYPE_META[k].l}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>category</label>
        <select className="ifield" value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value, sub: "" }))}>
          <option value="">select category</option>
          {CATS.map(c => <option key={c.id} value={c.label}>{c.icon} {c.label}</option>)}
        </select>
      </div>
      {selCat && <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>specific</label>
        <select className="ifield" value={form.sub} onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}>
          <option value="">select</option>
          {selCat.subs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>}
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>title{SPEECH_OK ? " — or say it 🎤" : ""}</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="ifield" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="describe in one line" style={{ flex: 1 }} />
          <VoiceButton onText={t => setForm(f => ({ ...f, title: t }))} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>details{SPEECH_OK ? " — type or just talk" : ""}</label>
        <textarea className="ifield" rows={4} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="what's included? condition? what would you take in trade?" style={{ resize: "none", marginBottom: 8 }} />
        <VoiceButton label="Speak the details" onText={t => setForm(f => ({ ...f, desc: (f.desc ? f.desc + " " : "") + t }))} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>value — <strong style={{ color: "var(--g)" }}>{form.rate === 0 ? "free / community swap" : "$" + form.rate + (form.type === "service" ? "/hr" : "")}</strong></label>
        <input type="range" min={0} max={250} step={5} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: +e.target.value }))} style={{ width: "100%", accentColor: "var(--g)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 3 }}><span>$0 (community / aid)</span><span>$250</span></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 7 }}>photos & video <span style={{ color: "var(--t3)" }}>— optional, but they sell</span></label>
        <MediaUpload media={form.media} onChange={m => setForm(f => ({ ...f, media: m }))} />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: "var(--t2)", cursor: "pointer", marginBottom: 20, padding: "10px 13px", background: "var(--s3)", borderRadius: "var(--rs)" }}>
        <input type="checkbox" checked={form.acceptTopup} onChange={e => setForm(f => ({ ...f, acceptTopup: e.target.checked }))} style={{ accentColor: "var(--g)", width: 15, height: 15 }} />
        accept Barter Tokens / cash top-up to balance value
      </label>
      <button className="btn bp" style={{ width: "100%" }} disabled={!form.title.trim() || !form.cat} onClick={go}>publish listing ✦</button>
    </div>
  );
}

// ── COACH MARKS (first-run, 3 dismissible tips, plain language) ──────────────
function CoachMarks({ onDone }) {
  const [i, setI] = useState(0);
  const tips = [
    { ic: "👀", t: "Find stuff to trade", b: "Tap “Explore” — pick a popular chip or just search what you need, like “haircut” or “moving help.”" },
    { ic: "◆", t: "Let us match you", b: "Tap “Find swaps” and hit “Find me anything good.” We'll line up people who want what you've got." },
    { ic: "🤝", t: "Make the trade", b: "See someone good? Tap “Propose swap.” No cash needed — even out the value with free tokens." },
  ];
  const tip = tips[i];
  const last = i === tips.length - 1;
  return (
    <div onClick={onDone} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(8,12,20,0.82)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fu" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: 18, padding: "26px 22px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>{tip.ic}</div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{tip.t}</div>
        <div style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.65, marginBottom: 20 }}>{tip.b}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 18 }}>
          {tips.map((_, n) => <div key={n} style={{ width: n === i ? 20 : 7, height: 7, borderRadius: 100, background: n === i ? "var(--g)" : "var(--s4)", transition: "all .2s" }} />)}
        </div>
        <button className="btn bp" style={{ width: "100%" }} onClick={() => last ? onDone() : setI(i + 1)}>{last ? "Got it — let's go" : "Next"}</button>
        {!last && <button onClick={onDone} style={{ marginTop: 10, background: "none", border: "none", color: "var(--t3)", fontSize: 12, cursor: "pointer" }}>skip tips</button>}
      </div>
    </div>
  );
}

// ── HOW-IT-WORKS VIDEO ───────────────────────────────────────────────────────
// Plays the bundled 60-sec explainer. If REACT_APP_INTRO_VIDEO (a YouTube URL)
// is set, it embeds that instead — so you can swap in a real promo video later.
function VideoModal({ onDone }) {
  const yt = process.env.REACT_APP_INTRO_VIDEO;
  const embed = yt ? yt.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/") : null;
  return (
    <div onClick={onDone} style={{ position: "fixed", inset: 0, zIndex: 320, background: "rgba(8,12,20,0.9)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, color: "var(--tx)", marginBottom: 10, textAlign: "center" }}>How BarterThat works — 60 seconds</div>
        {embed
          ? <div style={{ position: "relative", paddingBottom: "177%", height: 0, borderRadius: 14, overflow: "hidden" }}><iframe title="How it works" src={embed} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen /></div>
          : <video src="/explainer.mp4" controls autoPlay playsInline style={{ width: "100%", borderRadius: 14, background: "#000", display: "block" }} />}
        <button className="btn bp" style={{ width: "100%", marginTop: 12 }} onClick={onDone}>got it — let's start</button>
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({ scr, onNav }) {
  const items = [{ id: "browse", ic: "◫", l: "explore" }, { id: "match", ic: "◆", l: "find swaps" }, { id: "post", ic: "✦", l: "post", prime: true }, { id: "community", ic: "⚇", l: "community" }, { id: "profile", ic: "◎", l: "profile" }];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--bd)", display: "flex", alignItems: "center", padding: "8px 0 18px", zIndex: 50 }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: scr === item.id ? "var(--g)" : "var(--t3)", transition: "color .15s" }}>
          {item.prime ? (
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--g)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", marginTop: -10 }}>{item.ic}</div>
          ) : (
            <span style={{ fontSize: 19 }}>{item.ic}</span>
          )}
          <span style={{ fontSize: 9, letterSpacing: ".04em" }}>{item.l}</span>
        </button>
      ))}
    </div>
  );
}

// Map a Supabase trade row to the shape the Trades UI expects, from "my" view.
function mapTrade(row, meId) {
  const d = row.data || {};
  const iAmProposer = meId === d.proposerId;
  const other = iAmProposer
    ? { name: d.ownerName, ini: d.ownerIni, avc: d.ownerAvc }
    : { name: d.proposerName, ini: d.proposerIni, avc: d.proposerAvc };
  return {
    id: row.id, _real: true, _row: row,
    wu: other.name, wi: other.ini, wc: other.avc,
    ms: d.myOffer, ts: d.theirOffer, topup: d.topup || 0, tpb: d.tpb,
    status: row.status, b2b: d.b2b, plat: d.plat || "",
    time: "recent", unread: false, _incoming: !iAmProposer, msgs: [],
  };
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [nav, setNav] = useState("browse");
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState(LISTINGS);
  const [trades, setTrades] = useState(() => storage.get("bt_trades") || TRADES_SEED);
  const [viewing, setViewing] = useState(null);
  const [proposeTo, setProposeTo] = useState(null);
  const [toast, setToast] = useState(null);
  const [coach, setCoach] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const bootedRef = useRef(false);

  // Build (or load) the user's profile + first listing once they have a verified session.
  const bootstrap = async authUser => {
    const uid = authUser.id;
    let prof = await db.loadProfile(uid);
    if (!prof) {
      const m = await db.getMeta();
      prof = { ...(m.profile || { name: (authUser.email || "member").split("@")[0], credits: 50, wants: [] }), id: uid, email: authUser.email };
      await db.saveProfile(uid, prof);
      if (m.listing) { const sv = await db.addListing(uid, { ...m.listing, uid }); if (sv) setListings(prev => [sv, ...prev]); }
    }
    setUser(prof); storage.set("bt_user", prof);
    // Native IAP: link this user to RevenueCat and reflect any active BarterThat+ entitlement.
    if (iap.IS_NATIVE) {
      iap.loginIAP(uid).then(active => {
        if (active) { const up = { ...prof, plus: true }; setUser(up); storage.set("bt_user", up); db.saveProfile(uid, up); }
      });
    }
    const myTrades = await db.loadTrades(uid);
    setTrades((myTrades || []).map(r => mapTrade(r, uid)));
    setScreen("main"); setNav("browse"); setPendingEmail("");
  };

  useEffect(() => {
    initAdMob(); // no-op on web
    iap.initIAP(); // native In-App Purchase (RevenueCat); no-op on web
    (async () => {
      // Shared marketplace: everyone's real listings, prepended to demo content.
      const real = await db.loadListings();
      if (real && real.length) setListings([...real, ...LISTINGS]);
    })();
    // Single source of truth for sessions: fires on load (existing session) and
    // right after the user clicks their email-verification link and returns.
    const off = db.onAuth(async session => {
      if (session && session.user && !bootedRef.current) { bootedRef.current = true; await bootstrap(session.user); }
    });
    return off;
  }, []);

  // Show the 3 quick tips the first time someone reaches the marketplace.
  useEffect(() => {
    if (screen === "main" && !storage.get("bt_coach")) setCoach(true);
  }, [screen]);
  const dismissCoach = () => { storage.set("bt_coach", 1); setCoach(false); };

  // Persist marketplace state so listings & trades survive a refresh
  useEffect(() => { storage.set("bt_listings", listings); }, [listings]);
  useEffect(() => { storage.set("bt_trades", trades); }, [trades]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const persist = (u) => { setUser(u); storage.set("bt_user", u); if (u && u.id) db.saveProfile(u.id, u); };

  const handleSignup = async form => {
    const elite = isInvite(form.invite);
    const license = form.b2b ? { number: form.licenseNo, state: form.licenseState } : null;
    const verifiedPro = form.b2b ? false : undefined;
    const ini = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const avc = ac(Math.floor(Math.random() * 8));
    // Stashed in user_metadata; turned into real rows once their email is verified.
    const profile = {
      name: form.name, email: form.email, loc: form.loc || "Remote", ini, avc,
      cat: form.cat, sub: form.sub, title: form.title, desc: form.desc, wants: form.wants || [],
      badges: form.badges || [], specialties: form.specialties || [],
      rate: form.rate, platforms: form.platforms, b2b: form.b2b, elite, license, verifiedPro,
      certs: form.certs, taxBracket: form.taxBracket, score: 72, swaps: 0, rating: 0, credits: 50,
    };
    const catMeta = CATS.find(c => c.label === form.cat);
    const listing = form.title ? { type: catMeta?.t || "service", name: form.name, ini, avc, cat: form.cat || "Creative Arts & Design", sub: form.sub, title: form.title, desc: form.desc, rate: form.rate, loc: form.loc || "Remote", remote: true, verified: form.platforms.length >= 1, elite, b2b: form.b2b, license, verifiedPro, score: 72, swaps: 0, rating: 0, rev: 0, saved: [], wants: form.wants || [], badges: form.badges || [], specialties: form.specialties || [], platforms: form.platforms, certs: form.certs, taxBracket: form.taxBracket } : null;

    const res = await db.signUp(form.email, form.password, { profile, listing });
    if (res.error) {
      flash(/already|registered|exists/i.test(res.error) ? "That email already has an account — tap “Log in” instead." : res.error);
      setScreen("login");
      return;
    }
    // If email confirmation is on, there's no session yet → ask them to verify.
    // (When it's off, onAuth fires immediately and bootstraps them straight in.)
    if (!res.session) { setPendingEmail(form.email); setScreen("verify"); }
  };

  const handleLogin = async (email, password) => {
    const res = await db.signIn(email, password);
    if (res.error) { flash(/confirm/i.test(res.error) ? "Please verify your email first — check your inbox." : "Couldn't log in — check your email & password."); return false; }
    return true; // onAuth listener bootstraps the profile + opens the app
  };

  const handlePost = async form => {
    if (!user) { setScreen("signup"); return; }
    const catMeta = CATS.find(c => c.label === form.cat);
    const nl = {
      uid: user.id, type: form.type || catMeta?.t || "service",
      name: user.name, ini: user.ini, avc: user.avc, cat: form.cat || "Creative Arts & Design",
      sub: form.sub, title: form.title, desc: form.desc || form.title, rate: form.rate,
      loc: user.loc || "Remote", remote: true, verified: true, elite: !!user.elite, b2b: user.b2b,
      license: user.license, verifiedPro: user.verifiedPro,
      score: user.score || 72, swaps: 0, rating: 0, rev: 0, saved: [], wants: user.wants || [],
      badges: user.badges || [], specialties: user.specialties || [], platforms: user.platforms || [],
      certs: user.certs || [], taxBracket: user.taxBracket, media: form.media || [],
    };
    const saved = await db.addListing(user.id, nl);
    setListings(p => [saved || { ...nl, id: Date.now() }, ...p]);
    setNav("profile");
    flash("✦ listing posted — everyone can see it now");
  };

  const handleSave = id => {
    if (!user) { setScreen("signup"); return; }
    setListings(p => p.map(l => {
      if (l.id !== id) return l;
      const has = l.saved?.includes(user.id);
      return { ...l, saved: has ? l.saved.filter(x => x !== user.id) : [...(l.saved || []), user.id] };
    }));
  };

  const handlePropose = l => { if (!user) { setScreen("signup"); return; } setProposeTo(l); };

  const handleSend = async ({ l, svc, myH, thH, msg }) => {
    const mv = (user.rate || 75) * myH, tv = l.rate * thH, diff = tv - mv;
    const data = {
      proposerId: user.id, proposerName: user.name, proposerIni: user.ini, proposerAvc: user.avc,
      ownerId: l.uid, ownerName: l.name, ownerIni: l.ini, ownerAvc: l.avc,
      myOffer: `${svc} (${myH}h)`, theirOffer: `${l.title} (${thH}h)`,
      topup: Math.abs(diff), tpb: diff > 0 ? "them" : diff < 0 ? "me" : null,
      b2b: l.b2b, listingId: l.id, plat: l.platforms?.[0]?.l || "",
    };
    setProposeTo(null);
    if (db.isUuid(l.uid)) {
      const row = await db.createTrade(user.id, l.uid, data);
      if (row) {
        setTrades(p => [mapTrade(row, user.id), ...p]);
        if (msg) await db.sendMessage(row.id, user.id, { text: msg, lang: user.lang || "English" });
        setNav("trades"); setViewing(null); flash("✦ swap proposed — your chat is live");
        return;
      }
    }
    // Demo/sample listing (no real member behind it) → local-only trade
    const local = { id: "l" + Date.now(), _real: false, wu: l.name, wi: l.ini, wc: l.avc, ms: data.myOffer, ts: data.theirOffer, topup: data.topup, tpb: data.tpb, status: "pending", b2b: l.b2b, plat: data.plat, time: "just now", unread: false, _incoming: false, msgs: msg ? [{ from: "me", txt: msg, time: "now" }] : [] };
    setTrades(p => [local, ...p]);
    setNav("trades"); setViewing(null);
    flash(db.isUuid(l.uid) ? "Saved locally — couldn't reach the server" : "That's a sample listing — propose to a real member for a live chat");
  };

  const handleAccept = async t => {
    if (t._real) await db.updateTrade(t.id, { status: "escrow" });
    setTrades(p => p.map(x => x.id === t.id ? { ...x, status: "escrow" } : x));
  };

  // Two-sided completion: a trade only completes (and pays out + builds reputation)
  // when BOTH people confirm it happened — that's what makes the rating real, not
  // self-claimed. Demo trades simulate the other side confirming a moment later.
  const finalizeTrade = async t => {
    if (t._real) await db.updateTrade(t.id, { status: "completed", done: { me: true, them: true } });
    setTrades(p => p.map(x => x.id === t.id ? { ...x, status: "completed", done: { me: true, them: true } } : x));
    const earned = Math.max(10, Math.round((t.topup || 50) / 5));
    if (user) persist({
      ...user,
      credits: (user.credits || 0) + earned,
      swaps: (user.swaps || 0) + 1,
      score: Math.min(100, (user.score || 72) + 1),   // reputation earned by completed trades
    });
    flash(`✓ Trade complete — ⬡ +${earned} tokens · reputation +1`);
  };
  const handleComplete = async t => {
    if (t.status === "completed") return;
    // If the other person already confirmed, this click closes it out.
    if (t.done && t.done.them) { await finalizeTrade(t); return; }
    const patch = { status: "confirming", done: { ...(t.done || {}), me: true } };
    if (t._real) await db.updateTrade(t.id, patch);
    setTrades(p => p.map(x => x.id === t.id ? { ...x, ...patch } : x));
    flash(`✓ You confirmed — completes once ${String(t.wu || "they").split(" ")[0]} confirms too.`);
    if (!t._real) setTimeout(() => finalizeTrade(t), 2200); // demo: simulate the other side
  };

  const handleEarn = (amount, patch = {}) => {
    if (!user) return;
    persist({ ...user, credits: (user.credits || 0) + amount, ...patch });
    flash(`⬡ +${amount} tokens added`);
  };

  // BarterThat+ subscription / promoted listing.
  // Native iOS & Android MUST use In-App Purchase (RevenueCat) per store policy;
  // the web app keeps using Stripe Checkout (see api/checkout.js).
  const startCheckout = async kind => {
    if (iap.IS_NATIVE) {
      if (kind !== "plus") return; // one-time "promote" is web-only for now
      try {
        const active = await iap.purchasePlus();
        if (active) {
          persist({ ...user, plus: true, credits: (user.credits || 0) + 30 });
          flash("BarterThat+ is active — welcome! ⬡ +30 tokens");
        } else {
          flash("Purchase didn't complete — try again.");
        }
      } catch (e) {
        const m = String(e?.message || e);
        if (m === "purchase_cancelled") return;
        flash(m === "iap_unavailable" ? "Subscriptions aren't available right now." : "Couldn't complete purchase — try again.");
      }
      return;
    }
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, email: user?.email, origin: window.location.origin }) });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      flash(d.error === "stripe_offline" ? "Payments aren't switched on yet — coming soon." : "Couldn't start checkout — try again.");
    } catch (e) { flash("Couldn't start checkout."); }
  };

  // Apple requires a visible "Restore Purchases" action for subscriptions.
  const handleRestore = async () => {
    if (!iap.IS_NATIVE) return;
    flash("Restoring purchases…");
    const active = await iap.restore();
    if (active && user) persist({ ...user, plus: true });
    flash(active ? "BarterThat+ restored ✓" : "No active purchases found.");
  };

  // Crowdfunding: back a venture with tokens, or pledge investor interest.
  const handleBack = async (listing, kind, amount) => {
    if (!user) { setScreen("login"); return false; }
    const dbId = listing._dbId;
    if (kind === "tokens") {
      if ((user.credits || 0) < amount) { flash("Not enough tokens — earn more first."); return false; }
      persist({ ...user, credits: user.credits - amount });
      if (dbId) await db.addBacking(dbId, user.id, "tokens", amount);
      flash(`🪙 Backed with ${amount} Barter Tokens!`);
    } else {
      if (dbId) await db.addBacking(dbId, user.id, "interest", amount, { email: user.email });
      flash("✅ Interest pledged — the founder will follow up.");
    }
    return true;
  };

  const handleBlock = uid => {
    if (!user) return;
    persist({ ...user, blocked: [...new Set([...(user.blocked || []), uid])] });
    setViewing(null);
    flash("Blocked — you won't see them anymore");
  };

  const handleReport = payload => {
    try {
      const r = storage.get("bt_reports") || [];
      r.push({ ...payload, by: user?.id, at: new Date().toISOString() });
      storage.set("bt_reports", r);
    } catch (e) {}
    flash("Reported — our team will review it. Thank you.");
  };

  const handleLogout = () => { db.signOut(); bootedRef.current = false; storage.remove("bt_user"); setUser(null); setScreen("splash"); setNav("browse"); };

  const handleReset = () => {
    ["bt_user", "bt_listings", "bt_trades", "bt_coach"].forEach(k => storage.remove(k));
    setUser(null);
    setListings(LISTINGS);
    setTrades(TRADES_SEED);
    setViewing(null);
    setProposeTo(null);
    setScreen("splash");
    setNav("browse");
    flash("demo data reset to sample");
  };

  const enter = d => { if (d === "signup") setScreen("signup"); else if (d === "login") setScreen("login"); else if (d === "pitch") setScreen("pitch"); else if (d === "admin") setScreen("admin"); else { setScreen("main"); setNav("browse"); } };
  if (screen === "splash") return <><G /><Splash onEnter={enter} onHow={() => setShowHow(true)} />{showHow && <VideoModal onDone={() => setShowHow(false)} />}</>;
  if (screen === "login") return <><G /><Login onLogin={handleLogin} onSignup={() => setScreen("signup")} onBack={() => setScreen("splash")} /></>;
  if (screen === "verify") return <><G /><VerifyEmail email={pendingEmail} onLogin={() => setScreen("login")} onBack={() => setScreen("splash")} /></>;
  if (screen === "signup") return <><G /><Signup onDone={handleSignup} onLogin={() => setScreen("login")} /></>;
  if (screen === "pitch") return <><G /><InvestorPitch onBack={() => setScreen(user ? "main" : "splash")} onEnter={enter} /></>;
  if (screen === "admin") return <><G /><AdminLeads onBack={() => setScreen("pitch")} /></>;

  const renderMain = () => {
    if (viewing) return <Detail l={viewing} user={user} listings={listings} onBack={() => setViewing(null)} onPropose={handlePropose} onBlock={handleBlock} onReport={handleReport} onFund={handleBack} />;
    switch (nav) {
      case "browse": return <Browse listings={listings} user={user} onView={setViewing} onSave={handleSave} onPropose={handlePropose} />;
      case "match": return <Match listings={listings} user={user} onView={setViewing} onPropose={handlePropose} />;
      case "community": return <Community listings={listings} user={user} onView={setViewing} onPropose={handlePropose} onNav={n => { setViewing(null); setNav(n); }} />;
      case "trades": return <Trades trades={trades} user={user} onAccept={handleAccept} onComplete={handleComplete} />;
      case "post": return <Post user={user} onPost={handlePost} />;
      case "saved": return <Saved listings={listings} user={user} onView={setViewing} />;
      case "earn": return <EarnTokens user={user} listings={listings} onEarn={handleEarn} onNav={n => { setViewing(null); setNav(n); }} onSubscribe={() => startCheckout("plus")} />;
      case "profile": return <Profile user={user} listings={listings} trades={trades} onNav={n => { setViewing(null); if (n === "pitch") setScreen("pitch"); else setNav(n); }} onLogout={handleLogout} onReset={handleReset} onPromote={() => startCheckout("promote")} onRestore={handleRestore} />;
      default: return null;
    }
  };

  const unread = trades.filter(t => t.unread).length;

  return (
    <>
      <G />
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--bd)", padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => { setViewing(null); setNav("browse"); }}><Logo height={28} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {user && <span className="credit" title="Barter Tokens — free store credit you can use to even out any trade. Tap to see your balance & earn more." style={{ cursor: "pointer" }} onClick={() => { setViewing(null); setNav("earn"); }}>⬡ {user.credits ?? 0}</span>}
          <button onClick={() => setShowHow(true)} title="How BarterThat works" style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--bd)", background: "var(--s3)", color: "var(--t2)", cursor: "pointer", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>?</button>
          <button onClick={() => { setViewing(null); setNav("trades"); }} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: nav === "trades" ? "var(--g)" : "var(--t2)", fontSize: 18 }}>
            ⇄{unread > 0 && <span style={{ position: "absolute", top: -3, right: -6, width: 14, height: 14, borderRadius: "50%", background: "var(--g)", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{unread}</span>}
          </button>
          <button onClick={() => { setViewing(null); setNav("saved"); }} style={{ background: "none", border: "none", cursor: "pointer", color: nav === "saved" ? "var(--g)" : "var(--t2)", fontSize: 16 }}>♡</button>
          {!user && <button className="btn bp bsm" onClick={() => setScreen("signup")}>join free</button>}
          {user && <Av ini={user.ini} avc={user.avc} size={30} style={{ cursor: "pointer" }} onClick={() => { setViewing(null); setNav("profile"); }} />}
        </div>
      </div>
      {renderMain()}
      <Nav scr={nav} onNav={s => { setViewing(null); setNav(s); }} />
      {coach && <CoachMarks onDone={dismissCoach} />}
      {showHow && <VideoModal onDone={() => setShowHow(false)} />}
      {proposeTo && <ProposeModal l={proposeTo} user={user} onClose={() => setProposeTo(null)} onSend={handleSend} />}
      {toast && <div className="fu" style={{ position: "fixed", bottom: 86, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: "var(--s1)", border: "1px solid rgba(232,177,74,0.4)", color: "var(--am)", padding: "10px 18px", borderRadius: "var(--rp)", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>{toast}</div>}
    </>
  );
}
