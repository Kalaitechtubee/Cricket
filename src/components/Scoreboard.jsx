import React, { memo } from "react";

const BowlingStats = memo(({ stats }) => (
  <div className="w-full mt-4">
    <div className="p-4 bg-gray-800 rounded-lg">
      <h4 className="mb-3 text-lg font-semibold text-white">Bowling</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="text-gray-400">
              <th className="pb-2 text-left"></th>
              <th className="pb-2 text-right">O</th>
              <th className="pb-2 text-right">M</th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">W</th>
              <th className="pb-2 text-right">ECO</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((player, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="py-2 text-left">
                  {player.name}
                  {player.isBowling && <span className="text-red-500">*</span>}
                </td>
                <td className="py-2 text-right">{player.overs}</td>
                <td className="py-2 text-right">{player.maidens}</td>
                <td className="py-2 text-right">{player.runs}</td>
                <td className="py-2 text-right">{player.wickets}</td>
                <td className="py-2 text-right">{player.economy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

const BattingStats = memo(({ stats }) => (
  <div className="w-full mt-4">
    <div className="p-4 bg-gray-800 rounded-lg">
      <h4 className="mb-3 text-lg font-semibold text-white">Batting</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="text-gray-400">
              <th className="pb-2 text-left"></th>
              <th className="pb-2 text-right">R</th>
              <th className="pb-2 text-right">B</th>
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
                  {player.isBatting && <span className="text-red-500">*</span>}
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

const Scoreboard = memo(({ match }) => {
  if (!match) return null;

  const {
    currentRunRate,
    battingStats,
    bowlingStats,
    matchStatus,
  } = match.scoreboard || {};

  const isLive = match.status === "live";

  return (
    <div className="mt-6">
      {/* Match Header */}
      <div className="p-4 bg-gray-900 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-white">
          {match.seriesName} - {match.matchNumber}
        </h3>
        <p className="text-sm text-green-400">{isLive ? "IN PROGRESS" : matchStatus}</p>
        <div className="flex justify-center items-center my-4">
          <div className="flex items-center">
            <img src={match.teams[0].logo} alt={match.teams[0].shortName} className="w-12 h-12 mr-2" />
            <span className="text-white font-bold">{match.teams[0].shortName}</span>
          </div>
          <span className="mx-4 text-white font-semibold">VS</span>
          <div className="flex items-center">
            <img src={match.teams[1].logo} alt={match.teams[1].shortName} className="w-12 h-12 mr-2" />
            <span className="text-white font-bold">{match.teams[1].shortName}</span>
          </div>
        </div>
        <div className="text-white font-bold text-xl">
          {match.teams[1].shortName} {match.teams[1].score}/{match.teams[1].wickets} ({match.teams[1].overs}) CRR: {currentRunRate}
        </div>
      </div>

      {/* Batting Stats */}
      {isLive && battingStats && battingStats.length > 0 && (
        <BattingStats stats={battingStats} />
      )}

      {/* Bowling Stats */}
      {isLive && bowlingStats && bowlingStats.length > 0 && (
        <BowlingStats stats={bowlingStats} />
      )}

      {/* Match Status */}
      {isLive && matchStatus && (
        <div className="p-4 mt-6 bg-gray-800 rounded-lg">
          <h4 className="mb-2 text-lg font-semibold text-white">Match Status</h4>
          <p className="text-white">{matchStatus}</p>
        </div>
      )}
    </div>
  );
});

BowlingStats.displayName = "BowlingStats";
BattingStats.displayName = "BattingStats";
Scoreboard.displayName = "Scoreboard";

export default Scoreboard;