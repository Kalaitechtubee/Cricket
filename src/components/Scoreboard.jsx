
// import React from "react";

// const Scoreboard = ({ commentary }) => {
//   console.log("Scoreboard commentary:", commentary);

//   if (!commentary || commentary.status !== "success") {
//     return (
//       <p className="text-red-500 text-center text-lg">
//         No valid commentary data available
//       </p>
//     );
//   }

//   const { matchInfo, commentary: commentaryList } = commentary;
//   const battingTeam = matchInfo.score.teamA.runs > 0 ? "teamA" : "teamB";

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       {/* Match Info */}
//       <div className="mb-4 text-center">
//         <h2 className="text-2xl font-bold text-gray-800">
//           {matchInfo.teams[0].teamName} vs {matchInfo.teams[1].teamName}
//         </h2>
//         <p className="text-sm text-gray-600">
//           Series: {matchInfo.seriesName} | Status: <span className="capitalize">{matchInfo.matchStatus}</span>
//         </p>
//       </div>

//       {/* Score */}
//       <div className="mb-6 grid grid-cols-1 gap-4">
//         <div className="bg-gray-100 p-4 rounded-md">
//           <p className="text-lg font-semibold text-gray-700">
//             {matchInfo.teams[battingTeam === "teamA" ? 0 : 1].teamName} (Batting)
//           </p>
//           <p className="text-2xl font-bold text-blue-600">
//             {matchInfo.score[battingTeam].runs}/{matchInfo.score[battingTeam].wickets}
//           </p>
//           <p className="text-sm text-gray-600">
//             Overs: {matchInfo.score[battingTeam].overs}
//           </p>
//         </div>
//       </div>

//       {/* Commentary */}
//       <div>
//         <h3 className="text-xl font-semibold text-gray-800 mb-2">Latest Commentary</h3>
//         <div className="space-y-3">
//           {commentaryList.slice(0, 3).map((comm, index) => (
//             <div
//               key={index}
//               className="bg-gray-50 p-3 rounded-md border-l-4 border-green-500"
//             >
//               <p className="text-sm font-medium text-gray-700">
//                 {comm.over}.{comm.ball} -{" "}
//                 {comm.wicket ? (
//                   <span className="text-red-600 font-bold">Wicket!</span>
//                 ) : (
//                   <span>{comm.runs} run{comm.runs !== 1 ? "s" : ""}</span>
//                 )}
//               </p>
//               <p className="text-gray-600">{comm.text}</p>
//               <p className="text-xs text-gray-400">
//                 {new Date(comm.timestamp).toLocaleTimeString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Scoreboard;
// services/cricbuzzApi.js
import axios from "axios";

const BASE_URL = "https://www.cricbuzz.com/api/cricket-match/commentary/";
const CACHE_DURATION = 30000; // 30 seconds cache

let lastFetchTime = 0;
let cachedData = null;

export const fetchCommentary = async (matchId) => {
  try {
    // Input validation
    if (!matchId || typeof matchId !== "string") {
      throw new Error("Invalid match ID provided");
    }

    const now = Date.now();
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      console.log("Returning cached commentary data");
      return cachedData;
    }

    console.log(`Fetching commentary for matchId: ${matchId}`);
    const response = await axios.get(`${BASE_URL}${matchId}`, {
      timeout: 10000, // 10s timeout
    });

    const commentaryData = response.data;
    if (!commentaryData?.matchHeader || !commentaryData?.miniscore) {
      throw new Error("Invalid commentary data structure");
    }

    const matchHeader = commentaryData.matchHeader;
    const miniscore = commentaryData.miniscore;
    const commentaryList = commentaryData.commentaryList || [];

    const formattedData = {
      matchId: matchHeader.matchId,
      status: "success",
      matchInfo: {
        seriesName: matchHeader.seriesDesc || matchHeader.matchDescription || "Unknown Series",
        teams: [
          {
            teamId: matchHeader.team1?.id || "1",
            teamName: matchHeader.team1?.name || "Team 1",
            shortName: matchHeader.team1?.shortName || "T1",
          },
          {
            teamId: matchHeader.team2?.id || "2",
            teamName: matchHeader.team2?.name || "Team 2",
            shortName: matchHeader.team2?.shortName || "T2",
          },
        ],
        matchStatus: matchHeader.state || (matchHeader.complete ? "completed" : "live"),
        currentOver: miniscore.currentOvers || "0.0",
        score: {
          teamA: {
            runs: miniscore.batTeam?.runs || 0,
            wickets: miniscore.batTeam?.wickets || 0,
            overs: miniscore.currentOvers || "0.0",
          },
          teamB: {
            runs: miniscore.bowlTeam?.runs || 0,
            wickets: miniscore.bowlTeam?.wickets || 0,
            overs: miniscore.bowlTeam?.overs || "0.0",
          },
        },
      },
      commentary: commentaryList.slice(0, 10).map((comm) => ({
        over: comm.overNumber || "N/A",
        ball: comm.ballNumber || "N/A",
        text: comm.commText || "No commentary available",
        timestamp: new Date(comm.timestamp * 1000).toISOString(),
        runs: comm.runs || 0,
        wicket: !!comm.wicket,
        eventType: comm.eventType || "ball",
      })),
    };

    lastFetchTime = now;
    cachedData = formattedData;
    return formattedData;

  } catch (error) {
    console.error("Error fetching commentary:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

// components/Scoreboard.jsx
import React from "react";

const Scoreboard = ({ commentary }) => {
  if (!commentary || commentary.status !== "success") {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-lg font-medium">
          Unable to load match data
        </p>
      </div>
    );
  }

  const { matchInfo, commentary: commentaryList } = commentary;
  const battingTeam = matchInfo.score.teamA.runs > 0 ? "teamA" : "teamB";
  const bowlingTeam = battingTeam === "teamA" ? "teamB" : "teamA";

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg transition-all duration-300">
      {/* Match Info */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          {matchInfo.teams[0].shortName} vs {matchInfo.teams[1].shortName}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {matchInfo.seriesName} |{" "}
          <span className={`capitalize ${matchInfo.matchStatus === "live" ? "text-green-600" : "text-gray-600"}`}>
            {matchInfo.matchStatus}
          </span>
        </p>
      </div>

      {/* Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-lg font-semibold text-gray-700">Batting</p>
          <p className="text-3xl font-bold text-blue-600">
            {matchInfo.score[battingTeam].runs}/{matchInfo.score[battingTeam].wickets}
          </p>
          <p className="text-sm text-gray-600">
            Overs: {matchInfo.score[battingTeam].overs}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-lg font-semibold text-gray-700">Bowling</p>
          <p className="text-3xl font-bold text-purple-600">
            {matchInfo.score[bowlingTeam].runs}/{matchInfo.score[bowlingTeam].wickets}
          </p>
          <p className="text-sm text-gray-600">
            Overs: {matchInfo.score[bowlingTeam].overs}
          </p>
        </div>
      </div>

      {/* Commentary */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Recent Updates</h3>
        <div className="space-y-4">
          {commentaryList.map((comm, index) => (
            <div
              key={`${comm.timestamp}-${index}`}
              className="bg-gray-50 p-4 rounded-lg border-l-4 border-l-green-500 hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-gray-700">
                {comm.over}.{comm.ball} -{" "}
                {comm.wicket ? (
                  <span className="text-red-600 font-bold">WICKET!</span>
                ) : (
                  <span className="text-blue-600">
                    {comm.runs} run{comm.runs !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <p className="text-gray-600 text-sm mt-1">{comm.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(comm.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;