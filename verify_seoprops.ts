

const BASE_URL = "http://localhost:8080/api/seoprops";

async function testSeoProps() {
    console.log("Starting SeoProps API verification...");

    // 1. Create
    console.log("1. Testing Create...");
    const createRes = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: "Test Page",
            description: "This is a test page",
            keywords: "test, seo",
            image: "test.jpg",
            pagename: "test-page-" + Date.now(),
        }),
    });

    if (!createRes.ok) {
        console.error("Create failed:", await createRes.text());
        return;
    }
    const created = await createRes.json();
    console.log("Created:", created);

    // 2. Get by pagename
    console.log("2. Testing Get by pagename...");
    const getRes = await fetch(`${BASE_URL}/${created.pagename}`);
    if (!getRes.ok) {
        console.error("Get failed:", await getRes.text());
        return;
    }
    const fetched = await getRes.json();
    console.log("Fetched:", fetched);

    // 3. Update
    console.log("3. Testing Update...");
    const updateRes = await fetch(`${BASE_URL}/${created.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: "Updated Test Page",
        }),
    });
    if (!updateRes.ok) {
        console.error("Update failed:", await updateRes.text());
        return;
    }
    const updated = await updateRes.json();
    console.log("Updated:", updated);

    // 4. Delete
    console.log("4. Testing Delete...");
    const deleteRes = await fetch(`${BASE_URL}/${created.id}`, {
        method: "DELETE",
    });
    if (!deleteRes.ok) {
        console.error("Delete failed:", await deleteRes.text());
        return;
    }
    console.log("Deleted successfully");

    console.log("Verification completed successfully!");
}

testSeoProps().catch(console.error);
