exports.handler = async (event, context) => {
  const { default: fetch } = await import("node-fetch"); // Use dynamic import
  const params = JSON.parse(event.body);
  const { lat, lon, unit } = params;
  const { API_KEY } = process.env;

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${unit}&appid=${API_KEY}`;

  try {
    const weatherStream = await fetch(url);
    const weatherJSON = await weatherStream.json();

    return {
      statusCode: 200,
      body: JSON.stringify(weatherJSON),
    };
  } catch (err) {
    return {
      statusCode: 422,
      body: err.stack,
    };
  }
};
