// services/cricbuzzApi.js
import axios from "axios";

const MATCH_DETAILS_URL = "/api/cricket-match/";

let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000;

// Mock data for testing
const mockMatchData = {
  matchInfo: {
    matchId: "104860",
    status: "completed",
    seriesName: "INDIAN PREMIER LEAGUE 2025",
    matchNumber: "6TH MATCH",
    startTime: "2025-03-27T19:30:00",
    team1: {
      id: "1",
      name: "Rajasthan Royals",
      shortName: "RR",
      logoUrl: "https://www.cricbuzz.com/a/img/v1/50x50/i1/c170661/rr.jpg",
    },
    team2: {
      id: "2",
      name: "Kolkata Knight Riders",
      shortName: "KKR",
      logoUrl: "https://www.cricbuzz.com/a/img/v1/50x50/i1/c170678/kkr.jpg",
    },
    result: {
      winningTeamId: "2",
      resultText: "Kolkata Knight Riders won by 8 wkts",
    },
  },
  matchScore: {
    team1Score: { inngs1: { runs: 152, wickets: 3, overs: "17.3" } },
    team2Score: { inngs1: { runs: 155, wickets: 2, overs: "17.0" } },
  },
  battingStats: [
    {
      name: "Quinton de Kock",
      runs: 97,
      balls: 61,
      fours: 8,
      sixes: 6,
      strikeRate: "159.02",
      isNotOut: true,
    },
    {
      name: "Angkrish Raghuvanshi",
      runs: 22,
      balls: 17,
      fours: 2,
      sixes: 0,
      strikeRate: "129.41",
      isNotOut: false,
    },
  ],
  bowlingStats: [
    {
      name: "Trent Boult",
      overs: "4.0",
      maidens: 0,
      runs: 35,
      wickets: 1,
      economy: "8.75",
    },
    {
      name: "Yuzvendra Chahal",
      overs: "3.0",
      maidens: 0,
      runs: 28,
      wickets: 1,
      economy: "9.33",
    },
  ],
};

export const fetchMatchDetails = async (matchId) => {
  try {
    if (!matchId || typeof matchId !== "string") {
      throw new Error("Invalid match ID provided");
    }

    const now = Date.now();
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      console.log("Returning cached match data");
      return cachedData;
    }

    console.log(`Fetching match details for matchId: ${matchId}`);
    const response = await axios.get(`${MATCH_DETAILS_URL}${matchId}`, {
      timeout: 10000,
    });

    const matchData = response.data;
    if (!matchData?.matchInfo || !matchData?.matchScore) {
      throw new Error("Invalid match data structure");
    }

    const matchInfo = matchData.matchInfo;
    const matchScore = matchData.matchScore;
    const battingStats = matchData.battingStats || [];
    const bowlingStats = matchData.bowlingStats || [];

    const formattedData = {
      matchId: matchInfo.matchId,
      status: matchInfo.status || "upcoming",
      seriesName: matchInfo.seriesName || "Unknown Series",
      matchNumber: matchInfo.matchNumber || "N/A",
      startTime: matchInfo.startTime || null,
      teams: [
        {
          teamId: matchInfo.team1.id,
          teamName: matchInfo.team1.name,
          shortName: matchInfo.team1.shortName,
          logo: matchInfo.team1.logoUrl,
          score: matchScore.team1Score?.inngs1?.runs || 0,
          wickets: matchScore.team1Score?.inngs1?.wickets || 0,
          overs: matchScore.team1Score?.inngs1?.overs || "0.0",
        },
        {
          teamId: matchInfo.team2.id,
          teamName: matchInfo.team2.name,
          shortName: matchInfo.team2.shortName,
          logo: matchInfo.team2.logoUrl,
          score: matchScore.team2Score?.inngs1?.runs || 0,
          wickets: matchScore.team2Score?.inngs1?.wickets || 0,
          overs: matchScore.team2Score?.inngs1?.overs || "0.0",
        },
      ],
      result: matchInfo.result || null,
      battingStats: battingStats.map((player) => ({
        name: player.name,
        runs: player.runs || 0,
        balls: player.balls || 0,
        fours: player.fours || 0,
        sixes: player.sixes || 0,
        strikeRate: player.strikeRate || "0.00",
        isNotOut: player.isNotOut || false,
      })),
      bowlingStats: bowlingStats.map((player) => ({
        name: player.name,
        overs: player.overs || "0.0",
        maidens: player.maidens || 0,
        runs: player.runs || 0,
        wickets: player.wickets || 0,
        economy: player.economy || "0.00",
      })),
      points: calculatePoints(matchInfo, matchScore),
    };

    lastFetchTime = now;
    cachedData = formattedData;
    return formattedData;
  } catch (error) {
    console.error("Error fetching match details:", error);

    // Fallback to mock data for testing
    if (error.response?.status === 404 || error.code === "ERR_BAD_REQUEST") {
      console.warn("Falling back to mock data due to API failure");
      const matchInfo = mockMatchData.matchInfo;
      const matchScore = mockMatchData.matchScore;
      return {
        matchId: matchInfo.matchId,
        status: matchInfo.status || "upcoming",
        seriesName: matchInfo.seriesName || "Unknown Series",
        matchNumber: matchInfo.matchNumber || "N/A",
        startTime: matchInfo.startTime || null,
        teams: [
          {
            teamId: matchInfo.team1.id,
            teamName: matchInfo.team1.name,
            shortName: matchInfo.team1.shortName,
            logo: matchInfo.team1.logoUrl,
            score: matchScore.team1Score?.inngs1?.runs || 0,
            wickets: matchScore.team1Score?.inngs1?.wickets || 0,
            overs: matchScore.team1Score?.inngs1?.overs || "0.0",
          },
          {
            teamId: matchInfo.team2.id,
            teamName: matchInfo.team2.name,
            shortName: matchInfo.team2.shortName,
            logo: matchInfo.team2.logoUrl,
            score: matchScore.team2Score?.inngs1?.runs || 0,
            wickets: matchScore.team2Score?.inngs1?.wickets || 0,
            overs: matchScore.team2Score?.inngs1?.overs || "0.0",
          },
        ],
        result: matchInfo.result || null,
        battingStats: mockMatchData.battingStats,
        bowlingStats: mockMatchData.bowlingStats,
        points: calculatePoints(matchInfo, matchScore),
      };
    }

    throw new Error(error.response?.data?.message || error.message);
  }
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