



// import React, { useState, useEffect } from "react";
// import { db } from "./firebase/firebase";
// import { doc, onSnapshot } from "firebase/firestore";
// import { fetchCommentary } from "./services/cricbuzzApi";
// import Scoreboard from "./components/Scoreboard";
// import Loading from "./components/Loading";
// import "./index.css";

// function App() {
//   const [matchId, setMatchId] = useState(null);
//   const [commentary, setCommentary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch matchId from Firestore
//   useEffect(() => {
//     const matchRef = doc(db, "matches", "currentMatch");
//     const unsub = onSnapshot(
//       matchRef,
//       (docSnapshot) => {
//         if (docSnapshot.exists()) {
//           const data = docSnapshot.data();
//           console.log("Firestore data:", data);
//           if (data?.matchId) {
//             setMatchId(data.matchId);
//           } else {
//             setError("No matchId found in Firestore document");
//             setLoading(false);
//           }
//         } else {
//           setError("Firestore document 'matches/currentMatch' not found");
//           setLoading(false);
//         }
//       },
//       (err) => {
//         console.error("Firestore error:", err);
//         setError(`Failed to connect to Firestore: ${err.message}`);
//         setLoading(false);
//       }
//     );

//     // Cleanup subscription on unmount
//     return () => unsub();
//   }, []);

//   // Fetch commentary when matchId changes
//   useEffect(() => {
//     if (!matchId) return; // Skip if no matchId

//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log("Fetching commentary for matchId:", matchId);
//         const data = await fetchCommentary(matchId);
//         setCommentary(data);
//       } catch (err) {
//         setError(`Failed to fetch commentary: ${err.message}`);
//         setCommentary(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [matchId]);

//   return (
//     <div className="App">
//       <header>
//         <h1>Live Cricket Scoreboard</h1>
//       </header>
//       <main>
//         {error && (
//           <div className="error-message" style={{ color: "red", margin: "1rem 0" }}>
//             {error}
//           </div>
//         )}
//         {loading ? (
//           <Loading />
//         ) : commentary ? (
//           <Scoreboard commentary={commentary} />
//         ) : (
//           <p>No commentary data available</p>
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;
// App.jsx
// App.jsx
// App.jsx (unchanged)
// App.jsx (unchanged)
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const matchRef = doc(db, "matches", "currentMatch");
    const unsub = onSnapshot(
      matchRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data?.matchId) {
            setMatchId(data.matchId);
          } else {
            setError("No match ID found in Firestore");
            setLoading(false);
          }
        } else {
          setError("No active match found");
          setLoading(false);
        }
      },
      (err) => {
        setError(`Firestore connection failed: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!matchId) return;

    let intervalId;
    const fetchData = async () => {
      try {
        const data = await fetchMatchDetails(matchId);
        setMatch(data);
        setError(null);
      } catch (err) {
        setError(`Failed to load match details: ${err.message}`);
        setMatch(null);
      }
    };

    fetchData().finally(() => setLoading(false));

    if (!error && match?.status === "live") {
      intervalId = setInterval(fetchData, 30000);
    }

    return () => intervalId && clearInterval(intervalId);
  }, [matchId]);

  return (
    <div className="min-h-screen bg-gray-800">
      <header className="bg-gray-900 text-white py-4 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Cricket Scoreboard
        </h1>
      </header>
      <main className="container mx-auto py-8 px-4">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
        {loading ? (
          <Loading />
        ) : match ? (
          <MatchCard match={match} />
        ) : (
          <p className="text-center text-gray-400">No match data available</p>
        )}
      </main>
    </div>
  );
}

export default App;