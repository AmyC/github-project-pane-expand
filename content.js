// If you used a specific match in manifest, just run your code here:
console.log("Hello from My GitHub Helper!");

// If you matched everything and want to filter in JS:
const ROOT = "https://github.com/your‑org/your‑repo";
if (window.location.href.startsWith(ROOT)) {
  console.log("We're in the right subtree:", window.location.href);
  // ← Put your real functionality here…
}
