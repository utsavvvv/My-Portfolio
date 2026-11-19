# Utsav Chakraborty Web Studio

Portfolio website. No Gemini API key is needed.

## Turn on the contact form and WhatsApp button
Open `index.tsx`, find `var CONTACT = {` near the top, and fill in:
- `web3formsKey`: your access key from web3forms.com (messages go to your Gmail)
- `whatsapp`: your number with country code, digits only, e.g. "919876543210"
Then redeploy.

## Run locally
    npm install
    npm run dev
