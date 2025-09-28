// Test API reverse calculation - copy and paste this into browser console
// Make sure the app is running first so the SDK is loaded

async function testReverseCalculation() {
    console.log('🧪 Testing API reverse calculation: 1 TON → ? USDT');
    
    try {
        // Get the RoutingApi from the global scope (if available)
        const { RoutingApi } = window.SwapCoffeeSDK || require('@swap-coffee/sdk');
        const routingApi = new RoutingApi();
        
        // Define tokens
        const tonToken = {
            blockchain: "ton",
            address: "native"
        };
        
        const usdtToken = {
            blockchain: "ton", 
            address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"
        };
        
        console.log('🔄 Testing forward calculation: 1 TON → ? USDT');
        
        // Test forward calculation: 1 TON → ? USDT
        const forwardRoute = await routingApi.buildRoute({
            input_token: tonToken,
            output_token: usdtToken,
            input_amount: 1,
        });
        
        console.log('✅ Forward calculation result:');
        console.log('  - 1 TON →', forwardRoute.data?.output_amount, 'USDT');
        
        // Test reverse calculation: ? USDT → 1 TON
        console.log('\n🔄 Testing reverse calculation: ? USDT → 1 TON');
        
        const reverseRoute = await routingApi.buildRoute({
            input_token: usdtToken,
            output_token: tonToken,
            input_amount: 1,
        });
        
        console.log('✅ Reverse calculation result:');
        console.log('  - 1 USDT →', reverseRoute.data?.output_amount, 'TON');
        
        // Calculate what we need for 1 TON
        const tonPerUsdt = reverseRoute.data?.output_amount;
        if (tonPerUsdt) {
            const usdtNeeded = 1 / tonPerUsdt;
            console.log('\n📊 Calculated:');
            console.log('  - 1 USDT gives', tonPerUsdt, 'TON');
            console.log('  - To get 1 TON, need', usdtNeeded, 'USDT');
            console.log('  - Expected: ~2.68 USDT for 1 TON');
            console.log('  - Difference from expected:', Math.abs(usdtNeeded - 2.68), 'USDT');
        }
        
        return {
            forward: forwardRoute.data?.output_amount,
            reverse: reverseRoute.data?.output_amount,
            usdtNeededFor1Ton: tonPerUsdt ? 1 / tonPerUsdt : null
        };
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.error('Full error:', error);
        return null;
    }
}

// Run the test
console.log('Starting API test...');
testReverseCalculation().then(result => {
    if (result) {
        console.log('🎯 Final results:', result);
    }
});
