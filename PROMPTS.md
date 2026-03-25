# Prompts Used to Build Observatoire 360

Built with Claude Code (Opus 4.6). Prompts listed in chronological order.

---

## Phase 1: Architecture & Initial Build

> Look at the current repo. This was made quickly with Copilot, so it's not too good. I want you to create your own version of this app, using the new instructions uploaded in the `new_instructions` directory. Ask any clarifying questions and I will answer. Do this in a new git repo so I can upload it to a new GitHub repository. Must include a way to run it locally, but the end goal is to run it through GitHub Actions to Cloudflare. Start by making a complete plan, then implement it once every detail is planned and makes sense. Account for edge cases, and make sure security is top notch.

> Run it locally so I can see it.

> Fix the demo user password so I can login.

## Phase 2: Deployment

> How do I deploy it?

> R2 needs to be enabled — how can I ensure I never go over the free limit before enabling it?

## Phase 3: Async Detection Pipeline

> The website is up and running. Will it work asynchronously in its current state?

> Plan out the next steps — satellite scanning, AI detection, notifications, emails.

> Sentinel Hub says "free 30-day trial, not free forever." Can you switch to something that's actually free?

> Can we configure it for Gatineau?

## Phase 4: Data Sources & Imagery

> The comparison feature should only be for specific addresses. It's useless for the entire city.

> You need to include an option for the entire municipality, or a specific address, or a latitude/longitude.

> Why does the address option still show latitude and longitude fields? Just geocode the address automatically.

> The images are extremely pixelated. What is this?

> The top comparison is clearly not working well. Do whatever you must to have a working AI change detection that is high resolution.

> But isn't Wayback only updated every few weeks? How will we do the daily one?

## Phase 5: AI Detection

> Does the AI actually run? It keeps showing 0 detections.

> Can we do pixel-diff first, then fine-tuned AI only if it detects something?

## Phase 6: Security

> Is security top notch? I don't want any environments exposed in the repo, or passwords stored as plain text, or PII in the frontend. Triple check.

> I'm thinking of making my repo public. Can you scan it and make sure nothing bad is there? Be very very careful, do it in detail, multiple times. I don't want anything going out to the world.

## Phase 7: Testing

> Can you use Playwright to test it out?

## Phase 8: UX & Bug Fixes

> The "Se connecter" button doesn't do anything.

> Why does it still show "Sherbrooke"? Is there anything else hardcoded?

> Why does refreshing the page sign me out?

> It says this when I click on an alert. (Alerte introuvable)

> The /utilisateurs endpoint is not working.

> When I click on an alert, there are still no images. The "Analyser cette zone" button launches an analysis but doesn't link it back to the alert.

> For the analysis feature, you need to block future dates.

> Even when I click "Analyser cette zone", it launches an analysis but doesn't link it.

> It keeps only showing these images. (pixelated Sentinel-2)

> Can you also fix the formatting? You can remove the bottom pic, it's duplicated.

## Phase 9: Documentation

> Create a good README.

> Write 3 complete playbooks — one for a technical admin, one for a non-technical admin, and one for municipalities on how to deploy/maintain/use the app.

> Write all prompts in PROMPTS.md.
