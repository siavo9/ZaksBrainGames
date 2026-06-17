# Zak's Brain Games — Website + iOS App (one repo)

Everything lives in this one folder / repo: the website **and** the iOS app.
There is a single source of truth for the content, and both outputs are built from it.

## How it fits together

```
public/                      ← THE SOURCE OF TRUTH (the website + all games)
server.js, vercel.json       ← serves/deploys the website (Vercel)
Zak's Brain Games.xcodeproj  ← the iOS app (open this in Xcode)
Zak's Brain Games/           ← the app's Swift code
    ZaksBrainGamesApp.swift  ← app entry point
    ContentView.swift        ← a full-screen WKWebView
    Assets.xcassets          ← app icon
```

The iOS app is a thin wrapper: it shows the `public/` website inside a full-screen
web view, fully offline. **`public/` is added to the Xcode project as a folder
reference**, which means Xcode bundles whatever is in `public/` *at the moment you
build*. There is no copy step to keep in sync — the app always ships the current site.

## The workflow you asked for

When you change the content (edit files in `public/`, e.g. via Claude Code):

1. **Commit & push to GitHub.**
   - The **website** auto-deploys via Vercel.
   - Your **local code** is the same files you just edited.
2. **Open the app in Xcode and press Build/Run (or Archive).**
   - Because `public/` is a folder reference, the app **automatically** picks up the
     latest content — nothing to copy or sync.
3. **Archive → Distribute App → App Store Connect** to submit the update.

One edit, one push, and the website + app stay aligned.

## First-time setup in Xcode (do this once)

Open `Zak's Brain Games.xcodeproj`, select the project → the **Zak's Brain Games**
target → **Signing & Capabilities**, then:

1. **Team:** select your Apple Developer team.
2. **Bundle Identifier:** set this to **the exact Bundle ID of your existing App Store
   app** (find it in App Store Connect → your app → App Information). It is currently a
   placeholder: `com.zaksbraingames.ZaksBrainGames`. It **must match** the existing app,
   or you can't submit an update to it.
3. Bump **Version** / **Build** for each new submission (target → General).

Then **Product → Archive** to build and submit.

## Notes

- `Site.bundle` and the `.github` sync workflow were used by the *old* app. The new app
  reads `public/` directly, so `Site.bundle` is no longer needed by the app (harmless to
  leave; safe to remove later).
- Keep this folder set to **"Keep Downloaded"** in iCloud (right-click the folder in
  Finder) so iCloud never offloads it — that offloading is what caused the original
  project to go missing.
