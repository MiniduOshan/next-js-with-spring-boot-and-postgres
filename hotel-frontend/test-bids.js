const fetch = require('node-fetch');

const API_BASE = "http://localhost:8080/api";

async function runTests() {
  console.log("Waiting for backend to start...");
  await new Promise(r => setTimeout(r, 10000));

  try {
    console.log("1. Creating Bid Request...");
    const reqRes = await fetch(`${API_BASE}/bid-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: "traveler@test.com",
        userName: "Traveler Test",
        location: "Paris",
        budget: "$500",
        requirements: "Need a pool"
      })
    });
    const reqData = await reqRes.json();
    console.log("Create Bid Request:", reqRes.status, reqData);

    const requestId = reqData.id || reqData._id;

    console.log("2. Fetching Open Bid Requests...");
    const openRes = await fetch(`${API_BASE}/open-bid-requests`);
    const openData = await openRes.json();
    console.log("Open Bid Requests:", openRes.status, "Count:", openData.length);

    console.log("3. Creating Bid Offer...");
    const offerRes = await fetch(`${API_BASE}/bid-requests/${requestId}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelId: "hotel-123",
        hotelName: "Grand Paris Hotel",
        ownerEmail: "partner@test.com",
        offerDetails: "We have a pool and a nice room",
        price: 450
      })
    });
    const offerData = await offerRes.json();
    console.log("Create Bid Offer:", offerRes.status, offerData);
    
    const offerId = offerData.id || offerData._id;

    console.log("4. Fetching Partner Offers...");
    const partnerRes = await fetch(`${API_BASE}/partner-offers`, {
      headers: { "X-Owner-Email": "partner@test.com" }
    });
    const partnerData = await partnerRes.json();
    console.log("Partner Offers:", partnerRes.status, "Count:", partnerData.length);

    console.log("5. Accepting the offer...");
    const acceptRes = await fetch(`${API_BASE}/bid-offers/${offerId}/accept`, {
      method: "PUT"
    });
    const acceptData = await acceptRes.json();
    console.log("Accept Offer:", acceptRes.status, acceptData.status);

    console.log("All tests completed!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTests();
