import React, { useState } from 'react';
import { WeatherData } from '../../types';
import { store } from '../../services/store';
import { CloudSun, Droplets, Thermometer, Wind, AlertTriangle, ShieldCheck, Bug } from 'lucide-react';

interface WeatherViewProps {
  weather: WeatherData;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ weather }) => {
  const [selectedDistrict, setSelectedDistrict] = useState('dt_pune');
  const activeWeather = store.getWeather(selectedDistrict) || weather;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <CloudSun className="w-4 h-4" />
            Agro-Meteorological Vector Surveillance
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Weather & Vector Proliferation Index
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Correlate precipitation, relative humidity and ambient temperature to predict vector surges (ticks, midges, biting flies).
          </p>
        </div>

        <select
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:bg-white focus:outline-hidden"
        >
          <option value="dt_pune">Pune District (Maharashtra)</option>
          <option value="dt_satara">Satara District (Maharashtra)</option>
          <option value="dt_anand">Anand District (Gujarat)</option>
          <option value="dt_belagavi">Belagavi District (Karnataka)</option>
        </select>
      </div>

      {/* Primary Weather Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase">Temperature</span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{activeWeather.temperatureC}°C</div>
          <p className="text-[11px] text-slate-500">Optimal viral replication range</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase">Relative Humidity</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{activeWeather.humidityPct}%</div>
          <p className="text-[11px] text-slate-500">High humidity elevates fungal & tick load</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase">Rainfall</span>
            <CloudSun className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{activeWeather.rainfallMm} mm</div>
          <p className="text-[11px] text-slate-500">Waterlogging triggers HS bacterial outbreaks</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase">Vector Threat Level</span>
            <Bug className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{activeWeather.vectorRiskIndex} RISK</div>
          <p className="text-[11px] text-slate-500">Culicoides midge & fly active</p>
        </div>
      </div>

      {/* Vector Advisory Card */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
          <span>Vector Proliferation Advisory: {activeWeather.districtName}</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          {activeWeather.forecastAlert ||
            'Prevailing monsoon moisture elevates biting fly and tick activity. Farmers are advised to apply deltamethrin/cypermethrin topical pour-on solutions and avoid stagnant puddling near animal sheds.'}
        </p>
      </div>
    </div>
  );
};
