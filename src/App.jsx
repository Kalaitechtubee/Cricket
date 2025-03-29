// import React, { useState, useEffect, useCallback } from "react";
// import { collection, onSnapshot, query, getDocs } from "firebase/firestore";
// import { db } from "./firebase/firebase";
// import { fetchMatchDetails } from "./services/cricbuzzApi";
// import MatchCard from "./components/MatchCard";
// import Loading from "./components/Loading";

// function App() {
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const [filter, setFilter] = useState("all");
//   const MAX_RETRIES = 3;

//   const handleError = useCallback((message, isFatal = false) => {
//     console.error(message);
//     setError(message);
//     if (isFatal) {
//       setLoading(false);
//     }
//   }, []);

//   const checkFirestoreStructure = async () => {
//     try {
//       const matchesRef = collection(db, "matches");
//       const snapshot = await getDocs(matchesRef);
//       console.log("Firestore Collection Structure:", {
//         totalDocs: snapshot.size,
//         docs: snapshot.docs.map((doc) => ({
//           id: doc.id,
//           data: doc.data(),
//         })),
//       });
//     } catch (err) {
//       console.error("Error checking Firestore structure:", err);
//     }
//   };

//   useEffect(() => {
//     checkFirestoreStructure();

//     const matchesRef = collection(db, "matches");
//     const q = query(matchesRef);

//     const unsub = onSnapshot(
//       q,
//       async (snapshot) => {
//         try {
//           const matchPromises = snapshot.docs.map(async (doc) => {
//             const data = doc.data();
//             if (data?.matchId) {
//               try {
//                 const matchDetails = await fetchMatchDetails(data.matchId);
//                 return matchDetails;
//               } catch (err) {
//                 console.error(`Error fetching match ${data.matchId}:`, err);
//                 return null;
//               }
//             }
//             return null;
//           });

//           const matchResults = await Promise.all(matchPromises);
//           const validMatches = matchResults.filter((match) => match !== null);

//           if (validMatches.length === 0) {
//             handleError("No active matches found. Please check back later.");
//           } else {
//             setMatches(validMatches);
//             setError(null);
//           }
//         } catch (err) {
//           handleError(`Failed to process matches: ${err.message}`);
//         } finally {
//           setRetryCount(0);
//           setLoading(false);
//         }
//       },
//       (err) => {
//         handleError(`Firestore connection failed: ${err.message}`, true);
//       }
//     );

//     return () => unsub();
//   }, [handleError]);

//   useEffect(() => {
//     if (!matches.length) return;

//     const intervalId = setInterval(() => {
//       const liveMatches = matches.filter((match) => match.status === "live");
//       if (liveMatches.length > 0) {
//         liveMatches.forEach(async (match) => {
//           try {
//             const updatedMatch = await fetchMatchDetails(match.matchId);
//             setMatches((prevMatches) =>
//               prevMatches.map((m) =>
//                 m.matchId === updatedMatch.matchId ? updatedMatch : m
//               )
//             );
//           } catch (err) {
//             console.error(`Error updating live match ${match.matchId}:`, err);
//           }
//         });
//       }
//     }, 30000);

//     return () => clearInterval(intervalId);
//   }, [matches]);

//   const filteredMatches = matches.filter((match) => {
//     if (filter === "all") return true;
//     return match.status === filter;
//   });

//   const handleRetry = () => {
//     setRetryCount(0);
//     setError(null);
//     setLoading(true);
//   };

//   return (
//     <div className="min-h-screen bg-gray-800">
//       <header className="py-4 text-white bg-gray-900 shadow-md">
//         <h1 className="text-2xl font-bold text-center md:text-3xl">
//           Cricket Scoreboard
//         </h1>
//         <div className="container px-4 mx-auto mt-4">
//           <div className="flex justify-center space-x-4">
//             {/* <button
//               onClick={() => setFilter("all")}
//               className={`px-4 py-2 rounded ${
//                 filter === "all"
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//               }`}
//             >
//               All Matches
//             </button> */}
//             <button
//               onClick={() => setFilter("live")}
//               className={`px-4 py-2 rounded ${
//                 filter === "live"
//                   ? "bg-green-500 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//               }`}
//             >
//               Live
//             </button>
//             <button
//               onClick={() => setFilter("upcoming")}
//               className={`px-4 py-2 rounded ${
//                 filter === "upcoming"
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//               }`}
//             >
//               Upcoming
//             </button>
//             <button
//               onClick={() => setFilter("completed")}
//               className={`px-4 py-2 rounded ${
//                 filter === "completed"
//                   ? "bg-gray-600 text-white"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//               }`}
//             >
//               Completed
//             </button>
//           </div>
//         </div>
//       </header>
//       <main className="container px-4 py-8 mx-auto">
//         {error && (
//           <div className="p-4 mb-6 text-red-700 bg-red-100 border-l-4 border-red-500 rounded">
//             <div className="flex items-center">
//               <svg
//                 className="w-5 h-5 mr-2"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               <p className="font-medium">{error}</p>
//             </div>
//             {retryCount >= MAX_RETRIES && (
//               <button
//                 onClick={handleRetry}
//                 className="px-4 py-2 mt-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
//               >
//                 Retry
//               </button>
//             )}
//           </div>
//         )}
//         {loading ? (
//           <Loading />
//         ) : filteredMatches.length > 0 ? (
//           <div className="space-y-6">
//             {filteredMatches.map((match) => (
//               <MatchCard key={match.matchId} match={match} />
//             ))}
//           </div>
//         ) : (
//           <div className="p-8 text-center text-gray-400 bg-gray-700 rounded-lg">
//             <svg
//               className="w-16 h-16 mx-auto mb-4 text-gray-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <p className="text-lg">No matches found for the selected filter</p>
//             <button
//               onClick={() => setFilter("all")}
//               className="px-4 py-2 mt-4 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
//             >
//               Show All Matches
//             </button>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect } from "react";
import { fetchMatchDetails } from "./services/cricbuzzApi";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Add setDoc import
import { db } from "./firebase/firebase"; // Import Firestore
import Scoreboard from "./components/Scoreboard";
import Loading from "./components/Loading";

const App = () => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMatchData = async () => {
      try {
        // First, try to fetch from Firestore
        const docRef = doc(db, "matches", "114996");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMatchData(docSnap.data());
          setLoading(false);
        } else {
          // If not in Firestore, fetch from API and save to Firestore
          const data = await fetchMatchDetails("114996");
          await setDoc(doc(db, "matches", "114996"), data); // Now setDoc is defined
          setMatchData(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getMatchData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center mt-10">Error: {error}</div>;
  if (!matchData) return <div className="text-white text-center mt-10">No match data available</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white text-center mb-6">Cricket Match Scoreboard</h1>
      <Scoreboard match={matchData} />
    </div>
  );
};

export default App;