import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Tool } from 'lucide-react';

const TradePage = ({ tradeName, onBack }) => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Backend: Only fetch jobs for THIS specific trade
    const q = query(collection(db, "jobs"), where("trade", "==", tradeName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [tradeName]);

  return (
    <div className="min-h-screen bg-white p-6">
      <button onClick={onBack} className="mb-6 flex items-center text-blue-600 font-bold">
        <ArrowLeft className="mr-2" /> Back to Dashboard
      </button>

      <h1 className="text-3xl font-black mb-2 uppercase">{tradeName}</h1>
      <p className="text-slate-500 mb-8">Managing live dispatches for {tradeName} services.</p>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            No active {tradeName} dispatches
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex justify-between">
              <div>
                <p className="font-bold text-lg">{job.location || "Main Site"}</p>
                <p className="text-sm text-slate-500">{job.urgency} Urgency</p>
              </div>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl h-fit text-sm font-bold">
                View Details
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradePage;