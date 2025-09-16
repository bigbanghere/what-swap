# Telegram Mini Apps Next.js Template

This template demonstrates how developers can implement a web application on the
Telegram Mini Apps platform using the following technologies and libraries:

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TON Connect](https://docs.ton.org/develop/dapps/ton-connect/overview)
- [@telegram-apps SDK](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/2-x)
- [Telegram UI](https://github.com/Telegram-Mini-Apps/TelegramUI)

> The template was created using [pnpm](https://pnpm.io/). Therefore, it is
> required to use it for this project as well. Using other package managers, you
> will receive a corresponding error.

## Install Dependencies

If you have just cloned this template, you should install the project
dependencies using the command:

```Bash
pnpm install
```

## Scripts

This project contains the following scripts:

- `dev`. Runs the application in development mode.
- `dev:https`. Runs the application in development mode using self-signed SSL
  certificate.
- `build`. Builds the application for production.
- `start`. Starts the Next.js server in production mode.
- `lint`. Runs [eslint](https://eslint.org/) to ensure the code quality meets
  the required
  standards.

To run a script, use the `pnpm run` command:

```Bash
pnpm run {script}
# Example: pnpm run build
```

## Create Bot and Mini App

Before you start, make sure you have already created a Telegram Bot. Here is
a [comprehensive guide](https://docs.telegram-mini-apps.com/platform/creating-new-app)
on how to do it.

## Run

Although Mini Apps are designed to be opened
within [Telegram applications](https://docs.telegram-mini-apps.com/platform/about#supported-applications),
you can still develop and test them outside of Telegram during the development
process.

To run the application in the development mode, use the `dev` script:

```bash
pnpm run dev
```

After this, you will see a similar message in your terminal:

```bash
▲ Next.js 14.2.3
- Local:        http://localhost:3000

✓ Starting...
✓ Ready in 2.9s
```

To view the application, you need to open the `Local`
link (`http://localhost:3000` in this example) in your browser.

It is important to note that some libraries in this template, such as
`@telegram-apps/sdk`, are not intended for use outside of Telegram.

Nevertheless, they appear to function properly. This is because the
`src/hooks/useTelegramMock.ts` file, which is imported in the application's
`Root` component, employs the `mockTelegramEnv` function to simulate the
Telegram environment. This trick convinces the application that it is
running in a Telegram-based environment. Therefore, be cautious not to use this
function in production mode unless you fully understand its implications.

### Run Inside Telegram

Although it is possible to run the application outside of Telegram, it is
recommended to develop it within Telegram for the most accurate representation
of its real-world functionality.

To run the application inside Telegram, [@BotFather](https://t.me/botfather)
requires an HTTPS link.

This template already provides a solution.

To retrieve a link with the HTTPS protocol, consider using the `dev:https`
script:

```bash
$ pnpm run dev:https

▲ Next.js 14.2.3
- Local:        https://localhost:3000

✓ Starting...
✓ Ready in 2.4s
```

Visiting the `Local` link (`https://localhost:3000` in this example) in your
browser, you will see the following warning:

![SSL Warning](assets/ssl-warning.png)

This browser warning is normal and can be safely ignored as long as the site is
secure. Click the `Proceed to localhost (unsafe)` button to continue and view
the application.

Once the application is displayed correctly, submit the
link `https://127.0.0.1:3000` (`https://localhost:3000` is considered as invalid
by BotFather) as the Mini App link to [@BotFather](https://t.me/botfather).
Then, navigate to [https://web.telegram.org/k/](https://web.telegram.org/k/),
find your bot, and launch the Telegram Mini App. This approach provides the full
development experience.

## Deploy

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out
the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for
more details.

## Useful Links

- [Platform documentation](https://docs.telegram-mini-apps.com/)
- [@telegram-apps/sdk-react documentation](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react)
- [Telegram developers community chat](https://t.me/devs)

Here's you API key with a limit of 36k requests per hour (10 per second). It becomes active within 5 minutes.

To make it work, you need to set:
- User-Agent to authorized-sraibaby
- X-Api-Key to swap-coffee-tokenrE8fSEDg9TeuQCdPKM

Once the key is applied, each response will include additional headers:
- X-RateLimit-Limit = 36000 - the hourly request limit
- X-RateLimit-Remaining - the number of requests left within the current hour

The hourly window starts the moment the first request is sent.


C:\BigBang\backup\whatever\src\mockEnv.ts:35 🔧 Initializing mock environment...
main-app.js?v=1758037576368:2610 [Client Instrumentation Hook] Slow execution detected: 40ms (Note: Code download overhead is not included in this measurement)
main-app.js?v=1758037576368:2402 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
layout.tsx:20  Server  An invalid locale was provided: "[object Promise]"
Please ensure you're using a valid Unicode locale identifier (e.g. "en-US").
error @ intercept-console-error.js:50
async RootLayout @ layout.tsx:20
react-stack-bottom-frame @ react-server-dom-webpack-client.browser.development.js:2669
resolveConsoleEntry @ react-server-dom-webpack-client.browser.development.js:2135
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2270
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2233
progress @ react-server-dom-webpack-client.browser.development.js:2479
<RootLayout>
buildFakeTask @ react-server-dom-webpack-client.browser.development.js:2040
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2027
resolveDebugInfo @ react-server-dom-webpack-client.browser.development.js:2063
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2261
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2233
progress @ react-server-dom-webpack-client.browser.development.js:2479
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:1587
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:2396
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:2717
eval @ app-index.js:132
(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/client/app-index.js @ main-app.js?v=1758037576368:259
options.factory @ webpack.js?v=1758037576368:717
__webpack_require__ @ webpack.js?v=1758037576368:37
fn @ webpack.js?v=1758037576368:374
eval @ app-next-dev.js:11
eval @ app-bootstrap.js:62
loadScriptsInSequence @ app-bootstrap.js:23
appBootstrap @ app-bootstrap.js:56
eval @ app-next-dev.js:10
(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1758037576368:281
options.factory @ webpack.js?v=1758037576368:717
__webpack_require__ @ webpack.js?v=1758037576368:37
__webpack_exec__ @ main-app.js?v=1758037576368:2946
(anonymous) @ main-app.js?v=1758037576368:2947
webpackJsonpCallback @ webpack.js?v=1758037576368:1393
(anonymous) @ main-app.js?v=1758037576368:9
C:\BigBang\backup\whatever\src\mockEnv.ts:43 🔍 TMA check result: false
C:\BigBang\backup\whatever\src\mockEnv.ts:46 🎭 Setting up mock environment...
C:\BigBang\backup\whatever\src\mockEnv.ts:117 ⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.
C:\BigBang\backup\whatever\src\mockEnv.ts:120 ✅ Mock environment setup complete
C:\BigBang\backup\whatever\src\instrumentation-client.ts:9 🎭 Mock environment ready, retrieving launch params...
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:13 🔍 Global state initialized - globalIsInputActive: false globalInputFocused: false
C:\BigBang\backup\whatever\src\instrumentation-client.ts:14 📱 Retrieved launch params: {tgWebAppData: {…}, tgWebAppPlatform: 'tdesktop', tgWebAppThemeParams: {…}, tgWebAppVersion: '8.4'}
C:\BigBang\backup\whatever\src\instrumentation-client.ts:20 ⚙️ Initializing app with: {platform: 'tdesktop', debug: true}
C:\BigBang\backup\whatever\src\core\init.ts:27 INFO 15:46:18.168 Bridge The package was configured. Launch params: {tgWebAppData: {…}, tgWebAppPlatform: 'tdesktop', tgWebAppThemeParams: {…}, tgWebAppVersion: '8.4'}
C:\BigBang\backup\whatever\src\core\init.ts:27 INFO 15:46:18.169 Bridge Posting event: {eventType: 'iframe_ready', eventData: {…}}
C:\BigBang\backup\whatever\src\core\init.ts:27 INFO 15:46:18.172 Bridge The package was initialized
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:34 🔍 Adding isInputActive listener, total listeners: 0
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:36 🔍 isInputActive listeners after add: 1
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 0
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 1
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 ⚠️ Using fallback launch params for browser development
 🔍 User has already set locale preference, keeping it
 🔍 Removing isInputActive listener, total listeners before: 1
 🔍 isInputActive listeners after remove: 0
 🔍 Removing isInputFocused listener, total listeners before: 1
 🔍 isInputFocused listeners after remove: 0
 🔍 Adding isInputActive listener, total listeners: 0
 🔍 isInputActive listeners after add: 1
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 0
 🔍 isInputFocused listeners after add: 1
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 ⚠️ Using fallback launch params for browser development
 🔍 User has already set locale preference, keeping it
 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:19 🔍 ===== Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:20 🔍 Swap render - isInputFocused: false shouldBeCompact: true
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:21 🔍 Swap render - will show CustomKeyboard: NO
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:22 🔍 ===== END Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:19 🔍 ===== Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:20 🔍 Swap render - isInputFocused: false shouldBeCompact: true
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:21 🔍 Swap render - will show CustomKeyboard: NO
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:22 🔍 ===== END Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:40 🔍 CustomInput render - isFocused: false value: 1
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:40 🔍 CustomInput render - isFocused: false value: 1
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:34 🔍 Adding isInputActive listener, total listeners: 1
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:36 🔍 isInputActive listeners after add: 2
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 1
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 2
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:30 🔍 ===== CustomInput isFocused STATE CHANGE =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:31 🔍 CustomInput isFocused changed to: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:32 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:1
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:33 🔍 ===== END CustomInput isFocused STATE CHANGE =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:48 🔍 CustomInput hiding cursor
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:136 🔍 ===== CustomInput FOCUS STATE CHANGE =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:137 🔍 CustomInput isFocused changed to: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:138 🔍 CustomInput calling onFocusChange with: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:139 🔍 CustomInput onFocusChange callback: (isFocused)=>{
            console.log('🔍 ===== SwapForm FOCUS CHANGE HANDLER =====');
            console.log('🔍 SwapForm handleFocusChange called with:', isFocused);
            console.log('🔍 S…
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:23 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:24 🔍 SwapForm handleFocusChange called with: false
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:25 🔍 SwapForm about to call setInputFocused with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:191 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: false → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
   
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 2 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 2
 🔍 isInputActive listeners after add: 3
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 2
 🔍 isInputFocused listeners after add: 3
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 3
 🔍 isInputActive listeners after add: 4
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 3
 🔍 isInputFocused listeners after add: 4
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 4
 🔍 isInputActive listeners after add: 5
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 4
 🔍 isInputFocused listeners after add: 5
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 5
 🔍 isInputFocused listeners after add: 6
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
 🔍 Viewport expansion unchanged: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && false )
 🔍    false || ( false )
 🔍   = false
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 5
 🔍 isInputFocused listeners after add: 6
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 Removing isInputActive listener, total listeners before: 5
 🔍 isInputActive listeners after remove: 4
 🔍 Removing isInputFocused listener, total listeners before: 5
 🔍 isInputFocused listeners after remove: 4
 🔍 Removing isInputActive listener, total listeners before: 4
 🔍 isInputActive listeners after remove: 3
 🔍 Removing isInputFocused listener, total listeners before: 4
 🔍 isInputFocused listeners after remove: 3
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at doubleInvokeEffectsOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16100:13)
    
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput hiding cursor
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput calling onFocusChange with: false
 🔍 CustomInput onFocusChange callback: 
 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
 🔍 SwapForm handleFocusChange called with: false
 🔍 SwapForm about to call setInputFocused with: false
 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: false → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 3 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 3 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 3
 🔍 isInputActive listeners after add: 4
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 3
 🔍 isInputFocused listeners after add: 4
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 4
 🔍 isInputActive listeners after add: 5
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 4
 🔍 isInputFocused listeners after add: 5
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 5
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:43 🔍 Removing isInputActive listener, total listeners before: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:45 🔍 isInputActive listeners after remove: 5
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:65 🔍 Removing isInputFocused listener, total listeners before: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:67 🔍 isInputFocused listeners after remove: 5
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:34 🔍 Adding isInputActive listener, total listeners: 5
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:36 🔍 isInputActive listeners after add: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 5
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 CustomInput render - isFocused: false value: 1
 🔍 CustomInput render - isFocused: false value: 1
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 Removing isInputActive listener, total listeners before: 5
 🔍 isInputActive listeners after remove: 4
 🔍 Removing isInputFocused listener, total listeners before: 5
 🔍 isInputFocused listeners after remove: 4
 🔍 Adding isInputActive listener, total listeners: 4
 🔍 isInputActive listeners after add: 5
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 4
 🔍 isInputFocused listeners after add: 5
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
 🔍 Viewport expansion unchanged: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && false )
 🔍    false || ( false )
 🔍   = false
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:1
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput hiding cursor
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput calling onFocusChange with: false
 🔍 CustomInput onFocusChange callback: 
 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
 🔍 SwapForm handleFocusChange called with: false
 🔍 SwapForm about to call setInputFocused with: false
 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: false → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
   
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 5 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 3 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 4 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 5 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 5
 🔍 isInputFocused listeners after add: 6
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 6
 🔍 isInputActive listeners after add: 7
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 6
 🔍 isInputFocused listeners after add: 7
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
 🔍 Viewport expansion unchanged: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:153 🔍 Viewport expansion unchanged: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:43 🔍 Removing isInputActive listener, total listeners before: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:45 🔍 isInputActive listeners after remove: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:65 🔍 Removing isInputFocused listener, total listeners before: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:67 🔍 isInputFocused listeners after remove: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:34 🔍 Adding isInputActive listener, total listeners: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:36 🔍 isInputActive listeners after add: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Removing isInputActive listener, total listeners before: 7
 🔍 isInputActive listeners after remove: 6
 🔍 Removing isInputFocused listener, total listeners before: 7
 🔍 isInputFocused listeners after remove: 6
 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at doubleInvokeEffectsOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16100:13)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16060:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_module
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput hiding cursor
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput calling onFocusChange with: false
 🔍 CustomInput onFocusChange callback: 
 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
 🔍 SwapForm handleFocusChange called with: false
 🔍 SwapForm about to call setInputFocused with: false
 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: false → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at doubleInvokeEffectsOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16100:13)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16060:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/co
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 5 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 3 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 4 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 5 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 5
 🔍 isInputFocused listeners after add: 6
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 6
 🔍 isInputActive listeners after add: 7
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 6
 🔍 isInputFocused listeners after add: 7
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 CustomInput render - isFocused: false value: 1
 🔍 CustomInput render - isFocused: false value: 1
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 Removing isInputActive listener, total listeners before: 7
 🔍 isInputActive listeners after remove: 6
 🔍 Removing isInputFocused listener, total listeners before: 7
 🔍 isInputFocused listeners after remove: 6
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
 🔍 Viewport expansion unchanged: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:136 🔍 ===== CustomInput FOCUS STATE CHANGE =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:137 🔍 CustomInput isFocused changed to: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:138 🔍 CustomInput calling onFocusChange with: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:139 🔍 CustomInput onFocusChange callback: (isFocused)=>{
            console.log('🔍 ===== SwapForm FOCUS CHANGE HANDLER =====');
            console.log('🔍 SwapForm handleFocusChange called with:', isFocused);
            console.log('🔍 S…
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:23 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:24 🔍 SwapForm handleFocusChange called with: false
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:25 🔍 SwapForm about to call setInputFocused with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:191 🔍 ===== setInputFocused CALLED =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:192 🔍 Input focused state change: false → false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:193 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
   
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:196 🔍 ✅ Global inputFocused state updated to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:199 🔍 Notifying 6 listeners about isInputFocused change
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 1 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 2 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 3 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 4 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 5 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 6 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:207 🔍 ===== setInputFocused COMPLETED =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:208 🔍 Final global state - isInputActive: false isInputFocused: false
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:27 🔍 SwapForm setInputFocused call completed
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:28 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:141 🔍 CustomInput onFocusChange completed
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:142 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:153 🔍 Viewport expansion unchanged: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:168 🔍 CustomInput handleTextClick called, isFocused: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:184 🔍 CustomInput handleTextClick setting isFocused to true
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:187 🔍 CustomInput handleTextClick completed
 🔍 CustomInput render - isFocused: true value: 1
 🔍 CustomInput render - isFocused: true value: 1
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: true
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:1
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput setting cursor to visible (no blinking)
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:137 🔍 CustomInput isFocused changed to: true
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:138 🔍 CustomInput calling onFocusChange with: true
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:139 🔍 CustomInput onFocusChange callback: (isFocused)=>{
            console.log('🔍 ===== SwapForm FOCUS CHANGE HANDLER =====');
            console.log('🔍 SwapForm handleFocusChange called with:', isFocused);
            console.log('🔍 S…
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:23 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:24 🔍 SwapForm handleFocusChange called with: true
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:25 🔍 SwapForm about to call setInputFocused with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:191 🔍 ===== setInputFocused CALLED =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:192 🔍 Input focused state change: false → true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:193 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
   
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:196 🔍 ✅ Global inputFocused state updated to: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:199 🔍 Notifying 6 listeners about isInputFocused change
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 1 with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 2 with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 3 with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 4 with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 5 with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 6 with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:207 🔍 ===== setInputFocused COMPLETED =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:208 🔍 Final global state - isInputActive: false isInputFocused: true
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:27 🔍 SwapForm setInputFocused call completed
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:28 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:141 🔍 CustomInput onFocusChange completed
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:142 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:19 🔍 ===== Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:20 🔍 Swap render - isInputFocused: true shouldBeCompact: true
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:21 🔍 Swap render - will show CustomKeyboard: YES
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:22 🔍 ===== END Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:19 🔍 ===== Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:20 🔍 Swap render - isInputFocused: true shouldBeCompact: true
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:21 🔍 Swap render - will show CustomKeyboard: YES
C:\BigBang\backup\whatever\src\app\main\components\swap.tsx:22 🔍 ===== END Swap COMPONENT RENDER =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:40 🔍 CustomInput render - isFocused: false value: 1
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:40 🔍 CustomInput render - isFocused: false value: 1
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\custom-keyboard.tsx:13 🔍 ===== CustomKeyboard RENDER =====
C:\BigBang\backup\whatever\src\app\main\components\custom-keyboard.tsx:14 🔍 CustomKeyboard component rendered
C:\BigBang\backup\whatever\src\app\main\components\custom-keyboard.tsx:15 🔍 ===== END CustomKeyboard RENDER =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\app\main\components\custom-keyboard.tsx:13 🔍 ===== CustomKeyboard RENDER =====
C:\BigBang\backup\whatever\src\app\main\components\custom-keyboard.tsx:14 🔍 CustomKeyboard component rendered
C:\BigBang\backup\whatever\src\app\main\components\custom-keyboard.tsx:15 🔍 ===== END CustomKeyboard RENDER =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:43 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 Removing isInputActive listener, total listeners before: 5
 🔍 isInputActive listeners after remove: 4
 🔍 Removing isInputFocused listener, total listeners before: 5
 🔍 isInputFocused listeners after remove: 4
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: true
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    true || ( true && false )
 🔍    true || ( false )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:1
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput hiding cursor
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput calling onFocusChange with: false
 🔍 CustomInput onFocusChange callback: 
 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
 🔍 SwapForm handleFocusChange called with: false
 🔍 SwapForm about to call setInputFocused with: false
 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: true → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
   
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 4 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 3 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 4 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 4
 🔍 isInputActive listeners after add: 5
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 4
 🔍 isInputFocused listeners after add: 5
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    true || ( true && true )
 🔍    true || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 5
 🔍 isInputFocused listeners after add: 6
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    true || ( true && true )
 🔍    true || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 6
 🔍 isInputActive listeners after add: 7
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 6
 🔍 isInputFocused listeners after add: 7
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    true || ( true && true )
 🔍    true || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    true || ( true && false )
 🔍    true || ( false )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    true || ( true && false )
 🔍    true || ( false )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    true || ( true && false )
 🔍    true || ( false )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Removing isInputActive listener, total listeners before: 7
 🔍 isInputActive listeners after remove: 6
 🔍 Removing isInputFocused listener, total listeners before: 7
 🔍 isInputFocused listeners after remove: 6
 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 Removing isInputActive listener, total listeners before: 5
 🔍 isInputActive listeners after remove: 4
 🔍 Removing isInputFocused listener, total listeners before: 5
 🔍 isInputFocused listeners after remove: 4
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at doubleInvokeEffectsOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16100:13)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16060:17)
    at 
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput hiding cursor
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput calling onFocusChange with: false
 🔍 CustomInput onFocusChange callback: 
 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
 🔍 SwapForm handleFocusChange called with: false
 🔍 SwapForm about to call setInputFocused with: false
 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: false → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at doubleInvokeEffectsOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16100:13)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at recursivelyTra
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 4 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 3 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 4 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 4
 🔍 isInputActive listeners after add: 5
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 4
 🔍 isInputFocused listeners after add: 5
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): true
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    true || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    true || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:34 🔍 Adding isInputActive listener, total listeners: 5
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:36 🔍 isInputActive listeners after add: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 5
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    true || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    true || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:34 🔍 Adding isInputActive listener, total listeners: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:36 🔍 isInputActive listeners after add: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    true || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    true || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 CustomInput render - isFocused: false value: 1
 🔍 CustomInput render - isFocused: false value: 1
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 Removing isInputActive listener, total listeners before: 7
 🔍 isInputActive listeners after remove: 6
 🔍 Removing isInputFocused listener, total listeners before: 7
 🔍 isInputFocused listeners after remove: 6
 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 Removing isInputActive listener, total listeners before: 5
 🔍 isInputActive listeners after remove: 4
 🔍 Removing isInputFocused listener, total listeners before: 5
 🔍 isInputFocused listeners after remove: 4
 🔍 Adding isInputActive listener, total listeners: 4
 🔍 isInputActive listeners after add: 5
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 4
 🔍 isInputFocused listeners after add: 5
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && false )
 🔍    false || ( false )
 🔍   = false
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:1
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput hiding cursor
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput calling onFocusChange with: false
 🔍 CustomInput onFocusChange callback: 
 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
 🔍 SwapForm handleFocusChange called with: false
 🔍 SwapForm about to call setInputFocused with: false
 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: false → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
   
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 5 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 3 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 4 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 5 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 5
 🔍 isInputFocused listeners after add: 6
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 6
 🔍 isInputActive listeners after add: 7
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 6
 🔍 isInputFocused listeners after add: 7
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && false )
 🔍    false || ( false )
 🔍   = false
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:43 🔍 Removing isInputActive listener, total listeners before: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:45 🔍 isInputActive listeners after remove: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:65 🔍 Removing isInputFocused listener, total listeners before: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:67 🔍 isInputFocused listeners after remove: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:34 🔍 Adding isInputActive listener, total listeners: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:36 🔍 isInputActive listeners after add: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:39 🔍 Setting initial isInputActive from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:56 🔍 Adding isInputFocused listener, total listeners: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:58 🔍 isInputFocused listeners after add: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:61 🔍 Setting initial isInputFocused from global state: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:159 🔍 Setting isViewportExpanded to: true from: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:214 🔍 isInputActive state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:220 🔍 isInputFocused state changed to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( true )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:43 🔍 Removing isInputActive listener, total listeners before: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:45 🔍 isInputActive listeners after remove: 6
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:65 🔍 Removing isInputFocused listener, total listeners before: 7
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:67 🔍 isInputFocused listeners after remove: 6
 🔍 Removing isInputActive listener, total listeners before: 6
 🔍 isInputActive listeners after remove: 5
 🔍 Removing isInputFocused listener, total listeners before: 6
 🔍 isInputFocused listeners after remove: 5
 🔍 ===== CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput isFocused stack trace: Error
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:20:66)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at doubleInvokeEffectsOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16100:13)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16060:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_module
 🔍 ===== END CustomInput isFocused STATE CHANGE =====
 🔍 CustomInput hiding cursor
 🔍 ===== CustomInput FOCUS STATE CHANGE =====
 🔍 CustomInput isFocused changed to: false
 🔍 CustomInput calling onFocusChange with: false
 🔍 CustomInput onFocusChange callback: 
 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
 🔍 SwapForm handleFocusChange called with: false
 🔍 SwapForm about to call setInputFocused with: false
 🔍 ===== setInputFocused CALLED =====
 🔍 Input focused state change: false → false
 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14097:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14144:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14068:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14090:11)
    at doubleInvokeEffectsOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16100:13)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16060:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16067:17)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/co
 🔍 ✅ Global inputFocused state updated to: false
 🔍 Notifying 5 listeners about isInputFocused change
 🔍 Notifying input focused listener 1 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 2 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 3 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 4 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 Notifying input focused listener 5 with: false
 🔍 Global isInputFocused listener triggered with: false
 🔍 ===== setInputFocused COMPLETED =====
 🔍 Final global state - isInputActive: false isInputFocused: false
 🔍 SwapForm setInputFocused call completed
 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
 🔍 CustomInput onFocusChange completed
 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
 🔍 Adding isInputActive listener, total listeners: 5
 🔍 isInputActive listeners after add: 6
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 5
 🔍 isInputFocused listeners after add: 6
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 Adding isInputActive listener, total listeners: 6
 🔍 isInputActive listeners after add: 7
 🔍 Setting initial isInputActive from global state: false
 🔍 Adding isInputFocused listener, total listeners: 6
 🔍 isInputFocused listeners after add: 7
 🔍 Setting initial isInputFocused from global state: false
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: false, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: false, …}
 🔍 Setting isViewportExpanded to: true from: false
 🔍 isInputActive state changed to: false
 🔍 isInputFocused state changed to: false
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: false
 🔍   isInBrowser: false
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
 🔍   globalIsInputActive: false
 🔍   globalInputFocused: false
 🔍 shouldBeCompact calculation:
 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
 🔍    false || ( true && true )
 🔍    false || ( true )
 🔍   = true
 🔍 ===== END VIEWPORT STATE DEBUG =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 ===== Swap COMPONENT RENDER =====
 🔍 Swap render - isInputFocused: false shouldBeCompact: false
 🔍 Swap render - will show CustomKeyboard: NO
 🔍 ===== END Swap COMPONENT RENDER =====
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 CustomInput render - isFocused: false value: 1
 🔍 CustomInput render - isFocused: false value: 1
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 useKeyboardDetection hook initialized/re-rendered
 🔍 Removing isInputActive listener, total listeners before: 7
 🔍 isInputActive listeners after remove: 6
 🔍 Removing isInputFocused listener, total listeners before: 7
 🔍 isInputFocused listeners after remove: 6
 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
 🔍 Viewport expansion unchanged: true
 🔍 ===== VIEWPORT STATE DEBUG =====
 🔍 Current state values:
 🔍   isKeyboardOpen: false
 🔍   isViewportExpanded: true
 🔍   isInBrowser: true
 🔍   mockViewportExpanded: true
 🔍   isInputActive (local): false
 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:136 🔍 ===== CustomInput FOCUS STATE CHANGE =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:137 🔍 CustomInput isFocused changed to: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:138 🔍 CustomInput calling onFocusChange with: false
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:139 🔍 CustomInput onFocusChange callback: (isFocused)=>{
            console.log('🔍 ===== SwapForm FOCUS CHANGE HANDLER =====');
            console.log('🔍 SwapForm handleFocusChange called with:', isFocused);
            console.log('🔍 S…
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:23 🔍 ===== SwapForm FOCUS CHANGE HANDLER =====
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:24 🔍 SwapForm handleFocusChange called with: false
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:25 🔍 SwapForm about to call setInputFocused with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:191 🔍 ===== setInputFocused CALLED =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:192 🔍 Input focused state change: false → false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:193 🔍 setInputFocused stack trace: Error
    at setInputFocused (webpack-internal:///(app-pages-browser)/./src/hooks/use-keyboard-detection.ts:199:56)
    at SwapForm.useCallback[handleFocusChange] (webpack-internal:///(app-pages-browser)/./src/app/main/components/swap-form.tsx:42:13)
    at CustomInput.useEffect (webpack-internal:///(app-pages-browser)/./src/app/main/components/custom-input.tsx:147:75)
    at react-stack-bottom-frame (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23055:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:845:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:11978:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12099:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13929:13)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14048:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
    at recursivelyTraversePassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13902:11)
    at commitPassiveMountOnFiber (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@15.3.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:13922:11)
   
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:196 🔍 ✅ Global inputFocused state updated to: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:199 🔍 Notifying 6 listeners about isInputFocused change
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 1 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 2 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 3 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 4 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 5 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:202 🔍 Notifying input focused listener 6 with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:52 🔍 Global isInputFocused listener triggered with: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:207 🔍 ===== setInputFocused COMPLETED =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:208 🔍 Final global state - isInputActive: false isInputFocused: false
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:27 🔍 SwapForm setInputFocused call completed
C:\BigBang\backup\whatever\src\app\main\components\swap-form.tsx:28 🔍 ===== END SwapForm FOCUS CHANGE HANDLER =====
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:141 🔍 CustomInput onFocusChange completed
C:\BigBang\backup\whatever\src\app\main\components\custom-input.tsx:142 🔍 ===== END CustomInput FOCUS STATE CHANGE =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:136 🔍 Viewport expansion effect running - TRIGGERED BY: {isInBrowser: true, mockViewportExpanded: true, isKeyboardOpen: false, telegramIsExpanded: true, currentIsViewportExpanded: true, …}
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:153 🔍 Viewport expansion unchanged: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:227 🔍 ===== VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:228 🔍 Current state values:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:229 🔍   isKeyboardOpen: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:230 🔍   isViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:231 🔍   isInBrowser: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:232 🔍   mockViewportExpanded: true
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:233 🔍   isInputActive (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:234 🔍   isInputFocused (local): false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:235 🔍   globalIsInputActive: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:236 🔍   globalInputFocused: false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:237 🔍 shouldBeCompact calculation:
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:238 🔍   isInputFocused || (!isKeyboardOpen && !isViewportExpanded)
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:239 🔍    false || ( true && false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:240 🔍    false || ( false )
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:241 🔍   = false
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:242 🔍 ===== END VIEWPORT STATE DEBUG =====
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
C:\BigBang\backup\whatever\src\hooks\use-keyboard-detection.ts:16 🔍 useKeyboardDetection hook initialized/re-rendered
