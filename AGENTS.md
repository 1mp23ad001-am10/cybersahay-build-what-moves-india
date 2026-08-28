# Build What Moves India — Project Contract

## Product purpose

Build What Moves India turns a citizen's natural-language voice or typed account into a reviewable, structured civic or cybercrime report. The experience is voice-first, calm under stress, multilingual, accessible, and explicit about what is and is not an official government submission.

## Interaction principles

- Copy the **interaction model**, not the CPGRAMS visual design: one clear question or stage at a time, visible progress, editable answers, and a final review.
- Keep the user in control. Speech produces an editable transcript; deterministic application state decides which information is missing. An LLM may extract or classify but must never silently control fields or submit a report.
- Keep the primary journey lightweight: complaint route → incident → relevant details → evidence → contact (when required) → review and confirmation.
- Support English, Hindi, and Kannada UI copy end-to-end. Preserve the original spoken/text input; do not replace it with a translation without showing it.
- Treat the cybercrime flow as a local demo unless a real, authorised government integration is deliberately added. Never imply a complaint has been filed with NCRP/cybercrime.gov.in.

## Data resilience and privacy

- Autosave non-sensitive draft data after a short debounce and show a clear saved state. On reload, resume the same draft and its current stage.
- Keep sensitive structured fields separate from the public narrative: UPI IDs, bank/account details, transaction IDs, phone numbers, email, IFSC, and identity-linked identifiers.
- Sensitive fields are typed by default. If voice capture is offered, show the captured value, read number-like values back digit by digit when speech synthesis is available, and require explicit accept/retry before saving it.
- Never put OTPs, PINs, passwords, full card numbers, or remote-access approval fields in the workflow. Warn against them prominently.
- Mask sensitive values in public/report-preview text. Display unmasked values only in the final confirmation area intended for the local protected payload.
- Evidence uploads must show filenames and sizes before submission, enforce the project limit, and be transparent that local-demo uploads are stored locally.

## Cybercrime reporting requirements

- Use three report routes: Financial Fraud, Women/Child Safety, and Other Cyber Crime. Map each to specific subcategories and evidence guidance; never route an identified cybercrime to a generic civic issue.
- Financial fraud intake must support incident date/time, loss amount, bank/wallet/merchant, transaction or UTR reference, source/destination information when known, and attachments.
- Preserve incident details, URLs, handles, numbers, screenshots, statements, chats, emails, and timestamps as evidence; never ask users to share illegal explicit material.
- Advise immediate financial-fraud victims to call 1930 and contact their bank/wallet. Advise emergency physical-danger cases to use local emergency services.
- Generate only a clearly labelled local demo reference. Tracking remains local/mock until an authorised integration exists.

## Accessibility and quality bar

- Every control must be keyboard reachable, visibly focused, and labelled. Status changes must use an `aria-live` region.
- Provide persistent high-contrast and font-size controls.
- Verify every change with the relevant classifier/extraction checks, production build, and a live local UI pass. Do not claim a feature is fixed without exercising the user scenario that exposed it.

## Engineering choices

- Keep all form state in structured JSON; classify/extract into fields rather than storing an LLM response as the source of truth.
- Prefer local, resilient fallbacks. Voice errors must leave every form usable by typing.
- Before expanding language support, validate the ASR quality for each language and make language-detection uncertainty visible rather than silently guessing.
