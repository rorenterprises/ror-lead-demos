# DFW Professional Pest Control — production handoff

## Approved source

- GitHub repository: `rorenterprises/ror-lead-demos`
- Site directory: `dfwpest/`
- Production branch: `main`
- Intended domain: `dfwpest.rorenterprises.net`
- This is a static site. Do not add a framework, database, or build service.

## Required deployment configuration

Use Cloudflare Pages unless an existing ROR static-site host already serves this repository.

1. Connect the GitHub repository `rorenterprises/ror-lead-demos`.
2. Set the production branch to `main`.
3. Set the project/root directory to `dfwpest`.
4. Leave the build command empty.
5. Set the output directory to `.`.
6. Deploy and verify the provider preview URL first.
7. Add the custom domain `dfwpest.rorenterprises.net` to that exact project.
8. Inspect the existing DNS record before changing it. Replace only the record for `dfwpest`; do not modify other ROR domains or tunnels.
9. Confirm HTTPS is active and the domain opens the proposal at `/`.

## Acceptance checks

- `/` redirects to `/proposal.html`.
- `/proposal.html` shows the one-page DFW Professional Pest Control pamphlet.
- `/pricing.html` opens the website option with public prices.
- `/quote-first.html` opens the call-for-quote option without public prices.
- `/invoice-demo.html` completes the approve-and-send invoice demonstration.
- Phone links dial `469-290-6098`.
- Prices remain exactly: `$497` setup and first 30 days, `$297` monthly afterward, `$297` founder website add-on, `$997` regular website price, and `$794` assistant-plus-website total.
- The site contains no per-minute client pricing and no ROI table.
- The ant and roach photos are tightly cropped with no dark description panel at the bottom.
- Desktop and mobile layouts have no horizontal overflow.
- Keep the proposal marked `noindex,nofollow`.

## Do not change without Frank's approval

- Pricing or included limits.
- The call-first recommendation.
- The business-texting carrier-approval disclaimer.
- The rule that invoices send only after approval.
- The voice-cloning consent requirement: use only a voice the business owns or has permission to use.
