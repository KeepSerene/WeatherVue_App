import CurrentLocation from "./currentLocation.js";

import {
  setPlaceHolderText,
  addSpinner,
  displayErrorMsg,
  updateSRConfirmation,
  handleAPIError,
  updateAppDisplay,
} from "./domFuncs.js";

import {
  setLocObj,
  getHomeLoc,
  cleanInputStr,
  fetchCoords,
  fetchWeather,
} from "./dataHandlers.js";

const currLoc = new CurrentLocation();

function initApp() {
  // Add listeners
  const geoLocBtn = document.getElementById("get-geo-location");
  geoLocBtn.addEventListener("click", getGeoLocWeather);

  const homeWeatherBtn = document.getElementById("home-weather");
  homeWeatherBtn.addEventListener("click", loadDefaultWeather);

  const saveLocBtn = document.getElementById("save-location");
  saveLocBtn.addEventListener("click", saveLocation);

  const unitTogglerBtn = document.getElementById("unit-toggler");
  unitTogglerBtn.addEventListener("click", setUnitPref);

  const refreshWeatherBtn = document.getElementById("refresh-weather");
  refreshWeatherBtn.addEventListener("click", refreshWeather);

  const searchForm = document.getElementById("search-bar__form");
  searchForm.addEventListener("submit", submitNewLoc);

  // Set up
  setPlaceHolderText();

  // Load default weather
  loadDefaultWeather();
}

function getGeoLocWeather(event) {
  if (event) {
    if (event.type === "click") {
      // Add the spinner
      const mapIcon = document.querySelector("[data-map-icon]");
      addSpinner(mapIcon);
    }
  }

  if (!navigator.geolocation) return handleGeoError();

  navigator.geolocation.getCurrentPosition(handleGeoSuccess, handleGeoError);
}

function handleGeoError(errObj) {
  const errMsg = errObj ? errObj.message : "Geo location not supported!";

  displayErrorMsg(errMsg, errMsg);
}

function handleGeoSuccess(posObj) {
  const myCoordsObj = {
    lat: posObj.coords.latitude,
    lon: posObj.coords.longitude,
    name: `Lat:${posObj.coords.latitude} Lon:${posObj.coords.longitude}`,
  };

  setLocObj(currLoc, myCoordsObj);
  updateWeather(currLoc);
}

function loadDefaultWeather(event) {
  const savedLoc = getHomeLoc();

  if (!savedLoc && !event) return getGeoLocWeather();

  if (!savedLoc && event.type === "click") {
    displayErrorMsg(
      "Home Location wasn't set!",
      "Sorry! Please save your home location first."
    );
  } else if (savedLoc && !event) {
    // When the app is loading weather from a previously set saved location, and the home weather btn wasn't clicked
    getHomeWeather(savedLoc);
  } else {
    // When the home weather btn was clicked, and a location was saved beforehand
    const homeIcon = document.querySelector("[data-home-icon]");
    addSpinner(homeIcon);
    getHomeWeather(savedLoc);
  }
}

function getHomeWeather(homeLoc) {
  if (typeof homeLoc === "string") {
    // When the retrieved home location is a JSON string stored in the local storage
    const parsedLocObj = JSON.parse(homeLoc);
    const coordsObj = {
      lat: parsedLocObj.lat,
      lon: parsedLocObj.lon,
      name: parsedLocObj.name,
      unit: parsedLocObj.unit,
    };

    setLocObj(currLoc, coordsObj);
    updateWeather(currLoc);
  }
}

function saveLocation() {
  if (currLoc.getLat() && currLoc.getLon()) {
    const saveIcon = document.querySelector("[data-save-icon]");
    addSpinner(saveIcon);

    const location = {
      name: currLoc.getName(),
      lat: currLoc.getLat(),
      lon: currLoc.getLon(),
      unit: currLoc.getUnit(),
    };

    localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));

    updateSRConfirmation(
      `${currLoc.getName()} has been saved as your home location.`
    );
  }
}

function setUnitPref() {
  const chartBarIcon = document.querySelector("[data-chart-bar-icon]");
  addSpinner(chartBarIcon);

  currLoc.toggleUnit();
  updateWeather(currLoc);
}

function refreshWeather() {
  const syncIcon = document.querySelector("[data-sync-icon]");
  addSpinner(syncIcon);

  updateWeather(currLoc);
}

async function submitNewLoc(event) {
  event.preventDefault();

  const inputStr = document.getElementById("search-bar__text").value;
  const locStr = cleanInputStr(inputStr);

  if (!locStr.length) return;

  const searchIcon = document.querySelector("[data-search-icon]");
  addSpinner(searchIcon);

  const coordsData = await fetchCoords(locStr, currLoc.getUnit());

  if (coordsData) {
    if (coordsData.cod === 200) {
      const myCoordsObj = {
        lat: coordsData.coord.lat,
        lon: coordsData.coord.lon,
        name: coordsData.sys.country
          ? `${coordsData.name}, ${coordsData.sys.country}`
          : coordsData.name,
      };

      setLocObj(currLoc, myCoordsObj);
      updateWeather(currLoc);
    } else {
      handleAPIError(coordsData);
    }
  } else {
    displayErrorMsg(
      "Connection error!",
      "A connection error was encountered! Please try again."
    );
  }
}

async function updateWeather(locObj) {
  const weatherInfo = await fetchWeather(locObj);

  if (weatherInfo) updateAppDisplay(weatherInfo, locObj);
}

document.addEventListener("DOMContentLoaded", initApp);
