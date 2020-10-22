/* script.js: Weather Dashboard JavaScript */
/* Emily Herman, HW 6, 10/22/2020  */

// Initialize variable for Search input
var citySearch;
 
// Create an array for searched cities and store in local storage
var searchHistory = [];
searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

// Get current date, format as MM/DD/YYYY
var date = moment().format("L");

// Function: get weather data from API
var weatherAPISearch = function(citySearch) {

    // Open Weather Map, "Current Weather Data" API
    var queryURL1 = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&appid=812d78430bc07e464f26b08f40f617f3";

    // Nested AJAX calls: first takes city name, gets city coordinates
    // (Coordinates are required for 7-day forecast search)
    $.ajax({
        url: queryURL1,
        method: "GET"
    }).then(function(response) {

        var latitude = response.coord.lat;
        var longitude = response.coord.lon;                             

        // Open Weather Map, "One Call API" for 7-day forecast
        var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=minutely,hourly,alerts&units=imperial&appid=812d78430bc07e464f26b08f40f617f3";

        // Second AJAX call: gets current and forecasted weather using city coordinates
        $.ajax({
            url: queryURL2,
            method: "GET"
        }).then(function(response) {                                         

            // Store current UV index, convert to integer
            var currentUVI = response.current.uvi;
                                        
            // Set color for UV index text:
            if (currentUVI <= 2.99) {
                // Favorable: green
                $("#uv-index").attr("style", "background-color:#5cb85c; color:white");
            } else if (currentUVI >= 3 && currentUVI <= 5) {
                // Moderate: yellow
                $("#uv-index").attr("style", "background-color:#f0ad4e");
            } else {
                // Severe: red
                $("#uv-index").attr("style", "background-color:#d9534f; color:white");
            }

            // Display city name and today's date
            $("#city-and-date").text(citySearch + " (" + date + ")");

            // Display weather icon next to city name and date
            // Adapted from https://stackoverflow.com/questions/44177417/how-to-display-openweathermap-weather-icon
            var iconImg = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + response.current.weather[0].icon + "@2x.png");
            iconImg.attr("class", "main-icon");
            $("#city-and-date").append(iconImg);

            // Display today's weather info
            $("#temp").text((response.current.temp).toFixed(1)); // toFixed(1) sets # of decimal places
            $("#humidity").text(response.current.humidity);
            $("#wind-speed").text((response.current.wind_speed).toFixed(1));
            $("#uv-index").text(currentUVI);

            // Display 5-day weather forecast info
            for (var i = 0; i < 5; i++) {
                $("#day-" + i).text(moment().add(i + 1, "day").format("L"));
                $("#icon-" + i).attr("src", "http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + "@2x.png");                                                             
                $("#temp-" + i).text((response.daily[i].temp.day).toFixed(1));
                $("#humidity-" + i).text(response.daily[i].humidity);
            }
        });
    });
};

 
// Store searched city in local storage
var storeSearches = function(citySearch) {

    // Push current searched city to the start of the searchHistory array
    if (searchHistory != null) {
        searchHistory.unshift(citySearch);
    } else {
        searchHistory= [citySearch];
    }
    
    // Create button for searched city
    var btn = $("<button>").attr("class", "btn btn-outline-secondary city-button");
    btn.attr("type", "button");
    btn.attr("value", searchHistory[0]);
    btn.text(searchHistory[0]);

    // Add button underneath search bar
    $("#saved-searches").prepend(btn); 

    // Limit size of searchHistory to 20 elements
    searchHistory.splice(20, 1);

    // Save array in local storage
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

 
// When search button is clicked:
$("#search-btn").on("click", function() {
 
    // If search field is not empty:
    if ($("#city-search").val() !== "") {

        // Get city name from search field
        citySearch = $("#city-search").val();

        // Clear search field
        $("#city-search").val("");

        // Save search
        storeSearches(citySearch);

        // Display weather info
        weatherAPISearch(citySearch);             
    }
});

 
// When a search history button is clicked:
$(document).on("click", ".city-button", function() {

    // Set button city as current city
    citySearch = this.innerHTML;
 
    // Display weather info
    weatherAPISearch(citySearch);
});

 
// When page is refreshed:
$(window).on("load", function() {

    // Get saved searches
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

    if (searchHistory != null) {

       // Get last searched city and display weather info
        citySearch = searchHistory[0];
        weatherAPISearch(citySearch);    

        // Display each saved search as a button underneath search bar
        for (var i = 0; i < searchHistory.length; i++) {
            if (searchHistory[i] !== "") {

                var btn = $("<button>").attr("class", "btn btn-outline-secondary city-button");
                btn.attr("type", "button");
                btn.attr("value", searchHistory[i]);
                btn.text(searchHistory[i]);

                $("#saved-searches").append(btn); 
            }
        }
    }
});