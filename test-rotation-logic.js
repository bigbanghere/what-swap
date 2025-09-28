// Test rotation logic step by step
const { RoutingApi } = require('@swap-coffee/sdk');

async function testRotationLogic() {
    console.log('🧪 Testing rotation logic step by step...');
    
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
    
    console.log('\n=== STEP 1: Initial state (1 TON → ? USDT) ===');
    
    // Initial forward calculation: 1 TON → ? USDT
    const initialRoute = await routingApi.buildRoute({
        input_token: tonToken,
        output_token: usdtToken,
        input_amount: 1,
    });
    
    const initialResult = initialRoute.data?.output_amount;
    console.log('Initial: 1 TON →', initialResult, 'USDT');
    
    console.log('\n=== STEP 2: After rotation (simulate what happens) ===');
    
    // After rotation:
    // - fromToken becomes USDT (was toToken)
    // - toToken becomes TON (was fromToken)  
    // - toAmount becomes "1" (the transferred value)
    // - We want to calculate: 1 TON → ? USDT
    
    console.log('After rotation:');
    console.log('- fromToken = USDT (was toToken)');
    console.log('- toToken = TON (was fromToken)');
    console.log('- toAmount = "1" (transferred value)');
    console.log('- We want: 1 TON → ? USDT');
    
    console.log('\n=== STEP 3: Reverse calculation call ===');
    
    // This is what our reverse calculation does:
    // calculateSwap(toToken, fromToken, toAmount)
    // = calculateSwap(TON, USDT, "1")
    
    console.log('Reverse calculation call: calculateSwap(TON, USDT, "1")');
    
    const reverseRoute = await routingApi.buildRoute({
        input_token: tonToken,  // TON (toToken)
        output_token: usdtToken, // USDT (fromToken)
        input_amount: 1,        // "1" (toAmount)
    });
    
    const reverseResult = reverseRoute.data?.output_amount;
    console.log('Reverse result: 1 TON →', reverseResult, 'USDT');
    
    console.log('\n=== STEP 4: Comparison ===');
    console.log('Initial calculation:', initialResult, 'USDT');
    console.log('Reverse calculation:', reverseResult, 'USDT');
    console.log('Difference:', Math.abs(initialResult - reverseResult), 'USDT');
    
    if (Math.abs(initialResult - reverseResult) < 0.01) {
        console.log('✅ Results match! The rotation logic should work correctly.');
    } else {
        console.log('❌ Results differ! There might be an issue with the rotation logic.');
    }
    
    console.log('\n=== STEP 5: Test the actual problem scenario ===');
    
    // Test what happens when we try to get 1 TON from USDT
    // This is what the user reported: "2.68 USDT should be sent to get 1 TON"
    
    console.log('Testing: How much USDT needed to get 1 TON?');
    
    const usdtToTonRoute = await routingApi.buildRoute({
        input_token: usdtToken,  // USDT
        output_token: tonToken,  // TON
        input_amount: 1,         // 1 USDT
    });
    
    const usdtToTonResult = usdtToTonRoute.data?.output_amount;
    console.log('1 USDT →', usdtToTonResult, 'TON');
    
    if (usdtToTonResult) {
        const usdtNeededFor1Ton = 1 / usdtToTonResult;
        console.log('To get 1 TON, need', usdtNeededFor1Ton, 'USDT');
        console.log('Expected: ~2.68 USDT');
        console.log('Difference:', Math.abs(usdtNeededFor1Ton - 2.68), 'USDT');
    }
}

// Run the test
testRotationLogic().catch(console.error);
