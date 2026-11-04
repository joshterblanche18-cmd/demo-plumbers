# Security and safety review

Done on 3 November 2026. This was a read-through of the code and normal use of the live site, by a reviewer with no knowledge of the build. It was **not an attack test** and no outside security firm was involved. Findings were checked before being fixed.

## What was checked and found fine

- Keys: none in the code, the git history or the live site's pages, by `scripts/scan-secrets.mjs`.
- Database: row-level security on every table. Signed-out and signed-in public users cannot read any table or run any function, tested directly.
- Stripe: forged and unsigned webhook messages are refused, and a faked confirmation link confirms nothing. Only test keys are accepted.
- Chatbot: requests from other websites are refused, and budget reservation is atomic.
- Honesty: the banner on every page, the noindex setting, no invented claims, and phone numbers from the allowed range.
- Layout: no sideways scrolling or clipping on 19 pages at 3 screen sizes in light and dark.

## Fixed

| Severity | Finding | Fix |
|---|---|---|
| High | The emergency check missed 35 of 46 hard wordings, such as "gas odour", "carbon-monoxide alarm" and "fire in my kitchen" | Wider check, with each wording added as a test. All 46 now pass, but that list guided the fix, so this is not an independent score |
| High | A missed emergency went to the AI, which could offer the fictional phone number to someone in danger | Fixed safety rule with the real numbers in the AI's instructions, and no firm's number in that case |
| High | The phone menu stayed open after a tap and covered the page | It now closes on a tap, on Escape and on an outside tap |
| Medium | Gas advice sat too low on phones | Moved to the top of the home and emergency pages |
| Medium | Chat scrolled past the first line of emergency advice | Emergency replies now show from their first line |
| Medium | The missing-page screen had no site header, footer or safety advice | It now uses the normal site layout |
| Medium | Dark-mode error text had low contrast (2.71:1) | Lighter red in dark mode |
| Medium | Sticky bars could hide a focused field | Scroll padding added |
| Medium | If a booking could not be linked to its Stripe session, payment could not be matched | That failure now cancels the payment page and shows an error |
| Medium | Browsers could autofill the hidden spam field, because it was called "company" | Renamed |
| Medium | Privacy wording ignored email copies, and the thanks page said an email went even if it failed | Reworded |
| Low | The chatbot gave the phone number without saying it was fictional | Rule added |
| Low | "£2200" was wrongly treated as an invented price | Fixed, with a test |
| Low | False emergency alarms on questions like "Do you fit carbon monoxide alarms?" | General questions are now left alone, with tests |
| Low | A consent tick was lost after a form error, and the gas number was a small tap target | Both fixed |
| Low | A source photo showed a perfume brand, and another a tool maker's name | Cropped and blurred out |

## Known and left as they are

Reasonable for a demo with nothing to sell. A real client's site should fix these.

- **Forged chat history:** a visitor can send made-up earlier "assistant" messages. The rules, price check and budget still apply, but the replies could be steered further than normal.
- **Visitor limit:** one person changing addresses can get round the 20-a-day limit. The shared daily budget still holds.
- **Sign-in:** the limit is per address, wrong emails take slightly different time from wrong passwords, and signing out does not cancel the token on the database side. Supabase's leaked password check is off.
- **Page security rules (CSP):** they allow inline scripts, because the framework needs them.
- **Dark mode** resets on reload, the **chat button** needs JavaScript, and `/contact/thanks` can be opened directly.
- **Form errors:** links to grouped choices land on the group, not the first option. Escape does not close the chat when focus is on its button.
- **Prices in words:** the price check only spots numbers with a £ sign, not words or percentages.

## Not checked

Real phones and keyboards, real screen readers, live visitor limits, the 7-day deletion job running on schedule, and each photo's licence page beyond the record in `CREDITS.md`.

The review itself did not cover the signed-in admin page on the live site or a live payment. Both were tried by hand on 4 November 2026, as normal use and not as an attack test: a test payment, a declined card, and a sign-in and refund from the admin page all worked, and Stripe's records confirm them.
