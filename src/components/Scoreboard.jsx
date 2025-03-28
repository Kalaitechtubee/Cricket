// src/components/Scoreboard.jsx
import React, { memo } from "react";

const BowlingStats = memo(({ stats }) => (
  <div className="w-full mt-4">
    <div className="p-4 bg-gray-800 rounded-lg">
      <h4 className="mb-3 text-lg font-semibold text-white">Bowling Stats</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="text-gray-400">
              <th className="pb-2 text-left">Player</th>
              <th className="pb-2 text-right">Overs</th>
              <th className="pb-2 text-right">Maidens</th>
              <th className="pb-2 text-right">Runs</th>
              <th className="pb-2 text-right">Wickets</th>
              <th className="pb-2 text-right">Eco</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((player, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="py-2 text-left">{player.name}</td>
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

const Scoreboard = memo(({ match }) => {
  if (!match) return null;

  const {
    currentRunRate,
    requiredRunRate,
    lastWicket,
    partnership,
    lastOver,
    matchStatus,
    bowlingStats
  } = match.scoreboard || {};

  return (
    <div className="mt-6">
      {/* Match Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
        {currentRunRate && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="mb-1 text-sm text-gray-400">Current Run Rate</h4>
            <p className="text-xl font-bold text-white">{currentRunRate}</p>
          </div>
        )}

        {requiredRunRate && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="mb-1 text-sm text-gray-400">Required Run Rate</h4>
            <p className="text-xl font-bold text-white">{requiredRunRate}</p>
          </div>
        )}

        {partnership && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="mb-1 text-sm text-gray-400">Current Partnership</h4>
            <p className="text-lg font-semibold text-white">{partnership}</p>
          </div>
        )}
      </div>

      {/* Last Wicket and Over */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        {lastWicket && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="mb-1 text-sm text-gray-400">Last Wicket</h4>
            <p className="text-lg font-semibold text-white">{lastWicket}</p>
          </div>
        )}

        {lastOver && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="mb-1 text-sm text-gray-400">Last Over</h4>
            <p className="text-lg font-semibold text-white">{lastOver}</p>
          </div>
        )}
      </div>

      {/* Bowling Stats */}
      {bowlingStats && bowlingStats.length > 0 && (
        <BowlingStats stats={bowlingStats} />
      )}

      {/* Additional Info */}
      {match.additionalInfo && (
        <div className="pt-4 mt-6 border-t border-gray-700">
          <h4 className="mb-3 text-lg font-semibold text-white">Match Info</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(match.additionalInfo).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-400">{key}</span>
                <p className="mt-1 font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

BowlingStats.displayName = "BowlingStats";
Scoreboard.displayName = "Scoreboard";

export default Scoreboard;