const API_URL = 'http://localhost:8080/api/pricing';

async function verify() {
    try {
        console.log('Fetching tiers...');
        const tiersResponse = await fetch(`${API_URL}/tiers`);
        const tiers = await tiersResponse.json();
        console.log('Tiers (Default/Detected):', tiers);

        const testCases = [
            { amount: 5, ip: '8.8.8.8', expectedCurrency: 'USD' }, // US IP
            { amount: 500, ip: '103.208.220.0', expectedCurrency: 'INR' }, // Indian IP
        ];

        for (const test of testCases) {
            console.log(`Calculating credits for ${test.amount} (IP: ${test.ip})...`);
            const response = await fetch(`${API_URL}/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Forwarded-For': test.ip
                },
                body: JSON.stringify({ amount: test.amount }),
            });
            const result = await response.json();
            console.log(`Result ${test.amount} (${test.expectedCurrency}):`, result);
        }

    } catch (error: any) {
        console.error('Verification failed:', error);
    }
}

verify();
