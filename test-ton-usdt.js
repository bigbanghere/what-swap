const { RoutingApi } = require('@swap-coffee/sdk');

async function testTonUsdtCalculation() {
    console.log('🧪 Testing TON > USDT calculation');
    console.log('📊 Testing: ? TON → 1 USDT (reverse calculation)');
    
    const routingApi = new RoutingApi();
    
    // Define tokens with the correct full addresses
    const tonToken = {
        blockchain: "ton",
        address: "0:0000000000000000000000000000000000000000000000000000000000000000"
    };
    
    const usdtToken = {
        blockchain: "ton", 
        address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"
    };
    
    try {
        console.log('🔄 Calling API with:');
        console.log('  - input_token (TON):', tonToken);
        console.log('  - output_token (USDT):', usdtToken);
        console.log('  - output_amount: 1 (desired USDT amount)');
        
        // Test the calculation: ? TON → 1 USDT (using output_amount)
        const route = await routingApi.buildRoute({
            input_token: tonToken,
            output_token: usdtToken,
            output_amount: 1,
        });
        
        console.log('\n✅ API Calculation result:');
        console.log('  -', route.data?.input_amount, 'TON → 1 USDT');
        
        // Also test with 1 TON for comparison
        console.log('\n🔄 Testing with 1 TON for comparison:');
        const singleRoute = await routingApi.buildRoute({
            input_token: tonToken,
            output_token: usdtToken,
            input_amount: 1,
        });
        
        console.log('✅ Single TON calculation:');
        console.log('  - 1 TON →', singleRoute.data?.output_amount, 'USDT');
        
        // Get the results
        const inputAmountFor1 = route.data?.input_amount;
        const outputAmountFor1 = singleRoute.data?.output_amount;
        
        if (inputAmountFor1 && outputAmountFor1) {
            console.log('\n📊 Analysis:');
            console.log('  - To get 1 USDT, you need', inputAmountFor1, 'TON');
            console.log('  - 1 TON gives you', outputAmountFor1, 'USDT');
            console.log('  - Ratio check: 1 /', outputAmountFor1, '=', 1 / outputAmountFor1);
            console.log('  - Direct calculation:', inputAmountFor1);
            console.log('  - Difference:', Math.abs(1 / outputAmountFor1 - inputAmountFor1));
            
            // Calculate how many TON needed for 1 USDT
            console.log('\n🎯 Answer to your question:');
            console.log('  - To get exactly 1 USDT, you need to send', inputAmountFor1, 'TON');
            console.log('  - This means you need approximately', Math.ceil(inputAmountFor1), 'TON tokens');
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testTonUsdtCalculation();


