import axios from 'axios';

export default async function handler(req, res) {
  // Allow cross-origin for local testing if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  try {
    const openMeteoPromise = axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`);
    const owmPromise = axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OWM_API_KEY}&units=metric`);
    const metPromise = axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, { headers: { 'User-Agent': 'PersonalWeatherAggregator/1.0 (github.com/test)' } });

    const [omRes, owmRes, metRes] = await Promise.allSettled([openMeteoPromise, owmPromise, metPromise]);

    let temperatures = [];
    let sourcesData = {};

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

    const avgTemp = temperatures.length > 0 
      ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length 
      : baseData.current.temperature_2m;

    res.status(200).json({
      source: 'Consensus Model',
      current: {
        ...baseData.current,
        temperature_2m: avgTemp
      },
      sources_temp: sourcesData,
      daily: baseData.daily,
      hourly: baseData.hourly
    });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
