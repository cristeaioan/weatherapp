jQuery(function($) {
	function success(position) {
		var pageOverlay = jQuery('.page-overlay');

		pageOverlay.find('h3').text('Retrieving weather information...')

		var lat = position.coords.latitude,
			lon = position.coords.longitude;

		$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon + '&sensor=false&key=AIzaSyByUe5jHZIiNa9TnDOQKmDIy8EcRvHa92I', function(locInfo) {
			// Convert unix time into day of the week
			function time(timestamp) {
				var a = new Date(timestamp*1000);
				var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
				return days[a.getDay()];
			}

			function upper(text) {
				return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
			}


			// Decide temperature format (metric/imperial)
			var impCountryCodes = ['BS', 'BZ', 'KY', 'PW', 'US'],
				units;
			if(impCountryCodes.indexOf(locInfo.results[0].address_components[5].short_name) == -1) units='metric';
				else units = 'imperial';
			function unitText() {
				if (units == 'metric') return ' &deg;C'; else return ' &deg;F';
			}

			$('.location h2').html(locInfo.results[0].address_components[2].long_name);
			$('.location h3').html(locInfo.results[0].address_components[5].long_name);


			// Get information about current and forecast weather
			$.ajax({
				'async': true,
				'crossDomain': true,
				'url': 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat +'&lon=' + lon + '&appid=0e4ac4b36b6cdcf2661160019d9f5154&exclude=minutely,hourly,alerts&units=' + units,
				'method': 'GET',
				success: function (weatherInfo) {
					console.log(weatherInfo);

					// Display weather information
					var currentWeather = weatherInfo.current,
						currWeatherCondition = currentWeather.weather[0],
						currWeatherConditionDescr = upper(currWeatherCondition.description),
						currWeatherConditionCode = currWeatherCondition.icon,
						currentWeatherTemp = currentWeather.temp;


					$('.curr-wthr .container').css('background-image', 'url("images/bgs/' + currWeatherConditionCode + '.jpg")');
					$('.curr-wthr .temp h1').html(Math.ceil(currentWeatherTemp) + '<span>' + unitText() + '</span>');

					$('.curr-wthr-state .icon img').attr('src', 'images/icons/' + currWeatherConditionCode + '.svg');
					$('.curr-wthr-state .description').html(currWeatherConditionDescr);


					// Display forecast weather information
					var forecastWeather = weatherInfo.daily,
						currForecastWeather,
						currForecastWeatherConditionCode,
						currForecastWeatherTempMin,
						currForecastWeatherTempMax,
						i = 1;

					$('.daily .day').each(function(day) {
						currForecastWeather = forecastWeather[i];

						currForecastWeatherConditionCode = currForecastWeather.weather[0].icon;

						currForecastWeatherTempMin = Math.ceil(currForecastWeather.temp.min);
						currForecastWeatherTempMax = Math.ceil(currForecastWeather.temp.max);


						$(this).children('.heading').html(time(currForecastWeather.dt));
						$(this).children('.icon').children('img').attr('src', 'images/icons/' + currForecastWeatherConditionCode + '.svg');
						$(this).children('.temp').html(currForecastWeatherTempMin + ' / ' + currForecastWeatherTempMax + unitText());

						i++;
					});

					setTimeout(function () {
						pageOverlay.addClass('hidden-content');

						setTimeout(function () {
							pageOverlay.addClass('hidden-overlay');
						}, 400);
					}, 300);
				}
			});
		});
	}

	navigator.geolocation.getCurrentPosition(success);
});