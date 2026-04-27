import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Login from './components/Login';
import {
  Camera,
  Database,
  Map as MapIcon,
  ShieldCheck,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';

function App() {
  const [view, setView] = useState('manager');
  const [loggedInRole, setLoggedInRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [jobs, setJobs] = useState([]);
  const [notification, setNotification] = useState('');
  const [jobFilter, setJobFilter] = useState('All');
  const [completedJobs, setCompletedJobs] = useState(new Set());
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportPhoto, setReportPhoto] = useState(null);
  const [marketPrice, setMarketPrice] = useState(null);
  const [bargainPrice, setBargainPrice] = useState('');

  const completeJob = async (id) => {
    try {
      const jobRef = doc(db, 'jobs', id);
      await updateDoc(jobRef, { status: 'Completed' });
      setCompletedJobs(prev => new Set(prev).add(id));
      setNotification('Job completed successfully.');
    } catch (error) {
      console.error(error);
      setNotification('Unable to complete job.');
    }
  };

  const createJob = async (trade, desc, photo, price) => {
    try {
      await addDoc(collection(db, 'jobs'), {
        trade,
        urgency: 'HIGH',
        desc: desc || `User reported issue with ${trade.toLowerCase()}.`,
        quote: price ? `$${price}` : 'TBD',
        worker: 'Pending',
        eta: 'TBD',
        status: 'Pending',
        timestamp: new Date(),
        mode: 'User Reported',
        photo: photo
      });
      setNotification(`${trade} job created and dispatched.`);
    } catch (error) {
      console.error(error);
      setNotification('Could not create job.');
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 2800);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const runSnapAndDispatch = async () => {
    setLoading(true);
    setAnalysisStep('Analyzing request with AI dispatch engine...');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setAnalysisStep('Matching service, location, and expected timing...');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const simulatedAgentResponse = {
        trade: 'Emergency Plumber',
        urgency: 'CRITICAL',
        desc: 'Visual analysis flagged a burst pipe and active leak. Dispatching top-rated pro.',
        quote: '$550.00',
        worker: 'Mike (4.9★)',
        eta: '12 mins',
        status: 'Pending'
      };

      await addDoc(collection(db, 'jobs'), {
        ...simulatedAgentResponse,
        timestamp: new Date(),
        mode: 'Visual-AI-Agent'
      });
      setNotification('Quote generated and job added to the dashboard.');
    } catch (error) {
      console.error(error);
      setNotification('Could not send the request. Try again.');
    }

    setLoading(false);
    setAnalysisStep('');
  };

  const acceptJob = async (id) => {
    try {
      const jobRef = doc(db, 'jobs', id);
      await updateDoc(jobRef, { status: 'In Progress', worker: 'Assigned' });
      setNotification('Job accepted. Route ready.');
    } catch (error) {
      console.error(error);
      setNotification('Unable to accept job.');
    }
  };

  const handleLogin = (role) => {
    setLoggedInRole(role);
    setView(role === 'worker' ? 'worker' : 'manager');
    setNotification(`Welcome back! ${role === 'worker' ? 'Worker' : 'User'} dashboard unlocked.`);
  };

  const logout = () => {
    setLoggedInRole(null);
    setView('manager');
    setNotification('Signed out. Choose a role to continue.');
  };

  const quickQuote = () => {
    if (loading) return;
    runSnapAndDispatch();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setNotification('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(photo);
      setNotification('Photo captured. Processing...');
      stopCamera();
      setTimeout(() => {
        runSnapAndDispatch();
      }, 1000);
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotification('Camera not supported on this device.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setCameraActive(true);
      setCapturedPhoto(null);
      setNotification('Camera opened. Tap capture when ready.');
    } catch (error) {
      console.error(error);
      setNotification('Camera permission denied or unavailable.');
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedPhoto(canvas.toDataURL('image/png'));
    setNotification('Photo captured successfully.');
  };

  const openReport = (service) => {
    setSelectedService(service);
    setShowReportModal(true);
    setReportDescription('');
    setReportPhoto(null);
    setMarketPrice(null);
    setBargainPrice('');
  };

  const captureReportPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setReportPhoto(canvas.toDataURL('image/png'));
    closeCamera();
    setNotification('Photo captured for report.');
  };

  const ManagerDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-zinc-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 blur-[80px] rounded-full"></div>
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={18} className="text-red-500" /> Snap & Dispatch
            </h2>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mt-1">AI-powered service matching</p>
          </div>
          <button
            onClick={() => setNotification('Popular services refreshed.')}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300 hover:border-red-600 transition"
          >
            Refresh services
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-64 rounded-[2rem] bg-black/70 border border-zinc-800 flex flex-col items-center justify-center text-center p-6 cursor-pointer" onClick={!cameraActive ? openCamera : undefined}>
            {cameraActive ? (
              <div className="flex h-full w-full flex-col">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full rounded-[1.6rem] object-cover" />
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button onClick={capturePhoto} className="rounded-2xl bg-red-600 px-4 py-2 text-xs uppercase tracking-[0.15em] text-white hover:bg-red-700 transition">
                    Capture
                  </button>
                  <button onClick={closeCamera} className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-2 text-xs uppercase tracking-[0.15em] text-zinc-200 hover:border-red-600 transition">
                    Close
                  </button>
                </div>
                {capturedPhoto && (
                  <img src={capturedPhoto} alt="Captured" className="mt-4 h-24 w-full rounded-2xl object-cover border border-zinc-800" />
                )}
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-red-600" size={36} />
                <p className="text-xs font-mono text-red-500">{analysisStep}</p>
              </div>
            ) : (
              <>
                <Camera size={48} className="text-zinc-500" />
                <p className="mt-4 text-sm text-zinc-400 uppercase tracking-[0.3em]">Live AI scan</p>
                <p className="mt-2 text-sm text-zinc-500">Tap to open the camera and capture a job site.</p>
              </>
            )}
          </div>
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Your current workflow</p>
              <h3 className="mt-4 text-2xl font-black text-white">Keep every request in one place</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">Review active jobs, create new estimates, and stay aligned with the field team.</p>
            </div>
            <button onClick={quickQuote} disabled={loading} className="mt-6 rounded-3xl bg-red-600 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-red-700 transition">
              {loading ? 'Processing...' : 'Generate quick quote'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
          <span className="flex items-center gap-2"><Database size={12} /> Live request pipeline</span>
          <span className="text-red-500">{jobs.length} active</span>
        </div>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-[2rem] border border-zinc-800 bg-zinc-900/90 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-white">{job.trade}</p>
                <p className="mt-1 text-xs text-zinc-500">{job.desc}</p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className="rounded-full bg-red-600/10 px-3 py-1 text-[10px] font-black uppercase text-red-300">{job.urgency}</span>
                <p className="text-sm font-black text-white">{job.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WorkerView = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 px-2">
      <div className="bg-gradient-to-br from-red-600 to-red-900 p-6 rounded-[2rem] shadow-xl">
        <div className="mt-4">
          <label className="block text-sm font-medium text-red-100 mb-2">Filter Jobs</label>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-red-200 bg-red-900/50 text-white focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="All">All Jobs</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Security">Security</option>
            <option value="Carpentry">Carpentry</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={() => setNotification('Route guidance enabled.')} className="rounded-[2rem] border border-zinc-800 bg-zinc-950/90 px-4 py-5 text-left text-sm font-black uppercase tracking-[0.12em] text-white hover:border-red-600 transition">Route planner</button>
        <button onClick={() => setNotification('Pinned jobs loaded.')} className="rounded-[2rem] border border-zinc-800 bg-zinc-950/90 px-4 py-5 text-left text-sm font-black uppercase tracking-[0.12em] text-white hover:border-red-600 transition">Pinned jobs</button>
      </div>

      <div className="space-y-4">
        {jobs.filter((j) => j.status === 'Pending' && (jobFilter === 'All' || j.trade === jobFilter)).map((job) => (
          <div key={job.id} className="rounded-[2rem] border border-zinc-800 bg-zinc-900/90 p-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-red-500">Urgent request</p>
                <h3 className="mt-2 text-2xl font-black text-white">{job.trade}</h3>
              </div>
              <p className="text-2xl font-black text-white">{job.quote}</p>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">{job.desc}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              <span className="inline-flex items-center gap-2"><MapIcon size={12} /> Downtown</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={12} /> Verified</span>
              <span className="inline-flex items-center gap-2">ETA {job.eta}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => acceptJob(job.id)} className="rounded-3xl bg-white px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-black hover:bg-red-600 hover:text-white transition">Accept job</button>
              {!completedJobs.has(job.id) && (
                <button onClick={() => setNotification('Chat opened with user.')} className="rounded-3xl border border-zinc-800 bg-zinc-950/90 px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-zinc-200 hover:border-red-600 transition">Chat with user</button>
              )}
              <button onClick={() => completeJob(job.id)} className="rounded-3xl bg-red-600 px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-red-700 transition">Complete work</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center selection:bg-red-500/30">
      {!loggedInRole ? (
        <Login onLoginSuccess={handleLogin} />
      ) : (
        <>
          <nav className="w-full max-w-md p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-0 bg-black/90 backdrop-blur-md z-50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-red-600/10 border border-red-600/20 text-red-300 font-black">V</div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-white">VELO</h1>
                <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Service dispatch platform</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setView(view === 'manager' ? 'worker' : 'manager')} className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300 hover:border-red-600 transition">
                Switch to {view === 'manager' ? 'Worker' : 'User'}
              </button>
              <button onClick={() => setNotification('Support guide opened.')} className="rounded-2xl bg-zinc-900/90 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300 hover:bg-zinc-800 transition">Help</button>
            </div>
          </nav>

          <main className="w-full max-w-md p-6 pb-32">
          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950/90 p-6 shadow-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Signed in as</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{loggedInRole === 'worker' ? 'Worker Hub' : 'User Hub'}</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setNotification('Profile opened.')} className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300 hover:border-red-600 transition">Profile</button>
                  <button onClick={logout} className="rounded-2xl bg-red-600 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white hover:bg-red-700 transition">Sign out</button>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button onClick={quickQuote} disabled={loading} className="rounded-3xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-red-900/30">
                  {loading ? 'Processing...' : 'Quick Quote'}
                </button>
                <button onClick={() => setNotification('Dispatch board refreshed.')} className="rounded-3xl border border-zinc-800 bg-zinc-900/90 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-zinc-200 hover:border-red-600 transition">Refresh feed</button>
              </div>
            </div>

            {view === 'manager' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/90 p-5">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Report an issue</p>
                  <div className="mt-4 space-y-3">
                    {['Plumbing', 'Electrical', 'Cleaning', 'Security'].map((service) => (
                      <button key={service} onClick={() => openReport(service)} className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 text-left text-sm font-semibold text-white hover:border-red-600 transition">{service}</button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/90 p-5">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">More services</p>
                  <div className="mt-4 space-y-3">
                    {['HVAC', 'Carpentry'].map((service) => (
                      <button key={service} onClick={() => createJob(service)} className="w-full rounded-3xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 text-left text-sm font-semibold text-white hover:border-red-600 transition">{service}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === 'worker' && (
              <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950/90 p-6 shadow-2xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Worker tools</p>
                    <h3 className="mt-2 text-2xl font-black text-white">Dispatch board</h3>
                  </div>
                  <button onClick={() => setNotification('Route planner activated.')} className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300 hover:border-red-600 transition">Route</button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {['Map', 'History', 'Messages'].map((label) => (
                    <button key={label} onClick={() => setNotification(`${label} opened.`)} className="rounded-3xl border border-zinc-800 bg-zinc-900/90 px-3 py-4 text-xs font-black uppercase tracking-[0.12em] text-zinc-200 hover:border-red-600 transition">{label}</button>
                  ))}
                </div>
              </div>
            )}

            {loggedInRole === 'manager' ? <ManagerDashboard /> : <WorkerView />}
          </div>
      
      </main>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-black text-white mb-4">Report Issue: {selectedService}</h3>
            {!reportPhoto ? (
              <div>
                <input
                  type="text"
                  placeholder="Describe the issue"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:ring-2 focus:ring-red-500 outline-none mb-4"
                />
                <div className="h-64 rounded-xl bg-black border border-zinc-700 flex flex-col items-center justify-center text-center p-4 cursor-pointer" onClick={openCamera}>
                  {cameraActive ? (
                    <div className="flex h-full w-full flex-col">
                      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full rounded-xl object-cover" />
                      <div className="mt-4 flex justify-center gap-3">
                        <button onClick={captureReportPhoto} className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white">Capture</button>
                        <button onClick={closeCamera} className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white">Close</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Camera size={48} className="text-zinc-500" />
                      <p className="mt-4 text-sm text-zinc-400">Tap to open camera</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <img src={reportPhoto} alt="Captured" className="w-full h-32 object-cover rounded-xl mb-4" />
                <p className="text-sm text-zinc-400 mb-4">{reportDescription}</p>
                {!marketPrice ? (
                  <button onClick={() => {
                    const prices = { Plumbing: 150, Electrical: 200, Cleaning: 100, Security: 250 };
                    setMarketPrice(prices[selectedService] || 150);
                  }} className="w-full bg-red-600 text-white py-3 rounded-xl mb-4">Search Market Price</button>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-zinc-400">Market Price: ${marketPrice}</p>
                    <input
                      type="number"
                      placeholder="Your bargain price"
                      value={bargainPrice}
                      onChange={(e) => setBargainPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:ring-2 focus:ring-red-500 outline-none mt-2"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setShowReportModal(false)} className="flex-1 border border-zinc-700 bg-zinc-800 text-white py-3 rounded-xl">Cancel</button>
                  <button onClick={() => {
                    createJob(selectedService, reportDescription, reportPhoto, bargainPrice || marketPrice);
                    setShowReportModal(false);
                  }} className="flex-1 bg-red-600 text-white py-3 rounded-xl" disabled={!marketPrice || (!bargainPrice && marketPrice)}>Submit</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed left-1/2 bottom-6 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-3xl border border-white/10 bg-zinc-950/95 px-5 py-4 text-sm text-zinc-100 shadow-2xl backdrop-blur-xl">
          {notification}
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default App;
