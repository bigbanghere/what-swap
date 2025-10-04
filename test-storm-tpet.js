const { RoutingApi } = require('@swap-coffee/sdk');

async function testStormTpetCalculation() {
    console.log('🧪 Testing Storm > TPet calculation');
    console.log('📊 Testing: ? STORM → 111 TPET (reverse calculation)');
    
    const routingApi = new RoutingApi();
    
    // Define tokens with the correct full addresses from the app logs
    const stormToken = {
        blockchain: "ton",
        address: "0:6ca2c99c66b0fa1478a303ba9618bc39c28fda1fc50de37e618bddf98c9fd24c"
    };
    
    const tpetToken = {
        blockchain: "ton", 
        address: "0:264068a6291ad21c32e596f75475e0ec5f50accc6cbf48f80d34df301368a123"
    };
    
    // First test with 1 TPET to see if the addresses work
    console.log('🔄 Testing with 1 TPET first...');
    try {
        const testRoute = await routingApi.buildRoute({
            input_token: tpetToken,
            output_token: stormToken,
            input_amount: 1,
        });
        console.log('✅ Test successful: 1 TPET →', testRoute.data?.output_amount, 'STORM');
    } catch (testError) {
        console.log('❌ Test failed:', testError.response?.data || testError.message);
        return;
    }
    
    try {
        console.log('🔄 Calling API with:');
        console.log('  - input_token (STORM):', stormToken);
        console.log('  - output_token (TPET):', tpetToken);
        console.log('  - output_amount: 111 (desired TPET amount)');
        
        // Test the calculation: ? STORM → 111 TPET (using output_amount)
        const route = await routingApi.buildRoute({
            input_token: stormToken,
            output_token: tpetToken,
            output_amount: 111,
        });
        
        console.log('\n✅ API Calculation result:');
        console.log('  -', route.data?.input_amount, 'STORM → 111 TPET');
        
        // Also test with 1 TPET for comparison
        console.log('\n🔄 Testing with 1 TPET for comparison:');
        const singleRoute = await routingApi.buildRoute({
            input_token: stormToken,
            output_token: tpetToken,
            output_amount: 1,
        });
        
        console.log('✅ Single TPET calculation:');
        console.log('  -', singleRoute.data?.input_amount, 'STORM → 1 TPET');
        
        // Get the results
        const inputAmountFor111 = route.data?.input_amount;
        const inputAmountFor1 = singleRoute.data?.input_amount;
        
        if (inputAmountFor111 && inputAmountFor1) {
            console.log('\n📊 Analysis:');
            console.log('  - To get 1 TPET, you need', inputAmountFor1, 'STORM');
            console.log('  - To get 111 TPET, you need', inputAmountFor111, 'STORM');
            console.log('  - Ratio check: 111 ×', inputAmountFor1, '=', 111 * inputAmountFor1);
            console.log('  - Direct calculation:', inputAmountFor111);
            console.log('  - Difference:', Math.abs(111 * inputAmountFor1 - inputAmountFor111));
            
            // Calculate how many STORM needed for 111 TPET
            console.log('\n🎯 Answer to your question:');
            console.log('  - To get exactly 111 TPET, you need to send', inputAmountFor111, 'STORM');
            console.log('  - This means you need approximately', Math.ceil(inputAmountFor111), 'STORM tokens');
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testStormTpetCalculation();
