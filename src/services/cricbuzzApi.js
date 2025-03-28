import axios from "axios";

const BASE_URL = "https://www.cricbuzz.com/api/cricket-match/commentary/";

export const fetchCommentary = async (matchId) => {
  try {
    console.log(`Fetching commentary for matchId: ${matchId}`);
    const response = await axios.get(`${BASE_URL}${matchId}`);
    console.log("Raw API Response:", response.data);

    const commentaryData = response.data;
    if (!commentaryData || !commentaryData.matchHeader || !commentaryData.miniscore) {
      throw new Error("Invalid commentary data returned");
    }

    const matchHeader = commentaryData.matchHeader;
    const miniscore = commentaryData.miniscore;
    const commentaryList = commentaryData.commentaryList || [];

    return {
      matchId: matchHeader.matchId,
      status: "success",
      matchInfo: {
        seriesName: matchHeader.seriesDesc || matchHeader.matchDescription || "Unknown Series",
        teams: [
          {
            teamId: matchHeader.team1?.id || "1",
            teamName: matchHeader.team1?.name || "Team 1",
          },
          {
            teamId: matchHeader.team2?.id || "2",
            teamName: matchHeader.team2?.name || "Team 2",
          },
        ],
        matchStatus: matchHeader.complete ? "completed" : "live",
        currentOver: miniscore.currentOvers || "N/A",
        score: {
          teamA: {
            runs: miniscore.batTeam?.runs || 0,
            wickets: miniscore.batTeam?.wickets || 0,
            overs: miniscore.currentOvers || "0.0",
          },
          teamB: {
            runs: 0,
            wickets: 0,
            overs: "0.0",
          },
        },
      },
      commentary: commentaryList.map((comm) => ({
        over: comm.overNumber || "N/A",
        ball: comm.ballNumber || "N/A",
        text: comm.commText || "No commentary available",
        timestamp: new Date(comm.timestamp * 1000).toISOString(),
        runs: comm.runs || 0,
        wicket: !!comm.wicket,
      })),
    };
  } catch (error) {
    console.error("Error fetching commentary:", error.message);
    throw error;
  }
};
