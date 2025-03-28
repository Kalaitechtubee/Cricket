
import React from "react";

const Scoreboard = ({ commentary }) => {
  console.log("Scoreboard commentary:", commentary);

  if (!commentary || commentary.status !== "success") {
    return (
      <p className="text-red-500 text-center text-lg">
        No valid commentary data available
      </p>
    );
  }

  const { matchInfo, commentary: commentaryList } = commentary;
  const battingTeam = matchInfo.score.teamA.runs > 0 ? "teamA" : "teamB";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Match Info */}
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {matchInfo.teams[0].teamName} vs {matchInfo.teams[1].teamName}
        </h2>
        <p className="text-sm text-gray-600">
          Series: {matchInfo.seriesName} | Status: <span className="capitalize">{matchInfo.matchStatus}</span>
        </p>
      </div>

      {/* Score */}
      <div className="mb-6 grid grid-cols-1 gap-4">
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-lg font-semibold text-gray-700">
            {matchInfo.teams[battingTeam === "teamA" ? 0 : 1].teamName} (Batting)
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {matchInfo.score[battingTeam].runs}/{matchInfo.score[battingTeam].wickets}
          </p>
          <p className="text-sm text-gray-600">
            Overs: {matchInfo.score[battingTeam].overs}
          </p>
        </div>
      </div>

      {/* Commentary */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Latest Commentary</h3>
        <div className="space-y-3">
          {commentaryList.slice(0, 3).map((comm, index) => (
            <div
              key={index}
              className="bg-gray-50 p-3 rounded-md border-l-4 border-green-500"
            >
              <p className="text-sm font-medium text-gray-700">
                {comm.over}.{comm.ball} -{" "}
                {comm.wicket ? (
                  <span className="text-red-600 font-bold">Wicket!</span>
                ) : (
                  <span>{comm.runs} run{comm.runs !== 1 ? "s" : ""}</span>
                )}
              </p>
              <p className="text-gray-600">{comm.text}</p>
              <p className="text-xs text-gray-400">
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