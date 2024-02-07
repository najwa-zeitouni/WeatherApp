const cityInput = document.querySelector(".city-input")
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather")
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "4d1a40f74e8477cd4c6a00631c9d056c";//API key for openweathermap API
const createWeatherCard = (cityName , weatherItem , index) => {
    if(index === 0){ //html for the main weather card
      return `<div class="details">
      <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
      <h4>Temperature:${(weatherItem.main.temp - 273.15).toFixed(2)} *C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity:${weatherItem.main.humidity}%</h4>
  </div>
  <div class="icon">
      <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
      <h4>${weatherItem.weather[0].desciption}</h4>
  </div>`;
    }else{
        return `<li class="card">
        <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp:${(weatherItem.main.temp - 273.15).toFixed(2)} *C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity:${weatherItem.main.humidity}%</h4>
        </li>`;
    }
    
}
const getWeatherDetails = (cityName , lat , lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        //filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });
        //clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        console.log(fiveDaysForecast);
        fiveDaysForecast.forEach((weatherItem,index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend" , createWeatherCard(cityName , weatherItem , index));
            }else {
                weatherCardsDiv.insertAdjacentHTML("beforeend" , createWeatherCard(cityName , weatherItem , index));
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forcast!");
    });
}
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();//get user entered city name and remove extra spaces
    if(!cityName) return; //return if cityname is empty
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
//get entered city coordinates (latitude , logitude , and name) from the api response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No Coordinates found for ${cityName}`);
        const { name , lat , lon} = data[0];
        getWeatherDetails(name , lat , lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}
const getUserCoodinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude , longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;
            //get city name from coordinates using reverse geocoding api
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name , latitude , longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city!");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. please reset location permission to grant access again.");
            }
        }
    );
}
locationButton.addEventListener("click",getUserCoodinates);
searchButton.addEventListener("click",getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
