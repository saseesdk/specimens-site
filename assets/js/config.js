/* =========================================================
   SPECIMENS — site switch
   launch: "soon"  → every button says "Get it on Google Play" and links to the store
   launch: "soon"  → every button says "Coming soon to Google Play" (not a link)
   ========================================================= */
window.SPECIMENS = {
  launch: "soon",
  iosLaunch: "soon",   /* App Store button: "soon" = "Coming soon" (not a link); "live" = "Download on the App Store" linking to appStoreUrl */
  appStoreUrl: "https://apps.apple.com/app/id6838748825",
  playUrl: "https://play.google.com/store/apps/details?id=com.vaultrush.game",
  gaId: "G-827Y9LZ0J1"   /* Google Analytics 4 Measurement ID, e.g. "G-ABC123XYZ"; empty = analytics off */
};
document.documentElement.setAttribute("data-launch", window.SPECIMENS.launch);
document.documentElement.setAttribute("data-ios", window.SPECIMENS.iosLaunch);
document.documentElement.classList.add("js");
