import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const API = process.env.E2E_API_URL ?? "http://localhost:8787";
const CREDS = {
    email: process.env.E2E_EMAIL ?? "demo@observatoire360.com",
    password: process.env.E2E_PASSWORD ?? "[REDACTED_PASSWORD]",
};

let browser, page;
let passed = 0;
let failed = 0;
const results = [];

function log(status, name, detail) {
    const icon = status === "PASS" ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
    console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ""}`);
    results.push({ status, name, detail });
    if (status === "PASS") passed++;
    else failed++;
}

async function test(name, fn) {
    try {
        await fn();
        log("PASS", name);
    } catch (err) {
        log("FAIL", name, err.message?.slice(0, 120));
    }
}

// =========================================================================
// TESTS
// =========================================================================

async function run() {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    page = await context.newPage();

    console.log("\n\x1b[1m=== Observatoire 360 — E2E Tests ===\x1b[0m\n");

    // --- Marketing site ---
    console.log("\x1b[36mMarketing Site\x1b[0m");

    await test("Landing page loads", async () => {
        const res = await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
        if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
    });

    await test("Navbar is visible", async () => {
        await page.waitForSelector("nav", { timeout: 5000 });
    });

    await test("Hero headline exists", async () => {
        const text = await page.textContent("body");
        if (!text.includes("OBSERVATOIRE 360")) throw new Error("Headline not found");
    });

    await test("ESPACE CLIENT button exists", async () => {
        const btn = await page.$('a[href="/connexion"], button:has-text("ESPACE CLIENT")');
        if (!btn) throw new Error("CTA not found");
    });

    await test("Footer is visible", async () => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        const footer = await page.$("footer");
        if (!footer) throw new Error("Footer not found");
    });

    // --- API Health ---
    console.log("\n\x1b[36mAPI Health\x1b[0m");

    await test("API health endpoint responds", async () => {
        const res = await fetch(`${API}/api/health`);
        const data = await res.json();
        if (data.status !== "ok") throw new Error(`Status: ${data.status}`);
    });

    // --- Login flow ---
    console.log("\n\x1b[36mAuthentication\x1b[0m");

    await test("Login page loads", async () => {
        await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    });

    await test("Valid login redirects to dashboard", async () => {
        await page.fill('input[name="email"]', CREDS.email);
        await page.fill('input[name="password"]', CREDS.password);
        await page.click('button[type="submit"]');
        // Wait for navigation — React Router redirect happens after async login
        await page.waitForTimeout(10000);
        const url = page.url();
        if (!url.includes("tableau-de-bord")) throw new Error(`Still on: ${url}`);
    });

    // --- Dashboard ---
    console.log("\n\x1b[36mDashboard\x1b[0m");

    await test("Dashboard page loaded", async () => {
        const url = page.url();
        if (!url.includes("tableau-de-bord")) throw new Error(`URL: ${url}`);
    });

    await test("Map container is visible", async () => {
        await page.waitForSelector(".leaflet-container", { timeout: 10000 });
    });

    await test("Alert markers appear on map", async () => {
        await page.waitForTimeout(3000);
        const markers = await page.$$(".leaflet-marker-icon, .leaflet-div-icon");
        if (markers.length === 0) throw new Error("No markers found");
    });

    await test("Sidebar navigation exists", async () => {
        const sidebar = await page.$('nav a[href*="tableau-de-bord"], aside a[href*="tableau-de-bord"]');
        if (!sidebar) throw new Error("Sidebar nav not found");
    });

    // --- Navigate via sidebar clicks (SPA navigation preserves auth) ---

    // --- Reports ---
    console.log("\n\x1b[36mReports\x1b[0m");

    await test("Reports page loads via sidebar", async () => {
        const link = await page.$('a[href="/tableau-de-bord/rapports"]');
        if (!link) throw new Error("Reports sidebar link not found");
        await link.click();
        await page.waitForTimeout(3000);
        const text = await page.textContent("body");
        if (!text.includes("Rapports") && !text.includes("Statistiques")) throw new Error("Reports heading not found");
    });

    // --- Navigate back to dashboard first ---
    await page.click('a[href="/tableau-de-bord"]');
    await page.waitForTimeout(1000);

    // --- Scans page ---
    console.log("\n\x1b[36mScan History\x1b[0m");

    await test("Scans page loads via sidebar", async () => {
        const link = await page.$('a[href="/tableau-de-bord/analyses"]');
        if (!link) throw new Error("Scans sidebar link not found");
        await link.click();
        await page.waitForTimeout(3000);
        const text = await page.textContent("body");
        if (!text.includes("analyses") && !text.includes("Analyses") && !text.includes("Historique")) throw new Error("Scans heading not found");
    });

    // --- Users page ---
    console.log("\n\x1b[36mUser Management\x1b[0m");

    await test("Users page loads via sidebar", async () => {
        const link = await page.$('a[href="/tableau-de-bord/utilisateurs"]');
        if (!link) throw new Error("Users sidebar link not found");
        await link.click();
        await page.waitForTimeout(3000);
        const text = await page.textContent("body");
        if (!text.includes("utilisateurs") && !text.includes("Utilisateurs")) throw new Error("Users heading not found");
    });

    await test("User list contains current user", async () => {
        const text = await page.textContent("body");
        if (!text.includes(CREDS.email)) throw new Error("Current user not in list");
    });

    // --- Profile page ---
    console.log("\n\x1b[36mProfile\x1b[0m");

    await test("Profile page loads via sidebar", async () => {
        const link = await page.$('a[href="/tableau-de-bord/profil"]');
        if (!link) throw new Error("Profile sidebar link not found");
        await link.click();
        await page.waitForTimeout(3000);
        const text = await page.textContent("body");
        if (!text.includes("profil") && !text.includes("Profil") && !text.includes("Informations")) throw new Error("Profile heading not found");
    });

    // --- Security tests ---
    console.log("\n\x1b[36mSecurity\x1b[0m");

    await test("Unauthenticated /api/alerts returns 401", async () => {
        const res = await fetch(`${API}/api/alerts`);
        if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    });

    await test("Registration endpoint is disabled (403)", async () => {
        const res = await fetch(`${API}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test@test.com", password: "Test1234!", name: "Test", municipalityId: "fake" }),
        });
        if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
    });

    await test("Health endpoint does not leak environment", async () => {
        const res = await fetch(`${API}/api/health`);
        const data = await res.json();
        if ("environment" in data) throw new Error("Environment field leaked");
    });

    await test("CORS blocks unauthorized origins", async () => {
        const res = await fetch(`${API}/api/health`, {
            headers: { "Origin": "https://evil-site.com" },
        });
        const acaoHeader = res.headers.get("access-control-allow-origin");
        if (acaoHeader === "*" || acaoHeader === "https://evil-site.com") {
            throw new Error(`CORS allows unauthorized origin: ${acaoHeader}`);
        }
    });

    await test("404 route returns JSON error", async () => {
        const res = await fetch(`${API}/api/nonexistent-route`);
        if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
        const data = await res.json();
        if (data.error !== "NOT_FOUND") throw new Error(`Unexpected error: ${data.error}`);
    });

    // --- Cleanup ---
    await browser.close();

    // --- Summary ---
    console.log(`\n\x1b[1m=== Results: ${passed} passed, ${failed} failed out of ${passed + failed} ===\x1b[0m\n`);

    if (failed > 0) {
        console.log("\x1b[31mFailed tests:\x1b[0m");
        results.filter(r => r.status === "FAIL").forEach(r => console.log(`  ✗ ${r.name}: ${r.detail}`));
        console.log();
    }

    process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
    console.error("Fatal error:", err);
    browser?.close();
    process.exit(1);
});
