// src/iap.js — Native In-App Purchase (Apple / Google) via RevenueCat.
//
// WHY: Apple Guideline 3.1.1 and Google Play Billing require digital subscriptions
// sold *inside the native apps* to use the platform's own purchase system — Stripe
// is not allowed there. The web app keeps using Stripe (see api/checkout.js); this
// module powers BarterThat+ on iOS/Android. It is a safe no-op on web.
//
// SETUP (one-time, in the RevenueCat dashboard):
//   1. Create a project, add the App Store app (bundle com.barterthat.app).
//   2. Add the App Store product `barterthat_plus_monthly` (auto-renewable sub).
//   3. Create an Entitlement `plus` and attach that product to it.
//   4. Create an Offering (default/current) with a monthly package -> that product.
//   5. Copy the PUBLIC Apple SDK key (starts with "appl_") into RC_API_KEY.ios below
//      (these public keys are safe to ship in the app bundle).

import { Capacitor } from "@capacitor/core";

export const IS_NATIVE =
  typeof Capacitor !== "undefined" &&
  Capacitor.getPlatform &&
  Capacitor.getPlatform() !== "web";

// Public RevenueCat SDK keys (safe to embed). Fill from RevenueCat → Project → API keys.
// Build-time override via env (REACT_APP_RC_*) is also supported.
const RC_API_KEY = {
  ios: process.env.REACT_APP_RC_IOS_KEY || "appl_uzrOnwMXXjDriZXSncxiKObeEyl",
  android: process.env.REACT_APP_RC_ANDROID_KEY || "goog_REPLACE_WITH_REVENUECAT_ANDROID_KEY",
};

// True if the user has any active entitlement. We prefer the configured "plus"
// entitlement but fall back to ANY active entitlement, so the unlock still works
// even if the RevenueCat entitlement ended up with a different identifier.
function hasPlus(customerInfo) {
  const active = customerInfo?.entitlements?.active || {};
  return !!active[ENTITLEMENT_PLUS] || Object.keys(active).length > 0;
}

// Store product identifiers — must match App Store Connect / Play Console & RevenueCat.
export const PRODUCTS = { plusMonthly: "barterthat_plus_monthly" };
export const ENTITLEMENT_PLUS = "plus";

let _ready = false;
let _Purchases = null;

// Lazily load the native plugin so web never imports it.
async function load() {
  if (_Purchases) return _Purchases;
  const mod = await import("@revenuecat/purchases-capacitor");
  _Purchases = mod.Purchases;
  return _Purchases;
}

function keyLooksReal(k) {
  return typeof k === "string" && k.length > 12 && !k.includes("REPLACE_WITH");
}

// Configure the SDK once at app launch (anonymous; call loginIAP after sign-in).
export async function initIAP() {
  if (!IS_NATIVE || _ready) return _ready;
  const apiKey = Capacitor.getPlatform() === "ios" ? RC_API_KEY.ios : RC_API_KEY.android;
  if (!keyLooksReal(apiKey)) return false; // not configured yet — stay a no-op
  try {
    const P = await load();
    await P.configure({ apiKey });
    _ready = true;
  } catch (e) {
    _ready = false;
  }
  return _ready;
}

// Returns true only if IAP is configured and usable (real key + plugin loaded).
export function iapAvailable() {
  return IS_NATIVE && _ready;
}

// Associate purchases with the signed-in user, then report entitlement state.
export async function loginIAP(appUserId) {
  if (!IS_NATIVE || !appUserId) return false;
  try {
    if (!_ready) await initIAP();
    if (!_ready) return false;
    const P = await load();
    await P.logIn({ appUserID: String(appUserId) });
    return await isPlusActive();
  } catch (e) {
    return false;
  }
}

export async function isPlusActive() {
  if (!iapAvailable()) return false;
  try {
    const P = await load();
    const { customerInfo } = await P.getCustomerInfo();
    return hasPlus(customerInfo);
  } catch (e) {
    return false;
  }
}

// Purchase BarterThat+. Returns true if the `plus` entitlement is active afterward.
// Throws "iap_unavailable" if not configured, "purchase_cancelled" if the user backs out.
export async function purchasePlus() {
  if (!iapAvailable()) throw new Error("iap_unavailable");
  const P = await load();
  const offerings = await P.getOfferings();
  const pkgs = offerings?.current?.availablePackages || [];
  const pkg =
    pkgs.find((p) => p.product?.identifier === PRODUCTS.plusMonthly) || pkgs[0];
  if (!pkg) throw new Error("no_offering");
  try {
    const { customerInfo } = await P.purchasePackage({ aPackage: pkg });
    return hasPlus(customerInfo);
  } catch (e) {
    if (e && (e.code === "1" || /cancel/i.test(String(e.message || e)) || e.userCancelled)) {
      throw new Error("purchase_cancelled");
    }
    throw e;
  }
}

// Apple requires a visible "Restore Purchases" action. Returns true if plus is active.
export async function restore() {
  if (!iapAvailable()) return false;
  try {
    const P = await load();
    const { customerInfo } = await P.restorePurchases();
    return hasPlus(customerInfo);
  } catch (e) {
    return false;
  }
}
