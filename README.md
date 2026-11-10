# Katyayani Weds Vineeth — Wedding Invitation Website (bride's side)

Same design as the groom's site; names and families are listed bride first, with the bride family's dates.

A responsive, static wedding invitation website ready to deploy on Vercel.

## Included
- Front cover: carved wooden temple doors with brass studs, lotus panels, ring handles and a mango-leaf/marigold toranam. On "Open Invitation" the doors swing open in 3D with a burst of golden light and you walk through into the Tirumala temple
- Top section: Sri Venkateswara Swamy temple, Tirumala photo that zooms into place, swinging temple bells, golden light rays, gold sparkles and a shower of flowers
- Closing section: Ananda Nilayam (gold vimana) photo with five flickering diyas
- Falling flowers, shimmering gold names, glowing icons and scroll reveal effects; "Front Cover" button to close the doors again
- Telugu shlokas and Telugu font
- Couple and family details, bride's family first, including siblings; "Invited by Sri Kondeti Madhu Babu & Smt. Kondeti Padma"
- Wedding (Sun 13 Dec 2026, night 4:01 — early hours of Monday, Thula Lagnam) and Reception/Dinner (Sun 13 Dec 2026, 6:00 PM onwards), both at Atluri Basavayya Kalyana Mandapam, Gudivada
- Countdown to the muhurtham (13 Dec night = 14 Dec 2026, 4:01 AM IST), with English and Telugu labels
- Google Maps directions to the venue (on both cards)
- "Share on WhatsApp" button and native share (both include the page link)
- Link preview image (`og-image.jpg`) for WhatsApp and other apps
- Respects "reduce motion" settings on phones and computers

## Photo sources
These photos are from Wikimedia Commons under CC BY-SA 4.0 (the licence asks for a credit to the photographer wherever the photo is shown):
- `tirumala-temple.jpg` (top section on laptops/desktops) — "Tirumala 090615.jpg" by Nikhilb239
- `tirumala-vimana.jpg` (closing section) — "Tirumala Anand nilayam4653.jpg" by Phanidharvaranasi

Supplied by Vineeth:
- `tirumala-mobile.jpg` (top section on phones) — from `tirupati.jpg`
- `balaji.jpg` (Sri Venkateswara Swamy, next to the shloka) — from `tirupati_balaji_of_chennai.jpg`

## Deploy on Vercel (no build command required)
1. Create a GitHub repository and upload all files in this folder (all files sit in this one folder, no subfolders).
2. Sign in to https://vercel.com and choose **Add New → Project**.
3. Import the GitHub repository.
4. Framework Preset: **Other**. Build Command: leave empty. Output Directory: `.`
5. Click **Deploy**. Vercel will provide a public URL.

You can also deploy with Vercel CLI from this folder using `vercel` and follow the prompts.

## After the first deploy
- **WhatsApp preview:** WhatsApp needs the full image address. In `index.html`, change
  `<meta property="og:image" content="og-image.jpg" />` to
  `<meta property="og:image" content="https://YOUR-SITE.vercel.app/og-image.jpg" />`
  and add `<meta property="og:url" content="https://YOUR-SITE.vercel.app/" />`, then redeploy.

## Optional
- **Music:** `music.m4a` is included (audio taken from the 31-second WhatsApp video). It starts at 0:02 when guests tap "Open Invitation", loops back to 0:02 at the end, and a Music On/Off button appears. To change the start point, edit `MUSIC_START` at the top of `script.js`. Without the file, no music button is shown.

## 40-day hosting
Vercel does not automatically expire a deployment after 40 days. Set a reminder to remove the deployment/project after the invitation period.
