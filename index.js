import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import bodyParser from 'body-parser'

/** Pseudocode for Getting Weather for Tomorrow on Phone and Web */

// 1. [x] Start this express server
// 2. [x] Set up EJS
// 3. [x] Fetch Daily Weather Data

// For Web
// 1. [x] Render that Data to EJS

const app = express();
const PORT = 3000;
let cityWeather, city = {};

dotenv.config()

const weatherAPI = process.env.WEATHER_API;

function convertMilitaryTimeToStandard(time) {
    time = time.split(':');

    let hours = Number(time[0]);
    let timeValue;

    if (hours > 0 && hours <= 12) {
        timeValue = "" + hours;
    } else if (hours > 12) {
        timeValue = "" + (hours - 12);
    } else if (hours == 0) {
        timeValue = "12";
    }

    return timeValue += (hours >= 12) ? " PM" : " AM";  
}

function formatDate(date) {
    const originalDate = new Date(date);
    const modifiedDate = String(originalDate).split(' ').slice(0, 4).join(' ');
    return modifiedDate;
}

function capitalize(words) {
    if (typeof words === 'Array')
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    else return words.charAt(0).toUpperCase() + words.slice(1)
}


function repackageThreeHours(threeHours) {
    return threeHours.map((interval) => {
        return {
            date: formatDate(interval.dt_txt.split(' ')[0]), 
            hour: convertMilitaryTimeToStandard(interval.dt_txt.split(' ')[1]),
            temp: Math.ceil(interval.main.temp),
            weatherDescription: capitalize(interval.weather['0'].description),
        }
    })
}

const fetchWeatherAt = async () => {
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${weatherAPI}&units=imperial`;

    try {
        const resp = await axios.get(apiURL);
        console.log(resp.data.city.name);
        cityWeather = {
            cityName: resp.data.city.name,
            list: threeHoursToDays(resp.data.list)
        }
        console.log(cityWeather);
    } catch (error) {
        console.log(error);
    }
}

function groupThreeHoursByDate(threeHours) {
    let fiveDayInterval = [];
    let prevDate = '';

    threeHours.forEach(interval => {
        if (interval.date !== prevDate) {
            fiveDayInterval.push({
                date: interval.date,
                list: []
            });
            prevDate = interval.date;
        }
    })
    threeHours.forEach(interval => {
        for (let i = 0; i < fiveDayInterval.length; i++) {
            if (fiveDayInterval[i].date == interval.date) {
                fiveDayInterval[i].list.push(interval);
            }
        }
    });

    return fiveDayInterval;
}

function threeHoursToDays(threeHours) {
    const threeHourIntervals = repackageThreeHours(threeHours);
    const days = groupThreeHoursByDate(threeHourIntervals);
    return days;
}

function setCity(lat, lon) {
    city.lat = lat;
    city.lon = lon;
}

function validateFormData(data) {
    // make sure it's a float
    try {
        let lat = parseFloat(data.body.latitude), 
            lon = parseFloat(data.body.longitude);
        console.log(lat, lon)
        setCity(lat, lon);
        return true
    } catch (error) {
        console.error(error)
        return false
    }
    
}

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', async (req, res) => {
    res.render('index', { weather: cityWeather });
})

app.post('/weather', async (req, res) => {
    if (validateFormData(req)) {
        await fetchWeatherAt(city);
    }
    res.redirect('/');
})

app.listen(PORT, () => {
    console.log(`Server is live on PORT: ${PORT}`);
})

// Todo
// add a form in the front end that receive latitude and longitude
// validate latitude and longitude inputs
// make sure it's a float value
// ? is it between certain numbers
// send http request to openweather after input is validated, this limits request calls
// add glassmorphism card
// Provide a readme for simple startup
// Share project in Q and A section
// Post to Angela Yu