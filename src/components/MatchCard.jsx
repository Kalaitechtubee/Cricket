// src/components/MatchCard.jsx (updated)
import React, { memo } from "react";
import Scoreboard from "./Scoreboard";

const TeamScore = memo(({ team, score, isRightAligned = false }) => (
  <div className={`flex flex-col items-center ${isRightAligned ? "items-end" : "items-start"}`}>
    <img
      src={team.logo}
      alt={team.teamName}
      className="object-contain w-16 h-16 mb-2 bg-gray-800 rounded-full"
      onError={(e) => {
        e.target.src = "https://placehold.co/50x50";
        e.target.classList.add("opacity-50");
      }}
    />
    <h3 className="mb-1 text-lg font-semibold text-white">{team.teamName}</h3>
    {score && (
      <p className="text-xl font-bold text-white">
        {score.runs}/{score.wickets} ({score.overs})
      </p>
    )}
  </div>
));

const BattingStats = memo(({ stats }) => (
  <div className="w-full mt-4">
    <div className="p-4 bg-gray-800 rounded-lg">
      <h4 className="mb-3 text-lg font-semibold text-white">Batting Stats</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="text-gray-400">
              <th className="pb-2 text-left">Player</th>
              <th className="pb-2 text-right">Runs</th>
              <th className="pb-2 text-right">Balls</th>
              <th className="pb-2 text-right">4s</th>
              <th className="pb-2 text-right">6s</th>
              <th className="pb-2 text-right">SR</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((player, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="py-2 text-left">
                  {player.name}
                  {player.notOut && <span className="text-blue-400">*</span>}
                </td>
                <td className="py-2 text-right">{player.runs}</td>
                <td className="py-2 text-right">{player.balls}</td>
                <td className="py-2 text-right">{player.fours}</td>
                <td className="py-2 text-right">{player.sixes}</td>
                <td className="py-2 text-right">{player.strikeRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

const MatchCard = memo(({ match }) => {
  if (!match) return null;

  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const isUpcoming = match.status === "upcoming";

  const getStatusColor = () => {
    switch (match.status) {
      case "completed":
        return "bg-gray-600";
      case "live":
        return "bg-blue-500";
      case "upcoming":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mb-6 overflow-hidden bg-gray-900 rounded-lg shadow-lg">
      {/* Match Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {match.seriesName} - {match.matchNumber}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor()}`}>
            {isUpcoming ? "UPCOMING" : isLive ? "LIVE" : "COMPLETE"}
          </span>
        </div>
        {isUpcoming && (
          <p className="mt-2 text-sm text-gray-400">
            Match starts at {new Date(match.startTime).toLocaleString()}
          </p>
        )}
      </div>

      {/* Teams and Scores */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <TeamScore 
            team={match.teams[0]} 
            score={isCompleted || isLive ? {
              runs: match.teams[0].score,
              wickets: match.teams[0].wickets,
              overs: match.teams[0].overs
            } : null}
          />
          <div className="flex flex-col items-center mx-4">
            <span className="mb-2 text-2xl font-bold text-white">VS</span>
            {isLive && (
              <span className="text-sm text-blue-400 animate-pulse">Live</span>
            )}
          </div>
          <TeamScore 
            team={match.teams[1]} 
            score={isCompleted || isLive ? {
              runs: match.teams[1].score,
              wickets: match.teams[1].wickets,
              overs: match.teams[1].overs
            } : null}
            isRightAligned
          />
        </div>

        {/* Match Result */}
        {isCompleted && match.result && (
          <div className="mt-4 text-center">
            <p className="font-medium text-green-400">{match.result.resultText}</p>
          </div>
        )}

        {/* Batting Stats */}
        {(isCompleted || isLive) && match.battingStats && (
          <BattingStats stats={match.battingStats} />
        )}

        {/* Additional Match Details */}
        {(isCompleted || isLive) && (
          <Scoreboard match={match} />
        )}
      </div>
    </div>
  );
});

MatchCard.displayName = "MatchCard";
TeamScore.displayName = "TeamScore";
BattingStats.displayName = "BattingStats";

export default MatchCard;