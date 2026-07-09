import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { globalOffices } from '../../data/about.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COORDS = {
  Bangalore:  [77.5946, 12.9716],
  Dubai:      [55.2708, 25.2048],
  Singapore:  [103.8198, 1.3521],
  Mumbai:     [72.8777, 19.0760],
  Hyderabad:  [78.4867, 17.3850],
  Pune:       [73.8567, 18.5204],
};

const DEFAULT_POSITION = { coordinates: [20, 15], zoom: 1 };

export default function GlobalPresence() {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [active, setActive] = useState(null);

  function handleMarkerClick(office) {
    const coords = COORDS[office.city];
    if (!coords) return;
    if (active === office.city) {
      setPosition(DEFAULT_POSITION);
      setActive(null);
    } else {
      setPosition({ coordinates: coords, zoom: 4 });
      setActive(office.city);
    }
  }

  return (
    <section id="global-offices" className="py-section-padding bg-brand text-white relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <Reveal from="left">
            <span className="font-label-caps text-label-caps uppercase text-accent-cyan">Our Network</span>
            <h2 className="font-display text-headline-md mt-4 mb-8">Global Engineering Hubs</h2>
            <div className="grid grid-cols-2 gap-y-12 gap-x-8">
              {globalOffices.map((office, i) => (
                <Reveal key={office.city} from="left" delay={i * 80}>
                  <button
                    onClick={() => handleMarkerClick(office)}
                    className={`flex items-start gap-4 text-left transition-opacity ${
                      active && active !== office.city ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    <Icon
                      name="location_on"
                      className={active === office.city ? 'text-yellow-400' : 'text-accent-cyan'}
                    />
                    <div>
                      <h4 className="font-display text-headline-sm text-base mb-1">{office.city}</h4>
                      <p className="text-xs text-white/60 uppercase tracking-tighter">{office.description}</p>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal from="right" className="relative h-[400px] md:h-[500px] rounded-xl border border-white/10 overflow-hidden bg-[#0a1628]">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 140 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                onMoveEnd={setPosition}
                minZoom={1}
                maxZoom={8}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#1e3a5f"
                        stroke="#0a1628"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover:   { fill: '#2a4f7f', outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {globalOffices.map((office) => {
                  const coords = COORDS[office.city];
                  if (!coords) return null;
                  const isActive = active === office.city;
                  return (
                    <Marker
                      key={office.city}
                      coordinates={coords}
                      onClick={() => handleMarkerClick(office)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r={isActive ? 6 : 4}
                        fill={isActive ? '#facc15' : '#22d3ee'}
                        stroke="#0a1628"
                        strokeWidth={1.5}
                        style={{ transition: 'r 0.2s, fill 0.2s' }}
                      />
                      {isActive && (
                        <text
                          textAnchor="middle"
                          y={-10}
                          style={{ fontSize: 5, fill: '#facc15', fontWeight: 600 }}
                        >
                          {office.city}
                        </text>
                      )}
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>

            {active && (
              <button
                onClick={() => { setPosition(DEFAULT_POSITION); setActive(null); }}
                className="absolute top-3 right-3 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition"
              >
                Reset
              </button>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
