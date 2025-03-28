



import React, { useState, useEffect } from "react";
import { db } from "./firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { fetchCommentary } from "./services/cricbuzzApi";
import Scoreboard from "./components/Scoreboard";
import Loading from "./components/Loading";
import "./index.css";

function App() {
  const [matchId, setMatchId] = useState(null);
  const [commentary, setCommentary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch matchId from Firestore
  useEffect(() => {
    const matchRef = doc(db, "matches", "currentMatch");
    const unsub = onSnapshot(
      matchRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log("Firestore data:", data);
          if (data?.matchId) {
            setMatchId(data.matchId);
          } else {
            setError("No matchId found in Firestore document");
            setLoading(false);
          }
        } else {
          setError("Firestore document 'matches/currentMatch' not found");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(`Failed to connect to Firestore: ${err.message}`);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsub();
  }, []);

  // Fetch commentary when matchId changes
  useEffect(() => {
    if (!matchId) return; // Skip if no matchId

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching commentary for matchId:", matchId);
        const data = await fetchCommentary(matchId);
        setCommentary(data);
      } catch (err) {
        setError(`Failed to fetch commentary: ${err.message}`);
        setCommentary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  return (
    <div className="App">
      <header>
        <h1>Live Cricket Scoreboard</h1>
      </header>
      <main>
        {error && (
          <div className="error-message" style={{ color: "red", margin: "1rem 0" }}>
            {error}
          </div>
        )}
        {loading ? (
          <Loading />
        ) : commentary ? (
          <Scoreboard commentary={commentary} />
        ) : (
          <p>No commentary data available</p>
        )}
      </main>
    </div>
  );
}

export default App;