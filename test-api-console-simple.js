// Simple API test for browser console
// Copy and paste this into the browser console when the app is running

async function testSwapAPI() {
    console.log('🧪 Testing Swap API directly...');
    
    try {
        // Use the same approach as the application
        const { RoutingApi } = require('@swap-coffee/sdk');
        const routingApi = new RoutingApi();
        
        // Define tokens exactly as in the app
        const tonToken = {
            blockchain: "ton",
            address: "native"
        };
        
        const usdtToken = {
            blockchain: "ton", 
            address: "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"
        };
        
        console.log('🔄 Testing forward: 1 TON → ? USDT');
        
        // Forward calculation: 1 TON → ? USDT
        const forwardRoute = await routingApi.buildRoute({
            input_token: tonToken,
            output_token: usdtToken,
            input_amount: 1,
        });
        
        const forwardResult = forwardRoute.data?.output_amount;
        console.log('✅ Forward result: 1 TON →', forwardResult, 'USDT');
        
        console.log('🔄 Testing reverse: 1 USDT → ? TON');
        
        // Reverse calculation: 1 USDT → ? TON
        const reverseRoute = await routingApi.buildRoute({
            input_token: usdtToken,
            output_token: tonToken,
            input_amount: 1,
        });
        
        const reverseResult = reverseRoute.data?.output_amount;
        console.log('✅ Reverse result: 1 USDT →', reverseResult, 'TON');
        
        // Calculate what we need for 1 TON
        if (reverseResult) {
            const usdtNeededFor1Ton = 1 / reverseResult;
            console.log('📊 Calculated: To get 1 TON, need', usdtNeededFor1Ton, 'USDT');
            console.log('📊 Expected: ~2.68 USDT for 1 TON');
            console.log('📊 Difference:', Math.abs(usdtNeededFor1Ton - 2.68).toFixed(4), 'USDT');
            
            // Check if the calculation is reasonable
            if (Math.abs(usdtNeededFor1Ton - 2.68) < 0.1) {
                console.log('✅ API calculation looks correct!');
            } else {
                console.log('❌ API calculation seems off - expected ~2.68 USDT for 1 TON');
            }
        }
        
        return {
            forward: forwardResult,
            reverse: reverseResult,
            usdtNeededFor1Ton: reverseResult ? 1 / reverseResult : null
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        return null;
    }
}

// Run the test
console.log('Starting API test...');
testSwapAPI();
