# Kirkgate Heating & Plumbing: case study

A demo website for a made-up plumbing and heating firm in Aberdeen. Nothing is sold, and no real money moves. Built by Josh Terblanche for Tarnfield.

Live demo: https://demo-plumbers.whynotmedia.workers.dev

## Problem

If you run a local plumbing firm, you lose work when people cannot reach you. You are under a sink when the phone rings. Someone with no hot water at 21:00 wants to know whether you cover their area and what a visit costs. If they get no answer, they try the next firm. People who book and then do not show up cost you a morning as well.

## Result

This demo shows how a firm could handle all of that:

- A clear form that tells you what the problem is, how urgent it is, and how the customer wants to be contacted.
- A £25 call-out deposit, taken online when someone books, which comes off the final bill. Here it uses test money only.
- A chatbot that answers everyday questions about prices, hours and areas at any time of day, and only from facts you have approved.
- If someone says they can smell gas, the site tells them straight away what to do and gives the real gas emergency number.

It works on the live demo site. It is a demo with no real customers, so it cannot tell you how many more enquiries you would get.

## The numbers

Measured on 3 November 2026.

- **Tests:** 167 unit, 22 integration and 121 browser tests passed. 5 browser tests were skipped because they only run at one screen size.
- **Lighthouse on a phone, median of 5 runs on the live site:** home page 98 for performance and 100 for accessibility. Book a call-out page 100 and 100.
- **Missed: Lighthouse SEO scored 66, not 100.** This is only because the site asks search engines not to list it, so a pretend plumber never shows up in a real search.
- **Missed: the chatbot test scored 23 of 25 on the final code.** The 25 questions were locked before any chatbot code was written. Earlier runs scored 25. Both failures were correct refusals that tripped a banned phrase, though one reply was also a sentence too long. The test was not changed.
- **Running cost:** the hosting, database and email are on free plans. The chatbot is capped at under £0.10 a day, so at most about £3.10 in a 31-day month.
- **Tested by hand on the live site on 4 November 2026, on a laptop browser set to phone size:** an enquiry, a passing and a failing test payment, and a refund. All four did what they should, and the database and Stripe's records confirm it. None of this has been done on a real phone yet.

## Our approach

We agreed what it had to do first, then showed working previews, then tested it. The look was chosen with Cameron Pittaway: real photos of Aberdeen's granite streets, navy and white, and plain wording. The first design was thrown away because it looked generic.

Everything a customer might rely on is honest. Every page says the firm is fictional. There are no reviews, badges or registrations, because none exist. The phone number comes from the range Ofcom keeps for drama, so it can never ring a real person.

## What we would improve

- Run it with a real firm, and count real enquiries, before saying it helps.
- Check it on real phones and with real screen readers. So far this has been on browsers set to phone size.
- Have someone with gas safety training read the emergency wording and test more ways people describe danger. The check matches words, so an unusual wording can get past it.
- Remember dark mode between visits, and use a more careful way of telling whether a visitor has hit the chatbot limit.
- For a real client, add a Google Business Profile, a reviews routine, local directory listings and enquiry tracking. These matter as much as the site, and we make no promises about rankings.

## Technical details

**Stack:** Next.js 16 with server actions, on Cloudflare Workers' free plan, with Supabase in London, Stripe's sandbox and Resend. Versions are in the [README](README.md#stack).

**Chatbot budget:** each request reserves its worst-case cost in the database before the AI is called, then settles the real cost, using an atomic function. Many visitors at once cannot go over the limit. There are limits on messages per visitor, message length, reply length and conversation length.

**Chatbot safety:** an emergency check in ordinary code runs before the model. The model has no tools, and a last check rejects any reply with an unlisted price.

**Payments:** Stripe Checkout, with bookings confirmed only by a signature-checked webhook. A confirmation page alone confirms nothing. The code refuses anything except test keys.

**Data:** row-level security on every table, no public policies, and functions locked to the server. A nightly job deletes enquiries and bookings after 7 days.

**What the review changed:** a reviewer with no knowledge of the build tested the live site and read the code. It found that the emergency check missed 35 of 46 hard wordings, and that a missed emergency could be offered the fictional phone number. It also found that the phone menu stayed open after a tap, and that gas advice sat too low on phones. These and most of the smaller findings were fixed, and the rest are written down in [docs/SECURITY-REVIEW.md](docs/SECURITY-REVIEW.md).

**A lesson:** the chatbot scored 25 of 25 on its first run, yet reading the answers by hand found four mistakes, such as a price given for the wrong job. A score only checks what it was told to check, so we read the answers too.
