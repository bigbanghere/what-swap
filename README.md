+ fix recalculation on focus of the opposite field after input - focus changes completely ignored, only value changes trigger calculations, removed focus parameters from useSwapCalculation call, added refs for immediate focus state tracking, fixed Get field editing by preventing forward calculations from overriding user input when Get field is focused
+ amount minimization
+ Swap button states: Connect Wallet, Insufficient balance, Price impact too high
+ assets-page scrolling
+ languages support
+ check themes
+ wallet balance
+ user's tokens shortlist
+ value selection on long tap
+ actual swap functionality
+ footer

AxiosError: Request failed with status code 400
    at settle (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/axios@1.12.2/node_modules/axios/dist/browser/axios.cjs:2056:12)
    at XMLHttpRequest.onloadend (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/axios@1.12.2/node_modules/axios/dist/browser/axios.cjs:2506:7)
    at Axios.request (webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/axios@1.12.2/node_modules/axios/dist/browser/axios.cjs:3337:41)
    at async useSwapCalculation.useCallback[calculateSwap] (webpack-internal:///(app-pages-browser)/./src/hooks/use-swap-calculation.ts:92:31)