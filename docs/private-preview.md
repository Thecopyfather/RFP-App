# Play privately on your phone

Run the draft application on your computer and open it from your phone on the **same trusted private Wi-Fi network**. The computer serves the preview while its terminal remains open. This procedure does not deploy a public site or merge the draft PR.

## Start the preview

Install Git, **Node.js 24 or later**, and npm on your computer. In a terminal:

```sh
git clone --branch codex/startup-prototype --single-branch https://github.com/Thecopyfather/RFP-App.git
cd RFP-App
npm install
npm run build
npm run preview -- --host 0.0.0.0
```

Use your existing GitHub access if Git requests authentication. The branch is the working draft; [PR #1](https://github.com/Thecopyfather/RFP-App/pull/1) stays unmerged. If you already cloned the repository, use that clone, switch to `codex/startup-prototype`, and pull its latest changes before installing/building.

Use `npm ci` instead of `npm install` when the branch includes a committed, current `package-lock.json`. A successful `npm run build` is required before previewing. If it fails, the preview is not ready; the recorded build status is in [the acceptance checklist](implementation-decisions.md#acceptance-checklist).

## Open it on your phone

1. Connect the computer and phone to the same private Wi-Fi. Guest networks may isolate devices and prevent this connection.
2. Find the **Network** URL printed by Vite, typically `http://192.168.1.25:4173/`. The address will match your computer’s actual LAN IP; use the printed value.
3. Open that Network URL in your phone’s browser. `localhost` on the phone refers to the phone, so use the computer’s Network address instead.
4. Keep the computer awake and the preview terminal running while you play. Stop the preview with **Ctrl+C** when finished.

If the operating system requests firewall access, limit it to the trusted private network. If the page does not connect, check that the devices share a network, that device isolation is off, and that the computer’s firewall permits local access to port 4173. The preview listens on the computer’s network interfaces; it has no application login, so use a network you trust.

Do not configure router port forwarding, a public tunnel or a public hosting service for this preview. No deployment, domain, paid service, or PR merge is needed.

## Saving, installation and offline use

Ordinary browser play works through the LAN HTTP preview. The application includes a secure random ID fallback for browsers where `crypto.randomUUID` is unavailable at an HTTP LAN address. Its added tests and the dedicated LAN-browser scenario have their own verification status in the acceptance checklist.

Your phone’s save is local to that browser and address. It is separate from the computer’s save. Return using the same phone, browser, LAN IP and port to resume; a changed IP or different browser is a different storage origin. Clearing site data removes that browser’s progress.

**PWA installation and service-worker offline caching need a secure context**, normally HTTPS, or `localhost` when the browser and server are on the same device. A phone opening `http://<computer-LAN-IP>:4173/` is normally not in a secure context. Browser play is supported there, but installation and offline reload are not guaranteed. A browser’s “Add to Home Screen” shortcut alone does not establish working offline support.

A private HTTPS preview could support those capabilities, but has **not** been provisioned here. No new hosting subscription or paid service is required or assumed. The production PWA tests run against same-device localhost; phone installation still requires testing on the intended secure origin and browser.
