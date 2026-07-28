const apiKey = "3a6191412432ff27dcc2ad94ffee264a";

// Search Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

// Weather Elements
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const pressure = document.getElementById("pressure");
const weatherIcon = document.getElementById("weatherIcon");

// Forecast
const forecastContainer = document.getElementById("forecast");

// Sunrise & Sunset
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

// Date & Time
const dateTime = document.getElementById("dateTime");

// =======================
// Event Listeners
// =======================

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchWeather();
    }
});

locationBtn.addEventListener("click", getCurrentLocation);

// =======================
// Search Weather
// =======================

function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    getCurrentWeather(city);
    getForecast(city);
}

// =======================
// Current Weather
// =======================

async function getCurrentWeather(city) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        if (data.cod != 200) {
            alert("City not found.");
            return;
        }

        displayWeather(data);

    } catch (error) {

        alert("Unable to fetch weather.");

    }

}

// =======================
// Display Weather
// =======================

function displayWeather(data) {

    cityName.textContent = data.name;

    temperature.textContent = `${Math.round(data.main.temp)}°C`;

    description.textContent = data.weather[0].description;

    humidity.textContent = `${data.main.humidity}%`;

    wind.textContent = `${data.wind.speed} m/s`;

    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

    pressure.textContent = `${data.main.pressure} hPa`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt = data.weather[0].description;

    // Sunrise & Sunset
    sunrise.textContent =
        new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    sunset.textContent =
        new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    updateDateTime();

    changeBackground(data.weather[0].main);

}

// =======================
// Forecast
// =======================

async function getForecast(city) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        forecastContainer.innerHTML = "";

        const forecast = data.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );

        forecast.forEach(day => {

            const card = document.createElement("div");

            card.className = "forecast-card";

            const date = new Date(day.dt_txt);

            card.innerHTML = `
                <h4>${date.toLocaleDateString("en-US", { weekday: "short" })}</h4>

                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

                <h3>${Math.round(day.main.temp)}°C</h3>

                <p>${day.weather[0].description}</p>
            `;

            forecastContainer.appendChild(card);

        });

    } catch (error) {

        console.log(error);

    }

}

// =======================
// Current Location
// =======================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(showPosition, showError);

}

function showPosition(position) {

    const lat = position.coords.latitude;

    const lon = position.coords.longitude;

    getLocationWeather(lat, lon);

}

function showError() {

    alert("Location permission denied.");

}

async function getLocationWeather(lat, lon) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        displayWeather(data);

        getForecast(data.name);

    } catch (error) {

        console.log(error);

    }

}

// =======================
// Date & Time
// =======================

function updateDateTime() {

    const now = new Date();

    dateTime.textContent =
        now.toLocaleDateString() +
        " | " +
        now.toLocaleTimeString();

}

updateDateTime();

setInterval(updateDateTime, 1000);

// =======================
// Background
// =======================

function changeBackground(weather) {

    switch (weather) {

        case "Clear":
            document.body.style.background =
                "linear-gradient(135deg,#56CCF2,#2F80ED)";
            break;

        case "Clouds":
            document.body.style.background =
                "linear-gradient(135deg,#BDC3C7,#2C3E50)";
            break;

        case "Rain":
        case "Drizzle":
            document.body.style.background =
                "linear-gradient(135deg,#4B79A1,#283E51)";
            break;

        case "Thunderstorm":
            document.body.style.background =
                "linear-gradient(135deg,#232526,#414345)";
            break;

        case "Snow":
            document.body.style.background =
                "linear-gradient(135deg,#E6DADA,#274046)";
            break;

        case "Mist":
        case "Fog":
        case "Haze":
            document.body.style.background =
                "linear-gradient(135deg,#757F9A,#D7DDE8)";
            break;

        default:
            document.body.style.background =
                "linear-gradient(135deg,#4FACFE,#00F2FE)";
    }

}