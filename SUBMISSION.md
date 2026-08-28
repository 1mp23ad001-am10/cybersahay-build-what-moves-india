# CyberSahay — Build What Moves India submission pack

## Public links

- Repository: https://github.com/1mp23ad001-am10/cybersahay-build-what-moves-india
- App: https://cybersahay-build-what-moves-india.onrender.com

## Project summary (218 words)

CyberSahay is an independent hackathon prototype that rethinks one stressful public-service journey: reporting a cybercrime. Today, a victim may need to choose a category, understand unfamiliar terms and remember many facts while under pressure. CyberSahay starts with a single incident account instead. A citizen can type or speak what happened, and the app maps the known facts into a live checklist: what is captured, what is still required and what is optional. Earlier facts remain visible instead of disappearing when someone remembers a new detail.

The complete Financial Fraud journey works with synthetic data: choose a route, describe the incident, see required and optional information, add protected identifiers separately, attach evidence, review masked values and receive a clearly labelled local-demo reference. It supports English, Hindi and Kannada UI, recognises common Kannada date and time phrases, includes a 1930/bank warning for financial fraud, and never asks for OTPs, passwords, PINs or full card numbers.

This is not an official government site and does not file a complaint with NCRP. Government integrations, identity verification and official case tracking are deliberately mocked. The public deployment runs a React/Vite client with an Express API, SQLite draft storage, evidence storage and health checks on Render. The free host can sleep and does not guarantee draft or upload persistence after a restart. Codex was used meaningfully to build, test and deploy the journey; the final workflow keeps the citizen in control because structured state and explicit review, not an LLM, decide what is missing or submitted.

## Exact two-minute narration and shot list

Record a real 1080p browser session with **synthetic data only**. The first minute is the citizen journey; the second is the build and product rationale, as required by the Builder Brief.

| Time | Screen recording | Narration |
| --- | --- | --- |
| 0:00–0:07 | Title card: **CyberSahay — a calmer way to prepare a cybercrime report** | “When someone has just lost money to cyber fraud, a long form is the wrong place to begin.” |
| 0:07–0:17 | Select **Financial Fraud**. | “CyberSahay is an independent prototype for one public-service problem: making cybercrime reporting clearer when a victim is stressed.” |
| 0:17–0:29 | Show the required-versus-optional guide and 1930 warning. | “Before collecting anything, it says what matters now, what is optional, and when to call 1930 and contact the bank.” |
| 0:29–0:43 | In the incident box, type a short fictional narrative with name, phone, State, date and time. | “The citizen simply explains what happened in one place. A live checklist maps each fact and shows both the captured value and the next missing detail.” |
| 0:43–0:53 | Add a second fictional sentence, for example loss amount and wallet; show earlier facts still visible. | “When another detail comes to mind, it is added without overwriting the earlier story. Nothing already captured vanishes.” |
| 0:53–1:00 | Brief Kannada narrative showing date/time mapping. | “The same journey supports English, Hindi and Kannada, including common Kannada date and time phrasing.” |
| 1:00–1:12 | Show protected-details section and masked review; do not type a real identifier. | “Privacy is built into the flow: protected identifiers are separate, review values are masked, and the product never asks for an OTP, PIN, password or full card number.” |
| 1:12–1:26 | Show evidence list, final review, then local-demo reference. | “The end-to-end journey works today with mock data: route, incident, evidence, protected review and a clearly labelled local-demo reference. It never claims that a government complaint was filed.” |
| 1:26–1:42 | Show a simple architecture slide: React/Vite → Express API → Render. | “Behind the interface, the public build uses React and Vite with an Express API. Render hosts the full service and health checks; the free deployment may sleep and its local demo data is not guaranteed to persist after a restart.” |
| 1:42–1:54 | Show the checklist and source code briefly. | “I used Codex as a meaningful build partner: to build the workflow, add multilingual date-and-time extraction, preserve state across edits, test the production build and deploy the service. I reviewed the product choices and tested the user journey myself.” |
| 1:54–2:00 | End card: **Clearer. Calmer. Reviewable.** | “CyberSahay does not replace an official portal. It shows how a safer intake layer can help a citizen arrive at a reviewable report with less confusion.” |

## Editing instructions

1. Use a real screen recording for every behaviour you describe. Do not show an interaction that does not work.
2. Keep the first 60 seconds strictly citizen-facing. Keep the explanation of architecture, Codex and mock limitations in the second 60 seconds.
3. Create the title/end cards in Hyperframes if desired, but use the actual browser recording for the core journey. Assemble clips and narration in Clipchamp, OBS, Loom, CapCut or Hyperframes; export one public MP4 at 1080p, under two minutes.
4. Use no government logos or real portal logins. Do not say “better than” as an unsupported claim; demonstrate the specific improvements instead: one incident account, live checklist, preserved facts, multilingual input and privacy-first review.
5. Open the final public URL in an incognito/private window before submitting. Check the home page, `/api/health`, narrative mapping, draft save, review and the final local-demo reference.

## Required honesty statement

Use this wording in the submission if asked about AI:

> “Codex was meaningfully used to build and test CyberSahay. The report workflow does not use an LLM to silently decide fields or submit a report: deterministic structured state maps facts, highlights missing information and requires user review. Government integration, identity verification and real case tracking are intentionally mocked.”

## Safety and scope

- Use only fictional/synthetic names, numbers, evidence and money amounts in the app and video.
- Do not connect to or test a live government system.
- Do not imply endorsement, official status or a filed government complaint.
- The Render service is a demo backend, not an authorised government data processor.
