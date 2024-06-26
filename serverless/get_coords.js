exports.handler = async (event, context) => {
  const { default: fetch } = await import("node-fetch"); // Use dynamic import
  const params = JSON.parse(event.body);
  const { locInput, unit } = params;
  const { API_KEY } = process.env;

  const regex = /^\d+$/g;
  const flag = regex.test(locInput) ? "zip" : "q";

  const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${locInput}&units=${unit}&appid=${API_KEY}`;
  const encodedURL = encodeURI(url);

  try {
    const dataStream = await fetch(encodedURL);
    const jsonData = await dataStream.json();

    return {
      statusCode: 200,
      body: JSON.stringify(jsonData),
    };
  } catch (err) {
    return {
      statusCode: 422,
      body: err.stack,
    };
  }
};
