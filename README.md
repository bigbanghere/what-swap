![lead picture](http://what-swap.vercel.app/lead.png)

## Development

To run the project in development mode:

```bash
pnpm run dev
```

## To Do

+ market cap, link to analitics
+ trench trading through bot > memepads integration + trading interface
+ 11 when I choose token bug
+ back button bag
+ emerald iced peak
+ user + connected wallet in db
+ notifications to bot
+ personalized ai reccomendations in bot
+ create wallet (store cloud checkmark), import wallet
+ cross-chain integration
+ pre-market
+ ai assistent
+ notifications for TTM

## To Test 

+ calculation bug (doge after multiple selection)
+ swap button reset and balances update after swap
+ actual swap functionality
+ token selection
+ $ rates
+ user's tokens shortlist
+ rotation (non-default)
+ amount minimization
+ Swap button states: Connect Wallet, Insufficient balance, Price impact too high
+ assets-page scrolling
+ languages support
+ check themes
+ value selection on long tap

## Errors noticed

AxiosError: Request failed with status code 400
    at settle (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/axios@1.12.2/node_modules/axios/dist/browser/axios.cjs:2056:12)
    at XMLHttpRequest.onloadend (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/axios@1.12.2/node_modules/axios/dist/browser/axios.cjs:2506:7)
    at Axios.request (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/axios@1.12.2/node_modules/axios/dist/browser/axios.cjs:3337:41)
    at async useSwapCalculation.useCallback[calculateSwap] (webpack-internal:///(app-pages-browser)/./src/hooks/use-swap-calculation.ts:92:31)