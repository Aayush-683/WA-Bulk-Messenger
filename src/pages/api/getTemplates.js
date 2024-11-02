import axios from 'axios';

// In-memory storage for templates
let templatesCache = null;
let lastFetched = null;

// Cache duration in milliseconds (e.g., 1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

export default async function handler(req, res) {
  try {
    const currentTime = new Date().getTime();

    // Check if templates are cached and valid (not expired)
    if (templatesCache && lastFetched && currentTime - lastFetched < CACHE_DURATION) {
      return res.status(200).json(templatesCache);
    }

    // Fetch templates from Meta API
    const response = await axios.get(`https://graph.facebook.com/v21.0/${process.env.BUSINESS_ACCOUNT_ID}/message_templates?fields=name,components,language,status&status=APPROVED`, {
      headers: {
        Authorization: `Bearer ${process.env.META_API_KEY}`,
      },
    });

    if (response.status !== 200) {
      return res.status(500).json({ error: 'Failed to fetch templates', details: response.data });
    }

    // Store templates in the in-memory cache and update the last fetched time
    templatesCache = response.data.data;
    lastFetched = currentTime;

    res.status(200).json(templatesCache);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch templates', details: error.response?.data || error.message });
  }
}
