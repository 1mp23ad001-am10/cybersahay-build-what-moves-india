# Build What Moves India — submission pack

## Live demo

https://build-what-moves-india-zeta.vercel.app

## Two-minute demo video plan

Use a real screen recording for the core demo. It proves the flow works better than a fully synthetic video. A Hyperframes-style motion opener is optional and should be no longer than 8 seconds.

| Time | Screen | Voiceover |
| --- | --- | --- |
| 0:00–0:08 | Title: **CyberSahay — a calmer cybercrime reporting journey** | “Reporting cybercrime should not begin with a maze of categories, unfamiliar terms, and a long form. It should begin with one question: what happened?” |
| 0:08–0:24 | Show the official portal's public landing or category page briefly. Do not enter personal data. | “Today, a victim under stress often has to decide the right category and find the facts a report needs before they can even start. CyberSahay is a prototype that reorganises that experience around the victim’s own account.” |
| 0:24–0:43 | Open CyberSahay. Select Financial fraud. Show the required/optional guide and 1930 message. | “Before asking for details, CyberSahay explains what is required, what is optional, and when to call 1930. It clearly says this is a local demo, not a government submission.” |
| 0:43–1:07 | Type or speak a short incident narrative. Use synthetic data only. | “The citizen speaks or types naturally in one incident box. The checklist maps facts as they appear—incident date, time, State, name, mobile number, and financial details—so the user always sees what is captured and what is still needed.” |
| 1:07–1:23 | Add another detail. Show that existing values remain and the live checklist displays captured values. | “When a person remembers another detail, earlier facts stay preserved. The next missing field is made explicit instead of making the person hunt through a form.” |
| 1:23–1:39 | Switch to Kannada and show a Kannada sample date/time being mapped. | “The flow supports English, Hindi, and Kannada UI. The local mapper recognises common Kannada date and time formats, including month names, Kannada numerals, and phrases like evening five o’clock.” |
| 1:39–1:53 | Show protected-details input, then review screen with masked values. | “Sensitive identifiers are deliberately separate. UPI IDs, UTRs, account numbers, and phone numbers are typed, masked in the public preview, and never requested as OTPs, PINs, passwords, or full card numbers.” |
| 1:53–2:00 | Show final review and local demo reference. End card: **Clearer. calmer. reviewable.** | “CyberSahay does not pretend to replace the official system. It demonstrates a safer, calmer intake layer that helps a victim arrive at a reviewable report with less confusion.” |

## What to say about Codex and ChatGPT

Use this wording exactly only if it reflects your work:

> “I used Codex as a hands-on build partner: to scaffold the React and Express application, iterate on the report workflow, add multilingual deterministic extraction, improve accessibility and privacy safeguards, diagnose mapping failures with test fixtures, run production builds, and deploy the frontend to Vercel. I reviewed each product decision and tested the user flow myself. The submitted product does not claim that an LLM files complaints or decides report fields; structured application state and user review remain in control.”

Do **not** claim that ChatGPT Sites, GPT models, or OpenRouter power the current report extraction. They do not. The product currently uses local deterministic mapping plus a local/demo voice workflow.

## Recording and merging

1. Record the actual demo in 1080p with Windows Snipping Tool’s screen recorder, OBS, or Clipchamp. Keep browser zoom at 100% and use only synthetic incident details.
2. Record the official public portal only long enough to establish the comparison. Do not log in, enter data, or imply the official portal is unsafe.
3. Record the CyberSahay flow as one continuous take, then record the Kannada segment separately if needed.
4. In Clipchamp: create a 16:9 1080p project; place the title card, official-portal clip, CyberSahay clips, then final card; trim to exactly two minutes; record the voiceover from the script above; add low-volume royalty-free music only if it does not obscure speech.
5. Export as MP4, 1080p. Watch it once with sound off (captions/text clarity) and once with sound on (pace and privacy check).

## Public-demo limitations

- This Vercel deployment is a frontend demo. Its local SQLite persistence, local voice service, and local upload storage do not run in Vercel’s static deployment.
- It never represents a report as filed with NCRP/cybercrime.gov.in.
- Use synthetic names, phone numbers, amounts, and evidence in the video.
