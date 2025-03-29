
import axios from "axios";

const MATCH_DETAILS_URL = "/api/cricket-match/commentary/";
const API_TIMEOUT = 10000;
const CACHE_DURATION = 30000; // 30 seconds
const MAX_RETRIES = 3;

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

class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.code = code;
  }
}

const validateMatchData = (data) => {
  if (!data) throw new APIError("No data received from API", 500, "NO_DATA");
  if (!data.matchHeader) throw new APIError("Invalid match data structure", 500, "INVALID_DATA");
  return true;
};

const transformMatchHeader = (matchHeader) => {
  const status = matchHeader.complete
    ? "completed"
    : matchHeader.status === "Match Ended"
    ? "completed"
    : matchHeader.status === "In Progress"
    ? "live"
    : "upcoming";

  return {
    matchId: matchHeader.matchId,
    status,
    seriesName: matchHeader.seriesName || "Unknown Series",
    matchNumber: matchHeader.matchDescription || "N/A",
    startTime: new Date(matchHeader.matchStartTimestamp).toISOString(),
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
    },
    result: matchHeader.status
      ? {
          winningTeamId: matchHeader.result?.winningteamId?.toString() || "N/A",
          resultText: matchHeader.status,
        }
      : null,
  };
};

const transformMiniscore = (miniscore) => {
  if (!miniscore || !miniscore.matchScoreDetails) {
    return {
      team1Score: { inngs1: { runs: 0, wickets: 0, overs: "0.0" } },
      team2Score: { inngs1: { runs: 0, wickets: 0, overs: "0.0" } },
      currentRunRate: "0.00",
      matchStatus: "Match not started",
    };
  }

  const inningsScores = miniscore.matchScoreDetails.inningsScoreList;
  const team1Score = inningsScores.find((inn) => inn.batTeamId === 59) || {
    score: 0,
    wickets: 0,
    overs: "0.0",
  };
  const team2Score = inningsScores.find((inn) => inn.batTeamId === 58) || {
    score: 0,
    wickets: 0,
    overs: "0.0",
  };

  return {
    team1Score: {
      inngs1: {
        runs: team1Score.score || 0,
        wickets: team1Score.wickets || 0,
        overs: team1Score.overs || "0.0",
      },
    },
    team2Score: {
      inngs1: {
        runs: team2Score.score || 0,
        wickets: team2Score.wickets || 0,
        overs: team2Score.overs || "0.0",
      },
    },
    currentRunRate: miniscore.currentRunRate || "0.00",
    matchStatus: miniscore.status || "Match not started",
  };
};

const transformBattingStats = (miniscore) => {
  if (!miniscore || !miniscore.batsmanStriker) return [];

  return [
    {
      name: miniscore.batsmanStriker.batName || "Unknown",
      runs: miniscore.batsmanStriker.batRuns || 0,
      balls: miniscore.batsmanStriker.batBalls || 0,
      fours: miniscore.batsmanStriker.batFours || 0,
      sixes: miniscore.batsmanStriker.batSixes || 0,
      strikeRate: miniscore.batsmanStriker.batStrikeRate || "0.00",
      isBatting: true,
    },
    {
      name: miniscore.batsmanNonStriker?.batName || "Unknown",
      runs: miniscore.batsmanNonStriker?.batRuns || 0,
      balls: miniscore.batsmanNonStriker?.batBalls || 0,
      fours: miniscore.batsmanNonStriker?.batFours || 0,
      sixes: miniscore.batsmanNonStriker?.batSixes || 0,
      strikeRate: miniscore.batsmanNonStriker?.batStrikeRate || "0.00",
      isBatting: true,
    },
  ].filter((player) => player.name !== "Unknown");
};

const transformBowlingStats = (miniscore) => {
  if (!miniscore || !miniscore.bowlerStriker) return [];

  return [
    {
      name: miniscore.bowlerStriker.bowlName || "Unknown",
      overs: miniscore.bowlerStriker.bowlOvs || "0.0",
      maidens: miniscore.bowlerStriker.bowlMaidens || 0,
      runs: miniscore.bowlerStriker.bowlRuns || 0,
      wickets: miniscore.bowlerStriker.bowlWkts || 0,
      economy: miniscore.bowlerStriker.bowlEcon || "0.00",
      isBowling: true,
    },
  ].filter((player) => player.name !== "Unknown");
};

export const fetchMatchDetails = async (matchId) => {
  try {
    if (!matchId || typeof matchId !== "string") {
      throw new APIError("Invalid match ID provided", 400, "INVALID_MATCH_ID");
    }

    const cachedData = matchCache.get();
    if (cachedData) return cachedData;

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
        const battingStats = transformBattingStats(matchData.miniscore);
        const bowlingStats = transformBowlingStats(matchData.miniscore);

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
              score: miniscore.team1Score.inngs1.runs,
              wickets: miniscore.team1Score.inngs1.wickets,
              overs: miniscore.team1Score.inngs1.overs,
              runRate: miniscore.currentRunRate,
            },
            {
              teamId: matchHeader.team2.id,
              teamName: matchHeader.team2.name,
              shortName: matchHeader.team2.shortName,
              logo: matchHeader.team2.logoUrl,
              score: miniscore.team2Score.inngs1.runs,
              wickets: miniscore.team2Score.inngs1.wickets,
              overs: miniscore.team2Score.inngs1.overs,
              runRate: miniscore.currentRunRate,
            },
          ],
          venue: matchHeader.venue,
          result: matchHeader.result,
          scoreboard: {
            currentRunRate: miniscore.currentRunRate,
            matchStatus: miniscore.matchStatus,
            battingStats,
            bowlingStats,
          },
          additionalInfo: {
            "Match Type": matchData.matchHeader?.matchType || "N/A",
            "Toss Winner": matchData.matchHeader?.tossResults?.tossWinnerName || "N/A",
            "Toss Decision": matchData.matchHeader?.tossResults?.decision || "N/A",
            Venue: `${matchHeader.venue.ground}, ${matchHeader.venue.city}`,
            "Start Time": new Date(matchHeader.startTime).toLocaleString(),
          },
        };

        matchCache.set(formattedData);
        return formattedData;
      } catch (error) {
        lastError = error;
        retries++;
        if (retries < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    throw lastError || new APIError("Failed to fetch match details", 500, "FETCH_ERROR");
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      error.message || "Failed to fetch match details",
      error.response?.status || 500,
      error.code || "UNKNOWN_ERROR"
    );
  }
};

export const clearCache = () => matchCache.clear();