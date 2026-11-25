# Scentology BD — administration foundation

The uploaded brief's build order is being followed. Database foundations and the bilingual private admin entrance are implemented at `/` and `/admin`; the storefront and checkout are not yet implemented. See `roadmap.md` and `SECURITY.md` for remaining work and verification limits.

## First Owner
In Lovable, open More → Users → Add user and create the account for the designated Owner email with a strong unique password. No default credentials are shipped. Sign in at `/admin`, scan the authenticator QR and verify a six-digit TOTP before private access. Public signup is disabled. Owner role assignment requires a verified email.

## Run and deploy
Install with `bun install`, run with `bun run dev`, test with `bun run test`. Lovable manages Cloud database migrations and runtime bindings. Add real secrets through Project Settings → Secrets, never source files. Publish from Lovable only after the security checklist is complete; the current implementation is not ready to accept real customer orders. This project uses TanStack Start/Cloudflare Workers, not the brief's requested Next.js/Node deployment architecture.

## Asset replacement
The basalt gallery image is original generated media. Uploaded screenshots are visual references only. Real bottle photographs, delivery fees, WhatsApp and payment details have not yet been supplied or added.

---

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
