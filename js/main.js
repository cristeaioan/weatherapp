jQuery(function($) {

	var $weatherInfoWrap = jQuery('.weather-info-wrap'),

		$weatherInfoOverlay = $weatherInfoWrap.find('.weather-info-overlay'),
		$weatherInfoOverlayText = $weatherInfoOverlay.find('h3'),

		// current weather
		$currWeatherWrap = $('.weather-info-current'),
		$currWeatherLocationWrap = $('.wic-location'),
		$currWeatherLocationCity = $currWeatherLocationWrap.find('.wic-location-city'),
		$currWeatherLocationCountry = $currWeatherLocationWrap.find('.wic-location-country'),
		$currWeatherTemp = $currWeatherWrap.find('.wic-temp h1'),
		$currWeatherState = $('.wif-current-state'),
		$currWeatherStateIcon = $currWeatherState.find('.wif-icon img'),
		$currWeatherStateDescr = $currWeatherState.find('.wif-description h4'),

		// lat and lon coordinates
		lat, lon,

		// list of imperial countries and units
		impCountryCodes = ['BS', 'BZ', 'KY', 'PW', 'US'],
		units;



	// On page load, try to get the weather info
	// for the user's current location
	getCurrentLocationWeather();



	// Try to get the weather info for the location
	// the user is searching for
	var $locationForm = $('#locationForm'),
		autocomplete,
		$locationInput = document.getElementById('location'),
		options = {
			types: ['(cities)'],
			fields: ['address_components', 'geometry'],
		};


	// Prevent the search location form from submitting on enter
	$locationForm.on('submit', function (e) {

		e.preventDefault();

	});



	// If the user chooses so, try to get the weather info
	// for the user's current location
	var $currentLocationBtn = $('.current-location');

	$currentLocationBtn.on('click', function () {

		// Reset the location input
		$locationInput.value = '';


		// Display the overlay background and reset the overlay text
		$weatherInfoWrap.removeClass('weather-info-loaded-2');
		$weatherInfoOverlayText.text('Retrieving weather information...');


		setTimeout(function () {
			// Display the overlay text
			$weatherInfoWrap.removeClass('weather-info-loaded-1');

			// Try to get the weather info for the
			// user's current location
			setTimeout(function () {
				getCurrentLocationWeather();
			}, 450);
		}, 200);

	});


	// Initialize the Places Autocomplete API from Google
	autocomplete = new google.maps.places.Autocomplete($locationInput, options);


	// Add an event listener for when the user selects a location
	// from the autocomplete field
	autocomplete.addListener('place_changed', function () {
		// Store the location info
		var locationInfo = autocomplete.getPlace();


		// If the user did not select a prediction, reset the input field
		if( !locationInfo.geometry ) {
			$locationInput.placeholder('Enter a place');
		}
		// Process the valid location
		else {
			// Display the overlay background and reset the overlay text
			$weatherInfoWrap.removeClass('weather-info-loaded-2');
			$weatherInfoOverlayText.text('Retrieving weather information...');

			setTimeout(function () {
				// Display the overlay text
				$weatherInfoWrap.removeClass('weather-info-loaded-1');

				setTimeout(function () {
					var addressComponents = locationInfo.address_components,
						country, countryCode, city,
						geometryCoords = locationInfo.geometry.location;

					// Parse the address components and identify the country and city
					for ( var i = 0; i < addressComponents.length; i++ ) {
						for ( var j = 0; j < addressComponents[i].types.length; j ++ ) {
							console.log(addressComponents[i]);

							// Identify the country and get the name and code
							if( addressComponents[i].types[j] === 'country' ) {
								country = addressComponents[i].long_name;
								countryCode = addressComponents[i].short_name;
							}

							// Identify the city and get the name
							if( addressComponents[i].types[j] === 'locality' ) {
								city = addressComponents[i].long_name;
							}
						}
					}


					// Display the city and country names
					$currWeatherLocationCity.html(city);
					$currWeatherLocationCountry.html(country);


					// Decide temperature format (metric/imperial)
					// based on country code
					if ( impCountryCodes.indexOf(countryCode) == -1 )
						units='metric';
					else units = 'imperial';


					// Get and display weather info
					lat = geometryCoords.lat();
					lon = geometryCoords.lng();

					getWeatherInfo(lat, lon);
				}, 400);
			}, 200);
		}
	});



	// Function to the the weather info for
	// the user's current location
	function getCurrentLocationWeather() {
		navigator.geolocation.getCurrentPosition(
			// The location is turned on
			function (position) {

				// Store the latitude and longitude coordinates
				lat = position.coords.latitude;
				lon = position.coords.longitude;

				$.ajax({
					'async': true,
					'crossDomain': true,
					'url': 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon + '&sensor=false&key=AIzaSyByUe5jHZIiNa9TnDOQKmDIy8EcRvHa92I',
					'method': 'GET',
					success: function (locationInfo) {

						var addressComponents = locationInfo.results[0].address_components,
							country = '',
							countryCode = '',
							city = '';

						for ( var i = 0; i < addressComponents.length; i++ ) {
							for ( var j = 0; j < addressComponents[i].types.length; j ++ ) {
								if( addressComponents[i].types[j] === 'country' ) {
									country = addressComponents[i].long_name;
									countryCode = addressComponents[i].short_name;
								}

								if( addressComponents[i].types[j] === 'locality' ) {
									city = addressComponents[i].long_name;
								}
							}
						}

						// Decide temperature format (metric/imperial)
						// based on country code
						if ( impCountryCodes.indexOf(countryCode) == -1 )
							units='metric';
						else units = 'imperial';


						// Display the city and country names
						$currWeatherLocationCity.html(city);
						$currWeatherLocationCountry.html(country);


						// Get and display weather info
						getWeatherInfo(lat, lon);

					}
				});

			},

			// The location is turned off
			function () {

				$weatherInfoOverlayText.html('Unable to retrieve your location.<br>Please activate your location setting, then refresh the page.');

			}
		)
	}




	// Function to get weather information based on
	// lat and lon coordinates
	function getWeatherInfo(lat, lon) {

		$.ajax({
			'async': true,
			'crossDomain': true,
			'url': 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat +'&lon=' + lon + '&appid=0e4ac4b36b6cdcf2661160019d9f5154&exclude=minutely,hourly,alerts&units=' + units,
			'method': 'GET',
			success: function (weatherInfo) {

				// Display current weather information
				var currentWeather = weatherInfo.current,
					currWeatherCondition = currentWeather.weather[0],
					currWeatherConditionDescr = upper(currWeatherCondition.description),
					currWeatherConditionCode = currWeatherCondition.icon,
					currentWeatherTemp = currentWeather.temp;

				// Deal with the current weather background
				$currWeatherWrap.css('background-image', 'url("images/bgs/' + currWeatherConditionCode + '.jpg")');

				// Deal with the current weather temperature
				$currWeatherTemp.html(Math.ceil(currentWeatherTemp) + '<span>' + unitText() + '</span>');

				// Deal with the current weather icon
				$currWeatherStateIcon.attr('src', 'images/icons/' + currWeatherConditionCode + '.svg');

				// Deal with the current weather condition
				$currWeatherStateDescr.html(currWeatherConditionDescr);


				// Display forecast weather information
				var forecastWeather = weatherInfo.daily,
					currForecastWeather,
					currForecastWeatherConditionCode,
					currForecastWeatherTempMin,
					currForecastWeatherTempMax,
					i = 1;

				$('.wif-daily .wif-day').each(function(day) {
					currForecastWeather = forecastWeather[i];

					// Deal with the forecast day name
					$(this).children('.wif-heading').html(time(currForecastWeather.dt));

					// Deal with the forecast icon
					$(this).children('.wif-icon').children('img').attr('src', 'images/icons/' + currForecastWeather.weather[0].icon + '.svg');

					// Deal with the forecast temperature
					$(this).children('.wif-temp').html(Math.ceil(currForecastWeather.temp.min) + ' / ' + Math.ceil(currForecastWeather.temp.max) + unitText());

					i++;
				});


				// Remove the overlay
				setTimeout(function () {
					$weatherInfoWrap.addClass('weather-info-loaded-1');

					setTimeout(function () {
						$weatherInfoWrap.addClass('weather-info-loaded-2');
					}, 400);
				}, 350);
			}
		});

	}



	// Function to convert unix time into day of the week
	function time(timestamp) {
		var a = new Date(timestamp*1000);
		var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		return days[a.getDay()];
	}



	// Function to decide which unit of meaasurement text
	// to display based on unit measurement type
	function unitText() {
		if (units === 'metric') return ' &deg;C'; else return ' &deg;F';
	}



	// Function to transform first letter of string to uppercase
	function upper(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	}

});