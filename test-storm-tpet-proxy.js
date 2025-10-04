// Test Storm > TPet calculation using the app's proxy API
async function testStormTpetCalculation() {
    console.log('🧪 Testing Storm > TPet calculation via app proxy');
    console.log('📊 Testing: 111 STORM → ? TPET');
    
    // Token addresses from the app logs
    const stormToken = {
        blockchain: "ton",
        address: "0:6ca2c99c66b0fa1478a303ba9618bc39c28fda1f"
    };
    
    const tpetToken = {
        blockchain: "ton", 
        address: "0:264068a5b84d6ae76b2d3be7c73da4f5f43c4adf"
    };
    
    try {
        console.log('🔄 Testing with 1 STORM first...');
        
        // Test with 1 STORM
        const testResponse = await fetch('http://localhost:3000/api/swap-coffee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpoint: '/api/v1/routing/build-route',
                data: {
                    input_token: stormToken,
                    output_token: tpetToken,
                    input_amount: 1,
                }
            })
        });
        
        if (!testResponse.ok) {
            const errorData = await testResponse.json();
            console.log('❌ Test failed:', errorData);
            return;
        }
        
        const testResult = await testResponse.json();
        console.log('✅ Test successful: 1 STORM →', testResult.data?.output_amount, 'TPET');
        
        // Now test with 111 STORM
        console.log('\n🔄 Testing with 111 STORM...');
        
        const response = await fetch('http://localhost:3000/api/swap-coffee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpoint: '/api/v1/routing/build-route',
                data: {
                    input_token: stormToken,
                    output_token: tpetToken,
                    input_amount: 111,
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.log('❌ API Error:', errorData);
            return;
        }
        
        const result = await response.json();
        console.log('\n✅ API Calculation result:');
        console.log('  - 111 STORM →', result.data?.output_amount, 'TPET');
        
        // Compare with app result
        const appResult = 125.857701;
        const apiResult = result.data?.output_amount;
        
        console.log('\n🔍 Comparison with app result:');
        console.log('  - App shows: 111 STORM → 125.857701 TPET');
        console.log('  - API shows: 111 STORM →', apiResult, 'TPET');
        console.log('  - Difference:', Math.abs(appResult - apiResult));
        
        if (Math.abs(appResult - apiResult) < 0.01) {
            console.log('  ✅ Results match within 0.01 TPET');
        } else {
            console.log('  ❌ Results differ significantly');
        }
        
        // Calculate ratio for 1 STORM
        const singleOutput = testResult.data?.output_amount;
        const multipleOutput = result.data?.output_amount;
        
        if (singleOutput && multipleOutput) {
            console.log('\n📊 Analysis:');
            console.log('  - 1 STORM =', singleOutput, 'TPET');
            console.log('  - 111 STORM =', multipleOutput, 'TPET');
            console.log('  - Ratio check: 111 ×', singleOutput, '=', 111 * singleOutput);
            console.log('  - Direct calculation:', multipleOutput);
            console.log('  - Difference:', Math.abs(111 * singleOutput - multipleOutput));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testStormTpetCalculation();
