import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GitCompare, Sparkles, ArrowRight, PhoneCall } from 'lucide-react';
import { getInsurers } from '../services/planService.js';

function TrustBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <Icon size={16} className="text-primary-500 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, desc, color }) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="absolute top-4 right-5 text-5xl font-black text-gray-50 select-none">{number}</span>
      <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Home() {
  const [insurers, setInsurers] = useState([]);

  useEffect(() => {
    getInsurers().then((res) => setInsurers(res.data)).catch(() => {});
  }, []);

  const pvt = insurers.filter((i) => i.category === 'PVT');
  const psu = insurers.filter((i) => i.category === 'PSU');

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
              <ShieldCheck size={13} />
              IRDAI Registered Insurance Broker
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-[1.1] tracking-tight">
              Find the Right<br />
              <span className="text-primary-400">Health Insurance</span>
            </h1>

            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
              Compare plans from {insurers.length > 0 ? insurers.length : '15'}+ leading insurers. Get personalised recommendations based on your health profile — in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/recommend"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-primary-900/40"
              >
                <Sparkles size={18} />
                Get My Recommendation
              </Link>
              <Link
                to="/plans"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
              >
                Browse All Plans
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <TrustBadge icon={ShieldCheck} label="100% Free Comparison" />
            <TrustBadge icon={GitCompare}  label="Compare Side by Side" />
            <TrustBadge icon={Sparkles}    label="Personalised Recommendations" />
            <TrustBadge icon={PhoneCall}   label="Expert Callback Support" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="text-center mb-10">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl font-black text-gray-900">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              number="01"
              icon={Sparkles}
              color="bg-primary-500"
              title="Answer a few questions"
              desc="Tell us your age, family size, and health conditions. Takes under 2 minutes."
            />
            <StepCard
              number="02"
              icon={GitCompare}
              color="bg-slate-700"
              title="Compare top plans"
              desc="We surface the best matching plans ranked by fit. Compare features side by side."
            />
            <StepCard
              number="03"
              icon={PhoneCall}
              color="bg-primary-700"
              title="Get a free quote"
              desc="Submit your details and our licensed advisor will reach out within 24 hours."
            />
          </div>
        </section>

        {/* ── Insurers grid ─────────────────────────────────────────────────── */}
        <section className="py-12 border-t border-gray-100">
          <div className="text-center mb-10">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">Our Network</p>
            <h2 className="text-3xl font-black text-gray-900">Plans from Top Insurers</h2>
            <p className="text-gray-500 mt-2 text-sm">Private &amp; public sector options — all in one place.</p>
          </div>

          {insurers.length > 0 ? (
            <div className="space-y-8">
              {pvt.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">Private Sector</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {pvt.map((ins) => (
                      <div key={ins.id} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:border-primary-200 transition-all group">
                        <div className="w-11 h-11 rounded-xl mx-auto mb-2.5 flex items-center justify-center overflow-hidden bg-primary-50 group-hover:bg-primary-100 transition-colors border border-gray-100">
                          {ins.logoUrl
                            ? <img src={ins.logoUrl} alt={ins.name} className="w-full h-full object-contain p-0.5" />
                            : <span className="text-xs font-black text-primary-600">{ins.name.slice(0, 2).toUpperCase()}</span>
                          }
                        </div>
                        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{ins.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {psu.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">Public Sector</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {psu.map((ins) => (
                      <div key={ins.id} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                        <div className="w-11 h-11 rounded-xl mx-auto mb-2.5 flex items-center justify-center overflow-hidden bg-orange-50 group-hover:bg-orange-100 transition-colors border border-gray-100">
                          {ins.logoUrl
                            ? <img src={ins.logoUrl} alt={ins.name} className="w-full h-full object-contain p-0.5" />
                            : <span className="text-xs font-black text-orange-600">{ins.name.slice(0, 2).toUpperCase()}</span>
                          }
                        </div>
                        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{ins.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 text-center animate-pulse">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl mx-auto mb-2.5" />
                  <div className="h-2.5 bg-gray-100 rounded mx-auto w-3/4" />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 text-primary-600 text-sm font-semibold border border-primary-300 px-6 py-2.5 rounded-xl hover:bg-primary-50 transition-colors"
            >
              View All Plans <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────────────────────────── */}
        <section className="py-12 border-t border-gray-100">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl px-8 py-10 text-center shadow-lg shadow-primary-100">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Not sure where to start?</h2>
            <p className="text-primary-100 mb-6 text-sm">Answer 4 quick questions and we'll recommend the best plan for your needs.</p>
            <Link
              to="/recommend"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow"
            >
              <Sparkles size={16} />
              Find My Plan
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
