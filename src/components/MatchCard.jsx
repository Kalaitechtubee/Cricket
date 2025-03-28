// components/MatchCard.jsx
import React from "react";

const MatchCard = ({ match }) => {
  const isUpcoming = match.status === "upcoming";
  const isCompleted = match.status === "completed";

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {match.seriesName} - Match {match.matchNumber}
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            isUpcoming ? "bg-blue-500" : "bg-green-500"
          }`}
        >
          {isUpcoming ? "UPCOMING" : "COMPLETE"}
        </span>
      </div>

      {isUpcoming && (
        <div className="text-center">
          <p className="text-sm mb-4">
            Match starts at {new Date(match.startTime).toLocaleString()}
          </p>
          <div className="flex justify-center items-center space-x-4">
            <div className="flex flex-col items-center">
              <img
                src={match.teams[0].logo}
                alt={match.teams[0].teamName}
                className="w-16 h-16 mb-2"
                onError={(e) => (e.target.src = "https://via.placeholder.com/50")} // Fallback image
              />
              <p className="text-sm">{match.teams[0].teamName}</p>
            </div>
            <span className="text-xl font-bold">VS</span>
            <div className="flex flex-col items-center">
              <img
                src={match.teams[1].logo}
                alt={match.teams[1].teamName}
                className="w-16 h-16 mb-2"
                onError={(e) => (e.target.src = "https://via.placeholder.com/50")} // Fallback image
              />
              <p className="text-sm">{match.teams[1].teamName}</p>
            </div>
          </div>
        </div>
      )}

      {isCompleted && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={match.teams[0].logo}
                alt={match.teams[0].teamName}
                className="w-12 h-12"
                onError={(e) => (e.target.src = "https://via.placeholder.com/50")} // Fallback image
              />
              <div>
                <p className="font-semibold">{match.teams[0].teamName}</p>
                <p className="text-lg">
                  {match.teams[0].score}/{match.teams[0].wickets} (
                  {match.teams[0].overs})
                </p>
              </div>
            </div>
            <span className="text-xl font-bold">VS</span>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-semibold">{match.teams[1].teamName}</p>
                <p className="text-lg">
                  {match.teams[1].score}/{match.teams[1].wickets} (
                  {match.teams[1].overs})
                </p>
              </div>
              <img
                src={match.teams[1].logo}
                alt={match.teams[1].teamName}
                className="w-12 h-12"
                onError={(e) => (e.target.src = "https://via.placeholder.com/50")} // Fallback image
              />
            </div>
          </div>

          <p className="text-center text-sm mb-4">{match.result?.resultText || "Result not available"}</p>
          <div className="flex justify-between text-sm mb-4">
            <p>
              {match.teams[0].shortName} Points: {match.points.team1Points}
            </p>
            <p>
              {match.teams[1].shortName} Points: {match.points.team2Points}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Batting Stats</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Player</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                  </tr>
                </thead>
                <tbody>
                  {match.battingStats.map((player, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {player.name}
                        {player.isNotOut && " *"}
                      </td>
                      <td className="text-center">{player.runs}</td>
                      <td className="text-center">{player.balls}</td>
                      <td className="text-center">{player.fours}</td>
                      <td className="text-center">{player.sixes}</td>
                      <td className="text-center">{player.strikeRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Bowling Stats</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Player</th>
                    <th>Overs</th>
                    <th>Maidens</th>
                    <th>Runs</th>
                    <th>Wickets</th>
                    <th>Eco</th>
                  </tr>
                </thead>
                <tbody>
                  {match.bowlingStats.map((player, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{player.name}</td>
                      <td className="text-center">{player.overs}</td>
                      <td className="text-center">{player.maidens}</td>
                      <td className="text-center">{player.runs}</td>
                      <td className="text-center">{player.wickets}</td>
                      <td className="text-center">{player.economy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MatchCard;