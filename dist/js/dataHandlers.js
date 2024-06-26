export function setLocObj(locObj, coordsObj) {
  const { lat, lon, name, unit } = coordsObj;

  locObj.setLat(lat);
  locObj.setLon(lon);
  locObj.setName(name);

  if (unit) locObj.setUnit(unit);
}

export const getHomeLoc = () => localStorage.getItem("defaultWeatherLocation");

export function cleanInputStr(str) {
  const regex = / {2,}/g;
  const desiredStr = str.replaceAll(regex, " ").trim();
  return desiredStr;
}

export async function fetchCoords(locStr, unit) {
  // const regex = /^\d+$/g;
  // const flag = regex.test(locStr) ? "zip" : "q";

  // const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${locStr}&units=${unit}&appid=${API_KEY}`;
  // const encodedURL = encodeURI(url);

  // try {
  //   const response = await fetch(encodedURL);
  //   const jsonData = await response.json();
  //   console.log(jsonData);
  //   return jsonData;
  // } catch (err) {
  //   console.error(err.stack);
  // }

  const urlDataObj = {
    locInput: locStr,
    unit: unit,
  };

  try {
    const dataStream = await fetch("./.netlify/functions/get_coords", {
      method: "POST",
      body: JSON.stringify(urlDataObj),
    });
    const jsonData = await dataStream.json();

    return jsonData;
  } catch (err) {
    console.error(err);
  }
}

export async function fetchWeather(locObj) {
  // const lat = locObj.getLat();
  // const lon = locObj.getLon();
  // const unit = locObj.getUnit();

  // const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${unit}&appid=${API_KEY}`;

  // try {
  //   const weatherResponse = await fetch(url);
  //   const weatherInfo = await weatherResponse.json();
  //   return weatherInfo;
  // } catch (err) {
  //   console.error(err);
  // }

  const urlDataObj = {
    lat: locObj.getLat(),
    lon: locObj.getLon(),
    unit: locObj.getUnit(),
  };

  try {
    const weatherStream = await fetch("./.netlify/functions/get_weather", {
      method: "POST",
      body: JSON.stringify(urlDataObj),
    });
    const weatherJSON = await weatherStream.json();

    return weatherJSON;
  } catch (err) {
    console.error(err);
  }
}
