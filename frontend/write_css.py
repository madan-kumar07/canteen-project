import os

OUT = r"C:\Users\Madan\.gemini\antigravity\scratch\canteen_project\frontend\src\index.css"

CSS = r"""/* ===== SMARTCANTEEN v2.0 — PREMIUM DESIGN SYSTEM ===== */
/* Deep Navy + Coral Identity | Mobile-First | Premium UI */

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

/* RESET */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-tap-highlight-color:transparent}
body{font-family:var(--font-body);background:var(--bg);color:var(--text1);line-height:1.6;overflow-x:hidden;min-height:100vh}
img{max-width:100%;display:block}
button{cursor:pointer;font-family:inherit}
a{text-decoration:none;color:inherit}
input,select,textarea{font-family:inherit}

/* DESIGN TOKENS */
:root {
  --bg:#080c14;--bg2:#0b101a;--surface:#111827;--surface2:#1a2335;--surface3:#212d42;
  --glass:rgba(17,24,39,0.85);
  --coral:#ff6b35;--coral-d:#e55a26;--coral-soft:rgba(255,107,53,0.1);
  --mint:#00c853;--mint-soft:rgba(0,200,83,0.1);
  --sky:#38bdf8;--sky-soft:rgba(56,189,248,0.1);
  --amber:#fbbf24;--amber-soft:rgba(251,191,36,0.1);
  --red:#f43f5e;--red-soft:rgba(244,63,94,0.1);
  --text1:#f1f5f9;--text2:#94a3b8;--text3:#475569;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);--border3:rgba(255,255,255,0.16);
  --s1:0.25rem;--s2:0.5rem;--s3:0.75rem;--s4:1rem;--s5:1.25rem;--s6:1.5rem;--s8:2rem;--s10:2.5rem;--s12:3rem;
  --r1:6px;--r2:10px;--r3:14px;--r4:18px;--r5:24px;--rfull:999px;
  --shadow-md:0 4px 16px rgba(0,0,0,0.4);--shadow-lg:0 8px 32px rgba(0,0,0,0.5);--shadow-xl:0 16px 48px rgba(0,0,0,0.6);
  --shadow-coral:0 8px 24px rgba(255,107,53,0.35);
  --font-heading:'Plus Jakarta Sans',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --z1:10;--z-nav:100;--z-sheet:200;--z-modal:300;--z-toast:400;
  --dur-fast:150ms;--dur-base:250ms;--dur-slow:400ms;
  --ease-out:cubic-bezier(0.16,1,0.3,1);--ease-spring:cubic-bezier(0.34,1.56,0.64,1);
  --navbar-h:64px;--bottomnav-h:72px;
}

/* ANIMATIONS */
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes slide-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slide-in-left{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes scale-in{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
@keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0.7}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
@keyframes confetti-fall{0%{opacity:1;transform:translateY(-20px) rotate(0deg)}100%{opacity:0;transform:translateY(80px) rotate(360deg)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes glow-pulse{0%,100%{box-shadow:0 0 20px rgba(255,107,53,0.2)}50%{box-shadow:0 0 40px rgba(255,107,53,0.5)}}
@keyframes number-tick{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes toast-in{from{opacity:0;transform:translateX(120%)}to{opacity:1;transform:translateX(0)}}
@keyframes toast-out{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(120%)}}
@keyframes badge-pop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}

.animate-fade-in{animation:fade-in var(--dur-base) var(--ease-out) both}
.animate-slide-up{animation:slide-up var(--dur-base) var(--ease-out) both}
.animate-scale-in{animation:scale-in var(--dur-base) var(--ease-spring) both}
.stagger-1{animation-delay:60ms}.stagger-2{animation-delay:120ms}.stagger-3{animation-delay:180ms}
.stagger-4{animation-delay:240ms}.stagger-5{animation-delay:300ms}
.page-enter{animation:slide-up 0.35s var(--ease-out) both}

/* SCROLLBAR */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:var(--rfull)}

/* NAVBAR */
.navbar{position:sticky;top:0;z-index:var(--z-nav);height:var(--navbar-h);background:var(--glass);
  backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);
  border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 var(--s5);gap:var(--s3)}
.navbar-brand{display:flex;align-items:center;gap:var(--s2);font-family:var(--font-heading);
  font-weight:800;font-size:1.25rem;color:var(--coral);white-space:nowrap;cursor:pointer}
.navbar-center{flex:1;display:flex;justify-content:center}
.navbar-right{display:flex;align-items:center;gap:var(--s3);margin-left:auto}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--mint);animation:pulse-dot 2s ease-in-out infinite;flex-shrink:0}
.live-dot.offline{background:var(--red);animation:none}
.nav-cart-btn{position:relative;display:flex;align-items:center;gap:var(--s2);padding:var(--s2) var(--s3);
  border:1.5px solid var(--border2);border-radius:var(--r2);background:var(--surface2);color:var(--text1);
  font-size:0.875rem;font-weight:600;cursor:pointer;transition:all var(--dur-base) var(--ease-out)}
.nav-cart-btn.has-items{border-color:var(--coral);background:var(--coral-soft);color:var(--coral);box-shadow:var(--shadow-coral)}
.nav-cart-btn:hover{transform:translateY(-1px)}
.nav-cart-count{width:20px;height:20px;background:var(--coral);color:white;border-radius:50%;
  font-size:0.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;
  animation:badge-pop 0.3s var(--ease-spring)}
.nav-avatar{width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,var(--coral),var(--coral-d));
  color:white;font-weight:800;font-size:1rem;display:flex;align-items:center;justify-content:center;
  position:relative;cursor:pointer;border:2px solid transparent;transition:border-color var(--dur-fast)}
.nav-avatar:hover{border-color:var(--coral)}
.nav-avatar-role{position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;
  border-radius:50%;border:2px solid var(--bg)}
.nav-avatar-role.student{background:var(--mint)}.nav-avatar-role.admin{background:var(--sky)}
.nav-hamburger{width:36px;height:36px;border:none;background:none;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:5px;border-radius:var(--r1);cursor:pointer;transition:background var(--dur-fast)}
.nav-hamburger:hover{background:var(--surface2)}
.nav-hamburger span{display:block;width:18px;height:2px;background:var(--text2);border-radius:2px;
  transition:all var(--dur-base) var(--ease-out)}

/* BOTTOM NAV */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;height:var(--bottomnav-h);background:var(--glass);
  backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);
  border-top:1px solid var(--border);display:none;align-items:center;justify-content:space-around;
  z-index:var(--z-nav);padding-bottom:env(safe-area-inset-bottom,0px)}
@media(max-width:768px){.bottom-nav{display:flex}}
.bottom-nav-item{display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;padding:var(--s2);border:none;background:none;color:var(--text3);font-size:0.65rem;
  font-weight:600;transition:color var(--dur-fast);flex:1;min-width:0;position:relative;cursor:pointer}
.bottom-nav-item.active{color:var(--coral)}
.bottom-nav-item .bn-icon{font-size:1.4rem;line-height:1;transition:transform var(--dur-base) var(--ease-spring)}
.bottom-nav-item.active .bn-icon{transform:scale(1.15)}
.bottom-nav-item .bn-badge{position:absolute;top:4px;right:50%;margin-right:-20px;
  background:var(--coral);color:white;border-radius:50%;width:16px;height:16px;
  font-size:0.6rem;font-weight:800;display:flex;align-items:center;justify-content:center;
  border:2px solid var(--bg);animation:badge-pop 0.3s var(--ease-spring)}
.bn-indicator{position:absolute;top:-1px;left:50%;transform:translateX(-50%);
  width:24px;height:3px;background:var(--coral);border-radius:0 0 var(--rfull) var(--rfull)}
@media(max-width:768px){.bottom-nav-page-pad{padding-bottom:calc(var(--bottomnav-h) + 1rem)}}

/* SIDEBAR */
.sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);
  z-index:var(--z-sheet);opacity:0;pointer-events:none;transition:opacity var(--dur-base) var(--ease-out)}
.sidebar-overlay.open{opacity:1;pointer-events:all}
.sidebar{position:fixed;top:0;left:0;bottom:0;width:300px;max-width:85vw;background:var(--surface);
  border-right:1px solid var(--border);z-index:calc(var(--z-sheet) + 1);transform:translateX(-100%);
  transition:transform var(--dur-slow) var(--ease-out);display:flex;flex-direction:column;
  overflow-y:auto;box-shadow:var(--shadow-xl)}
.sidebar.open{transform:translateX(0)}
.sidebar-profile{padding:2.5rem var(--s5) var(--s5);
  background:linear-gradient(180deg,rgba(255,107,53,0.1) 0%,transparent 100%);
  border-bottom:1px solid var(--border);display:flex;align-items:center;gap:var(--s4)}
.sidebar-avatar{width:56px;height:56px;border-radius:50%;
  background:linear-gradient(135deg,var(--coral),var(--coral-d));
  color:white;font-weight:900;font-size:1.5rem;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;border:3px solid var(--coral-soft)}
.sidebar-name{font-family:var(--font-heading);font-weight:700;font-size:1rem}
.sidebar-role{font-size:0.75rem;color:var(--coral);font-weight:600;margin-top:2px}
.sidebar-menu{padding:var(--s3) 0;flex:1}
.sidebar-item{width:100%;display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--s5);
  border:none;background:none;color:var(--text2);font-size:0.9rem;font-weight:500;
  cursor:pointer;text-align:left;transition:all var(--dur-fast)}
.sidebar-item:hover,.sidebar-item.active{background:var(--coral-soft);color:var(--coral)}
.sidebar-item .si-icon{font-size:1.2rem;flex-shrink:0}
.sidebar-item .si-badge{margin-left:auto;margin-right:var(--s2);background:var(--coral-soft);
  color:var(--coral);font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:var(--rfull)}
.sidebar-divider{border:none;border-top:1px solid var(--border);margin:var(--s2) 0}
.sidebar-logout{margin:var(--s4) var(--s5);padding:var(--s3);border-radius:var(--r3);
  background:var(--red-soft);border:1.5px solid rgba(244,63,94,0.2);color:var(--red);
  font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;
  gap:var(--s2);cursor:pointer;transition:all var(--dur-fast)}
.sidebar-logout:hover{background:var(--red);color:white}

/* TOASTS */
.toast-container{position:fixed;top:calc(var(--navbar-h) + 1rem);right:1rem;z-index:var(--z-toast);
  display:flex;flex-direction:column;gap:var(--s2);pointer-events:none}
.toast{display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--s4);
  border-radius:var(--r3);background:var(--surface);border:1px solid var(--border2);
  box-shadow:var(--shadow-lg);min-width:280px;max-width:360px;pointer-events:all;
  animation:toast-in 0.4s var(--ease-out) both;backdrop-filter:blur(16px)}
.toast.out{animation:toast-out 0.3s var(--ease-out) both}
.toast-icon{font-size:1.4rem;flex-shrink:0}
.toast-body{flex:1}
.toast-title{font-weight:700;font-size:0.875rem}
.toast-msg{font-size:0.8rem;color:var(--text2);margin-top:2px}
.toast-close{color:var(--text3);background:none;border:none;font-size:1rem;cursor:pointer;flex-shrink:0}
.toast.success{border-color:rgba(0,200,83,0.3)}
.toast.error{border-color:rgba(244,63,94,0.3)}
.toast.info{border-color:rgba(56,189,248,0.3)}
.toast.order{border-color:var(--coral);background:rgba(255,107,53,0.08)}

/* SKELETON */
.skeleton{background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);
  background-size:200% 100%;animation:shimmer 1.5s ease-in-out infinite;border-radius:var(--r2)}
.skeleton-text{height:14px;margin-bottom:var(--s2)}
.skeleton-title{height:20px;margin-bottom:var(--s3);width:60%}
.skeleton-img{height:100px;border-radius:var(--r3)}
.food-card-skeleton{background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r4);padding:var(--s4);display:flex;gap:var(--s4)}

/* SEARCH */
.search-wrap{position:relative;flex:1;max-width:520px}
.search-input-row{display:flex;align-items:center;background:var(--surface2);
  border:1.5px solid var(--border2);border-radius:var(--rfull);padding:var(--s2) var(--s4);
  gap:var(--s2);transition:all var(--dur-base) var(--ease-out)}
.search-input-row:focus-within{border-color:var(--coral);background:var(--surface);
  box-shadow:0 0 0 3px var(--coral-soft)}
.search-icon{color:var(--text3);font-size:1.1rem;flex-shrink:0}
.search-input{flex:1;border:none;background:none;color:var(--text1);font-size:0.9rem;outline:none}
.search-input::placeholder{color:var(--text3)}
.search-clear{color:var(--text3);background:none;border:none;font-size:1.1rem;cursor:pointer}
.search-dropdown{position:absolute;top:calc(100% + 8px);left:0;right:0;background:var(--surface);
  border:1px solid var(--border2);border-radius:var(--r4);box-shadow:var(--shadow-lg);
  overflow:hidden;animation:scale-in var(--dur-fast) var(--ease-out);z-index:var(--z1);
  max-height:400px;overflow-y:auto}
.search-dropdown-section{padding:var(--s3) var(--s4) var(--s1)}
.search-dropdown-label{font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px}
.search-result-item{display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--s4);cursor:pointer;transition:background var(--dur-fast)}
.search-result-item:hover{background:var(--surface2)}
.search-result-name{font-weight:600;font-size:0.875rem}
.search-result-cat{font-size:0.75rem;color:var(--text3)}
.search-result-price{margin-left:auto;font-weight:700;font-size:0.875rem;color:var(--coral);font-family:var(--font-mono)}
.trending-chip{display:inline-flex;align-items:center;gap:var(--s1);background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--rfull);padding:var(--s1) var(--s3);
  font-size:0.8rem;font-weight:500;cursor:pointer;transition:all var(--dur-fast);margin:var(--s1)}
.trending-chip:hover{border-color:var(--coral);color:var(--coral)}

/* FILTERS */
.filter-row{display:flex;align-items:center;gap:var(--s2);overflow-x:auto;padding:var(--s1) 0;scrollbar-width:none}
.filter-row::-webkit-scrollbar{display:none}
.filter-chip{display:inline-flex;align-items:center;gap:var(--s1);padding:var(--s2) var(--s4);
  border-radius:var(--rfull);border:1.5px solid var(--border2);background:var(--surface2);
  color:var(--text2);font-size:0.82rem;font-weight:500;white-space:nowrap;cursor:pointer;
  transition:all var(--dur-fast);flex-shrink:0}
.filter-chip.active{border-color:var(--coral);background:var(--coral-soft);color:var(--coral)}
.filter-chip:hover:not(.active){border-color:var(--border3);color:var(--text1)}

/* CATEGORY SCROLL */
.cat-scroll{display:flex;gap:var(--s3);overflow-x:auto;padding:var(--s1) 0 var(--s2);scrollbar-width:none}
.cat-scroll::-webkit-scrollbar{display:none}
.cat-card{display:flex;flex-direction:column;align-items:center;gap:var(--s2);flex-shrink:0;
  background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r4);
  padding:var(--s3) var(--s4);min-width:80px;cursor:pointer;transition:all var(--dur-base) var(--ease-out)}
.cat-card:hover,.cat-card.active{border-color:var(--coral);background:var(--coral-soft);
  transform:translateY(-2px);box-shadow:var(--shadow-coral)}
.cat-card-emoji{width:44px;height:44px;border-radius:var(--r3);display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.cat-card-name{font-size:0.72rem;font-weight:600;text-align:center;color:var(--text2)}
.cat-card.active .cat-card-name{color:var(--coral)}

/* STICKY CAT TABS */
.cat-tabs-wrap{position:sticky;top:var(--navbar-h);z-index:var(--z1);background:var(--glass);
  backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 var(--s4)}
.cat-tabs{display:flex;gap:var(--s1);overflow-x:auto;scrollbar-width:none;padding:var(--s2) 0}
.cat-tab{display:flex;align-items:center;gap:var(--s1);padding:var(--s2) var(--s3);border:none;
  background:none;color:var(--text3);font-size:0.82rem;font-weight:600;white-space:nowrap;
  cursor:pointer;border-radius:var(--r2);transition:all var(--dur-fast);flex-shrink:0}
.cat-tab:hover{color:var(--text1);background:var(--surface2)}
.cat-tab.active{color:var(--coral);background:var(--coral-soft)}

/* SECTION HEADERS */
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s4)}
.section-title{font-family:var(--font-heading);font-size:1.1rem;font-weight:800;color:var(--text1)}
.section-subtitle{font-size:0.78rem;color:var(--text3);margin-top:2px}
.section-action{font-size:0.82rem;font-weight:600;color:var(--coral);background:none;border:none;cursor:pointer}

/* HERO */
.hero{padding:var(--s8) var(--s5) var(--s5);background:linear-gradient(180deg,rgba(255,107,53,0.04) 0%,transparent 100%)}
.hero-greeting{font-size:0.9rem;color:var(--text3);margin-bottom:var(--s1)}
.hero-title{font-family:var(--font-heading);font-size:clamp(1.5rem,4vw,2.2rem);font-weight:900;line-height:1.2;margin-bottom:var(--s2)}
.hero-title span{color:var(--coral)}
.hero-sub{font-size:0.875rem;color:var(--text2);margin-bottom:var(--s4)}
.hero-art{font-size:3.5rem;animation:float 4s ease-in-out infinite}

/* FOOD CARDS */
.food-grid{display:flex;flex-direction:column;gap:var(--s3)}
.food-card{display:flex;align-items:center;gap:var(--s4);background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r4);padding:var(--s4);transition:all var(--dur-base) var(--ease-out);
  position:relative;overflow:hidden}
.food-card:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:var(--shadow-md)}
.food-card.sold-out{opacity:0.6}
.food-card-info{flex:1;min-width:0;position:relative;z-index:1}
.food-card-badges{display:flex;align-items:center;gap:var(--s1);flex-wrap:wrap;margin-bottom:var(--s2)}
.fc-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:var(--rfull);font-size:0.68rem;font-weight:700;white-space:nowrap}
.fc-badge.veg{background:var(--mint-soft);color:var(--mint);border:1px solid rgba(0,200,83,0.2)}
.fc-badge.non-veg{background:var(--red-soft);color:var(--red);border:1px solid rgba(244,63,94,0.2)}
.fc-badge.best{background:var(--amber-soft);color:var(--amber);border:1px solid rgba(251,191,36,0.2)}
.fc-badge.sold-out-b{background:var(--surface3);color:var(--text3)}
.fc-badge.new{background:var(--sky-soft);color:var(--sky);border:1px solid rgba(56,189,248,0.2)}
.food-card-name{font-family:var(--font-heading);font-size:0.95rem;font-weight:700;color:var(--text1);
  margin-bottom:var(--s1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.food-card-meta{display:flex;align-items:center;gap:var(--s3);font-size:0.78rem;color:var(--text3);margin-bottom:var(--s2)}
.fc-rating{display:flex;align-items:center;gap:3px;color:var(--amber);font-weight:600}
.fc-dot{width:3px;height:3px;background:var(--text3);border-radius:50%}
.food-card-price{font-family:var(--font-mono);font-size:1.05rem;font-weight:700;color:var(--text1)}
.price-original{font-size:0.8rem;text-decoration:line-through;color:var(--text3);margin-left:var(--s2);font-family:var(--font-body)}
.food-card-img-wrap{position:relative;flex-shrink:0;width:110px;height:100px}
.food-card-img{width:100%;height:100%;object-fit:cover;border-radius:var(--r3)}
.food-card-img-ph{width:100%;height:100%;border-radius:var(--r3);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:2rem}
.food-card-img.dimmed{filter:grayscale(1);opacity:0.5}
.sold-out-overlay{position:absolute;inset:0;background:rgba(8,12,20,0.6);border-radius:var(--r3);display:flex;align-items:center;justify-content:center}
.sold-out-label{background:var(--red);color:white;font-size:0.65rem;font-weight:800;padding:2px 8px;border-radius:var(--rfull);transform:rotate(-15deg)}

.qty-ctrl{display:flex;align-items:center;background:var(--surface2);border:1.5px solid var(--coral);border-radius:var(--rfull);overflow:hidden}
.qty-btn{width:30px;height:30px;border:none;background:none;color:var(--coral);font-size:1.1rem;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background var(--dur-fast);flex-shrink:0}
.qty-btn:hover{background:var(--coral-soft)}
.qty-num{min-width:28px;text-align:center;font-weight:800;font-size:0.9rem;color:var(--text1)}
.add-btn{display:flex;align-items:center;gap:var(--s1);padding:var(--s2) var(--s3);background:transparent;
  border:1.5px solid var(--coral);border-radius:var(--rfull);color:var(--coral);font-weight:700;
  font-size:0.85rem;cursor:pointer;transition:all var(--dur-fast);position:relative;overflow:hidden}
.add-btn:hover{background:var(--coral);color:white}
.add-btn-not-avail{padding:var(--s2) var(--s3);background:var(--surface3);border-radius:var(--rfull);font-size:0.75rem;color:var(--text3);font-weight:600}

/* SPECIAL SCROLL */
.special-scroll{display:flex;gap:var(--s3);overflow-x:auto;scrollbar-width:none;padding-bottom:var(--s2)}
.special-scroll::-webkit-scrollbar{display:none}
.special-card{flex-shrink:0;width:160px;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r4);overflow:hidden;cursor:pointer;transition:all var(--dur-base) var(--ease-out)}
.special-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md);border-color:var(--border2)}
.special-img{width:100%;height:110px;object-fit:cover}
.special-img-ph{width:100%;height:110px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:2.5rem}
.special-body{padding:var(--s3)}
.special-tag{display:inline-block;background:var(--coral);color:white;font-size:0.62rem;font-weight:800;padding:2px 7px;border-radius:var(--rfull);margin-bottom:var(--s1)}
.special-name{font-weight:700;font-size:0.82rem;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.special-price{font-family:var(--font-mono);font-weight:700;color:var(--coral);font-size:0.875rem}
.special-add{width:100%;margin-top:var(--s2);padding:var(--s2);border-radius:var(--r2);background:var(--coral-soft);border:1px solid var(--coral);color:var(--coral);font-weight:700;font-size:0.78rem;cursor:pointer;transition:all var(--dur-fast)}
.special-add:hover{background:var(--coral);color:white}

/* CATEGORY SECTION */
.cat-section{padding-top:var(--s6)}
.cat-section-head{display:flex;align-items:center;gap:var(--s3);margin-bottom:var(--s4);padding-bottom:var(--s3);border-bottom:1px solid var(--border)}
.cat-section-emoji{width:44px;height:44px;border-radius:var(--r3);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
.cat-section-title{font-family:var(--font-heading);font-weight:800;font-size:1.1rem}
.cat-section-sub{font-size:0.75rem;color:var(--text3);margin-top:2px}

/* RUSH INDICATOR */
.rush-pill{display:inline-flex;align-items:center;gap:var(--s2);padding:var(--s2) var(--s4);border-radius:var(--rfull);border:1.5px solid;font-size:0.8rem;font-weight:600}
.rush-dot{width:8px;height:8px;border-radius:50%;animation:pulse-dot 2s ease-in-out infinite}

/* CART PAGE */
.cart-page{min-height:100vh;background:var(--bg)}
.cart-header{display:flex;align-items:center;justify-content:space-between;padding:var(--s4) var(--s5);
  background:var(--glass);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);
  position:sticky;top:var(--navbar-h);z-index:var(--z1)}
.cart-back-btn{display:flex;align-items:center;gap:var(--s2);background:var(--surface2);border:1.5px solid var(--border2);color:var(--text1);padding:var(--s2) var(--s3);border-radius:var(--r2);font-weight:600;font-size:0.875rem;cursor:pointer;transition:all var(--dur-fast)}
.cart-back-btn:hover{border-color:var(--coral);color:var(--coral)}
.cart-header-title{font-family:var(--font-heading);font-size:1.1rem;font-weight:800}
.cart-header-sub{font-size:0.75rem;color:var(--text2)}
.cart-clear{background:none;border:none;color:var(--red);font-weight:600;font-size:0.82rem;cursor:pointer}
.cart-body{display:grid;grid-template-columns:1fr 360px;gap:var(--s6);padding:var(--s6);max-width:1100px;margin:0 auto}
@media(max-width:860px){.cart-body{grid-template-columns:1fr;padding:var(--s4)}}
.cart-section{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);padding:var(--s5);margin-bottom:var(--s4)}
.cart-section-title{font-size:0.82rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--s4)}
.cart-item{display:flex;align-items:center;gap:var(--s4);padding:var(--s4) 0;border-bottom:1px solid var(--border)}
.cart-item:last-child{border-bottom:none;padding-bottom:0}
.cart-item:first-child{padding-top:0}
.cart-item-info{flex:1;min-width:0}
.cart-item-name{font-weight:600;font-size:0.925rem}
.cart-item-unit{font-size:0.78rem;color:var(--text3);margin-top:2px}
.cart-item-total{font-family:var(--font-mono);font-weight:700;color:var(--text1)}

/* BILL */
.bill-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);padding:var(--s5);position:sticky;top:140px}
.bill-title{font-family:var(--font-heading);font-size:1rem;font-weight:800;margin-bottom:var(--s4)}
.bill-rows{display:flex;flex-direction:column;gap:var(--s2);margin-bottom:var(--s3)}
.bill-row{display:flex;justify-content:space-between;font-size:0.875rem;color:var(--text2)}
.bill-row.discount{color:var(--mint)}
.bill-row.total{font-size:1rem;font-weight:800;color:var(--text1);margin-top:var(--s1)}
.bill-divider{border:none;border-top:1px dashed var(--border2);margin:var(--s3) 0}
.bill-savings{background:var(--mint-soft);border:1px solid rgba(0,200,83,0.2);border-radius:var(--r2);padding:var(--s2) var(--s3);font-size:0.78rem;color:var(--mint);font-weight:600;text-align:center;margin-top:var(--s3)}

/* PICKUP */
.pickup-label{font-size:0.82rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--s3)}
.pickup-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--s2)}
.pickup-slot{padding:var(--s2) var(--s3);background:var(--surface2);border:1.5px solid var(--border2);color:var(--text2);border-radius:var(--r2);font-size:0.72rem;font-weight:500;cursor:pointer;transition:all var(--dur-fast);text-align:center;line-height:1.4}
.pickup-slot.active{background:var(--coral-soft);border-color:var(--coral);color:var(--coral);font-weight:700}

/* PAYMENT */
.pay-methods{display:grid;grid-template-columns:1fr 1fr;gap:var(--s2);margin-bottom:var(--s4)}
.pay-btn{display:flex;align-items:center;gap:var(--s2);padding:var(--s3);border-radius:var(--r3);border:1.5px solid var(--border2);background:var(--surface2);cursor:pointer;transition:all var(--dur-fast);text-align:left;position:relative}
.pay-btn.active{border-color:var(--coral);background:var(--coral-soft)}
.pay-btn-icon{font-size:1.4rem;flex-shrink:0}
.pay-btn-title{font-size:0.82rem;font-weight:700;color:var(--text1)}
.pay-btn-sub{font-size:0.68rem;color:var(--text3)}
.pay-btn-check{position:absolute;top:6px;right:8px;color:var(--coral);font-weight:900}
.pay-secure{font-size:0.7rem;color:var(--text3);text-align:center;margin-top:var(--s2)}

/* PLACE ORDER */
.place-order-btn{width:100%;padding:var(--s4);border:none;border-radius:var(--r3);
  background:linear-gradient(135deg,var(--coral),var(--coral-d));color:white;
  font-family:var(--font-heading);font-weight:800;font-size:1rem;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:var(--s2);
  box-shadow:var(--shadow-coral);transition:all var(--dur-base) var(--ease-out);min-height:52px}
.place-order-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 32px rgba(255,107,53,0.5)}
.place-order-btn:disabled{opacity:0.5;cursor:not-allowed}

/* PROMO */
.promo-row{display:flex;gap:var(--s2)}
.promo-input{flex:1;padding:var(--s3) var(--s4);background:var(--surface2);border:1.5px solid var(--border2);color:var(--text1);border-radius:var(--r2);font-size:0.9rem;transition:border-color var(--dur-fast)}
.promo-input:focus{outline:none;border-color:var(--coral)}
.promo-apply{padding:var(--s3) var(--s4);background:var(--coral);border:none;border-radius:var(--r2);color:white;font-weight:700;cursor:pointer}
.promo-applied{padding:var(--s3) var(--s4);background:var(--mint-soft);border:1.5px solid rgba(0,200,83,0.2);border-radius:var(--r2);color:var(--mint);font-weight:600;font-size:0.875rem}

/* CART EMPTY */
.cart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;padding:var(--s8);text-align:center}
.cart-empty-art{font-size:5rem;animation:float 4s ease-in-out infinite;margin-bottom:var(--s5)}
.cart-empty-title{font-family:var(--font-heading);font-size:1.4rem;font-weight:800;margin-bottom:var(--s2)}
.cart-empty-sub{color:var(--text2);margin-bottom:var(--s6)}

/* RECS */
.rec-list{display:flex;flex-direction:column;gap:var(--s2)}
.rec-card{display:flex;justify-content:space-between;align-items:center;background:var(--surface2);border-radius:var(--r2);padding:var(--s3)}
.rec-name{font-weight:600;font-size:0.875rem}
.rec-price{font-size:0.8rem;color:var(--coral);font-weight:600;margin-top:2px;font-family:var(--font-mono)}
.rec-add{padding:var(--s1) var(--s3);background:var(--coral-soft);border:1.5px solid var(--coral);color:var(--coral);border-radius:var(--r2);font-weight:700;font-size:0.8rem;cursor:pointer;transition:all var(--dur-fast)}
.rec-add:hover{background:var(--coral);color:white}

/* ORDER DETAIL */
.order-page{min-height:100vh}
.order-page-header{padding:var(--s5);background:linear-gradient(180deg,rgba(255,107,53,0.08) 0%,transparent 100%);border-bottom:1px solid var(--border)}
.order-page-top{display:flex;align-items:center;gap:var(--s4);margin-bottom:var(--s4)}
.order-token-big{font-family:var(--font-heading);font-size:3rem;font-weight:900;color:var(--coral);line-height:1}
.order-id-mono{font-family:var(--font-mono);font-size:0.8rem;color:var(--text3);margin-top:4px}

/* TIMELINE */
.timeline{padding:var(--s5) 0}
.timeline-step{display:flex;align-items:flex-start;gap:var(--s4);padding-bottom:var(--s5);position:relative}
.timeline-step:last-child{padding-bottom:0}
.timeline-step:last-child .tl-line{display:none}
.tl-icon-wrap{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;position:relative;z-index:1;border:2px solid var(--border);background:var(--surface);transition:all var(--dur-slow) var(--ease-out)}
.tl-icon-wrap.done{background:var(--mint);border-color:var(--mint);box-shadow:0 0 16px rgba(0,200,83,0.4)}
.tl-icon-wrap.active{background:var(--coral-soft);border-color:var(--coral);box-shadow:var(--shadow-coral);animation:glow-pulse 2s ease-in-out infinite}
.tl-icon-wrap.pending{opacity:0.4}
.tl-line{position:absolute;left:19px;top:44px;width:2px;bottom:0;background:var(--border2);transition:background var(--dur-slow)}
.tl-line.done{background:var(--mint)}
.tl-content{flex:1;padding-top:var(--s1)}
.tl-status{font-weight:700;font-size:0.95rem}
.tl-status.done{color:var(--mint)}.tl-status.active{color:var(--coral)}.tl-status.pending{color:var(--text3)}
.tl-desc{font-size:0.78rem;color:var(--text3);margin-top:2px}
.tl-time{font-size:0.72rem;color:var(--text3);margin-top:4px;font-family:var(--font-mono)}

/* ORDER ACTIONS */
.order-actions{display:flex;gap:var(--s2);flex-wrap:wrap;padding:var(--s4) 0}
.order-action-btn{display:flex;align-items:center;gap:var(--s2);padding:var(--s2) var(--s4);border-radius:var(--rfull);font-weight:600;font-size:0.82rem;cursor:pointer;transition:all var(--dur-fast);border:1.5px solid var(--border2);background:var(--surface2);color:var(--text1)}
.order-action-btn:hover{border-color:var(--coral);color:var(--coral)}
.order-action-btn.danger{border-color:rgba(244,63,94,0.3);color:var(--red)}
.order-action-btn.danger:hover{background:var(--red);color:white}

/* QR CARD */
.qr-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);padding:var(--s5);text-align:center}
.qr-img{width:160px;height:160px;margin:0 auto var(--s3);border-radius:var(--r3);border:3px solid white}
.qr-label{font-size:0.78rem;color:var(--text3)}
.qr-id{font-family:var(--font-mono);font-size:0.82rem;margin-top:var(--s1);color:var(--text2)}

/* ORDER HISTORY */
.history-tabs{display:flex;gap:var(--s2);padding:var(--s4) var(--s5);border-bottom:1px solid var(--border)}
.history-tab{padding:var(--s2) var(--s4);border-radius:var(--rfull);border:1.5px solid var(--border2);background:var(--surface2);color:var(--text2);font-weight:600;font-size:0.85rem;cursor:pointer;transition:all var(--dur-fast)}
.history-tab.active{border-color:var(--coral);background:var(--coral-soft);color:var(--coral)}
.history-list{padding:var(--s4) var(--s5);display:flex;flex-direction:column;gap:var(--s3)}
.history-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);overflow:hidden;transition:all var(--dur-base);cursor:pointer}
.history-card:hover{border-color:var(--border2);box-shadow:var(--shadow-md)}
.history-card-head{display:flex;align-items:center;justify-content:space-between;padding:var(--s4)}
.history-token{font-family:var(--font-heading);font-size:1.5rem;font-weight:900;color:var(--coral)}
.history-status-badge{padding:4px 12px;border-radius:var(--rfull);font-size:0.75rem;font-weight:700}
.history-items-row{padding:0 var(--s4) var(--s3);display:flex;flex-wrap:wrap;gap:var(--s1)}
.history-chip{background:var(--surface2);border-radius:var(--rfull);padding:3px 10px;font-size:0.75rem;color:var(--text2)}
.history-card-foot{display:flex;justify-content:space-between;align-items:center;padding:var(--s3) var(--s4);border-top:1px solid var(--border);background:var(--surface2)}
.history-meta{font-size:0.75rem;color:var(--text3)}
.history-total{font-family:var(--font-mono);font-weight:700;color:var(--coral)}
.ready-alert{margin:0 var(--s4) var(--s3);padding:var(--s2) var(--s3);background:var(--mint-soft);border:1px solid rgba(0,200,83,0.3);border-radius:var(--r2);color:var(--mint);font-weight:700;font-size:0.82rem;animation:glow-pulse 2s ease-in-out infinite}

/* PROFILE */
.profile-page{max-width:640px;margin:0 auto;padding:var(--s5)}
.profile-hero{text-align:center;padding:var(--s8) 0 var(--s6);border-bottom:1px solid var(--border);margin-bottom:var(--s5)}
.profile-avatar{width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,var(--coral),var(--coral-d));color:white;font-weight:900;font-size:2.5rem;display:flex;align-items:center;justify-content:center;margin:0 auto var(--s3);border:4px solid var(--coral-soft);box-shadow:var(--shadow-coral)}
.profile-name{font-family:var(--font-heading);font-size:1.4rem;font-weight:800}
.profile-role{color:var(--coral);font-size:0.85rem;font-weight:600;margin-top:var(--s1)}
.profile-section{margin-bottom:var(--s5)}
.profile-section-title{font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:var(--s3)}
.profile-item{display:flex;align-items:center;gap:var(--s3);padding:var(--s4);background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);margin-bottom:var(--s2);cursor:pointer;transition:all var(--dur-fast)}
.profile-item:hover{border-color:var(--border2);background:var(--surface2)}
.profile-item-icon{font-size:1.3rem;flex-shrink:0}
.profile-item-label{font-weight:600;font-size:0.9rem}
.profile-item-sub{font-size:0.75rem;color:var(--text3);margin-top:2px}
.profile-item-arrow{margin-left:auto;color:var(--text3)}
.profile-logout{width:100%;padding:var(--s4);border-radius:var(--r3);background:var(--red-soft);border:1.5px solid rgba(244,63,94,0.2);color:var(--red);font-weight:700;font-size:0.9rem;cursor:pointer;transition:all var(--dur-fast);margin-top:var(--s6)}
.profile-logout:hover{background:var(--red);color:white}

/* LOGIN */
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden}
.login-bg-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.login-bg-orb-1{width:400px;height:400px;background:rgba(255,107,53,0.12);top:-100px;right:-100px}
.login-bg-orb-2{width:300px;height:300px;background:rgba(0,200,83,0.06);bottom:-80px;left:-80px}
.login-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r5);padding:var(--s8);width:100%;max-width:420px;box-shadow:var(--shadow-xl);position:relative;z-index:1;animation:scale-in 0.5s var(--ease-spring) both}
.login-logo{display:flex;align-items:center;justify-content:center;gap:var(--s2);font-family:var(--font-heading);font-weight:900;font-size:1.8rem;color:var(--coral);margin-bottom:var(--s6)}
.login-logo-icon{font-size:2.2rem;animation:wiggle 3s ease-in-out infinite}
.login-title{font-family:var(--font-heading);font-size:1.4rem;font-weight:800;margin-bottom:var(--s1)}
.login-sub{font-size:0.875rem;color:var(--text2);margin-bottom:var(--s6)}
.form-group{margin-bottom:var(--s4)}
.form-label{display:block;font-size:0.82rem;font-weight:600;color:var(--text2);margin-bottom:var(--s2)}
.form-input{width:100%;padding:var(--s3) var(--s4);background:var(--surface2);border:1.5px solid var(--border2);color:var(--text1);border-radius:var(--r3);font-size:0.9rem;transition:all var(--dur-fast)}
.form-input:focus{outline:none;border-color:var(--coral);box-shadow:0 0 0 3px var(--coral-soft)}
.form-input.error{border-color:var(--red)}
.form-error{font-size:0.75rem;color:var(--red);margin-top:var(--s1)}
.login-btn{width:100%;padding:var(--s4);background:linear-gradient(135deg,var(--coral),var(--coral-d));border:none;border-radius:var(--r3);color:white;font-weight:800;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:var(--s2);box-shadow:var(--shadow-coral);transition:all var(--dur-base) var(--ease-out);margin-top:var(--s5);min-height:52px}
.login-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 32px rgba(255,107,53,0.5)}
.login-btn:disabled{opacity:0.6;cursor:not-allowed}
.login-creds{margin-top:var(--s4);padding:var(--s3) var(--s4);background:var(--surface2);border-radius:var(--r2);font-size:0.78rem;color:var(--text3);line-height:2}
.login-cred{display:flex;align-items:center;gap:var(--s2)}
.spinner{width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;animation:spin 0.7s linear infinite}

/* ADMIN */
.admin-page{min-height:100vh}
.admin-header{display:flex;align-items:center;justify-content:space-between;padding:var(--s4) var(--s5);flex-wrap:wrap;gap:var(--s3);border-bottom:1px solid var(--border);background:var(--surface)}
.admin-title{font-family:var(--font-heading);font-size:1.4rem;font-weight:900}
.admin-sub{font-size:0.8rem;color:var(--text2);display:flex;align-items:center;gap:var(--s2)}
.admin-actions{display:flex;gap:var(--s2);flex-wrap:wrap}
.admin-tabs{display:flex;gap:var(--s1);padding:var(--s3) var(--s5);border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none;background:var(--surface);position:sticky;top:0;z-index:var(--z1)}
.admin-tab{display:flex;align-items:center;gap:var(--s2);padding:var(--s2) var(--s4);border-radius:var(--rfull);border:1.5px solid transparent;background:none;color:var(--text3);font-weight:600;font-size:0.85rem;cursor:pointer;white-space:nowrap;transition:all var(--dur-fast)}
.admin-tab:hover{color:var(--text1);background:var(--surface2)}
.admin-tab.active{border-color:var(--coral);background:var(--coral-soft);color:var(--coral)}
.admin-tab-badge{background:var(--coral);color:white;border-radius:50%;width:18px;height:18px;font-size:0.65rem;font-weight:800;display:flex;align-items:center;justify-content:center}
.admin-content{padding:var(--s5)}

/* STAT CARDS */
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--s4);margin-bottom:var(--s6)}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);padding:var(--s5);transition:all var(--dur-base);position:relative;overflow:hidden}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:var(--r4) var(--r4) 0 0}
.stat-card.coral::before{background:var(--coral)}.stat-card.mint::before{background:var(--mint)}
.stat-card.sky::before{background:var(--sky)}.stat-card.amber::before{background:var(--amber)}
.stat-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
.stat-icon{font-size:2rem;margin-bottom:var(--s3)}
.stat-value{font-family:var(--font-heading);font-size:2rem;font-weight:900;color:var(--text1);line-height:1;animation:number-tick 0.4s var(--ease-out)}
.stat-label{font-size:0.8rem;color:var(--text3);margin-top:var(--s1);font-weight:500}
.stat-change{font-size:0.75rem;margin-top:var(--s2);font-weight:600}
.stat-change.up{color:var(--mint)}.stat-change.neutral{color:var(--text3)}

/* KANBAN */
.kanban{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--s4)}
@media(max-width:1200px){.kanban{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.kanban{grid-template-columns:1fr}}
.kanban-col{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);overflow:hidden}
.kanban-col-head{padding:var(--s3) var(--s4);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.kanban-col-title{font-weight:700;font-size:0.875rem;display:flex;align-items:center;gap:var(--s2)}
.kanban-col-count{background:var(--surface2);border-radius:var(--rfull);padding:2px 8px;font-size:0.72rem;font-weight:700;color:var(--text2)}
.kanban-cards{padding:var(--s3);display:flex;flex-direction:column;gap:var(--s3);min-height:80px}
.k-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r3);padding:var(--s3);animation:slide-up var(--dur-base) var(--ease-out)}
.k-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s2)}
.k-token{font-family:var(--font-heading);font-weight:900;font-size:1.2rem;color:var(--coral)}
.k-time{font-size:0.68rem;color:var(--text3);font-family:var(--font-mono)}
.k-items{font-size:0.78rem;color:var(--text2);margin-bottom:var(--s2);line-height:1.5}
.k-price{font-family:var(--font-mono);font-weight:700;font-size:0.875rem;color:var(--text1)}
.k-actions{display:flex;gap:var(--s1);margin-top:var(--s3)}
.k-btn{flex:1;padding:var(--s1) var(--s2);border-radius:var(--r2);font-size:0.72rem;font-weight:700;border:none;cursor:pointer;transition:all var(--dur-fast)}
.k-btn.advance{background:var(--coral);color:white}.k-btn.advance:hover{background:var(--coral-d)}
.k-btn.view{background:var(--surface3);color:var(--text2)}.k-btn.view:hover{color:var(--text1)}
.k-col-pending .kanban-col-head{border-top:3px solid var(--amber)}
.k-col-preparing .kanban-col-head{border-top:3px solid var(--sky)}
.k-col-ready .kanban-col-head{border-top:3px solid var(--mint)}
.k-col-complete .kanban-col-head{border-top:3px solid var(--text3)}

/* ADMIN BUTTONS */
.admin-btn{display:flex;align-items:center;gap:var(--s2);padding:var(--s2) var(--s4);border-radius:var(--r2);font-size:0.82rem;font-weight:600;cursor:pointer;border:1.5px solid var(--border2);background:var(--surface2);color:var(--text1);transition:all var(--dur-fast)}
.admin-btn:hover{border-color:var(--border3);background:var(--surface3)}
.admin-btn.primary{background:var(--coral);border-color:var(--coral);color:white}.admin-btn.primary:hover{background:var(--coral-d)}
.admin-btn.danger{border-color:rgba(244,63,94,0.3);color:var(--red)}.admin-btn.danger:hover{background:var(--red);color:white}

/* ACTIVITY FEED */
.activity-feed{display:flex;flex-direction:column;gap:0}
.activity-item{display:flex;align-items:flex-start;gap:var(--s3);padding:var(--s3) 0;border-bottom:1px solid var(--border);animation:slide-in-left var(--dur-base) var(--ease-out)}
.activity-dot{width:8px;height:8px;border-radius:50%;margin-top:6px;flex-shrink:0}
.activity-text{font-size:0.82rem;flex:1}
.activity-time{font-size:0.72rem;color:var(--text3);font-family:var(--font-mono)}

/* MENU ADMIN */
.menu-grid-admin{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--s4)}
.menu-admin-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);overflow:hidden;transition:all var(--dur-base)}
.menu-admin-card:hover{border-color:var(--border2)}
.menu-admin-img{width:100%;height:140px;object-fit:cover}
.menu-admin-img-ph{width:100%;height:140px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:3rem}
.menu-admin-body{padding:var(--s3)}
.menu-admin-name{font-weight:700;font-size:0.9rem;margin-bottom:var(--s1)}
.menu-admin-price{font-family:var(--font-mono);color:var(--coral);font-weight:700;font-size:0.875rem}
.menu-admin-cat{font-size:0.72rem;color:var(--text3);margin-top:2px}
.menu-admin-foot{display:flex;align-items:center;justify-content:space-between;padding:var(--s3);border-top:1px solid var(--border)}
.toggle-switch{width:44px;height:24px;border-radius:var(--rfull);background:var(--surface3);border:none;cursor:pointer;position:relative;transition:background var(--dur-base)}
.toggle-switch.on{background:var(--mint)}
.toggle-switch::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:white;transition:transform var(--dur-base) var(--ease-out)}
.toggle-switch.on::after{transform:translateX(20px)}
.menu-delete-btn{background:none;border:none;color:var(--red);font-size:1.1rem;cursor:pointer;padding:var(--s1)}
.add-form{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);padding:var(--s5)}
.add-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--s3)}
@media(max-width:600px){.add-form-grid{grid-template-columns:1fr}}
.form-select{width:100%;padding:var(--s3) var(--s4);background:var(--surface2);border:1.5px solid var(--border2);color:var(--text1);border-radius:var(--r2);font-size:0.9rem}
.db-stat-row{display:flex;justify-content:space-between;padding:var(--s2) 0;border-bottom:1px solid var(--border);font-size:0.875rem}
.db-stat-label{color:var(--text2)}.db-stat-val{font-weight:700;font-family:var(--font-mono);color:var(--text1)}

/* QUEUE */
.queue-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:var(--s5)}
.queue-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r5);padding:var(--s8);text-align:center;max-width:480px;width:100%;box-shadow:var(--shadow-xl)}
.queue-now-label{font-size:0.82rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:2px;margin-bottom:var(--s2)}
.queue-token-display{font-family:var(--font-heading);font-size:clamp(5rem,20vw,8rem);font-weight:900;color:var(--coral);line-height:1;animation:glow-pulse 3s ease-in-out infinite}
.queue-sub{font-size:1rem;color:var(--text2);margin:var(--s3) 0 var(--s6)}
.queue-stats{display:grid;grid-template-columns:1fr 1fr;gap:var(--s4);margin-top:var(--s6)}
.queue-stat-box{background:var(--surface2);border-radius:var(--r3);padding:var(--s4)}
.queue-stat-num{font-family:var(--font-heading);font-size:2rem;font-weight:900}
.queue-stat-label{font-size:0.75rem;color:var(--text3);margin-top:var(--s1)}

/* SCAN VERIFY */
.scan-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:var(--z-modal);display:flex;align-items:center;justify-content:center;animation:fade-in var(--dur-fast) var(--ease-out)}
.scan-modal{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r5);padding:var(--s6);width:100%;max-width:420px;max-height:90vh;overflow-y:auto;animation:scale-in var(--dur-base) var(--ease-spring)}
.scan-modal-title{font-family:var(--font-heading);font-size:1.1rem;font-weight:800;margin-bottom:var(--s5)}
.scan-video{width:100%;border-radius:var(--r3);background:#000;display:block}
.scan-frame-overlay{position:relative;aspect-ratio:1;border-radius:var(--r3);overflow:hidden;background:#000}
.scan-corner{position:absolute;width:32px;height:32px;border-color:var(--coral);border-style:solid;border-width:0}
.scan-corner.tl{top:12px;left:12px;border-top-width:3px;border-left-width:3px}
.scan-corner.tr{top:12px;right:12px;border-top-width:3px;border-right-width:3px}
.scan-corner.bl{bottom:12px;left:12px;border-bottom-width:3px;border-left-width:3px}
.scan-corner.br{bottom:12px;right:12px;border-bottom-width:3px;border-right-width:3px}

/* QR MODAL */
.qr-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:var(--z-modal);display:flex;align-items:center;justify-content:center;animation:fade-in var(--dur-fast)}
.qr-modal-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r5);padding:var(--s6);max-width:400px;width:100%;animation:scale-in var(--dur-base) var(--ease-spring)}
.qr-modal-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--s4)}
.qr-modal-title{font-family:var(--font-heading);font-weight:800;font-size:1rem}
.qr-modal-sub{font-size:0.75rem;color:var(--text3)}
.qr-modal-close{background:none;border:none;color:var(--text2);font-size:1.2rem;cursor:pointer}
.qr-modal-token{text-align:center;padding:var(--s4) 0;border-bottom:1px solid var(--border);margin-bottom:var(--s4)}
.qr-token-label{font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px}
.qr-token-num{font-family:var(--font-heading);font-size:3rem;font-weight:900;color:var(--coral)}
.qr-modal-qr{text-align:center;margin-bottom:var(--s4)}
.qr-modal-id{font-family:var(--font-mono);font-size:0.75rem;color:var(--text3);margin-top:var(--s2)}
.qr-modal-items{margin-bottom:var(--s4)}
.qr-items-title{font-weight:700;font-size:0.82rem;margin-bottom:var(--s2)}
.qr-item-row{display:flex;justify-content:space-between;font-size:0.82rem;padding:var(--s1) 0;color:var(--text2)}
.qr-modal-pickup{font-size:0.8rem;color:var(--text3)}

/* EMPTY STATES */
.empty-state{text-align:center;padding:var(--s12) var(--s5)}
.empty-art{font-size:4rem;margin-bottom:var(--s4)}
.empty-title{font-family:var(--font-heading);font-size:1.2rem;font-weight:800;margin-bottom:var(--s2)}
.empty-sub{color:var(--text2);margin-bottom:var(--s6);font-size:0.875rem}
.empty-cta{display:inline-flex;align-items:center;gap:var(--s2);padding:var(--s3) var(--s6);border-radius:var(--rfull);background:linear-gradient(135deg,var(--coral),var(--coral-d));color:white;font-weight:700;border:none;cursor:pointer;box-shadow:var(--shadow-coral);transition:all var(--dur-base)}
.empty-cta:hover{transform:translateY(-2px)}

/* STATUS BADGES */
.status-pending{background:var(--amber-soft);color:var(--amber);border:1px solid rgba(251,191,36,0.3)}
.status-preparing{background:var(--sky-soft);color:var(--sky);border:1px solid rgba(56,189,248,0.3)}
.status-ready{background:var(--mint-soft);color:var(--mint);border:1px solid rgba(0,200,83,0.3)}
.status-completed{background:var(--surface3);color:var(--text3)}

/* CONFETTI */
.confetti-piece{position:fixed;width:10px;height:10px;top:-20px;border-radius:2px;pointer-events:none;z-index:var(--z-toast);animation:confetti-fall 1.2s ease-in forwards}

/* RESPONSIVE */
.hide-mobile{display:block}
.show-mobile{display:none}
@media(max-width:768px){
  .hide-mobile{display:none!important}
  .show-mobile{display:block}
  .hero{padding:var(--s5) var(--s4) var(--s4)}
  .hero-title{font-size:1.6rem}
  .cat-card{min-width:70px;padding:var(--s2) var(--s3)}
  .food-card-img-wrap{width:90px;height:84px}
  .bill-card{position:static}
  .stat-grid{grid-template-columns:repeat(2,1fr)}
  .kanban{grid-template-columns:repeat(2,1fr)}
  .admin-header{flex-direction:column;align-items:flex-start}
  .login-card{padding:var(--s6) var(--s5);margin:var(--s4)}
}
@media(max-width:480px){
  .stat-grid{grid-template-columns:1fr 1fr}
  .kanban{grid-template-columns:1fr}
}
"""

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(CSS)

print(f"Written {len(CSS)} chars, {CSS.count(chr(10))} lines")
