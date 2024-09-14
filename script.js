const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-infor-container");

// Initital variables
let oldTab = userTab;
let API_KEY = "7f6a1a920ba20b00a85493c610c5b2bf";
oldTab.classList.add("current-tab");

// function switchTab(newTab) {
//   // if (newTab != oldTab) {
//   //   oldTab.classList.remove("current-tab");
//   //   oldTab = newTab;
//   //   oldTab.classList.add("current-tab");

//   //   if (searchForm.style.display ='none') {
//   //     userInfoContainer.style.display = 'none';
//   //     grantAccessContainer.style("active");
//   //     searchForm.classList.add("active");
//   //   } else {
//   //     // if searchForm container is visible the make it invisible
//   //     searchForm.classList.remove("active");
//   //     userInfoContainer.classList.remove("active");
//   //     // now im in use weather tab now  we have to display weather lets check local storage first for cordinates
//   //     getFromSessionStorage();
//   //   }
//   // }
// }

function switchTab(newTab) {
  if (newTab != oldTab) {
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    searchInput.value = "";
    if (newTab === searchTab) {
      // Hide user info container and grant access container
      userInfoContainer.style.display = "none";
      grantAccessContainer.style.display = "none";
      // Show search form
      searchForm.style.display = "flex";
    } else {
      // Show user info container if location data is available, otherwise show grant access container
      if (sessionStorage.getItem("user-coordinates")) {
        userInfoContainer.style.display = "flex";
        grantAccessContainer.style.display = "none";
      } else {
        userInfoContainer.style.display = "none";
        grantAccessContainer.style.display = "flex";
      }
      // Hide search form
      searchForm.style.display = "none";
      // Fetch and display weather information
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  // pass cliked tab as inout parametr
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // pass cliked tab as inout parametr
  switchTab(searchTab);
});

// check if cordinatea re already present in storage
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  // make loader visible
  loadingScreen.style.display = "flex";

  //   api call

  const url =
    "https://weatherapi-com.p.rapidapi.com/current.json?q=" + lat + "%2C" + lon;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "1577b914a9mshc7e25a729b23d1fp1b238bjsnc81522547467",
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    loadingScreen.style.display = "none";
    renderWatherData(data);
  } catch (error) {
    loadingScreen.classList.remove("active");
    console.error(error);
  }
}

function renderWatherData(data) {
  // first we have to fetch the data

  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherDescIcon]");
  const temp = document.querySelector("[data-temprature]");
  const windSpeed = document.querySelector("[data-windSpeed]");
  const humidity = document.querySelector("[data-humidty]");
  const clouds = document.querySelector("[data-clouds]");

  //  Fe values from data object and put it in UI

  cityName.innerHTML = data?.location.name;

  // get country flag
  getCountryFlag(data?.location?.country).then((flagUrl) => {
    countryIcon.src = flagUrl;
  });
  desc.textContent = data?.current?.condition?.text;
  weatherIcon.src = data?.current?.condition?.icon;
  temp.innerHTML = `${data?.current?.temp_c} ℃`;
  windSpeed.innerHTML = `${data?.current?.wind_kph} Km/h`;
  humidity.innerHTML = `${data?.current?.humidity} %`;
  clouds.innerHTML = data?.current?.cloud;
}

async function getCountryFlag(countryName) {
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`
    );
    const data = await response.json();
    return data[0]?.flags?.png;
  } catch (error) {
    console.log(error);
    return "";
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    grantAccessContainer.style.display = "none";
    userInfoContainer.style.display = "flex";
  } else {
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

// search functionaly

const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  let cityName = searchInput.value;
  if (cityName === "") {
    return;
  } else {
    const data = await fetchUserWeatherInfoByCity(cityName);
    if (data) {
      userInfoContainer.style.display = "flex";
      searchForm.style.alignItem = "center";
      searchForm.style.justifyContent = "center";
      renderWatherData(data);
    } else {
      console.log("Error fetching weather data");
    }
  }
});
async function fetchUserWeatherInfoByCity(cityName) {
  loadingScreen.style.display = "flex";
  userInfoContainer.style.display = "none";
  grantAccessContainer.style.display = "none";

  try {
    const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${encodeURIComponent(
      cityName
    )}`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "1577b914a9mshc7e25a729b23d1fp1b238bjsnc81522547467",
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
      },
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      searchInput.innerHTML = "";
      loadingScreen.style.display = "none";
      return data;
    } catch (error) {
      console.error(error);
      loadingScreen.style.display = "none";
    }
  } catch (error) {
    console.log(error);
    loadingScreen.style.display = "none";
  }
}
