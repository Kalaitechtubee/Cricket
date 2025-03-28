import React, { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { fetchMatchDetails } from "./services/cricbuzzApi";
import MatchCard from "./components/MatchCard";
import Loading from "./components/Loading";

function App() {
  const [matchId, setMatchId] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleError = useCallback((message, isFatal = false) => {
    console.error(message);
    setError(message);
    if (isFatal) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const matchRef = doc(db, "matches", "currentMatch");
    const unsub = onSnapshot(
      matchRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data?.matchId) {
            console.log("Match ID from Firestore:", data.matchId);
            setMatchId(data.matchId);
            setError(null);
          } else {
            handleError("No match ID found in Firestore", true);
          }
        } else {
          handleError("No active match found", true);
        }
      },
      (err) => {
        handleError(`Firestore connection failed: ${err.message}`, true);
      }
    );

    return () => unsub();
  }, [handleError]);

  useEffect(() => {
    if (!matchId) return;

    let intervalId;
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        
        const data = await fetchMatchDetails(matchId);
        if (!isMounted) return;

        setMatch(data);
        setError(null);
        setRetryCount(0);
      } catch (err) {
        if (!isMounted) return;

        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        if (newRetryCount >= MAX_RETRIES) {
          handleError(`Failed to load match details after ${MAX_RETRIES} attempts: ${err.message}`);
          setMatch(null);
        } else {
          console.warn(`Retry attempt ${newRetryCount} of ${MAX_RETRIES}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    if (!error && match?.status === "live") {
      intervalId = setInterval(fetchData, 30000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [matchId, retryCount, error, match?.status, handleError]);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-gray-800">
      <header className="py-4 text-white bg-gray-900 shadow-md">
        <h1 className="text-2xl font-bold text-center md:text-3xl">
          Cricket Scoreboard
        </h1>
      </header>
      <main className="container px-4 py-8 mx-auto">
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border-l-4 border-red-500 rounded">
            <p>{error}</p>
            {retryCount >= MAX_RETRIES && (
              <button
                onClick={handleRetry}
                className="px-4 py-2 mt-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
              >
                Retry
              </button>
            )}
          </div>
        )}
        {loading ? (
          <Loading />
        ) : match ? (
          <MatchCard match={match} />
        ) : (
          <div className="p-8 text-center text-gray-400 bg-gray-700 rounded-lg">
            <p>No match data available</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 mt-4 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;