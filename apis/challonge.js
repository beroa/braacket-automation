const { default: axios } = require("axios");
require("dotenv").config();

console.log("umm", process.env.CHALLONGE_API_KEY);
async function get_tournaments(filter) {
  if (!filter) {
    console.log("get_tournaments() required filter, 'melee' or 'pm'");
    return;
  }

  const response = await axios.get(`https://api.challonge.com/v1/tournaments.json?api_key=${process.env.CHALLONGE_API_KEY}`);
  const tournaments = response.data;

  return tournaments
    .filter((tournament) => {
      if (tournament.tournament.description == "braacketed") {
        return false;
      } else if (filter === "melee") {
        return (
          (tournament.tournament.game_name === "Super Smash Bros. Melee" ||
            ["melee", "ssbm"].some((s) => tournament.tournament.name.toLowerCase().includes(s))) &&
          !["volley", "ganon", "dub", "doub", "side"].some((s) => tournament.tournament.name.toLowerCase().includes(s))
        );
      } else if (filter === "pm") {
        return (
          (tournament.tournament.game_name === "Project M" || ["pm", "p+"].some((s) => tournament.tournament.name.toLowerCase().includes(s))) &&
          !["dub", "doub", "side"].some((s) => tournament.tournament.name.toLowerCase().includes(s))
        );
      }
    })
    .sort((a, b) => new Date(b.tournament.created_at) - new Date(a.tournament.created_at))
    .map((s) => s.tournament.url)
}

async function mark_uploaded(challonge_ids) {
  console.log("marking uploaded", challonge_ids);
  for (const id of challonge_ids) {
    await axios.put(
      `https://api.challonge.com/v1/tournaments/${id}.json?api_key=${process.env.CHALLONGE_API_KEY}&tournament[description]=braacketed`
    );
  }
  console.log(`Marked ${challonge_ids.length} tournaments as uploaded`);
}

module.exports = { get_tournaments, mark_uploaded };
