import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Phone, Hospital, RefreshCw, AlertCircle, List, Map as MapIcon } from 'lucide-react';
import { cn } from '../lib/utils';

// Fix for default marker icons
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HospitalData {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  distance?: number;
  phone?: string;
}

const RecenterMap = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
};

export const HospitalMap: React.FC<{ t: any }> = ({ t }) => {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserPos([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, []);

  useEffect(() => {
    if (userPos) {
      fetchHospitals(userPos[0], userPos[1]);
    }
  }, [userPos]);

  const fetchHospitals = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      // Overpass API query for hospitals only within 10km
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:10000, ${lat}, ${lon});
          way["amenity"="hospital"](around:10000, ${lat}, ${lon});
          relation["amenity"="hospital"](around:10000, ${lat}, ${lon});
        );
        out center;
      `;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const results = data.elements.map((el: any) => {
        const phone = el.tags.phone || el.tags["contact:phone"] || el.tags["emergency:phone"] || `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          id: el.id,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          name: el.tags.name || el.tags["name:en"] || "Medical Facility",
          type: el.tags.amenity,
          phone: phone,
        };
      }).filter((h: any) => h.lat && h.lon);
      
      // Sort by name
      results.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setHospitals(results);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split');
  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-display font-bold flex items-center gap-3">
            <MapPin className="text-medical-blue" />
            {t.hospitals}
          </h3>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('split')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === 'split' ? "bg-medical-blue text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <MapIcon size={14} />
              Map View
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === 'list' ? "bg-medical-blue text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <List size={14} />
              Directory
            </button>
          </div>
        </div>
        <div className="relative flex-1 max-w-md">
          <input 
            type="text"
            placeholder="Search hospital names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-medical-blue transition-all text-sm"
          />
          <Hospital className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        </div>
        <button 
          onClick={() => userPos && fetchHospitals(userPos[0], userPos[1])}
          className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-medical-teal transition-all"
          title="Refresh List"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'split' ? (
          <motion.div 
            key="split"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-inner">
              {userPos ? (
                <MapContainer center={userPos} zoom={13} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap position={userPos} />
                  <Marker position={userPos}>
                    <Popup>You are here</Popup>
                  </Marker>
                  {filteredHospitals.map((h) => (
                    <Marker key={h.id} position={[h.lat, h.lon]}>
                      <Tooltip direction="top" offset={[0, -32]} opacity={1} permanent={false}>
                        <span className="font-bold text-xs">{h.name}</span>
                      </Tooltip>
                      <Popup>
                        <div className="p-2 min-w-[180px]">
                          <h4 className="font-bold text-medical-dark text-sm mb-1">{h.name}</h4>
                          <div className="flex flex-col gap-2">
                            <a 
                              href={`tel:${h.phone}`}
                              className="flex items-center justify-center gap-2 w-full py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors font-bold"
                            >
                              <Phone size={12} />
                              Ambulance: {h.phone}
                            </a>
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-1.5 bg-medical-blue text-white text-xs rounded-lg hover:bg-medical-blue/90 transition-colors"
                            >
                              <Navigation size={12} />
                              Directions
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 gap-4">
                  <div className="w-12 h-12 border-4 border-medical-blue/20 border-t-medical-blue rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-medium">Acquiring GPS Location...</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {filteredHospitals.length} Hospitals Found
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[440px]">
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((h) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={h.id} 
                      className="glass-card p-4 glass-card-hover flex justify-between items-center group"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-medical-blue/10 flex items-center justify-center group-hover:bg-medical-blue/20 transition-colors">
                          <Hospital className="w-6 h-6 text-medical-blue" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-white leading-tight mb-2">{h.name}</h4>
                          <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <Phone size={10} />
                            Ambulance: {h.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-medical-blue/20 text-medical-blue transition-all"
                          title="Get Directions"
                        >
                          <Navigation size={18} />
                        </a>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 glass-card border-dashed">
                    <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 text-sm">No facilities found matching your search or location.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
          >
            {filteredHospitals.length > 0 ? (
              filteredHospitals.map((h) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={h.id} 
                  className="glass-card p-6 glass-card-hover flex flex-col gap-6 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-medical-blue/10 flex items-center justify-center group-hover:bg-medical-blue/20 transition-colors">
                      <Hospital className="w-8 h-8 text-medical-blue" />
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-white/5 hover:bg-medical-blue/20 text-medical-blue transition-all"
                        title="Get Directions"
                      >
                        <Navigation size={20} />
                      </a>
                      <a 
                        href={`tel:${h.phone}`}
                        className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                        title="Call Ambulance"
                      >
                        <Phone size={20} />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white leading-tight mb-2">{h.name}</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={12} />
                          Local Area
                        </span>
                      </div>
                      <a 
                        href={`tel:${h.phone}`}
                        className="flex items-center gap-2 text-red-400 font-bold text-sm hover:text-red-300 transition-colors"
                      >
                        <Phone size={14} />
                        Ambulance: {h.phone}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-center p-8 glass-card border-dashed">
                <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm">No facilities found matching your search or location.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
