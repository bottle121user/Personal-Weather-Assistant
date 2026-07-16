const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Weather Aggregation Engine
app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  try {
    // 1. Open-Meteo
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`;
    const openMeteoPromise = axios.get(openMeteoUrl);

    // 2. OpenWeatherMap
    const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OWM_API_KEY}&units=metric`;
    const owmPromise = axios.get(owmUrl);

    // 3. MET Norway (Requires custom User-Agent)
    const metUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    const metPromise = axios.get(metUrl, { headers: { 'User-Agent': 'PersonalWeatherAggregator/1.0 (github.com/test)' } });

    // Fetch all concurrently
    const [omRes, owmRes, metRes] = await Promise.allSettled([openMeteoPromise, owmPromise, metPromise]);

    let temperatures = [];
    let sourcesData = {};

    // Base data from Open-Meteo
    const baseData = omRes.status === 'fulfilled' ? omRes.value.data : null;
    
    if (omRes.status === 'fulfilled') {
      temperatures.push(omRes.value.data.current.temperature_2m);
      sourcesData['Open-Meteo'] = omRes.value.data.current.temperature_2m;
    }
    
    if (owmRes.status === 'fulfilled') {
      temperatures.push(owmRes.value.data.main.temp);
      sourcesData['OpenWeatherMap'] = owmRes.value.data.main.temp;
    }

    if (metRes.status === 'fulfilled') {
      const metTemp = metRes.value.data.properties.timeseries[0].data.instant.details.air_temperature;
      temperatures.push(metTemp);
      sourcesData['MET Norway'] = metTemp;
    }

    if (!baseData) {
      return res.status(500).json({ error: 'Primary data source (Open-Meteo) failed.' });
    }

    // Calculate Consensus Average Temperature
    const avgTemp = temperatures.length > 0 
      ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length 
      : baseData.current.temperature_2m;

    const weatherData = {
      source: 'Consensus Model',
      current: {
        ...baseData.current,
        temperature_2m: avgTemp // Override with average
      },
      sources_temp: sourcesData,
      daily: baseData.daily,
      hourly: baseData.hourly
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Geocoding endpoint
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
    const response = await axios.get(geoUrl);
    
    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      res.json({
        name: `${result.name}${result.admin1 ? `, ${result.admin1}` : ''}`,
        lat: result.latitude,
        lon: result.longitude
      });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error in geocoding:', error.message);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
