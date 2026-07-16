import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
    const response = await axios.get(geoUrl);
    
    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      res.status(200).json({
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
}
