// src/services/cricbuzzApi.js
import axios from "axios";

const MATCH_DETAILS_URL = "/api/cricket-match/commentary/";
const API_TIMEOUT = 10000;
const CACHE_DURATION = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Cache implementation
class MatchCache {
  constructor() {
    this.data = null;
    this.lastFetchTime = 0;
  }

  set(data) {
    this.data = data;
    this.lastFetchTime = Date.now();
  }

  get() {
    if (!this.data) return null;
    if (Date.now() - this.lastFetchTime > CACHE_DURATION) {
      this.data = null;
      return null;
    }
    return this.data;
  }

  clear() {
    this.data = null;
    this.lastFetchTime = 0;
  }
}

const matchCache = new MatchCache();

// Error handling
class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.code = code;
  }
}

// Data validation
const validateMatchData = (data) => {
  if (!data) throw new APIError("No data received from API", 500, "NO_DATA");
  if (!data.matchHeader) throw new APIError("Invalid match data structure", 500, "INVALID_DATA");
  return true;
};

// Data transformation
const transformMatchHeader = (matchHeader) => {
  const status = matchHeader.complete ? "completed" : 
                 matchHeader.status === "Match Ended" ? "completed" :
                 matchHeader.status === "In Progress" ? "live" : "upcoming";

  return {
    matchId: matchHeader.matchId,
    status,
    seriesName: matchHeader.seriesName || "Unknown Series",
    matchNumber: matchHeader.matchDescription || "N/A",
    startTime: matchHeader.startTime || new Date().toISOString(),
    team1: {
      id: matchHeader.team1?.id?.toString() || "1",
      name: matchHeader.team1?.name || "Team 1",
      shortName: matchHeader.team1?.shortName || "T1",
      logoUrl: matchHeader.team1?.image || "https://placehold.co/50x50",
    },
    team2: {
      id: matchHeader.team2?.id?.toString() || "2",
      name: matchHeader.team2?.name || "Team 2",
      shortName: matchHeader.team2?.shortName || "T2",
      logoUrl: matchHeader.team2?.image || "https://placehold.co/50x50",
    },
    venue: {
      ground: matchHeader.venueInfo?.ground || "Unknown Stadium",
      city: matchHeader.venueInfo?.city || "Unknown City",
      country: matchHeader.venueInfo?.country || "Unknown Country",
      startTime: matchHeader.venueInfo?.startTime,
    },
    result: matchHeader.status ? {
      winningTeamId: matchHeader.team2?.id?.toString() || "2",
      resultText: matchHeader.status,
    } : null,
  };
};

const transformMiniscore = (miniscore) => {
  if (!miniscore) {
    return {
      team1Score: { inngs1: { runs: 0, wickets: 0, overs: "0.0" } },
      team2Score: { inngs1: { runs: 0, wickets: 0, overs: "0.0" } },
      currentRunRate: "0.00",
      requiredRunRate: "0.00",
      lastWicket: "No wickets yet",
      partnership: "0",
      lastOver: "No overs bowled yet",
      matchStatus: "Match not started"
    };
  }
  
  return {
    team1Score: miniscore.team1Score || { inngs1: { runs: 0, wickets: 0, overs: "0.0" } },
    team2Score: miniscore.team2Score || { inngs1: { runs: 0, wickets: 0, overs: "0.0" } },
    currentRunRate: miniscore.currentRunRate || "0.00",
    requiredRunRate: miniscore.requiredRunRate || "0.00",
    lastWicket: miniscore.lastWicket || "No wickets yet",
    partnership: miniscore.partnership || "0",
    lastOver: miniscore.lastOver || "No overs bowled yet",
    matchStatus: miniscore.matchStatus || "Match not started"
  };
};

const calculatePoints = (matchInfo, matchScore) => {
  if (matchInfo.status !== "completed") return { team1Points: 0, team2Points: 0 };

  const team1Score = matchScore.team1Score?.inngs1?.runs || 0;
  const team2Score = matchScore.team2Score?.inngs1?.runs || 0;
  const winner = matchInfo.result?.winningTeamId;

  let team1Points = 0;
  let team2Points = 0;

  if (winner) {
    if (winner === matchInfo.team1.id) {
      team1Points = 2;
      team2Points = 0;
    } else if (winner === matchInfo.team2.id) {
      team2Points = 2;
      team1Points = 0;
    }
  } else {
    team1Points = 1;
    team2Points = 1;
  }

  return { team1Points, team2Points };
};

const transformBattingStats = (battingData) => {
  if (!battingData) return [];
  
  return battingData.map(player => ({
    name: player.name,
    runs: player.runs || 0,
    balls: player.balls || 0,
    fours: player.fours || 0,
    sixes: player.sixes || 0,
    strikeRate: player.strikeRate || "0.00",
    notOut: player.notOut || false
  }));
};

const transformBowlingStats = (bowlingData) => {
  if (!bowlingData) return [];
  
  return bowlingData.map(player => ({
    name: player.name,
    overs: player.overs || "0.0",
    maidens: player.maidens || 0,
    runs: player.runs || 0,
    wickets: player.wickets || 0,
    economy: player.economy || "0.00"
  }));
};

export const fetchMatchDetails = async (matchId) => {
  try {
    if (!matchId || typeof matchId !== "string") {
      throw new APIError("Invalid match ID provided", 400, "INVALID_MATCH_ID");
    }

    const cachedData = matchCache.get();
    if (cachedData) {
      return cachedData;
    }

    let retries = 0;
    let lastError = null;

    while (retries < MAX_RETRIES) {
      try {
        const response = await axios.get(`${MATCH_DETAILS_URL}${matchId}`, {
          timeout: API_TIMEOUT,
        });

        validateMatchData(response.data);
        const matchData = response.data;

        const matchHeader = transformMatchHeader(matchData.matchHeader);
        const miniscore = transformMiniscore(matchData.miniscore);
        const battingStats = transformBattingStats(matchData.battingStats);
        const bowlingStats = transformBowlingStats(matchData.bowlingStats);

        const formattedData = {
          matchId: matchHeader.matchId,
          status: matchHeader.status,
          seriesName: matchHeader.seriesName,
          matchNumber: matchHeader.matchNumber,
          startTime: matchHeader.startTime,
          teams: [
            {
              teamId: matchHeader.team1.id,
              teamName: matchHeader.team1.name,
              shortName: matchHeader.team1.shortName,
              logo: matchHeader.team1.logoUrl,
              score: miniscore.team1Score?.inngs1?.runs || 0,
              wickets: miniscore.team1Score?.inngs1?.wickets || 0,
              overs: miniscore.team1Score?.inngs1?.overs || "0.0",
              runRate: miniscore.currentRunRate,
            },
            {
              teamId: matchHeader.team2.id,
              teamName: matchHeader.team2.name,
              shortName: matchHeader.team2.shortName,
              logo: matchHeader.team2.logoUrl,
              score: miniscore.team2Score?.inngs1?.runs || 0,
              wickets: miniscore.team2Score?.inngs1?.wickets || 0,
              overs: miniscore.team2Score?.inngs1?.overs || "0.0",
              runRate: miniscore.requiredRunRate,
            },
          ],
          venue: matchHeader.venue,
          result: matchHeader.result,
          points: calculatePoints(matchHeader, miniscore),
          battingStats,
          scoreboard: {
            currentRunRate: miniscore.currentRunRate,
            requiredRunRate: miniscore.requiredRunRate,
            lastWicket: miniscore.lastWicket,
            partnership: miniscore.partnership,
            lastOver: miniscore.lastOver,
            matchStatus: miniscore.matchStatus,
            bowlingStats
          },
          additionalInfo: {
            "Match Type": matchData.matchHeader?.matchType || "N/A",
            "Toss Winner": matchData.matchHeader?.tossWinner || "N/A",
            "Toss Decision": matchData.matchHeader?.tossDecision || "N/A",
            "Venue": `${matchHeader.venue.ground}, ${matchHeader.venue.city}`,
            "Start Time": new Date(matchHeader.startTime).toLocaleString()
          },
        };

        matchCache.set(formattedData);
        return formattedData;
      } catch (error) {
        lastError = error;
        retries++;
        if (retries < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    throw lastError || new APIError("Failed to fetch match details", 500, "FETCH_ERROR");
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error.message || "Failed to fetch match details",
      error.response?.status || 500,
      error.code || "UNKNOWN_ERROR"
    );
  }
};

// Export cache methods for testing
export const clearCache = () => matchCache.clear();