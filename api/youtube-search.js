export const config = { runtime: 'edge' };

function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return Infinity;
  const hours   = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: missing API key.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let exerciseName;
  try {
    const body = await req.json();
    exerciseName = body.exerciseName;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!exerciseName) {
    return new Response(
      JSON.stringify({ error: 'Missing exerciseName' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const query = encodeURIComponent(`${exerciseName} tutorial proper form`);
  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet&q=${query}&type=video&maxResults=5` +
    `&relevanceLanguage=en&order=relevance&key=${apiKey}`;

  let videoIds;
  try {
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      return new Response(JSON.stringify({ videoId: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const searchData = await searchRes.json();
    videoIds = (searchData.items || []).map((item) => item.id?.videoId).filter(Boolean);
  } catch {
    return new Response(JSON.stringify({ videoId: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!videoIds.length) {
    return new Response(JSON.stringify({ videoId: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch durations and filter to videos under 10 minutes (600 seconds).
  try {
    const detailsUrl =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);

    if (detailsRes.ok) {
      const detailsData = await detailsRes.json();
      const durationMap = {};
      for (const item of (detailsData.items || [])) {
        durationMap[item.id] = parseISO8601Duration(item.contentDetails.duration);
      }
      const under10 = videoIds.filter((id) => (durationMap[id] ?? Infinity) < 600);
      const videoId = under10[0] || videoIds[0];
      return new Response(JSON.stringify({ videoId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch {
    // fall through to returning top search result
  }

  return new Response(JSON.stringify({ videoId: videoIds[0] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
