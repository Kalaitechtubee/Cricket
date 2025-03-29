
import React, { useState, useEffect } from "react";
import { fetchMatchDetails } from "./services/cricbuzzApi";
import { doc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import Scoreboard from "./components/Scoreboard";
import Loading from "./components/Loading";

const App = () => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchId, setMatchId] = useState(null);

  useEffect(() => {
    // Listen for changes to the match ID in Firestore
    const unsubscribe = onSnapshot(doc(db, "settings", "currentMatch"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newMatchId = data.matchId;
        setMatchId(newMatchId);
      } else {
        setError("Match ID not found in Firestore");
        setLoading(false);
      }
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!matchId) return; // Wait until matchId is set

    const getMatchData = async () => {
      try {
        setLoading(true);

        // Check if match data exists in Firestore
        const matchDocRef = doc(db, "matches", matchId);
        const matchDocSnap = await getDoc(matchDocRef);

        if (matchDocSnap.exists()) {
          setMatchData(matchDocSnap.data());
          setLoading(false);
        } else {
          // Fetch from API and save to Firestore
          const data = await fetchMatchDetails(matchId);
          await setDoc(doc(db, "matches", matchId), data);
          setMatchData(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getMatchData();
  }, [matchId]); // Re-run when matchId changes

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center mt-10">Error: {error}</div>;
  if (!matchData) return <div className="text-white text-center mt-10">No match data available</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white text-center mb-6">Cricket Match Scoreboard</h1>
      <div className="text-center mb-4">
        <p className="text-white">Current Match ID: {matchId}</p>
      </div>
      <Scoreboard match={matchData} />
    </div>
  );
};

export default App;