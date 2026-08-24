import React, { useState, useMemo } from 'react';
import { DISEASES_DATABASE, SYMPTOMS_LIST } from '../../data/knowledgeBase';
import { Disease, Species } from '../../types';
import { Modal } from '../common/Modal';
import { BookOpen, Search, Filter, ShieldAlert, AlertTriangle, Syringe, Info, ExternalLink } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<string>('ALL');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const filteredDiseases = useMemo(() => {
    return DISEASES_DATABASE.filter(d => {
      if (categoryFilter !== 'ALL' && d.category !== categoryFilter) return false;
      if (speciesFilter !== 'ALL' && !d.affectedSpecies.includes(speciesFilter as Species) && !d.affectedSpecies.includes('Other')) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.scientificName.toLowerCase().includes(q) ||
          d.commonNames.some(c => c.toLowerCase().includes(q)) ||
          d.causativeAgent.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, speciesFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            National Veterinary Disease Knowledge Base
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Livestock Pathogen Directory ({DISEASES_DATABASE.length} Diseases)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official epidemiology reference covering clinical hallmarks, transmission routes, zoonotic risk and bio-containment.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Disease, Common Name, Agent..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="VIRAL">Viral Diseases</option>
            <option value="BACTERIAL">Bacterial Diseases</option>
            <option value="PROTOZOAL">Protozoal / Vector</option>
            <option value="PARASITIC">Parasitic</option>
            <option value="FUNGAL">Fungal</option>
            <option value="METABOLIC">Metabolic</option>
          </select>

          <select
            value={speciesFilter}
            onChange={e => setSpeciesFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Species</option>
            <option value="Cattle">Cattle</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
            <option value="Pig">Pig</option>
            <option value="Poultry">Poultry</option>
          </select>
        </div>
      </div>

      {/* Diseases Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiseases.map(disease => (
          <div
            key={disease.id}
            onClick={() => setSelectedDisease(disease)}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  disease.category === 'VIRAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  disease.category === 'BACTERIAL' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {disease.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {disease.zoonotic && (
                    <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded" title="Zoonotic (Human risk)">
                      Zoonotic
                    </span>
                  )}
                  {disease.notifiable && (
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded" title="State Notifiable">
                      Notifiable
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">{disease.name}</h3>
              <p className="text-xs text-slate-500 italic font-serif">{disease.scientificName}</p>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {disease.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Incubation:</span>
                <span className="font-semibold text-slate-700">{disease.incubationPeriod}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Mortality Risk:</span>
                <span className="font-bold text-rose-700">{disease.mortalityRate}</span>
              </div>

              <div className="text-right pt-1">
                <span className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
                  View Full Protocols →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <Modal
          isOpen={!!selectedDisease}
          onClose={() => setSelectedDisease(null)}
          title={selectedDisease.name}
          subtitle={`${selectedDisease.scientificName} • ${selectedDisease.category} Pathogen`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Causative Agent:</span>
                <span className="font-bold text-slate-900">{selectedDisease.causativeAgent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Susceptible Species:</span>
                <span className="font-semibold text-slate-800">{selectedDisease.affectedSpecies.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Common Regional Names:</span>
                <span className="font-semibold text-slate-800">{selectedDisease.commonNames.join(', ')}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Clinical Hallmark Signs:</h4>
              <p className="text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                {selectedDisease.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold block">Transmission Routes:</span>
                <ul className="text-slate-700 list-disc list-inside space-y-0.5">
                  {selectedDisease.transmissionRoutes.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold block">Diagnostic Confirmation:</span>
                <ul className="text-slate-700 list-disc list-inside space-y-0.5">
                  {selectedDisease.diagnosticTests.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Official Prevention & Biosecurity Protocol:</h4>
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                <p>• <strong>Vaccination Schedule:</strong> {selectedDisease.prevention}</p>
                <p>• <strong>Bio-Containment:</strong> {selectedDisease.treatmentSupportive}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDisease(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Close Reference
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
