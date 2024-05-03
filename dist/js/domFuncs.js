export function setPlaceHolderText() {
  const inputEl = document.getElementById("search-bar__text");

  inputEl.placeholder =
    window.innerWidth <= 400
      ? "City, State, Country"
      : "City, State, Country, or Zip Code";
}

export function addSpinner(element) {
  animateSpinnerBtn(element);

  setTimeout(animateSpinnerBtn, 1000, element);
}

function animateSpinnerBtn(elem) {
  elem.classList.toggle("dis-none");

  // Handle the spinner icon element
  elem.nextElementSibling.classList.toggle("dis-block");
  elem.nextElementSibling.classList.toggle("dis-none");
}

// sr or SR: screen reader
export function displayErrorMsg(headerMsg, srMsg) {
  updateLocationHeader(headerMsg);
  updateSRConfirmation(srMsg);
}

export function handleAPIError(statusCode) {
  const properMsg = toProperCase(statusCode.message);

  updateLocationHeader(properMsg);
  updateSRConfirmation(`${properMsg}. Please try again.`);
}

function toProperCase(msg) {
  const words = msg.split(" ");

  const properWords = words.map(
    (word) => word[0].toUpperCase() + word.slice(1)
  );

  return properWords.join(" ");
}

function updateLocationHeader(msg) {
  const locationHeader = document.getElementById("current-forecast__location");

  if (msg.indexOf("Lat:") !== -1 && msg.indexOf("Lon:") !== -1) {
    const msgArray = msg.split(" ");

    const mapArray = msgArray.map((coord) => coord.replace(":", ": "));

    const lat =
      mapArray[0].indexOf("-") === -1
        ? mapArray[0].slice(0, 10)
        : mapArray[0].slice(0, 11);

    const lon =
      mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 10)
        : mapArray[1].slice(0, 11);

    locationHeader.innerText = `${lat} \u2022 ${lon}`;
  } else locationHeader.innerText = msg;
}

export const updateSRConfirmation = (msg) => {
  document.getElementById("confirmation").innerText = msg;
};

export function updateAppDisplay(weahterInfo, locObj) {
  fadeDisplay(); // Fade out

  clearDisplay();

  const weatherTheme = getWeatherTheme(weahterInfo.current.weather[0].icon);
  setBGImage(weatherTheme);

  const srWeatherUpdates = getSRWeatherUpdates(weahterInfo, locObj);
  updateSRConfirmation(srWeatherUpdates);

  updateLocationHeader(locObj.getName());

  // Current conditions
  const currCondsArr = createCurrCondsDivs(weahterInfo, locObj.getUnit());
  displayCurrentConditions(currCondsArr);

  // 6 day forecast
  displaySixDayForecast(weahterInfo);

  setFocusOnSearchBar();

  fadeDisplay(); // Fade back in
}

function fadeDisplay() {
  const currentForecastEl = document.getElementById("current-forecast");
  const dailyForecastEl = document.getElementById("daily-forecast");

  for (let elem of [currentForecastEl, dailyForecastEl]) {
    elem.classList.toggle("vis-0");
    elem.classList.toggle("fade-in");
  }
}

function clearDisplay() {
  const currentConditionsEl = document.getElementById(
    "current-forecast__conditions"
  );
  const sixDayForecastEl = document.getElementById("daily-forecast__contents");

  for (let elem of [currentConditionsEl, sixDayForecastEl])
    deleteContents(elem);
}

function deleteContents(parentElem) {
  let childEl = parentElem.lastElementChild;

  while (childEl) {
    parentElem.removeChild(childEl);
    childEl = parentElem.lastElementChild;
  }
}

function getWeatherTheme(icon) {
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);

  const weatherLookUp = {
    "09": "snowy",
    10: "rainy",
    11: "rainy",
    13: "snowy",
    50: "foggy",
  };

  let weatherTheme;

  if (weatherLookUp[firstTwoChars]) {
    weatherTheme = weatherLookUp[firstTwoChars];
  } else if (lastChar === "d") {
    weatherTheme = "cloudy";
  } else {
    weatherTheme = "night";
  }

  return weatherTheme;
}

function setBGImage(weatherTheme) {
  document.documentElement.classList.add(weatherTheme);

  document.documentElement.classList.forEach((bgImg) => {
    if (bgImg !== weatherTheme)
      document.documentElement.classList.remove(bgImg);
  });
}

function getSRWeatherUpdates(weahterInfo, locObj) {
  const location = locObj.getName();
  const unit = locObj.getUnit();
  const tempUnit = unit === "imperial" ? "fahrenheit" : "celsius";

  return `${weahterInfo.current.weather[0].description}, ${Math.round(
    Number(weahterInfo.current.temp)
  )}\u00B0 ${tempUnit} in ${location}.`;
}

const setFocusOnSearchBar = () =>
  document.getElementById("search-bar__text").focus();

function createCurrCondsDivs(weahterInfo, unit) {
  const tempUnit = unit === "imperial" ? "F" : "C";
  const windSpeedUnit = unit === "imperial" ? "mph" : "m/s";

  const iconWrapperEl = createIconWrapperDiv(
    weahterInfo.current.weather[0].icon,
    weahterInfo.current.weather[0].description
  );

  const tempEl = createElem(
    "div",
    "temp",
    `${Math.round(Number(weahterInfo.current.temp))}\u00B0`,
    tempUnit
  );

  const properDesc = toProperCase(weahterInfo.current.weather[0].description);
  const descEl = createElem("div", "desc", properDesc);

  const realFeelEl = createElem(
    "div",
    "real-feel",
    `Feels Like ${Math.round(Number(weahterInfo.current.feels_like))}\u00B0`
  );

  const maxTempEl = createElem(
    "div",
    "max-temp",
    `Max ${Math.round(Number(weahterInfo.daily[0].temp.max))}\u00B0`
  );
  const minTempEl = createElem(
    "div",
    "min-temp",
    `Min ${Math.round(Number(weahterInfo.daily[0].temp.min))}\u00B0`
  );

  const humidityEl = createElem(
    "div",
    "humidity",
    `Humidity ${weahterInfo.current.humidity}%`
  );

  const windSpeedEl = createElem(
    "div",
    "wind",
    `Wind ${Math.round(
      Number(weahterInfo.current.wind_speed)
    )} ${windSpeedUnit}`
  );

  return [
    iconWrapperEl,
    tempEl,
    descEl,
    realFeelEl,
    maxTempEl,
    minTempEl,
    humidityEl,
    windSpeedEl,
  ];
}

function createIconWrapperDiv(icon, iconDesc) {
  const iconWrapperDiv = createElem("div", "icon-wrapper");
  iconWrapperDiv.id = "icon-wrapper";
  const faIconEl = getFontAwesomeWeatherIcon(icon);
  faIconEl.ariaHidden = true;
  faIconEl.title = iconDesc;
  iconWrapperDiv.appendChild(faIconEl);
  return iconWrapperDiv;
}

function createElem(elemType, elemClassName, elemInnerText, unit) {
  const div = document.createElement(elemType);
  div.className = elemClassName;

  if (elemInnerText) {
    div.innerText = elemInnerText;
  }

  if (elemClassName === "temp") {
    const unitDiv = document.createElement("div");
    unitDiv.className = "unit";
    unitDiv.innerText = unit;
    div.appendChild(unitDiv);
  }

  return div;
}

function getFontAwesomeWeatherIcon(icon) {
  const i = document.createElement("i");
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);

  switch (firstTwoChars) {
    case "01":
      if (lastChar === "d") i.classList.add("far", "fa-sun");
      else i.classList.add("far", "fa-moon");
      break;

    case "02":
      if (lastChar === "d") i.classList.add("fas", "fa-cloud-sun");
      else i.classList.add("fas", "fa-cloud-moon");
      break;

    case "03":
      i.classList.add("fas", "fa-cloud");
      break;

    case "04":
      i.classList.add("fas", "fa-cloud-meatball");
      break;

    case "09":
      i.classList.add("fas", "fa-cloud-rain");
      break;

    case "10":
      if (lastChar === "d") i.classList.add("fas", "fa-cloud-sun-rain");
      else i.classList.add("fas", "fa-cloud-moon-rain");
      break;

    case "11":
      i.classList.add("fas", "fa-poo-storm");
      break;

    case "13":
      i.classList.add("far", "fa-snowflake");
      break;

    case "50":
      i.classList.add("fas", "fa-smog");
      break;

    default:
      i.classList.add("far", "fa-question-circle");
  }

  return i;
}

function displayCurrentConditions(currCondsArr) {
  const currCondsWrapper = document.getElementById(
    "current-forecast__conditions"
  );

  currCondsArr.forEach((currCond) => currCondsWrapper.appendChild(currCond));
}

function displaySixDayForecast(weahterInfo) {
  for (let i = 1; i <= 6; i++) {
    const dailyForecastDivs = createDailyForecastDivs(weahterInfo.daily[i]);
    displayDailyForecast(dailyForecastDivs);
  }
}

function createDailyForecastDivs(dayWeather) {
  const weekDayName = getWeekDayName(dayWeather.dt);
  const weekDayEl = createElem("p", "day", weekDayName);

  const dayWeatherIcon = createDayWeatherIcon(
    dayWeather.weather[0].icon,
    dayWeather.weather[0].description
  );

  const dayMaxTemp = createElem(
    "p",
    "day-max-temp",
    `${Math.round(Number(dayWeather.temp.max))}\u00B0`
  );
  const dayMinTemp = createElem(
    "p",
    "day-min-temp",
    `${Math.round(Number(dayWeather.temp.min))}\u00B0`
  );

  return [weekDayEl, dayWeatherIcon, dayMaxTemp, dayMinTemp];
}

function getWeekDayName(timestamp) {
  const dateObj = new Date(timestamp * 1000);
  const utcStr = dateObj.toUTCString();
  return utcStr.slice(0, 3).toUpperCase();
}

function displayDailyForecast(dailyForecastDivs) {
  const dayForecastWrapper = createElem("div", "forecast__item");

  dailyForecastDivs.forEach((dayForecast) =>
    dayForecastWrapper.appendChild(dayForecast)
  );

  const dailyForecastContentsWrapper = document.getElementById(
    "daily-forecast__contents"
  );
  dailyForecastContentsWrapper.appendChild(dayForecastWrapper);
}

function createDayWeatherIcon(icon, desc) {
  const img = document.createElement("img");

  if (window.innerWidth <= 768 || window.innerHeight <= 1025)
    img.src = `https://openweathermap.org/img/wn/${icon}.png`;
  else img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  img.alt = desc;

  return img;
}
