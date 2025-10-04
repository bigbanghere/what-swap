const { RoutingApi } = require('@swap-coffee/sdk');

async function testTonUsdtForwardCalculation() {
    console.log('🧪 Testing TON > USDT forward calculation');
    console.log('📊 Testing: 1 TON → ? USDT');
    
    const routingApi = new RoutingApi();
    
    // Define tokens with the correct full addresses
    const tonToken = {
        blockchain: "ton",
        address: "native"
    };
    
    const usdtToken = {
        blockchain: "ton", 
        address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"
    };
    
    try {
        console.log('🔄 Calling API with:');
        console.log('  - input_token (TON):', tonToken);
        console.log('  - output_token (USDT):', usdtToken);
        console.log('  - input_amount: 1');
        
        // Test the forward calculation: 1 TON → ? USDT
        const route = await routingApi.buildRoute({
            input_token: tonToken,
            output_token: usdtToken,
            input_amount: 1,
        });
        
        console.log('\n✅ API Forward Calculation result:');
        console.log('  - 1 TON →', route.data?.output_amount, 'USDT');
        
        // Now test reverse: ? TON → 1 USDT
        console.log('\n🔄 Testing reverse calculation: ? TON → 1 USDT');
        const reverseRoute = await routingApi.buildRoute({
            input_token: tonToken,
            output_token: usdtToken,
            output_amount: 1,
        });
        
        console.log('✅ API Reverse Calculation result:');
        console.log('  -', reverseRoute.data?.input_amount, 'TON → 1 USDT');
        
        // Analysis
        const forwardOutput = route.data?.output_amount;
        const reverseInput = reverseRoute.data?.input_amount;
        
        if (forwardOutput && reverseInput) {
            console.log('\n📊 Analysis:');
            console.log('  - Forward: 1 TON →', forwardOutput, 'USDT');
            console.log('  - Reverse:', reverseInput, 'TON → 1 USDT');
            console.log('  - Ratio check: 1 /', forwardOutput, '=', 1 / forwardOutput);
            console.log('  - Reverse calculation:', reverseInput);
            console.log('  - Difference:', Math.abs(1 / forwardOutput - reverseInput));
            
            console.log('\n🎯 Verification:');
            console.log('  - App shows: 2.812043 TON → 1 USDT');
            console.log('  - API shows:', reverseInput, 'TON → 1 USDT');
            console.log('  - Match:', Math.abs(2.812043 - reverseInput) < 0.001 ? '✅ YES' : '❌ NO');
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testTonUsdtForwardCalculation();
