'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockAnalysisResults } from '@/lib/analyse-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import { 
  FileText, UserPlus, Upload, BarChart, AlertCircle, 
  AlertTriangle, ThumbsUp, Check, Target, ArrowUpRight, 
  Sparkles, CheckCircle2, Loader2, X, Target as TargetIcon
} from 'lucide-react';

export default function AnalysePage() {
  const router = useRouter(); // <-- Initialize router
  
  const [jobFile, setJobFile] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyse = () => {
    if (!jobFile || !resumeFile) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  const resetAnalysis = () => {
    setJobFile(null);
    setResumeFile(null);
    setShowResults(false);
  };

  // Helper function to route to setup
  const handleSkillClick = () => {
    router.push('/setup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] font-sans text-gray-900">
      <Navbar isLoggedIn={true} />

      <main className="flex-grow relative flex flex-col items-center py-12 px-4">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(#FDE68A_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div className="w-full max-w-5xl mb-12 z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">Analyse Your Skill Gap</h1>
            <p className="text-gray-600 text-lg">Upload your target job description and your current resume to see what you're missing.</p>
          </motion.div>

          {/* Upload Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              className={`bg-white rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 group flex flex-col items-center justify-center text-center h-[320px] relative ${jobFile ? 'border-green-400 bg-green-50/10' : 'border-dashed border-gray-300 hover:border-[#FFD700]'}`}
            >
              {jobFile && (
                <button onClick={() => { setJobFile(null); setShowResults(false); }} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 ${jobFile ? 'bg-green-100 text-green-600' : 'bg-[#FEF9C3] text-[#CA8A04] group-hover:scale-110'}`}>
                {jobFile ? <CheckCircle2 className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Job Advertisement</h2>
              
              {jobFile ? (
                <p className="text-green-700 font-medium mb-6 px-4 py-2 bg-green-50 rounded-lg truncate max-w-[250px] border border-green-200">{jobFile}</p>
              ) : (
                <p className="text-gray-500 mb-6 max-w-xs">Upload the job description or paste the text of the role you want.</p>
              )}

              {!jobFile && (
                <label className="bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 font-bold py-3 px-8 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95">
                  <Upload className="w-5 h-5" />
                  Browse Files
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => { if(e.target.files?.[0]) setJobFile(e.target.files[0].name); }} />
                </label>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              className={`bg-white rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 group flex flex-col items-center justify-center text-center h-[320px] relative ${resumeFile ? 'border-green-400 bg-green-50/10' : 'border-dashed border-gray-300 hover:border-[#FFD700]'}`}
            >
              {resumeFile && (
                <button onClick={() => { setResumeFile(null); setShowResults(false); }} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 ${resumeFile ? 'bg-green-100 text-green-600' : 'bg-[#FEF9C3] text-[#CA8A04] group-hover:scale-110'}`}>
                {resumeFile ? <CheckCircle2 className="w-10 h-10" /> : <UserPlus className="w-10 h-10" />}
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your Resume</h2>
              
              {resumeFile ? (
                <p className="text-green-700 font-medium mb-6 px-4 py-2 bg-green-50 rounded-lg truncate max-w-[250px] border border-green-200">{resumeFile}</p>
              ) : (
                <p className="text-gray-500 mb-6 max-w-xs">Upload your current CV to compare against the job requirements.</p>
              )}

              {!resumeFile && (
                <label className="bg-[#FFD700] hover:bg-[#E6C200] text-gray-900 font-bold py-3 px-8 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95">
                  <Upload className="w-5 h-5" />
                  Browse Files
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => { if(e.target.files?.[0]) setResumeFile(e.target.files[0].name); }} />
                </label>
              )}
            </motion.div>
          </div>

          <AnimatePresence>
            {!showResults && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex justify-center mb-12"
              >
                <button 
                  onClick={handleAnalyse}
                  disabled={!jobFile || !resumeFile || isAnalyzing}
                  className={`flex items-center gap-3 px-12 py-4 rounded-2xl font-display font-bold text-xl transition-all duration-300 shadow-xl
                    ${(!jobFile || !resumeFile) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#18181B] hover:bg-gray-800 text-white hover:shadow-2xl hover:-translate-y-1 active:scale-95'}`}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-6 h-6 animate-spin text-[#FFD700]" /> Analyzing Matches...</>
                  ) : (
                    <><Sparkles className={`w-6 h-6 ${jobFile && resumeFile ? 'text-[#FFD700]' : 'text-gray-400'}`} /> Analyse Skills</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showResults && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full max-w-5xl z-10"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD700] to-[#E6C200]" />
                
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <BarChart className="w-7 h-7 text-[#CA8A04]" /> 
                    Analysis Results
                  </h2>
                  <button onClick={resetAnalysis} className="text-sm font-bold text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors">
                    Start New Analysis
                  </button>
                </div>

                {/* Match Score Bar */}
                <div className="mb-10 bg-gray-50/80 rounded-3xl p-6 md:p-8 border border-gray-100">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="font-display font-bold text-xl text-gray-900 flex items-center gap-2">
                        <TargetIcon className="w-5 h-5 text-[#CA8A04]" />
                        Resume Match Score
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Based on required and preferred skills extracted from the job description</p>
                    </div>
                    <span className="font-display font-bold text-4xl text-[#A16207]">
                      {mockAnalysisResults.matchPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <motion.div 
                      className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] h-4 rounded-full relative"
                      initial={{ width: 0 }} animate={{ width: `${mockAnalysisResults.matchPercentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8 pb-4 items-start">
                  
                  {/* Skill Must */}
                  <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-gray-900">Skill Must</h3>
                    </div>
                    <ul className="space-y-4">
                      {mockAnalysisResults.mustHave.map((skill) => (
                        <li 
                          key={skill.id} 
                          onClick={handleSkillClick}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between group cursor-pointer hover:shadow-md hover:border-red-300 transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-gray-800">{skill.name}</span>
                          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Useful */}
                  <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <ThumbsUp className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-gray-900">Useful</h3>
                    </div>
                    <ul className="space-y-4">
                      {mockAnalysisResults.useful.map((skill) => (
                        <li 
                          key={skill.id} 
                          onClick={handleSkillClick}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between group cursor-pointer hover:shadow-md hover:border-blue-300 transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-gray-800">{skill.name}</span>
                          <Check className="w-5 h-5 text-blue-500 shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Might Need */}
                  <div className="bg-yellow-50/50 rounded-3xl p-6 border border-yellow-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 text-[#B45309] flex items-center justify-center">
                        <Target className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-gray-900">Might Need</h3>
                    </div>
                    <ul className="space-y-4">
                      {mockAnalysisResults.mightNeed.map((skill) => (
                        <li 
                          key={skill.id} 
                          onClick={handleSkillClick}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-200 flex items-center justify-between group cursor-pointer hover:shadow-md hover:border-yellow-400 transition-all active:scale-[0.98]"
                        >
                          <span className="font-bold text-gray-800">{skill.name}</span>
                          <ArrowUpRight className="w-5 h-5 text-[#CA8A04] shrink-0 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <Footer />
    </div>
  );
}