// =====================================
// Real-Time Weather Forecast Application
// =====================================

// OpenWeatherMap API Key
const apiKey = "3a6191412432ff27dcc2ad94ffee264a";

// ==============================
// HTML Elements
// ==============================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const pressure = document.getElementById("pressure");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const aqi = document.getElementById("aqi");
const dateTime = document.getElementById("dateTime");

const weatherIcon = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecast");
const loading = document.getElementById("loading");

// ==============================
// Event Listeners
// ==============================

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        searchWeather();
    }
});

locationBtn.addEventListener("click", getCurrentLocation);

// ==============================
// Search Weather
// ==============================

function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    localStorage.setItem("lastCity", city);

    getCurrentWeather(city);
    getForecast(city);

}

// ==============================
// Current Weather API
// ==============================

async function getCurrentWeather(city) {

    loading.style.display = "block";

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        if (data.cod != 200) {

            alert("City not found.");

            loading.style.display = "none";

            return;
        }

        displayWeather(data);

        getAQI(data.coord.lat, data.coord.lon);

    }

    catch (error) {

        console.error(error);

        alert("Unable to fetch weather.");

    }

    finally {

        loading.style.display = "none";

    }

}

// ==============================
// Display Weather
// ==============================

function displayWeather(data) {

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    description.textContent =
        data.weather[0].description;

    humidity.textContent =
        `${data.main.humidity}%`;

    wind.textContent =
        `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    sunrise.textContent =
        new Date(data.sys.sunrise * 1000)
            .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

    sunset.textContent =
        new Date(data.sys.sunset * 1000)
            .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

    changeBackground(data.weather[0].main);

}
// ==============================
// Air Quality Index (AQI)
// ==============================

async function getAQI(lat, lon) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch AQI");
        }

        const data = await response.json();

        const aqiLevels = {
            1: "🟢 Good",
            2: "🟡 Fair",
            3: "🟠 Moderate",
            4: "🔴 Poor",
            5: "🟣 Very Poor"
        };

        aqi.textContent = aqiLevels[data.list[0].main.aqi] || "Unknown";

    } catch (error) {

        console.error(error);

        aqi.textContent = "Not Available";

    }

}

// ==============================
// 5-Day Forecast
// ==============================

async function getForecast(city) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        forecastContainer.innerHTML = "";

        const forecastDays = data.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );

        forecastDays.forEach(day => {

            const card = document.createElement("div");

            card.className = "forecast-card";

            const date = new Date(day.dt_txt);

            card.innerHTML = `
                <h4>${date.toLocaleDateString("en-US", {
                    weekday: "short"
                })}</h4>

                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

                <h3>${Math.round(day.main.temp)}°C</h3>

                <p>${day.weather[0].main}</p>
            `;

            forecastContainer.appendChild(card);

        });

    } catch (error) {

        console.error(error);

    }

}

// ==============================
// Current Location
// ==============================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");

        return;

    }

    loading.style.display = "block";

    navigator.geolocation.getCurrentPosition(showPosition, showError);

}

function showPosition(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    getLocationWeather(latitude, longitude);

}

function showError(error) {

    loading.style.display = "none";

    switch (error.code) {

        case error.PERMISSION_DENIED:
            alert("Location permission denied.");
            break;

        case error.POSITION_UNAVAILABLE:
            alert("Location unavailable.");
            break;

        case error.TIMEOUT:
            alert("Location request timed out.");
            break;

        default:
            alert("Unable to get location.");

    }

}

async function getLocationWeather(lat, lon) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        displayWeather(data);

        getForecast(data.name);

        getAQI(lat, lon);

        cityInput.value = data.name;

        localStorage.setItem("lastCity", data.name);

    } catch (error) {

        console.error(error);

        alert("Unable to fetch location weather.");

    } finally {

        loading.style.display = "none";

    }

}
// ==============================
// Live Date & Time
// ==============================

function updateDateTime() {

    const now = new Date();

    dateTime.textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }) +
        " | " +
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

}

updateDateTime();

setInterval(updateDateTime, 1000);

// ==============================
// Dark Mode
// ==============================

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeBtn.textContent = "☀️";
        localStorage.setItem("theme", "dark");

    } else {

        themeBtn.textContent = "🌙";
        localStorage.setItem("theme", "light");

    }

});

// Restore Theme

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");
    themeBtn.textContent = "☀️";

}

// ==============================
// Dynamic Background
// ==============================

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
                "linear-gradient(135deg,#4facfe,#00c6ff)";

    }

}

// ==============================
// Load Last Searched City
// ==============================

window.addEventListener("load", () => {

    const lastCity = localStorage.getItem("lastCity") || "Hyderabad";

    cityInput.value = lastCity;

    getCurrentWeather(lastCity);
    getForecast(lastCity);

});

// ==============================
// Clear Search Box with ESC
// ==============================

cityInput.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        cityInput.value = "";

    }

});

// ==============================
// Auto Focus
// ==============================

cityInput.focus();

// ==============================
// Console Message
// ==============================

console.log("🌤️ Real-Time Weather Forecast App Loaded Successfully!");