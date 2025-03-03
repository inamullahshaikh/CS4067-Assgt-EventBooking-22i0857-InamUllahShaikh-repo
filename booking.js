const readline = require("readline");
const axios = require("axios");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const BASE_URL = "http://localhost:5001/bookings";

function showMenu() {
  console.log("\n📌 Booking Service CLI");
  console.log("1. Create Booking");
  console.log("2. Get Booking by ID");
  console.log("3. Update Booking Status");
  console.log("4. Delete Booking");
  console.log("5. Exit");
  rl.question("Select an option: ", handleMenuSelection);
}

async function handleMenuSelection(choice) {
  switch (choice) {
    case "1":
      rl.question("Enter User ID: ", (user_id) => {
        rl.question("Enter Event ID: ", (event_id) => {
          rl.question("Enter Payment Amount: ", async (payment) => {
            try {
              const response = await axios.post(BASE_URL, {
                user_id,
                event_id,
                payment,
              });
              console.log("✅ Booking Created:", response.data);
            } catch (error) {
              console.error("❌ Error:", error.response?.data || error.message);
            }
            showMenu();
          });
        });
      });
      break;

    case "2":
      rl.question("Enter Booking ID: ", async (id) => {
        try {
          const response = await axios.get(`${BASE_URL}/${id}`);
          console.log("📜 Booking Details:", response.data);
        } catch (error) {
          console.error("❌ Error:", error.response?.data || error.message);
        }
        showMenu();
      });
      break;

    case "3":
      rl.question("Enter Booking ID: ", (id) => {
        rl.question("Enter New Status: ", async (status) => {
          try {
            const response = await axios.put(`${BASE_URL}/${id}/status`, {
              status,
            });
            console.log("✅ Booking Updated:", response.data);
          } catch (error) {
            console.error("❌ Error:", error.response?.data || error.message);
          }
          showMenu();
        });
      });
      break;

    case "4":
      rl.question("Enter Booking ID to Delete: ", async (id) => {
        try {
          const response = await axios.delete(`${BASE_URL}/${id}`);
          console.log("✅ Booking Deleted:", response.data);
        } catch (error) {
          console.error("❌ Error:", error.response?.data || error.message);
        }
        showMenu();
      });
      break;

    case "5":
      console.log("👋 Exiting CLI. Goodbye!");
      rl.close();
      break;

    default:
      console.log("❌ Invalid choice, try again!");
      showMenu();
  }
}

showMenu();
