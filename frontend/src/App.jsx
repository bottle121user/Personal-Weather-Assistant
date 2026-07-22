import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  MapPin, 
  Search,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Thermometer,
  Info,
  RefreshCw,
  Bot
} from 'lucide-react';
import './index.css';

// Simple weather code mapping for Open-Meteo format
const getWeatherIcon = (code, isDay, size = 'large') => {
  const baseClass = size === 'large' ? 'weather-icon-large' : 'weather-icon-small';
  if (code === 0) return <Sun className={`${baseClass} anim-spin-slow`} />; // Clear
  if (code >= 1 && code <= 3) return <Cloud className={`${baseClass} anim-float`} />; // Partly cloudy
  if (code >= 51 && code <= 67) return <CloudRain className={`${baseClass} anim-bounce`} />; // Rain
  if (code >= 71 && code <= 77) return <CloudSnow className={`${baseClass} anim-sway`} />; // Snow
  if (code >= 95 && code <= 99) return <CloudLightning className={`${baseClass} anim-flash`} />; // Thunderstorm
  return <Cloud className={`${baseClass} anim-float`} />;
};

const getDetailedWeatherIcons = (code, isDay, size = 'small') => {
  const baseClass = size === 'large' ? 'weather-icon-large' : 'weather-icon-small';
  const icons = [];
  
  if (isDay && code !== 3 && code !== 65 && code !== 67 && code !== 75 && code !== 77) {
    icons.push(<Sun key="sun" className={`${baseClass} anim-spin-slow`} style={{ color: '#fcd34d' }} />);
  }
  
  if (code >= 1) {
    icons.push(<Cloud key="cloud" className={`${baseClass} anim-float`} style={{ color: '#e2e8f0' }} />);
  }
  
  if (code >= 51 && code <= 67) {
    icons.push(<CloudRain key="rain" className={`${baseClass} anim-bounce`} style={{ color: '#38bdf8' }} />);
  } else if (code >= 71 && code <= 77) {
    icons.push(<CloudSnow key="snow" className={`${baseClass} anim-sway`} style={{ color: '#ffffff' }} />);
  } else if (code >= 95 && code <= 99) {
    icons.push(<CloudLightning key="lightning" className={`${baseClass} anim-flash`} style={{ color: '#a78bfa' }} />);
  }
  
  if (icons.length === 0 && !isDay) {
    icons.push(<Cloud key="night-clear" className={`${baseClass} anim-float`} />);
  }
  
  return icons;
};

const getWeatherDesc = (code) => {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

const getTonyThoughts = (data, location, clicks) => {
  if (!data || !data.current || !data.daily) return "Hold on, my circuits are still booting up...";
  
  if (clicks === 5) return "Bzzzt! System annoyed. I am on strike. Please consult a window.";
  if (clicks === 6) return "I said I'm on strike! Stop poking the metal.";
  if (clicks === 7) return "Are you just going to keep clicking me all day?";
  if (clicks >= 8) return "Okay, okay, I surrender! Rebooting system... 🔄";

  const temp = data.current.temperature_2m;
  const code = data.current.weather_code;
  const precipProb = data.daily.precipitation_probability_max?.[0] || 0;
  const windSpeed = data.current.wind_speed_10m;
  const desc = getWeatherDesc(code).toLowerCase();

  let tempFeels = "mild";
  if (temp < 10) tempFeels = "freezing my metal bolts off";
  else if (temp < 20) tempFeels = "a bit chilly";
  else if (temp < 28) tempFeels = "pretty nice";
  else tempFeels = "overheating my processors";

  let summary = `It's currently ${tempFeels} and ${desc} in ${location}. `;

  if (precipProb > 60) {
    summary += "My sensors detect high rain probability. Deploy your umbrella! ";
  } else if (precipProb > 20) {
    summary += "There's a slight chance of rain. I'm not waterproof, so I'd be careful. ";
  } else {
    summary += "Looks mostly dry. Good for my circuitry! ";
  }

  if (windSpeed > 40) {
    summary += "Also, it's super windy. Don't blow away!";
  } else if (windSpeed > 20) {
    summary += "A bit breezy today too.";
  }

  if (clicks === 1) summary = "You poked me! Anyway... " + summary;
  if (clicks === 2) summary = "Hey! Stop that! " + summary;
  if (clicks === 3) summary = "Please stop clicking me. " + summary;
  if (clicks === 4) summary = "I'm warning you... " + summary;

  return summary;
};

const WeatherEffects = ({ code }) => {
  const elements = [];
  
  if (code >= 51 && code <= 67) {
    // Rain
    for(let i=0; i<30; i++) {
      elements.push(
        <div key={`rain-${i}`} className="drop" style={{
          left: `${Math.random() * 96}%`,
          animationDuration: `${0.5 + Math.random()}s`,
          animationDelay: `-${Math.random() * 2}s`
        }} />
      );
    }
  } else if (code >= 71 && code <= 77) {
    // Snow
    for(let i=0; i<50; i++) {
      elements.push(
        <div key={`snow-${i}`} className="flake" style={{
          left: `${Math.random() * 96}%`,
          width: `${3 + Math.random() * 5}px`,
          height: `${3 + Math.random() * 5}px`,
          animationDuration: `${3 + Math.random() * 3}s`,
          animationDelay: `-${Math.random() * 5}s`
        }} />
      );
    }
  } else if (code >= 1 && code <= 3) {
    // Clouds
    for(let i=0; i<4; i++) {
      elements.push(
        <div key={`cloud-${i}`} className="floating-cloud" style={{
          top: `${10 + Math.random() * 40}vh`,
          width: `${180 + Math.random() * 150}px`,
          height: `${80 + Math.random() * 60}px`,
          animationDuration: `${30 + Math.random() * 30}s`,
          animationDelay: `-${Math.random() * 30}s`
        }} />
      );
    }
  }
  
  if (code === 0 || code === 1) {
    elements.push(<div key="sun" className="sun-reflection" />);
  }
  
  return <div className="weather-effects-container">{elements}</div>;
};

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tonyClicks, setTonyClicks] = useState(0);
  
  const [lat, setLat] = useState('29.5829');
  const [lon, setLon] = useState('80.2182');
  const [locationName, setLocationName] = useState('Pithoragarh, Uttarakhand');
  const [searchInput, setSearchInput] = useState('');

  const fetchWeather = async (latitude, longitude, silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    if (!silent) setError(null);
    try {
      const response = await axios.get(`/api/weather?lat=${latitude}&lon=${longitude}`);
      setWeatherData(response.data);
    } catch (err) {
      console.error(err);
      if (!silent) setError('Failed to load weather data');
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather(lat, lon);
    const intervalId = setInterval(() => {
      fetchWeather(lat, lon, true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [lat, lon]);

  useEffect(() => {
    if (tonyClicks >= 8) {
      const timer = setTimeout(() => {
        setTonyClicks(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tonyClicks]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setLoading(true);
    try {
      const geoRes = await axios.get(`/api/geocode?q=${searchInput}`);
      const { lat: newLat, lon: newLon, name } = geoRes.data;
      
      setLat(newLat);
      setLon(newLon);
      setLocationName(name);
      setSearchInput('');
    } catch (err) {
      console.error(err);
      alert('Location not found. Please try another city.');
      setLoading(false); 
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="app-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="glass-panel">
          <p>{error}</p>
          <button onClick={() => fetchWeather(lat, lon)}>Retry</button>
        </div>
      </div>
    );
  }

  const current = weatherData?.current;

  const getNext24Hours = (hourlyData) => {
    if (!hourlyData) return [];
    const now = new Date();
    // Find index for the current hour
    const currentIndex = hourlyData.time.findIndex(timeStr => new Date(timeStr) >= now);
    const startIdx = currentIndex !== -1 ? currentIndex : 0;
    
    return Array.from({ length: 24 }).map((_, i) => {
      const idx = startIdx + i;
      if (idx >= hourlyData.time.length) return null;
      return {
        time: hourlyData.time[idx],
        temp: hourlyData.temperature_2m[idx],
        code: hourlyData.weather_code[idx],
        precip: hourlyData.precipitation_probability[idx]
      };
    }).filter(Boolean);
  };

  return (
    <>
      <WeatherEffects code={current?.weather_code} />
      
      <div className="app-container">
        
        <form className="search-bar animate-in" onSubmit={handleSearch}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search city to update..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <Search size={20} />
          </button>
        </form>

        <div className="glass-panel animate-in delay-1" style={{ padding: '1.25rem', marginBottom: '0.25rem', background: 'linear-gradient(145deg, rgba(167, 139, 250, 0.08), rgba(49, 46, 129, 0.2))', border: '1px solid rgba(167, 139, 250, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <button 
              className={`tony-bot ${tonyClicks > 0 ? 'anim-bounce' : ''}`}
              onClick={() => setTonyClicks(c => c + 1)}
              style={{ background: 'rgba(167, 139, 250, 0.2)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
            >
              <Bot size={24} color={tonyClicks >= 5 ? '#ef4444' : 'var(--accent-color)'} />
            </button>
            <span style={{ fontSize: '1rem', fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>What Tony Thinks</span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-primary)', fontStyle: 'italic' }}>
            "{getTonyThoughts(weatherData, locationName, tonyClicks)}"
          </p>
        </div>

        <div className="glass-panel animate-in delay-2">
          <div className="header">
            <div className="title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Current Weather
              <button onClick={() => fetchWeather(lat, lon, true)} className="refresh-btn">
                <RefreshCw size={16} className={isRefreshing ? 'anim-spin' : ''} />
              </button>
            </div>
            <div className="source-badge">{weatherData?.source}</div>
          </div>

          <div className="location-display">
            <MapPin size={28} color="#38bdf8" />
            <div className="city-name">{locationName}</div>
          </div>

          <div className="main-weather">
            <div>
              <div className="current-temp">{Math.round(current?.temperature_2m)}°</div>
              <div className="weather-desc">{getWeatherDesc(current?.weather_code)}</div>
            </div>
            <div>
              {getWeatherIcon(current?.weather_code, current?.is_day)}
            </div>
          </div>
        </div>

        {weatherData?.sources_temp && Object.keys(weatherData.sources_temp).length > 0 && (
          <div className="glass-panel animate-in delay-2" style={{padding: '1.25rem'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Info size={16} color="var(--accent-color)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Consensus Data</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {Object.entries(weatherData.sources_temp).map(([source, temp]) => (
                <div key={source} style={{display: 'flex', justifyContent: 'space-between', fontSize: '1rem'}}>
                  <span style={{color: 'var(--text-primary)'}}>{source}</span>
                  <span style={{fontWeight: 600, color: 'var(--accent-color)'}}>{(temp).toFixed(1)}°C</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="details-grid animate-in delay-3">
          <div className="detail-item">
            <Thermometer className="detail-icon" size={24} />
            <div className="detail-info">
              <span className="detail-label">Feels Like</span>
              <span className="detail-value">{Math.round(current?.apparent_temperature)}°C</span>
            </div>
          </div>
          <div className="detail-item">
            <Droplets className="detail-icon" size={24} />
            <div className="detail-info">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{current?.relative_humidity_2m}%</span>
            </div>
          </div>
          <div className="detail-item">
            <Wind className="detail-icon" size={24} />
            <div className="detail-info">
              <span className="detail-label">Wind</span>
              <span className="detail-value">{current?.wind_speed_10m} km/h</span>
            </div>
          </div>
          <div className="detail-item">
            <CloudRain className="detail-icon" size={24} />
            <div className="detail-info">
              <span className="detail-label">Precipitation</span>
              <span className="detail-value">{current?.precipitation} mm</span>
            </div>
        </div>
        </div>
        <div className="glass-panel animate-in delay-3" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CloudRain size={24} color="var(--accent-color)" className="anim-bounce" />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Chance of Rain</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
              {getDetailedWeatherIcons(current?.weather_code, current?.is_day, 'small')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <div style={{ 
                height: '100%', 
                width: `${weatherData?.daily?.precipitation_probability_max?.[0] || 0}%`, 
                background: 'var(--gradient-primary)',
                borderRadius: '12px',
                transition: 'width 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} />
            </div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, minWidth: '70px', textAlign: 'right', color: 'var(--text-primary)' }}>
              {weatherData?.daily?.precipitation_probability_max?.[0] || 0}%
            </span>
          </div>
        </div>

        {weatherData?.hourly && (
          <div className="glass-panel animate-in delay-3" style={{ padding: '1.25rem' }}>
            <div className="title" style={{ marginBottom: '1rem', fontSize: '1rem' }}>Hourly Forecast</div>
            <div className="hourly-container">
              {getNext24Hours(weatherData.hourly).map((hour, index) => {
                const date = new Date(hour.time);
                let timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                if (timeStr === '12 AM') timeStr = '12 AM'; // format cleanup if needed
                
                // Determine if it's day or night for the icon based on hour (rough estimate: 6 AM to 6 PM is day)
                const h = date.getHours();
                const isDay = h >= 6 && h < 18;

                return (
                  <div key={hour.time} className="hourly-item">
                    <span className="hourly-time">{index === 0 ? 'Now' : timeStr}</span>
                    {getWeatherIcon(hour.code, isDay, 'small')}
                    <span className="hourly-temp">{Math.round(hour.temp)}°</span>
                    <div style={{fontSize: '0.65rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600, marginTop: '2px'}}>
                      <Droplets size={10} /> {hour.precip}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass-panel animate-in delay-4">
          <div className="title" style={{ marginBottom: '1rem' }}>7-Day Forecast</div>
          <div className="forecast-list">
            {weatherData?.daily?.time?.map((time, index) => {
              const date = new Date(time);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div className="forecast-item" key={time}>
                  <span className="forecast-day">{index === 0 ? 'Today' : dayName}</span>
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem'}}>
                    {getWeatherIcon(weatherData.daily.weather_code[index], true, 'small')}
                    <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                      {getWeatherDesc(weatherData.daily.weather_code[index])}
                    </span>
                    <div style={{fontSize: '0.7rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600}}>
                      <Droplets size={12} /> {weatherData.daily.precipitation_probability_max[index]}%
                    </div>
                  </div>
                  <div className="forecast-temps">
                    <span className="temp-max">{Math.round(weatherData.daily.temperature_2m_max[index])}°</span>
                    <span className="temp-min">{Math.round(weatherData.daily.temperature_2m_min[index])}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </>
  );
}

export default App;
