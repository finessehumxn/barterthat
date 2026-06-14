import { useState, useEffect } from "react";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
    :root {
      /* ── BarterThat Brand Colors (from logo guide) ── */
      --g:#EF5D47;          /* coral red — primary action color */
      --gd:#D94433;         /* coral red dark — hover states */
      --gl:rgba(239,93,71,0.12); /* coral red tint — pill backgrounds */
      --gm:rgba(239,93,71,0.25); /* coral red mid */
      --navy:#16243F;       /* deep navy — primary text & backgrounds */
      --navyl:rgba(22,36,63,0.08); /* navy tint */
      --gold:#E8B14A;       /* warm gold — accents, verified badges */
      --goldd:#C8941F;      /* gold dark */
      --goldl:rgba(232,177,74,0.15); /* gold tint */
      --cream:#FFE3D1;      /* warm cream — light backgrounds */
      --creaml:#FFF6F0;     /* lighter cream */

      /* ── App surfaces (dark mode keeping navy feel) ── */
      --bk:#0E1825;         /* deepest navy background */
      --s1:#16243F;         /* navy — card surface 1 */
      --s2:#1C2D4F;         /* navy mid — card surface 2 */
      --s3:#243660;         /* navy light — input backgrounds */
      --s4:#2E4275;         /* navy lighter — borders */

      /* ── Text ── */
      --tx:#FFE3D1;         /* cream — primary text */
      --t2:#C4B5A8;         /* muted cream — secondary text */
      --t3:#7A6E66;         /* dim — tertiary text */

      /* ── Borders ── */
      --bd:rgba(255,227,209,0.08);  /* cream border subtle */
      --bd2:rgba(255,227,209,0.18); /* cream border visible */

      /* ── Semantic colors ── */
      --am:#E8B14A;         /* gold = amber/warning */
      --amb:rgba(232,177,74,0.12);
      --rd:#EF5D47;         /* coral = error (same as primary) */
      --rdb:rgba(239,93,71,0.1);
      --bl:#4A90D9;         /* blue — info/escrow */
      --blb:rgba(74,144,217,0.12);
      --pu:#9B72DD;         /* purple — B2B badge */
      --pub:rgba(155,114,221,0.12);

      /* ── Shape ── */
      --r:12px;--rs:7px;--rp:100px;

      /* ── Fonts (keeping Syne — matches logo weight) ── */
      --fd:'Syne',sans-serif;--fb:'Instrument Sans',sans-serif;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:var(--bk);color:var(--tx);font-family:var(--fb);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased;min-height:100vh}
    .pg{background:rgba(239,93,71,0.15)!important;color:#EF5D47!important}
    .pa{background:rgba(232,177,74,0.15)!important;color:#E8B14A!important}
    .pb{background:rgba(74,144,217,0.15)!important;color:#4A90D9!important}
    .pd{background:rgba(255,227,209,0.08)!important;color:var(--t2)!important}
    .pp{background:rgba(155,114,221,0.15)!important;color:#9B72DD!important}
    input,select,textarea,button{font-family:var(--fb);font-size:14px;color:var(--tx)}
    input:focus,select:focus,textarea:focus{outline:none}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--s4);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    .fu{animation:fadeUp .35s ease both}
    .fi{animation:fadeIn .25s ease both}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--rp);font-family:var(--fb);font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;white-space:nowrap}
    .bp{background:var(--g);color:#fff}.bp:hover{background:var(--gd);transform:translateY(-1px)}.bp:active{transform:translateY(0)}
    .bg{background:transparent;color:var(--t2);border:1px solid var(--bd)}.bg:hover{border-color:var(--bd2);color:var(--tx)}
    .bsm{padding:6px 13px;font-size:12px}.blg{padding:13px 26px;font-size:15px;font-weight:700}
    .btn:disabled{opacity:.35;cursor:not-allowed;transform:none!important}
    .card{background:var(--s2);border:1px solid var(--bd);border-radius:var(--r);padding:16px;transition:border-color .15s}
    .card:hover{border-color:var(--bd2)}
    .pill{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:var(--rp);font-size:11px;font-weight:600;white-space:nowrap}
    .pg{background:var(--gl);color:#0D9A5A}.pa{background:var(--amb);color:var(--am)}.pr{background:var(--rdb);color:var(--rd)}.pb{background:var(--blb);color:var(--bl)}.pp{background:var(--pub);color:var(--pu)}.pd{background:var(--s3);color:var(--t2)}
    .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-weight:800;flex-shrink:0}
    .ifield{width:100%;background:var(--s3);border:1px solid var(--bd);border-radius:var(--rs);color:var(--tx);padding:10px 13px;transition:border-color .15s}
    .ifield:focus{border-color:var(--g)}.ifield::placeholder{color:var(--t3)}
    select.ifield option{background:var(--s2)}
    .ndot{width:7px;height:7px;border-radius:50%;background:var(--g);animation:pulse 2s infinite;flex-shrink:0}
    .b2b-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:var(--rp);font-size:10px;font-weight:700;background:var(--pub);color:var(--pu);border:1px solid rgba(155,114,221,0.3)}
  `}</style>
);

const CATS = [
  { id:"beauty", label:"Beauty & Wellness", icon:"✦", subs:["Hair braiding & locs","Natural hair styling","Lash extensions","Nail art & manicures","Wig ventilation & making","Esthetician services","Massage therapy","IV hydration therapy","Chiropractic care","Personal training","Yoga & breathwork","Barber services","Makeup artistry","Microblading"] },
  { id:"food", label:"Food & Farming", icon:"◉", subs:["Meal prepping & delivery","Sourdough bread & baking","Custom cakes & pastries","Food by the pound (beef, chicken, etc)","Farm eggs, milk & dairy","Honey & bee products","Fresh herbs & spice bundles","Fruits & vegetables","Catering & event food","Hot sauce & preserves"] },
  { id:"home", label:"Home & Trade Services", icon:"⌂", subs:["Interior & exterior painting","Electrical work (licensed)","Plumbing (licensed)","HVAC services","Roofing (licensed)","General handyman","Home remodeling","Patio & deck installation","Gutter cleaning","TV & wall mounting","Flooring installation","Pressure washing","Solar installation (licensed)"] },
  { id:"garden", label:"Garden & Outdoor", icon:"❧", subs:["Lawn care & mowing","Landscaping & design","Plant care & propagation","Tree trimming & removal","Garden planting","Snow removal","Herb garden setup","Composting & soil prep","Beekeeping setup"] },
  { id:"creative", label:"Creative & Design", icon:"◈", subs:["Graphic design","Photography","Videography & editing","Logo & brand identity","Social media content","Illustration & art","Music production","Podcast editing","Crochet & fiber arts","Candles & body products","Pottery & ceramics","Custom clothing & sewing"] },
  { id:"tech", label:"Tech & Digital", icon:"⬡", subs:["Web development","App development","IT support & repair","Network setup","SEO & digital marketing","Data analysis","AI & automation","Computer repair","Phone repair","Smart home setup","Business digitization & organizing"] },
  { id:"events", label:"Events & Celebrations", icon:"◇", subs:["Wedding planning","Event coordination","Florist & floral design","DJ services","Live music","Party rentals","Photo booth rental","Event decorating","Venue consulting"] },
  { id:"care", label:"Care & Support", icon:"♡", subs:["Child care & babysitting","Elder care (CNA)","Pet sitting","Pet grooming","Pet food & treats","Dog training","Homework tutoring","Special needs support","Postpartum doula","Senior companionship"] },
  { id:"lessons", label:"Lessons & Coaching", icon:"◎", subs:["Music lessons (all instruments)","Language tutoring","Academic tutoring","Business coaching","Life coaching","Cooking classes","Art & drawing lessons","Dance lessons","Horseback riding lessons","Martial arts instruction","Financial literacy coaching"] },
  { id:"auto", label:"Auto & Transportation", icon:"⊕", subs:["Car detailing","Auto maintenance & oil change","Tire rotation & balancing","Car wash","Mobile mechanic","Car audio installation","Parking spot rental","Airport shuttle","RV maintenance"] },
  { id:"professional", label:"Professional & B2B", icon:"◻", subs:["Accounting & bookkeeping","Tax preparation","Legal consulting","Business consulting","HR consulting","Notary services","Grant writing","Business plan writing","Payroll services"] },
  { id:"travel", label:"Travel & Stays", icon:"✈", subs:["Discounted flights (travel agent)","Hotel deals","Vacation planning","House sitting","Airbnb co-hosting","Local tour guide","Travel photography","Group travel coordination"] },
  { id:"org", label:"Organization & Lifestyle", icon:"▣", subs:["Home organizing & decluttering","Digital business organizing","Closet organization","Moving & packing help","Laundry & folding service","Personal shopping","Wardrobe styling","Errand running"] },
  { id:"health", label:"Health & Medical", icon:"✚", subs:["Dental services (licensed)","Nutrition coaching","Mental health coaching","Physical therapy (licensed)","Herbal medicine consulting","Acupuncture (licensed)","Reiki & energy healing","Doula services"] },
  { id:"community", label:"Community Squads", icon:"⚇", subs:["Friend group rotation (gutters, repairs)","Neighborhood watch network","Community garden share","Tool & equipment lending","Group grocery co-op","Moving squad rotation","Emergency home repair crew","Senior help brigade","Community childcare circle","Skill swap circles"] },
];

const PLATFORMS = [
  {id:"styleseat",l:"StyleSeat",c:"#D63E6E"},{id:"etsy",l:"Etsy",c:"#F1641E"},
  {id:"fiverr",l:"Fiverr",c:"#1DBF73"},{id:"upwork",l:"Upwork",c:"#14A800"},
  {id:"google",l:"Google Business",c:"#4285F4"},{id:"instagram",l:"Instagram",c:"#E1306C"},
  {id:"linkedin",l:"LinkedIn",c:"#0A66C2"},{id:"youtube",l:"YouTube",c:"#FF0000"},
  {id:"thumbtack",l:"Thumbtack",c:"#009FD9"},{id:"taskrabbit",l:"TaskRabbit",c:"#4B9E3E"},
  {id:"mindbody",l:"Mindbody",c:"#5B2D8E"},{id:"amazon",l:"Amazon Handmade",c:"#FF9900"},
  {id:"angi",l:"Angi",c:"#F26522"},{id:"yelp",l:"Yelp",c:"#D32323"},
];

const B2B_CERTS = [
  "Business License","General Liability Insurance","Professional License (state)",
  "LLC / Corporation Status","Workers Comp Insurance","Bonded & Insured",
  "BBB Accreditation","Contractor License","Health Dept Permit",
  "Food Handler Cert","CPA License","Bar License (Attorney)","Medical License",
];

const TAX_BRACKETS = ["$0–$44k","$44k–$95k","$95k–$201k","$201k–$383k","$383k+"];

const AVC = ["#16243F","#D94433","#1C3A5C","#A8350E","#243660","#E8B14A","#16243F","#2E4275"];
const ac = i => AVC[i % AVC.length];

const LISTINGS = [
  {id:1,uid:10,name:"Nia Kendrick",ini:"NK",avc:ac(0),cat:"Beauty & Wellness",sub:"Hair braiding & locs",title:"Knotless braids, locs & protective styles",desc:"10+ yrs. Home studio (Atlanta) or mobile. All textures, all ages welcome.",rate:85,loc:"Atlanta, GA",remote:false,verified:true,elite:true,b2b:false,tscore:97,swaps:87,rating:4.9,rev:87,saved:[],platforms:[{id:"styleseat",l:"StyleSeat",proof:"87 clients · 4.9★",url:"styleseat.com/niakendrick"},{id:"instagram",l:"Instagram",proof:"4.2k followers",url:"instagram.com/niakendrick.hair"},{id:"google",l:"Google Business",proof:"61 reviews · 5.0★",url:"g.co/niasnatural"}],certs:[],taxBracket:"$44k–$95k"},
  {id:2,uid:11,name:"Marcus Rivera",ini:"MR",avc:ac(1),cat:"Home & Trade Services",sub:"Interior & exterior painting",title:"Residential & commercial painting — licensed & insured",desc:"15 yrs, licensed contractor. Free estimate. Coachella Valley & Palm Desert.",rate:95,loc:"Palm Desert, CA",remote:false,verified:true,elite:true,b2b:true,tscore:94,swaps:61,rating:5.0,rev:61,saved:[],platforms:[{id:"google",l:"Google Business",proof:"61 reviews · 5.0★",url:"maps.google.com/marcus"},{id:"thumbtack",l:"Thumbtack",proof:"Top Pro",url:"thumbtack.com/marcus"},{id:"angi",l:"Angi",proof:"Super Service Award",url:"angi.com/marcus"}],certs:["Business License","General Liability Insurance","Contractor License","Bonded & Insured"],taxBracket:"$95k–$201k"},
  {id:3,uid:12,name:"Deja Johnson",ini:"DJ",avc:ac(2),cat:"Food & Farming",sub:"Sourdough bread & baking",title:"Artisan sourdough, custom cakes & baked goods",desc:"Small-batch, all-natural. Custom orders. Delivery or pickup in Houston.",rate:55,loc:"Houston, TX",remote:false,verified:true,elite:false,b2b:false,tscore:88,swaps:34,rating:4.8,rev:340,saved:[],platforms:[{id:"etsy",l:"Etsy",proof:"340 sales · 4.8★",url:"etsy.com/shop/deja"},{id:"instagram",l:"Instagram",proof:"2.1k followers",url:"instagram.com/dejabakes"}],certs:[],taxBracket:"$0–$44k"},
  {id:4,uid:13,name:"Keanu Williams",ini:"KW",avc:ac(3),cat:"Tech & Digital",sub:"Web development",title:"Shopify, Next.js & full-stack web apps",desc:"$40k+ Upwork earnings. Mobile-first. Small business specialist. 100% remote.",rate:100,loc:"Remote",remote:true,verified:true,elite:true,b2b:true,tscore:96,swaps:52,rating:4.9,rev:47,saved:[],platforms:[{id:"upwork",l:"Upwork",proof:"$40k+ earned · 4.9★",url:"upwork.com/keanu"},{id:"linkedin",l:"LinkedIn",proof:"6yrs verified",url:"linkedin.com/in/keanu"}],certs:["Business License","LLC / Corporation Status"],taxBracket:"$95k–$201k"},
  {id:5,uid:14,name:"Trina Powell",ini:"TP",avc:ac(4),cat:"Creative & Design",sub:"Graphic design",title:"Brand identity, flyers & social media kits",desc:"Adobe + Canva Pro. 24hr turnaround. Fiverr Level 2 seller. 5 yrs freelancing.",rate:65,loc:"Los Angeles, CA",remote:true,verified:true,elite:false,b2b:false,tscore:82,swaps:28,rating:4.7,rev:92,saved:[],platforms:[{id:"fiverr",l:"Fiverr",proof:"Level 2 · 4.7★",url:"fiverr.com/trinadesigns"},{id:"instagram",l:"Instagram",proof:"1.8k followers",url:"instagram.com/trinadesigns"}],certs:[],taxBracket:"$0–$44k"},
  {id:6,uid:15,name:"Lena Moore",ini:"LM",avc:ac(5),cat:"Beauty & Wellness",sub:"Yoga & breathwork",title:"Private yoga, breathwork & mobility sessions",desc:"200-hr YTT certified. In-home, studio or virtual. All levels. Chicago area.",rate:75,loc:"Chicago, IL",remote:true,verified:true,elite:false,b2b:false,tscore:91,swaps:41,rating:4.9,rev:200,saved:[],platforms:[{id:"mindbody",l:"Mindbody",proof:"200+ sessions · 4.9★",url:"mindbody.io/lena"},{id:"instagram",l:"Instagram",proof:"3.4k followers",url:"instagram.com/lenayoga"}],certs:[],taxBracket:"$44k–$95k"},
  {id:7,uid:16,name:"Carmen Osei",ini:"CO",avc:ac(6),cat:"Events & Celebrations",sub:"Wedding planning",title:"Full-service wedding & event planning",desc:"100+ events. Licensed business. Day-of coordination to full planning packages.",rate:110,loc:"Atlanta, GA",remote:false,verified:true,elite:true,b2b:true,tscore:93,swaps:29,rating:5.0,rev:45,saved:[],platforms:[{id:"google",l:"Google Business",proof:"45 reviews · 5.0★",url:"g.co/carmenevents"},{id:"instagram",l:"Instagram",proof:"8.1k followers",url:"instagram.com/carmenevents"},{id:"yelp",l:"Yelp",proof:"38 reviews · 4.9★",url:"yelp.com/carmen"}],certs:["Business License","General Liability Insurance","LLC / Corporation Status"],taxBracket:"$95k–$201k"},
  {id:8,uid:17,name:"Rico Farms",ini:"RF",avc:ac(7),cat:"Food & Farming",sub:"Farm eggs, milk & dairy",title:"Fresh farm eggs, raw honey, seasonal produce",desc:"Pasture-raised. Weekly harvest boxes. Local delivery or swap. Black-owned farm.",rate:40,loc:"Memphis, TN",remote:false,verified:true,elite:false,b2b:true,tscore:85,swaps:19,rating:4.8,rev:31,saved:[],platforms:[{id:"etsy",l:"Etsy",proof:"Sells online",url:"etsy.com/ricofarms"},{id:"instagram",l:"Instagram",proof:"5.2k followers",url:"instagram.com/ricofarms"}],certs:["Business License","Health Dept Permit","Food Handler Cert"],taxBracket:"$44k–$95k"},
  {id:9,uid:18,name:"The Gutter Squad",ini:"GS",avc:ac(0),cat:"Community Squads",sub:"Friend group rotation (gutters, repairs)",title:"8-person rotation squad — gutters, caulking, repairs",desc:"We rotate homes every other weekend tackling jobs women often can't get to alone. Join or invite your crew.",rate:0,loc:"Dallas, TX",remote:false,verified:true,elite:false,b2b:false,tscore:89,swaps:44,rating:4.9,rev:44,saved:[],platforms:[{id:"instagram",l:"Instagram",proof:"Community group · 1.1k",url:"instagram.com/guttersquad"}],certs:[],taxBracket:"$0–$44k",isSquad:true},
  {id:10,uid:19,name:"Alexis Gray CNA",ini:"AG",avc:ac(1),cat:"Care & Support",sub:"Elder care (CNA)",title:"Certified nursing assistant — elder care & companionship",desc:"CNA licensed. In-home elder care, post-surgery support, companion visits. Background checked.",rate:35,loc:"Phoenix, AZ",remote:false,verified:true,elite:false,b2b:false,tscore:90,swaps:22,rating:5.0,rev:22,saved:[],platforms:[{id:"linkedin",l:"LinkedIn",proof:"CNA License verified",url:"linkedin.com/alexisgray"},{id:"google",l:"Google Business",proof:"22 reviews · 5.0★",url:"g.co/alexiscares"}],certs:["Professional License (state)"],taxBracket:"$0–$44k"},
  {id:11,uid:20,name:"Braid & Books Academy",ini:"BB",avc:ac(2),cat:"Lessons & Coaching",sub:"Music lessons (all instruments)",title:"Guitar, piano, voice & music theory lessons",desc:"10+ yrs teaching. Online or in-person. Kids & adults. First lesson free with any swap.",rate:70,loc:"Remote",remote:true,verified:true,elite:false,b2b:false,tscore:84,swaps:33,rating:4.8,rev:60,saved:[],platforms:[{id:"youtube",l:"YouTube",proof:"8.2k subscribers",url:"youtube.com/braidbooks"},{id:"instagram",l:"Instagram",proof:"2.3k followers",url:"instagram.com/braidbooks"}],certs:[],taxBracket:"$44k–$95k"},
  {id:12,uid:21,name:"Swift Auto Detail",ini:"SA",avc:ac(3),cat:"Auto & Transportation",sub:"Car detailing",title:"Mobile car detailing — full interior & exterior",desc:"We come to you. Full detail in 3hrs. Licensed mobile business. Dallas metro.",rate:80,loc:"Dallas, TX",remote:false,verified:true,elite:false,b2b:true,tscore:87,swaps:38,rating:4.9,rev:55,saved:[],platforms:[{id:"google",l:"Google Business",proof:"55 reviews · 4.9★",url:"g.co/swiftauto"},{id:"yelp",l:"Yelp",proof:"42 reviews",url:"yelp.com/swiftauto"}],certs:["Business License","General Liability Insurance"],taxBracket:"$44k–$95k"},
];

const TRADES_SEED = [
  {id:1,wu:"Marcus Rivera",wi:"MR",wc:ac(1),ms:"Brand identity (4hrs)",ts:"Interior painting (4hrs)",mv:400,tv:380,topup:0,tpb:null,status:"pending",plat:"Google Business · 5.0★",time:"2h ago",unread:true,b2b:false,msgs:[{from:"them",txt:"Hey! I saw your listing. 4hrs of interior painting for 4hrs of brand work — let's do it!",time:"2h ago"}]},
  {id:2,wu:"Deja Johnson",wi:"DJ",wc:ac(2),ms:"Logo kit (2hrs)",ts:"Sourdough loaves × 6",mv:130,tv:90,topup:40,tpb:"them",status:"escrow",plat:"Etsy · 4.8★",time:"5h ago",unread:true,b2b:false,msgs:[{from:"them",txt:"Love your work! My sourdough retails for $90 in product value. I'll add a $40 escrow top-up?",time:"5h ago"},{from:"me",txt:"Deal! Let's lock it in.",time:"4h ago"}]},
  {id:3,wu:"Keanu Williams",wi:"KW",wc:ac(3),ms:"UI/UX design (6hrs)",ts:"React dev work (6hrs)",mv:600,tv:600,topup:0,tpb:null,status:"completed",plat:"Upwork · $40k+ earned",time:"3d ago",unread:false,b2b:true,rating:5,msgs:[{from:"them",txt:"Perfect B2B swap. Great working with you.",time:"3d ago"}]},
];

// ── STORAGE: localStorage wrapper (works locally + in production) ─────────────
const storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Av({ ini, avc, size = 38, style = {} }) {
  return <div className="av" style={{ width: size, height: size, background: avc, fontSize: size * .32, color: "rgba(255,255,255,0.85)", ...style }}>{ini}</div>;
}
function TScore({ score }) {
  const c = score >= 90 ? "#16A567" : score >= 75 ? "#E9A92A" : "#E04848";
  return <span style={{ fontSize: 11, fontWeight: 700, color: c, background: `${c}18`, padding: "2px 7px", borderRadius: 100 }}>⬡ {score}</span>;
}
function Stars({ r }) {
  return <span style={{ fontSize: 11 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(r) ? "#E9A92A" : "#333" }}>★</span>)}<span style={{ color: "var(--t2)", marginLeft: 3 }}>{r.toFixed(1)}</span></span>;
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
function CertBadge({ cert }) {
  return <span className="pill pp" style={{ margin: "2px 3px 2px 0" }}>{cert}</span>;
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({ onEnter }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)`, backgroundSize: "44px 44px", opacity: .5 }} />
      <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(22,165,103,0.13) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div className="fu" style={{ position: "relative", zIndex: 1, maxWidth: 600 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(52px,11vw,90px)", fontWeight: 800, letterSpacing: "-3px", lineHeight: .95, marginBottom: 8 }}>
          Barter<span style={{ color: "var(--g)" }}>That</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>SWAP SKILLS · BUILD COMMUNITY</div>
        <div style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 36px" }}>
          Swap verified skills. From braids to bricklaying, sourdough to software. No cash needed — just proof.
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
          <button className="btn bp blg" onClick={() => onEnter("signup")}>get started free</button>
          <button className="btn bg blg" onClick={() => onEnter("browse")}>explore marketplace</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, maxWidth: 500, margin: "0 auto 32px" }}>
          {["2.4M traders", "$380M swapped", "180+ cities", "50+ categories", "B2B licensed", "Community squads"].map(t => (
            <div key={t} style={{ background: "var(--s2)", border: "1px solid var(--bd)", borderRadius: "var(--rp)", padding: "7px 12px", fontSize: 12, color: "var(--t2)" }}>{t}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--t3)" }}>link your StyleSeat · Etsy · Fiverr · Upwork · Google Business · and 9 more platforms</div>
      </div>
    </div>
  );
}

// ── SIGNUP ────────────────────────────────────────────────────────────────────
function Signup({ onDone }) {
  const [step, setStep] = useState(0);
  const [isB2B, setIsB2B] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", loc: "", cat: "", sub: "", title: "", desc: "", rate: 75, acceptTopup: true, taxBracket: "$0–$44k" });
  const [selPlats, setSelPlats] = useState([]);
  const [platUrls, setPlatUrls] = useState({});
  const [selCerts, setSelCerts] = useState([]);

  const steps = isB2B ? ["account", "your service", "platforms", "B2B credentials", "launch"] : ["account", "your service", "platforms", "launch"];

  const ok = () => {
    if (step === 0) return form.name.trim() && form.email.trim() && form.loc.trim();
    if (step === 1) return form.cat && form.title.trim() && form.desc.trim();
    if (step === 2) return selPlats.length >= 1;
    if (isB2B && step === 3) return selCerts.length >= 2;
    return true;
  };

  const go = () => {
    if (step < steps.length - 1) { setStep(s => s + 1); return; }
    const plats = selPlats.map(id => { const p = PLATFORMS.find(x => x.id === id); return { id, l: p.l, proof: platUrls[id] || "profile linked", url: platUrls[id] || `${p.l.toLowerCase().replace(/\s/g, "")}.com/${form.name.toLowerCase().replace(/\s/g, "")}` }; });
    onDone({ ...form, platforms: plats, b2b: isB2B, certs: selCerts });
  };

  const selectedCat = CATS.find(c => c.label === form.cat);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 500 }} className="fu">
        <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, letterSpacing: "-1px", marginBottom: 28, textAlign: "center" }}>Barter<span style={{ color: "var(--g)" }}>That</span></div>
        <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "var(--g)" : "var(--s4)", transition: "background .3s" }} />)}
        </div>
        {step === 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "var(--s3)", borderRadius: "var(--r)", padding: 4 }}>
            {[["Personal / Freelancer", false], ["Business / B2B", true]].map(([l, v]) => (
              <button key={l} onClick={() => setIsB2B(v)} style={{ flex: 1, padding: "9px 12px", borderRadius: "var(--rs)", background: isB2B === v ? "var(--s1)" : "transparent", border: isB2B === v ? "1px solid var(--bd2)" : "1px solid transparent", color: isB2B === v ? "var(--tx)" : "var(--t2)", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>{l}</button>
            ))}
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 6 }}>step {step + 1} of {steps.length}</div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 800, marginBottom: 20, letterSpacing: "-.5px" }}>{steps[step]}</div>

        {step === 0 && <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>{isB2B ? "business name" : "full name"}</label><input className="ifield" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isB2B ? "e.g. Swift Auto Detail" : "e.g. Nia Kendrick"} /></div>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>email</label><input className="ifield" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" /></div>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>location</label><input className="ifield" value={form.loc} onChange={e => setForm(f => ({ ...f, loc: e.target.value }))} placeholder="city, state or 'Remote'" /></div>
          {isB2B && <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>tax bracket</label>
            <select className="ifield" value={form.taxBracket} onChange={e => setForm(f => ({ ...f, taxBracket: e.target.value }))}>
              {TAX_BRACKETS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 5 }}>B2B swaps match within 1 bracket — both parties have something to lose</div>
          </div>}
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
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>specific service</label>
            <select className="ifield" value={form.sub} onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}>
              <option value="">select service</option>
              {selectedCat.subs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>}
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>listing title</label><input className="ifield" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="describe your service in one line" /></div>
          <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>details</label><textarea className="ifield" rows={3} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="what's included? hours? requirements?" style={{ resize: "none" }} /></div>
          <div>
            <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>your rate — <strong style={{ color: "var(--g)" }}>${form.rate}/hr</strong> {form.rate === 0 && "(free / community swap)"}</label>
            <input type="range" min={0} max={250} step={5} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: +e.target.value }))} style={{ width: "100%", accentColor: "var(--g)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 3 }}><span>$0 (community)</span><span>$250/hr</span></div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: "var(--t2)", cursor: "pointer" }}>
            <input type="checkbox" checked={form.acceptTopup} onChange={e => setForm(f => ({ ...f, acceptTopup: e.target.checked }))} style={{ accentColor: "var(--g)", width: 15, height: 15 }} />
            accept cash top-up when partner's service is lower value
          </label>
        </div>}

        {step === 2 && <div>
          <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 14, lineHeight: 1.6 }}>Select platforms where your work is already reviewed. This is your proof — no strangers, no sketchy.</p>
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
                <div style={{ fontSize: 11, color: "var(--t2)", width: 85, flexShrink: 0 }}>{p.l}</div>
                <input className="ifield" placeholder={`${p.l.toLowerCase()}.com/you`} value={platUrls[id] || ""} onChange={e => setPlatUrls(v => ({ ...v, [id]: e.target.value }))} style={{ flex: 1 }} />
              </div>
            ); })}
          </div>}
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 8 }}>✦ links are community-verified — fake profiles get flagged</div>
        </div>}

        {isB2B && step === 3 && <div>
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
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 10 }}>{selCerts.length}/2 minimum selected</div>
        </div>}

        {step === steps.length - 1 && <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 14, color: "var(--g)" }}>✦</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 10, color: "var(--g)" }}>you're live.</div>
          <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, marginBottom: 20 }}>Your listing is active. Platforms linked. That Score starts building now.</p>
          {isB2B && <div style={{ background: "var(--pub)", border: "1px solid rgba(155,114,221,0.3)", borderRadius: "var(--rs)", padding: "11px 14px", marginBottom: 16, fontSize: 12, color: "var(--pu)" }}>B2B verified — matched with licensed businesses in your tax bracket</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
            {["✓ listing live in marketplace", "✓ platform proof verified", "✓ swap proposals open", "✓ escrow protection active"].map(t => (
              <div key={t} style={{ fontSize: 12, color: "var(--t2)", padding: "8px 12px", background: "var(--s3)", borderRadius: "var(--rs)" }}>{t}</div>
            ))}
          </div>
        </div>}

        <div style={{ display: "flex", gap: 9, marginTop: 24 }}>
          {step > 0 && <button className="btn bg" onClick={() => setStep(s => s - 1)}>← back</button>}
          <button className="btn bp" style={{ flex: 1 }} disabled={!ok()} onClick={go}>
            {step === steps.length - 1 ? "enter marketplace →" : "continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BROWSE ────────────────────────────────────────────────────────────────────
function Browse({ listings, user, onView, onSave, onPropose }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState(false);
  const [b2b, setB2B] = useState(false);
  const [squad, setSquad] = useState(false);
  const [maxR, setMaxR] = useState(250);
  const [showCats, setShowCats] = useState(false);

  const filtered = listings.filter(l => {
    if (user && l.uid === user.id) return false;
    if (cat !== "All" && l.cat !== cat) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase()) && !l.name.toLowerCase().includes(q.toLowerCase()) && !l.sub.toLowerCase().includes(q.toLowerCase())) return false;
    if (remote && !l.remote) return false;
    if (b2b && !l.b2b) return false;
    if (squad && !l.isSquad) return false;
    if (l.rate > maxR) return false;
    return true;
  });

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--bd)", padding: "10px 14px 8px" }}>
        <input className="ifield" value={q} onChange={e => setQ(e.target.value)} placeholder="search any service, skill, or city..." style={{ marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["remote", remote, setRemote], ["B2B licensed", b2b, setB2B], ["community squads", squad, setSquad]].map(([l, v, s]) => (
            <button key={l} onClick={() => s(x => !x)} style={{ padding: "4px 11px", borderRadius: "var(--rp)", border: `1px solid ${v ? "var(--g)" : "var(--bd)"}`, background: v ? "var(--gl)" : "transparent", color: v ? "#0D9A5A" : "var(--t2)", fontSize: 11, cursor: "pointer", transition: "all .15s" }}>{v ? "✓ " : ""}{l}</button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <span style={{ fontSize: 10, color: "var(--t3)", whiteSpace: "nowrap" }}>max ${maxR}</span>
            <input type="range" min={0} max={250} step={5} value={maxR} onChange={e => setMaxR(+e.target.value)} style={{ width: 70, accentColor: "var(--g)" }} />
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 14px 0" }}>
        <button onClick={() => setShowCats(x => !x)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: "var(--rp)", border: "1px solid var(--bd)", background: showCats ? "var(--s3)" : "transparent", color: "var(--t2)", cursor: "pointer", fontSize: 12, marginBottom: 8 }}>
          {showCats ? "▲" : "▼"} browse all {CATS.length} categories
        </button>
        {showCats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 6, marginBottom: 12 }}>
            <button onClick={() => { setCat("All"); setShowCats(false); }} style={{ padding: "8px 12px", borderRadius: "var(--rs)", border: `1px solid ${cat === "All" ? "var(--g)" : "var(--bd)"}`, background: cat === "All" ? "var(--gl)" : "var(--s3)", color: cat === "All" ? "#0D9A5A" : "var(--t2)", cursor: "pointer", fontSize: 12, textAlign: "left" }}>◈ All categories</button>
            {CATS.map(c => (
              <button key={c.id} onClick={() => { setCat(c.label); setShowCats(false); }} style={{ padding: "8px 12px", borderRadius: "var(--rs)", border: `1px solid ${cat === c.label ? "var(--g)" : "var(--bd)"}`, background: cat === c.label ? "var(--gl)" : "var(--s3)", color: cat === c.label ? "#0D9A5A" : "var(--t2)", cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                {c.icon} {c.label}
              </button>
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

      <div style={{ padding: "0 14px", fontSize: 11, color: "var(--t3)", marginBottom: 10 }}>{filtered.length} service{filtered.length !== 1 ? "s" : ""} found</div>

      <div style={{ padding: "0 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(275px,1fr))", gap: 10 }}>
        {filtered.map((l, i) => (
          <div key={l.id} className="card fu" style={{ animationDelay: `${i * .04}s`, cursor: "pointer" }} onClick={() => onView(l)}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Av ini={l.ini} avc={l.avc} size={40} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    {l.name}
                    {l.elite && <span className="pill pa">Elite</span>}
                    {l.b2b && <span className="b2b-badge">B2B</span>}
                    {l.isSquad && <span className="pill pg">Squad</span>}
                  </div>
                  <Stars r={l.rating} />
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); onSave(l.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: user && l.saved?.includes(user.id) ? "var(--g)" : "var(--t3)", transition: "color .15s", flexShrink: 0 }}>♡</button>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 7 }}>
              <span className="pill pd">{l.cat}</span>
              {l.sub && <span style={{ fontSize: 10, color: "var(--t3)", padding: "2px 8px", background: "transparent", border: "1px solid var(--bd)", borderRadius: "var(--rp)" }}>{l.sub}</span>}
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, marginBottom: 5, lineHeight: 1.3 }}>{l.title}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 10, lineHeight: 1.5 }}>{l.desc}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
              {l.platforms.slice(0, 3).map(p => { const pl = PLATFORMS.find(x => x.id === p.id) || { c: "#555" }; return (
                <span key={p.id} style={{ fontSize: 10, padding: "2px 7px", borderRadius: "var(--rp)", background: `${pl.c}15`, color: pl.c, fontWeight: 600 }}>✓ {p.l}</span>
              ); })}
            </div>
            {l.b2b && l.certs?.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                {l.certs.slice(0, 2).map(c => <span key={c} className="pill pp" style={{ fontSize: 9 }}>{c}</span>)}
                {l.certs.length > 2 && <span className="pill pp" style={{ fontSize: 9 }}>+{l.certs.length - 2} more</span>}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800, color: "var(--g)" }}>{l.rate === 0 ? "Free swap" : "$" + l.rate}</span>
                <span style={{ fontSize: 11, color: "var(--t3)" }}>{l.rate > 0 ? "/hr · " : " · "}{l.loc}</span>
              </div>
              <button className="btn bp bsm" onClick={e => { e.stopPropagation(); onPropose(l); }}>propose swap</button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--t3)" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>◎</div>
          <div>no listings match — try different filters</div>
        </div>
      )}
    </div>
  );
}

// ── DETAIL ────────────────────────────────────────────────────────────────────
function Detail({ l, user, onBack, onPropose }) {
  const [myRate, setMyRate] = useState(user?.rate || 60);
  const [hrs, setHrs] = useState(3);
  const diff = Math.max(0, Math.round((l.rate - myRate) * hrs));
  const taxMatch = !l.b2b || !user?.b2b || user?.taxBracket === l.taxBracket ||
    Math.abs(TAX_BRACKETS.indexOf(user?.taxBracket || "$0–$44k") - TAX_BRACKETS.indexOf(l.taxBracket || "$0–$44k")) <= 1;

  return (
    <div style={{ padding: "14px 14px 80px" }} className="fi">
      <button className="btn bg bsm" onClick={onBack} style={{ marginBottom: 14 }}>← back</button>
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <Av ini={l.ini} avc={l.avc} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800 }}>{l.name}</span>
              {l.elite && <span className="pill pa">Elite</span>}
              {l.b2b && <span className="b2b-badge">B2B Licensed</span>}
              {l.isSquad && <span className="pill pg">Community Squad</span>}
              {l.verified && <span className="pill pg">✓ verified</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 3 }}>{l.cat} · {l.sub} · {l.loc}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap", alignItems: "center" }}>
              <Stars r={l.rating} /><TScore score={l.tscore} /><span style={{ fontSize: 11, color: "var(--t3)" }}>{l.swaps} swaps · {l.rev} reviews</span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, marginBottom: 5 }}>{l.title}</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{l.desc}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 10 }}>
        {[{ label: "market rate", val: l.rate === 0 ? "free" : `$${l.rate}/hr` }, { label: "scope", val: "2–4 hrs" }, { label: "top-up", val: "accepted" }].map(v => (
          <div key={v.label} style={{ background: "var(--s3)", borderRadius: "var(--rs)", padding: "10px 11px" }}>
            <div style={{ fontSize: 9, color: "var(--t3)", marginBottom: 3 }}>{v.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{v.val}</div>
          </div>
        ))}
      </div>

      {l.b2b && (
        <div style={{ background: taxMatch ? "rgba(22,165,103,0.08)" : "var(--rdb)", border: `1px solid ${taxMatch ? "rgba(22,165,103,0.25)" : "rgba(224,72,72,0.3)"}`, borderRadius: "var(--rs)", padding: "11px 13px", marginBottom: 10, fontSize: 12 }}>
          <div style={{ fontWeight: 700, color: taxMatch ? "var(--g)" : "var(--rd)", marginBottom: 4 }}>{taxMatch ? "✓ B2B bracket eligible" : "⚠ B2B bracket mismatch"}</div>
          <div style={{ color: "var(--t2)", lineHeight: 1.5 }}>{l.name.split(" ")[0]} is in bracket <strong>{l.taxBracket || "$44k–$95k"}</strong>. {taxMatch ? "You're within range for a protected B2B swap." : "B2B swaps are limited to within 1 bracket for mutual protection."}</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>verified platform links</div>
        {l.platforms.map(p => <PlatBadge key={p.id} p={p} />)}
      </div>

      {l.b2b && l.certs?.length > 0 && (
        <div className="card" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>business credentials</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>{l.certs.map(c => <CertBadge key={c} cert={c} />)}</div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 8 }}>Tax bracket: <strong style={{ color: "var(--tx)" }}>{l.taxBracket}</strong></div>
        </div>
      )}

      {l.rate > 0 && <>
        <div style={{ background: "rgba(22,165,103,0.07)", border: "1px solid rgba(22,165,103,0.2)", borderRadius: "var(--rs)", padding: "12px 14px", marginBottom: 9 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g)", marginBottom: 5 }}>⇄ value match zone</div>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>Fair swap: any service valued <strong style={{ color: "var(--tx)" }}>${Math.round(l.rate * .9)}–${Math.round(l.rate * 1.1)}/hr</strong> for equal hours.</div>
        </div>
        <div style={{ background: "var(--amb)", border: "1px solid rgba(233,169,42,0.25)", borderRadius: "var(--rs)", padding: "12px 14px", marginBottom: 9 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--am)", marginBottom: 9 }}>◎ top-up calculator</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 3 }}>your rate</div><input type="number" value={myRate} min={10} step={5} onChange={e => setMyRate(+e.target.value)} className="ifield" style={{ width: 75, textAlign: "center", padding: "7px 8px" }} /></div>
            <div style={{ color: "var(--t3)" }}>×</div>
            <div><div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 3 }}>hours</div><input type="number" value={hrs} min={1} max={20} onChange={e => setHrs(+e.target.value)} className="ifield" style={{ width: 60, textAlign: "center", padding: "7px 8px" }} /></div>
            <div style={{ color: "var(--t3)" }}>=</div>
            <div><div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 3 }}>you'd pay</div><div style={{ fontSize: 19, fontWeight: 800, color: diff === 0 ? "var(--g)" : "var(--am)" }}>{diff === 0 ? "no gap!" : "$" + diff}</div></div>
          </div>
          {diff > 0 && <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 7 }}>held in escrow · auto-released after both parties confirm</div>}
        </div>
      </>}

      <div style={{ background: "var(--blb)", border: "1px solid rgba(79,148,212,0.2)", borderRadius: "var(--rs)", padding: "11px 13px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--bl)", marginBottom: 4 }}>🔒 escrow protection</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>Cash top-ups held by BarterThat until both confirm delivery. 72-hr dispute window.{l.b2b ? " B2B swaps include smart contract." : ""}</div>
      </div>

      <button className="btn bp" style={{ width: "100%" }} disabled={l.b2b && !taxMatch} onClick={() => onPropose(l)}>
        {l.b2b && !taxMatch ? "bracket mismatch — cannot swap" : "propose swap to " + l.name.split(" ")[0] + " →"}
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

  const send = () => {
    setSent(true);
    setTimeout(() => { onSend({ l, svc, myH, thH, msg }); onClose(); }, 1100);
  };

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
                <div style={{ fontSize: 10, color: "var(--t2)" }}>{myH}hr × ${user?.rate || 75}</div>
              </div>
              <div style={{ fontSize: 18, color: "var(--t3)" }}>⇄</div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 3 }}>they offer</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--g)" }}>${tv}</div>
                <div style={{ fontSize: 10, color: "var(--t2)" }}>{thH}hr × ${l.rate}</div>
              </div>
            </div>
            {diff !== 0 && <div style={{ padding: "8px 12px", background: diff > 0 ? "var(--gl)" : "var(--amb)", borderRadius: "var(--rs)", marginBottom: 12, fontSize: 12, color: diff > 0 ? "#0D9A5A" : "var(--am)" }}>
              {diff > 0 ? `${l.name.split(" ")[0]} pays you a $${Math.abs(diff)} top-up` : `you pay a $${Math.abs(diff)} top-up — held in escrow`}
            </div>}
            <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>your service</label><input className="ifield" value={svc} onChange={e => setSvc(e.target.value)} placeholder="what will you provide?" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 10 }}>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>your hours</label><input type="number" className="ifield" value={myH} min={1} max={20} onChange={e => setMyH(+e.target.value)} /></div>
              <div><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>their hours</label><input type="number" className="ifield" value={thH} min={1} max={20} onChange={e => setThH(+e.target.value)} /></div>
            </div>
            <div style={{ marginBottom: 18 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>message (optional)</label><textarea className="ifield" rows={3} value={msg} onChange={e => setMsg(e.target.value)} placeholder="introduce yourself..." style={{ resize: "none" }} /></div>
            {l.b2b && <div style={{ background: "var(--pub)", border: "1px solid rgba(155,114,221,0.3)", borderRadius: "var(--rs)", padding: "9px 12px", marginBottom: 14, fontSize: 11, color: "var(--pu)" }}>B2B swap — smart contract generated on acceptance</div>}
            <button className="btn bp" style={{ width: "100%" }} disabled={!svc.trim()} onClick={send}>send proposal →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── TRADES ────────────────────────────────────────────────────────────────────
function Trades({ trades, user }) {
  const [active, setActive] = useState(null);
  const [newMsg, setNewMsg] = useState("");

  if (active) {
    const t = trades.find(x => x.id === active);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bd)", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setActive(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 17 }}>←</button>
          <Av ini={t.wi} avc={t.wc} size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{t.wu}{t.b2b && <span className="b2b-badge" style={{ fontSize: 9 }}>B2B</span>}</div>
            <div style={{ fontSize: 10, color: "var(--t3)" }}>{t.plat}</div>
          </div>
          <span className={`pill ${t.status === "pending" ? "pa" : t.status === "escrow" ? "pb" : t.status === "completed" ? "pd" : "pg"}`}>{t.status}</span>
        </div>
        <div style={{ padding: "8px 14px", background: "var(--s2)", borderBottom: "1px solid var(--bd)", display: "flex", gap: 8, alignItems: "center", fontSize: 11 }}>
          <span style={{ color: "var(--t2)" }}>{t.ms}</span><span style={{ color: "var(--t3)" }}>⇄</span><span style={{ color: "var(--t2)" }}>{t.ts}</span>
          {t.topup > 0 && <span className={`pill ${t.tpb === "them" ? "pg" : "pa"}`} style={{ marginLeft: "auto" }}>{t.tpb === "them" ? "+" : "−"}${t.topup} escrow</span>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {t.msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{ maxWidth: "76%", padding: "9px 13px", borderRadius: "var(--r)", background: m.from === "me" ? "var(--g)" : "var(--s3)", color: m.from === "me" ? "#fff" : "var(--tx)", fontSize: 12, lineHeight: 1.5 }}>
                {m.txt}
                <div style={{ fontSize: 9, opacity: .55, marginTop: 3, textAlign: m.from === "me" ? "right" : "left" }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        {t.status === "pending" && (
          <div style={{ padding: "9px 14px", borderTop: "1px solid var(--bd)", display: "flex", gap: 7 }}>
            <button className="btn bp bsm" style={{ flex: 1 }}>accept ✓</button>
            <button className="btn bg bsm">counter</button>
            <button className="btn bg bsm" style={{ color: "var(--rd)" }}>decline</button>
          </div>
        )}
        {t.status === "escrow" && (
          <div style={{ padding: "9px 14px", borderTop: "1px solid var(--bd)" }}>
            <div style={{ fontSize: 11, color: "var(--bl)", marginBottom: 7 }}>🔒 ${t.topup} in escrow — confirm completion to release funds</div>
            <button className="btn bp bsm" style={{ width: "100%" }}>confirm completed ✓</button>
          </div>
        )}
        <div style={{ padding: "9px 14px", borderTop: "1px solid var(--bd)", display: "flex", gap: 7 }}>
          <input className="ifield" style={{ flex: 1 }} value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="message..." />
          <button className="btn bp bsm" disabled={!newMsg.trim()}>send</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 14px 80px" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 14 }}>my trades</div>
      {trades.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--t3)" }}><div style={{ fontSize: 28, marginBottom: 10 }}>⇄</div>no trades yet — go propose a swap!</div>}
      {trades.map(t => (
        <div key={t.id} className="card" style={{ marginBottom: 9, cursor: "pointer", borderLeft: t.unread ? "3px solid var(--g)" : "1px solid var(--bd)" }} onClick={() => setActive(t.id)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Av ini={t.wi} avc={t.wc} size={34} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  {t.wu}{t.unread && <div className="ndot" />}{t.b2b && <span className="b2b-badge" style={{ fontSize: 9 }}>B2B</span>}
                </div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{t.plat}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span className={`pill ${t.status === "pending" ? "pa" : t.status === "escrow" ? "pb" : t.status === "completed" ? "pd" : "pg"}`}>{t.status}</span>
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
function Profile({ user, listings, trades }) {
  if (!user) return <div style={{ padding: 24, textAlign: "center", color: "var(--t3)" }}>sign in to view your profile</div>;
  const mine = listings.find(l => l.uid === user.id);
  const done = trades.filter(t => t.status === "completed").length;
  return (
    <div style={{ padding: "14px 14px 80px" }}>
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Av ini={user.ini} avc={user.avc} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{user.cat || "Community member"} · {user.loc}</div>
            {user.b2b && <div style={{ marginTop: 6 }}><span className="b2b-badge">B2B · {user.taxBracket}</span></div>}
            <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
              <TScore score={user.tscore || 72} /><span className="pill pg">✓ verified</span><span className="pill pd">{done} swaps</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 10 }}>
        {[{ n: `$${user.rate || 0}/hr`, l: "your rate" }, { n: done, l: "swaps done" }, { n: user.platforms?.length || 0, l: "platforms" }].map(s => (
          <div key={s.l} style={{ background: "var(--s3)", borderRadius: "var(--rs)", padding: "11px 9px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 800, color: "var(--g)" }}>{s.n}</div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {mine && <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>my listing</div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{mine.title}</div>
        <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5, marginBottom: 10 }}>{mine.desc}</div>
        <span style={{ color: "var(--g)", fontWeight: 700, fontFamily: "var(--fd)" }}>${mine.rate}/hr · {mine.loc}</span>
      </div>}
      {user.platforms?.length > 0 && <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>verified platforms</div>
        {user.platforms.map(p => <PlatBadge key={p.id} p={p} />)}
      </div>}
      {user.b2b && user.certs?.length > 0 && <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em" }}>business credentials</div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>{user.certs.map(c => <CertBadge key={c} cert={c} />)}</div>
        <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 9 }}>Tax bracket: <strong style={{ color: "var(--tx)" }}>{user.taxBracket}</strong></div>
      </div>}
    </div>
  );
}

// ── SAVED ─────────────────────────────────────────────────────────────────────
function Saved({ listings, user, onView }) {
  const sv = listings.filter(l => user && l.saved?.includes(user.id));
  return (
    <div style={{ padding: "14px 14px 80px" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 14 }}>saved</div>
      {sv.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--t3)" }}><div style={{ fontSize: 26, marginBottom: 9 }}>♡</div>save listings by tapping ♡</div> :
        sv.map(l => (
          <div key={l.id} className="card" style={{ marginBottom: 9, cursor: "pointer" }} onClick={() => onView(l)}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <Av ini={l.ini} avc={l.avc} size={34} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div><Stars r={l.rating} /></div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 800, color: "var(--g)" }}>{l.rate === 0 ? "Free" : "$" + l.rate + "/hr"}</div>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{l.title}</div>
            <div style={{ display: "flex", gap: 5 }}><span className="pill pd">{l.cat}</span>{l.b2b && <span className="b2b-badge">B2B</span>}</div>
          </div>
        ))
      }
    </div>
  );
}

// ── POST ──────────────────────────────────────────────────────────────────────
function Post({ user, onPost }) {
  const [form, setForm] = useState({ cat: user?.cat || "", sub: "", title: user?.title || "", desc: user?.desc || "", rate: user?.rate || 75, acceptTopup: true });
  const [done, setDone] = useState(false);
  const selCat = CATS.find(c => c.label === form.cat);
  const go = () => { setDone(true); setTimeout(() => onPost(form), 1200); };

  if (done) return <div style={{ minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}><div><div style={{ fontSize: 40, color: "var(--g)", marginBottom: 12 }}>✓</div><div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 7 }}>listing live!</div><div style={{ fontSize: 13, color: "var(--t2)" }}>your service is in the marketplace</div></div></div>;

  return (
    <div style={{ padding: "14px 14px 100px" }}>
      <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>post your service</div>
      <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20 }}>tell the community what you offer</div>
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>category</label>
        <select className="ifield" value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value, sub: "" }))}>
          <option value="">select category</option>
          {CATS.map(c => <option key={c.id} value={c.label}>{c.icon} {c.label}</option>)}
        </select>
      </div>
      {selCat && <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>specific service</label>
        <select className="ifield" value={form.sub} onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}>
          <option value="">select service</option>
          {selCat.subs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>}
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>title</label><input className="ifield" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="describe in one line" /></div>
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>details</label><textarea className="ifield" rows={4} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="what's included? hours? location?" style={{ resize: "none" }} /></div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: "var(--t2)", display: "block", marginBottom: 5 }}>rate — <strong style={{ color: "var(--g)" }}>{form.rate === 0 ? "free / community swap" : "$" + form.rate + "/hr"}</strong></label>
        <input type="range" min={0} max={250} step={5} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: +e.target.value }))} style={{ width: "100%", accentColor: "var(--g)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 3 }}><span>$0 (community / squad)</span><span>$250/hr</span></div>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: "var(--t2)", cursor: "pointer", marginBottom: 20, padding: "10px 13px", background: "var(--s3)", borderRadius: "var(--rs)" }}>
        <input type="checkbox" checked={form.acceptTopup} onChange={e => setForm(f => ({ ...f, acceptTopup: e.target.checked }))} style={{ accentColor: "var(--g)", width: 15, height: 15 }} />
        accept cash top-up if partner's service is lower value
      </label>
      <button className="btn bp" style={{ width: "100%" }} disabled={!form.title.trim() || !form.cat} onClick={go}>publish listing ✦</button>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({ scr, onNav, unread }) {
  const items = [{ id: "browse", ic: "◫", l: "explore" }, { id: "trades", ic: "⇄", l: "trades", badge: unread }, { id: "post", ic: "✦", l: "post", prime: true }, { id: "saved", ic: "♡", l: "saved" }, { id: "profile", ic: "◎", l: "profile" }];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--bd)", display: "flex", alignItems: "center", padding: "8px 0 18px", zIndex: 50 }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: scr === item.id ? "var(--g)" : "var(--t3)", transition: "color .15s" }}>
          {item.prime ? (
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--g)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", marginTop: -10 }}>{item.ic}</div>
          ) : (
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 19 }}>{item.ic}</span>
              {item.badge > 0 && <div style={{ position: "absolute", top: -4, right: -6, width: 14, height: 14, borderRadius: "50%", background: "var(--g)", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{item.badge}</div>}
            </div>
          )}
          <span style={{ fontSize: 9, letterSpacing: ".04em" }}>{item.l}</span>
        </button>
      ))}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [nav, setNav] = useState("browse");
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState(LISTINGS);
  const [trades, setTrades] = useState(TRADES_SEED);
  const [viewing, setViewing] = useState(null);
  const [proposeTo, setProposeTo] = useState(null);

  // Load saved user from localStorage on mount
  useEffect(() => {
    const saved = storage.get("bt_user");
    if (saved) { setUser(saved); setScreen("main"); }
  }, []);

  const handleSignup = form => {
    const u = {
      id: Date.now(), name: form.name, email: form.email, loc: form.loc,
      ini: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      avc: ac(Math.floor(Math.random() * 8)),
      cat: form.cat, sub: form.sub, title: form.title, desc: form.desc,
      rate: form.rate, platforms: form.platforms, b2b: form.b2b,
      certs: form.certs, taxBracket: form.taxBracket, tscore: 72, swaps: 0, rating: 0
    };
    if (form.title) {
      const nl = { id: Date.now() + 1, uid: u.id, name: u.name, ini: u.ini, avc: u.avc, cat: form.cat || "Creative", sub: form.sub, title: form.title, desc: form.desc, rate: form.rate, loc: form.loc, remote: true, verified: form.platforms.length >= 1, elite: false, b2b: form.b2b, tscore: 72, swaps: 0, rating: 0, rev: 0, saved: [], platforms: form.platforms, certs: form.certs, taxBracket: form.taxBracket, isSquad: false };
      setListings(p => [...p, nl]);
    }
    setUser(u);
    storage.set("bt_user", u);  // save to localStorage
    setScreen("main");
    setNav("browse");
  };

  const handleSave = id => {
    if (!user) return;
    setListings(p => p.map(l => {
      if (l.id !== id) return l;
      const has = l.saved?.includes(user.id);
      return { ...l, saved: has ? l.saved.filter(x => x !== user.id) : [...(l.saved || []), user.id] };
    }));
  };

  const handlePropose = l => { if (!user) { setScreen("signup"); return; } setProposeTo(l); };

  const handleSend = ({ l, svc, myH, thH, msg }) => {
    const mv = (user.rate || 75) * myH, tv = l.rate * thH, diff = tv - mv;
    setTrades(p => [{ id: Date.now(), wu: l.name, wi: l.ini, wc: l.avc, ms: `${svc} (${myH}hr)`, ts: `${l.title} (${thH}hr)`, mv, tv, topup: Math.abs(diff), tpb: diff > 0 ? "them" : diff < 0 ? "me" : null, status: "pending", plat: l.platforms[0]?.l + " · " + l.platforms[0]?.proof, time: "just now", unread: false, b2b: l.b2b, msgs: msg ? [{ from: "me", txt: msg, time: "just now" }] : [] }, ...p]);
    setProposeTo(null);
    setNav("trades");
  };

  const unread = trades.filter(t => t.unread).length;

  if (screen === "splash") return <><G /><Splash onEnter={d => { if (d === "signup") setScreen("signup"); else { setScreen("main"); setNav("browse"); } }} /></>;
  if (screen === "signup") return <><G /><Signup onDone={handleSignup} /></>;

  const renderMain = () => {
    if (viewing) return <Detail l={viewing} user={user} onBack={() => setViewing(null)} onPropose={handlePropose} />;
    switch (nav) {
      case "browse": return <Browse listings={listings} user={user} onView={setViewing} onSave={handleSave} onPropose={handlePropose} />;
      case "trades": return <Trades trades={trades} user={user} />;
      case "post": return <Post user={user} onPost={() => setNav("profile")} />;
      case "saved": return <Saved listings={listings} user={user} onView={setViewing} />;
      case "profile": return <Profile user={user} listings={listings} trades={trades} />;
      default: return null;
    }
  };

  return (
    <>
      <G />
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--bd)", padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 19, fontWeight: 800, letterSpacing: "-1px" }}>Barter<span style={{ color: "var(--g)" }}>That</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ fontSize: 11, color: "var(--g)", fontStyle: "italic", fontFamily: "var(--fd)" }}>SWAP SKILLS · BUILD COMMUNITY</div>
          {!user && <button className="btn bp bsm" onClick={() => setScreen("signup")}>join free</button>}
          {user && <Av ini={user.ini} avc={user.avc} size={30} style={{ cursor: "pointer" }} onClick={() => setNav("profile")} />}
        </div>
      </div>
      {renderMain()}
      <Nav scr={nav} onNav={s => { setViewing(null); setNav(s); }} unread={unread} />
      {proposeTo && <ProposeModal l={proposeTo} user={user} onClose={() => setProposeTo(null)} onSend={handleSend} />}
    </>
  );
}
