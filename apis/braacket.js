const { default: axios } = require("axios");
const FormData = require("form-data");
const prompt = require("prompt-sync")();
require("dotenv").config();

async function upload_challonge(ids, cookie, id_league, max_retries = 10) {
  console.log(`upload_challonge. league: ${id_league}, ids: ${ids}`);
  cookie = process.env.BRAACKET_COOKIE;

  for (const tournament of ids) {
    let success = false;
    let attempt = 0;
    let wait_time = 5000; // Initial wait time in milliseconds

    while (!success && attempt < max_retries) {
      try {
        // Sleep between tournament uploads / retries
        await new Promise((resolve) => setTimeout(resolve, wait_time));

        const formData = new FormData();
        formData.append("type", "challonge");
        formData.append("api_key", process.env.CHALLONGE_API_KEY);
        formData.append("tournament", tournament);
        formData.append("id_league", id_league);
        formData.append("league_weight", "100");
        formData.append("id_privacy_policy", "2");
        formData.append("exclude_dq", "on");
        formData.append("exclude_draw", "on");

        const headers = {
          ...formData.getHeaders(),
          Cookie: cookie,
        };

        const res = await axios.post("https://braacket.com/tournament/process/import", formData, { headers });
        console.log(`${res.data.status} uploading ${tournament}`);
        success = true; // Exit retry loop if successful
      } catch (error) {
        attempt++;
        console.error(`Error uploading ${tournament}. Attempt ${attempt} of ${max_retries}:`, error.message);

        if (attempt >= max_retries) {
          console.error(`Max retries reached for tournament ${tournament}. Moving to next ID.`);
        } else {
          console.log(`Retrying in ${wait_time / 1000} seconds...`);
          wait_time *= 3; // Triple the wait time for exponential backoff
        }
      }
    }
  }
}

module.exports = { upload_challonge };
