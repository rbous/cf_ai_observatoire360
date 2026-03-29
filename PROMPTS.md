# Prompts Used to Build Observatoire 360

Built with Claude Code (Opus 4.6). Prompts listed in chronological order.

---

> this repo was a quick copilot job so its not great. i need you to build a better version based on the instructions in the `new_instructions` directory. plan it all out first, think about security and edge cases, then build it. needs to run locally but the end goal is to run it on cloudflare through github actions

> show me how to run it locally

> the demo user password isnt working, fix it so i can log in

> ok so how do i deploy this thing

> i need to enable R2 but i dont want to get charged. how can i make sure i stay in the free tier

> the site is live but will the detection pipeline run async as-is or does it need work

> lets plan the actual features - satellite scanning, the ai detection part, notifications, and emails. map it out

> sentinel hub is only a 30-day trial, find me something thats actually free to use long-term

> switch the config over to use gatineau

> the city-wide comparison is useless, it needs to be for specific addresses

> add options so the user can pick between the whole town, one address, or a lat/long

> why is it asking for lat/long when i give it an address, just geocode it automatically

> the images are super pixelated, what is this? we need better quality

> the change detection is not working well at all. do whatever you need to do to get a high-res version working

> wayback only updates every few weeks right? how are we supposed to do daily checks

> is the ai even running? it just says 0 detections every time

> can we do a simple pixel-diff first and then only run the real ai if it finds something? seems more efficient

> do a full security audit, i want this to be top notch. no exposed env vars, no plaintext passwords, no pii in the frontend. triple check everything

> im going to make this repo public. scan everything and make sure theres no sensitive info. be super careful, check it multiple times

> can you write some playwright tests for this

> the "se connecter" button is dead, does nothing

> why does it still say "sherbrooke" everywhere, find all the hardcoded text and fix it

> refreshing the page logs me out, thats not right

> i get "Alerte introuvable" when i click an alert

> the /utilisateurs endpoint is broken

> when i click an alert, there are no images. the "analyser cette zone" button starts a new analysis but it doesnt get linked back to the alert

> block future dates in the analysis date picker

> clicking "analyser cette zone" still doesnt link the analysis to the alert

> its still showing those same pixelated sentinel-2 images

> fix the formatting on the results page, and you can delete the bottom picture its a duplicate

> write a good readme

> i need 3 playbooks: one for a tech admin, one for a non-tech admin, and one for other cities on how to use/deploy/maintain this thing

> put all the prompts we used into a PROMPTS.md file
