const { RoutingApi } = require('@swap-coffee/sdk');

async function testReverseCalculation() {
    console.log('🧪 Testing API reverse calculation: 1 TON → ? USDT');
    
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
    
    try {
        console.log('🔄 Calling API with:');
        console.log('  - input_token (TON):', tonToken);
        console.log('  - output_token (USDT):', usdtToken);
        console.log('  - input_amount: 1');
        
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
        console.log('  - input_token (USDT):', usdtToken);
        console.log('  - output_token (TON):', tonToken);
        console.log('  - input_amount: 1');
        
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
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testReverseCalculation();
