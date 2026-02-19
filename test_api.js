
// using built-in fetch

async function testApi() {
    try {
        const response = await fetch('http://localhost:3001/api/restaurants?lat=12.9352&lng=77.6245&radius=10');
        const data = await response.json();
        console.log('Success:', data.success);
        console.log('Count:', data.count);
        if (data.data && data.data.length > 0) {
            console.log('First restaurant:', data.data[0].name);
        } else {
            console.log('No restaurants found');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

testApi();
