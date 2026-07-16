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
  Info
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

const WeatherEffects = ({ code }) => {
  const elements = [];
  
  if (code >= 51 && code <= 67) {
    // Rain
    for(let i=0; i<30; i++) {
      elements.push(
        <div key={i} className="drop" style={{
          left: `${Math.random() * 100}vw`,
          animationDuration: `${0.5 + Math.random()}s`,
          animationDelay: `${Math.random() * 2}s`
        }} />
      );
    }
  } else if (code >= 71 && code <= 77) {
    // Snow
    for(let i=0; i<50; i++) {
      elements.push(
        <div key={i} className="flake" style={{
          left: `${Math.random() * 100}vw`,
          width: `${3 + Math.random() * 5}px`,
          height: `${3 + Math.random() * 5}px`,
          animationDuration: `${3 + Math.random() * 3}s`,
          animationDelay: `${Math.random() * 5}s`
        }} />
      );
    }
  } else if (code >= 1 && code <= 3) {
    // Clouds
    for(let i=0; i<4; i++) {
      elements.push(
        <div key={i} className="floating-cloud" style={{
          top: `${10 + Math.random() * 40}vh`,
          width: `${200 + Math.random() * 300}px`,
          height: `${100 + Math.random() * 100}px`,
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
  
  const [lat, setLat] = useState('29.5829');
  const [lon, setLon] = useState('80.2182');
  const [locationName, setLocationName] = useState('Pithoragarh, Uttarakhand');
  const [searchInput, setSearchInput] = useState('');

  const fetchWeather = async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/weather?lat=${latitude}&lon=${longitude}`);
      setWeatherData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(lat, lon);
  }, [lat, lon]);

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

        <div className="glass-panel animate-in delay-1">
          <div className="header">
            <div className="title">Current Weather</div>
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
