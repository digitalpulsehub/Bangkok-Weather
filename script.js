// DOM Elements
const refreshBtn = document.getElementById('refreshBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const currentTemp = document.getElementById('currentTemp');
const weatherCondition = document.getElementById('weatherCondition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const rainProb = document.getElementById('rainProb');
const hourlyForecast = document.getElementById('hourlyForecast');
const dailyForecast = document.getElementById('dailyForecast');

// Bangkok coordinates for API
const BANGKOK_LAT = 13.7563;
const BANGKOK_LON = 100.5018;

// Open-Meteo API URLs
const CURRENT_WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${BANGKOK_LAT}&longitude=${BANGKOK_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`;
const HOURLY_FORECAST_URL = `https://api.open-meteo.com/v1/forecast?latitude=${BANGKOK_LAT}&longitude=${BANGKOK_LON}&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=2&timezone=Asia%2FBangkok`;
const DAILY_FORECAST_URL = `https://api.open-meteo.com/v1/forecast?latitude=${BANGKOK_LAT}&longitude=${BANGKOK_LON}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FBangkok&forecast_days=7`;

// Weather conditions mapping based on Open-Meteo weather codes
const weatherCodes = {
    0: { text: "Clear sky", icon: "fas fa-sun", color: "#FFD700" },
    1: { text: "Mainly clear", icon: "fas fa-cloud-sun", color: "#FFB347" },
    2: { text: "Partly cloudy", icon: "fas fa-cloud-sun", color: "#87CEEB" },
    3: { text: "Overcast", icon: "fas fa-cloud", color: "#A9A9A9" },
    45: { text: "Foggy", icon: "fas fa-smog", color: "#D3D3D3" },
    48: { text: "Depositing rime fog", icon: "fas fa-smog", color: "#D3D3D3" },
    51: { text: "Light drizzle", icon: "fas fa-cloud-rain", color: "#4682B4" },
    53: { text: "Moderate drizzle", icon: "fas fa-cloud-rain", color: "#4682B4" },
    55: { text: "Dense drizzle", icon: "fas fa-cloud-rain", color: "#4682B4" },
    61: { text: "Slight rain", icon: "fas fa-cloud-showers-heavy", color: "#1E90FF" },
    63: { text: "Moderate rain", icon: "fas fa-cloud-showers-heavy", color: "#1E90FF" },
    65: { text: "Heavy rain", icon: "fas fa-cloud-showers-heavy", color: "#0000FF" },
    71: { text: "Slight snow", icon: "far fa-snowflake", color: "#F0F8FF" },
    73: { text: "Moderate snow", icon: "far fa-snowflake", color: "#F0F8FF" },
    75: { text: "Heavy snow", icon: "far fa-snowflake", color: "#F0F8FF" },
    80: { text: "Slight rain showers", icon: "fas fa-cloud-sun-rain", color: "#87CEEB" },
    81: { text: "Moderate rain showers", icon: "fas fa-cloud-sun-rain", color: "#87CEEB" },
    82: { text: "Violent rain showers", icon: "fas fa-poo-storm", color: "#4169E1" },
    95: { text: "Thunderstorm", icon: "fas fa-bolt", color: "#FF4500" },
    96: { text: "Thunderstorm with hail", icon: "fas fa-bolt", color: "#FF4500" },
    99: { text: "Heavy thunderstorm with hail", icon: "fas fa-bolt", color: "#FF4500" }
};

// Thai icons for different weather conditions
const thaiWeatherIcons = {
    sunny: "🌞",
    cloudy: "☁️",
    rainy: "🌧️",
    stormy: "⛈️",
    hot: "🔥",
    humid: "💧",
    windy: "💨",
    thailand: "🇹🇭",
    temple: "🛕",
    elephant: "🐘"
};

// Initialize page with weather data
document.addEventListener('DOMContentLoaded', function() {
    loadAllWeatherData();
    
    // Initialize AdSense ads
    initializeAds();
});

// Initialize AdSense
function initializeAds() {
    console.log("AdSense initialized with ID: ca-pub-3452391762887871");
    
    // Example of how to push an ad unit
    /*
    (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "ca-pub-3452391762887871",
        enable_page_level_ads: true
    });
    */
}

// Refresh button functionality
refreshBtn.addEventListener('click', function() {
    loadAllWeatherData();
});

// Load all weather data
async function loadAllWeatherData() {
    // Show loading spinner
    loadingSpinner.classList.remove('hidden');
    refreshBtn.querySelector('span').textContent = 'Loading...';
    
    try {
        // Fetch all data in parallel
        const [currentData, hourlyData, dailyData] = await Promise.all([
            fetchWeatherData(CURRENT_WEATHER_URL),
            fetchWeatherData(HOURLY_FORECAST_URL),
            fetchWeatherData(DAILY_FORECAST_URL)
        ]);
        
        // Update UI with fetched data
        updateCurrentWeather(currentData);
        updateHourlyForecast(hourlyData);
        updateDailyForecast(dailyData);
        
        // Show update notification
        showNotification('Weather data updated successfully! ' + thaiWeatherIcons.thailand);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showNotification('Error updating weather data. Please try again.', true);
        
        // Fallback to mock data if API fails
        loadMockData();
    } finally {
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
        refreshBtn.querySelector('span').textContent = 'Refresh Data';
    }
}

// Fetch weather data from API
async function fetchWeatherData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// Update current weather display
function updateCurrentWeather(data) {
    if (!data || !data.current) {
        console.error('Invalid current weather data:', data);
        return;
    }
    
    const current = data.current;
    
    // Update temperature
    currentTemp.textContent = Math.round(current.temperature_2m);
    
    // Update feels like temperature
    feelsLike.textContent = Math.round(current.apparent_temperature) + '°C';
    
    // Update humidity
    humidity.textContent = current.relative_humidity_2m + '%';
    
    // Update wind speed
    windSpeed.textContent = Math.round(current.wind_speed_10m) + ' km/h';
    
    // Update rain
    const rainValue = current.rain || current.precipitation || 0;
    rainProb.textContent = rainValue.toFixed(1) + ' mm';
    
    // Update weather condition
    const weatherCode = current.weather_code;
    const condition = weatherCodes[weatherCode] || weatherCodes[3]; // Default to overcast
    
    // Add Thai icon based on weather
    let thaiIcon = '';
    if (weatherCode <= 2) thaiIcon = thaiWeatherIcons.sunny;
    else if (weatherCode <= 3) thaiIcon = thaiWeatherIcons.cloudy;
    else if (weatherCode <= 65) thaiIcon = thaiWeatherIcons.rainy;
    else if (weatherCode >= 95) thaiIcon = thaiWeatherIcons.stormy;
    else thaiIcon = thaiWeatherIcons.cloudy;
    
    weatherCondition.innerHTML = `<i class="${condition.icon}" style="color:${condition.color}"></i> ${condition.text} ${thaiIcon}`;
}

// Update hourly forecast display
function updateHourlyForecast(data) {
    if (!data || !data.hourly || !data.hourly.time) {
        console.error('Invalid hourly forecast data:', data);
        return;
    }
    
    hourlyForecast.innerHTML = '';
    const now = new Date();
    
    // Show next 12 hours
    for (let i = 0; i < 12; i++) {
        const time = new Date(data.hourly.time[i]);
        const temp = data.hourly.temperature_2m[i];
        const weatherCode = data.hourly.weather_code[i];
        const precipitation = data.hourly.precipitation_probability ? data.hourly.precipitation_probability[i] : 0;
        
        const condition = weatherCodes[weatherCode] || weatherCodes[3];
        
        // Format time
        const hourDisplay = time.getHours() === 0 ? '12 AM' : 
                          time.getHours() < 12 ? `${time.getHours()} AM` : 
                          time.getHours() === 12 ? '12 PM' : 
                          `${time.getHours() - 12} PM`;
        
        // Add Thai icon for rain probability
        let rainIcon = '';
        if (precipitation > 70) rainIcon = '🌧️';
        else if (precipitation > 30) rainIcon = '🌦️';
        
        const hourCard = document.createElement('div');
        hourCard.className = 'hour-card';
        hourCard.innerHTML = `
            <div class="hour-time">${hourDisplay}</div>
            <div class="hour-icon">
                <i class="${condition.icon}" style="color:${condition.color}"></i>
                ${rainIcon}
            </div>
            <div class="hour-temp">${Math.round(temp)}°C</div>
            ${precipitation > 0 ? `<div style="font-size:0.8rem;color:#64748b;margin-top:5px;">${precipitation}%</div>` : ''}
        `;
        
        hourlyForecast.appendChild(hourCard);
    }
}

// Update daily forecast display
function updateDailyForecast(data) {
    if (!data || !data.daily || !data.daily.time) {
        console.error('Invalid daily forecast data:', data);
        return;
    }
    
    dailyForecast.innerHTML = '';
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Show 7 days forecast
    for (let i = 0; i < 7; i++) {
        const date = new Date(data.daily.time[i]);
        const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[date.getDay()];
        const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
        const minTemp = Math.round(data.daily.temperature_2m_min[i]);
        const weatherCode = data.daily.weather_code[i];
        const precipitation = data.daily.precipitation_sum ? data.daily.precipitation_sum[i] : 0;
        
        const condition = weatherCodes[weatherCode] || weatherCodes[3];
        
        // Add Thai icon for the day
        let dayIcon = '';
        if (precipitation > 5) dayIcon = '🌧️';
        else if (weatherCode <= 1) dayIcon = '🌞';
        else if (weatherCode <= 3) dayIcon = '⛅';
        else dayIcon = '☁️';
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <div class="day-name">${dayName} ${dayIcon}</div>
            <div class="day-icon">
                <i class="${condition.icon}" style="color:${condition.color}"></i>
            </div>
            <div class="day-temp">${minTemp}° / ${maxTemp}°</div>
        `;
        
        dailyForecast.appendChild(dayCard);
    }
}

// Fallback mock data if API fails
function loadMockData() {
    console.log('Loading mock data as fallback...');
    
    // Mock current weather
    const mockCurrent = {
        temperature_2m: 32 + Math.floor(Math.random() * 3) - 1,
        apparent_temperature: 34 + Math.floor(Math.random() * 3) - 1,
        relative_humidity_2m: 65 + Math.floor(Math.random() * 10) - 5,
        wind_speed_10m: 12 + Math.floor(Math.random() * 6) - 3,
        rain: Math.random() * 5,
        weather_code: Math.random() > 0.7 ? 1 : (Math.random() > 0.5 ? 2 : 3)
    };
    
    updateCurrentWeather({ current: mockCurrent });
    
    // Mock hourly forecast
    const now = new Date();
    const mockHourly = {
        time: [],
        temperature_2m: [],
        weather_code: [],
        precipitation_probability: []
    };
    
    for (let i = 0; i < 12; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        mockHourly.time.push(time.toISOString());
        mockHourly.temperature_2m.push(30 + Math.floor(Math.random() * 6));
        mockHourly.weather_code.push(Math.random() > 0.7 ? 1 : (Math.random() > 0.5 ? 2 : 3));
        mockHourly.precipitation_probability.push(Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0);
    }
    
    updateHourlyForecast({ hourly: mockHourly });
    
    // Mock daily forecast
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mockDaily = {
        time: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
        weather_code: []
    };
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        mockDaily.time.push(date.toISOString().split('T')[0]);
        mockDaily.temperature_2m_max.push(32 + Math.floor(Math.random() * 4));
        mockDaily.temperature_2m_min.push(28 + Math.floor(Math.random() * 3));
        mockDaily.weather_code.push(Math.random() > 0.6 ? 1 : (Math.random() > 0.4 ? 2 : 3));
    }
    
    updateDailyForecast({ daily: mockDaily });
}

// Show notification
function showNotification(message, isError = false) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${isError ? '#ef4444' : '#10b981'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Add CSS animations if not already present
    if (!document.querySelector('#notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-refresh weather data every 15 minutes
setInterval(() => {
    loadAllWeatherData();
}, 15 * 60 * 1000);