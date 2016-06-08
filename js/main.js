jQuery(function($) {
	function success(position) {
		$('.error').css('display', 'none');

		var lat = position.coords.latitude,
			lon = position.coords.longitude;

		$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon + '&sensor=false', function(locInfo) {
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
			if(impCountryCodes.indexOf(locInfo.results[0].address_components[5].short_name) == -1) units='si';
			else units='us';
			function unitText() {
				if (units = 'metric') return ' &deg;C'; else return ' &deg;F';
			}

			$('.location h2').html(locInfo.results[0].address_components[2].long_name);
			$('.location h3').html(locInfo.results[0].address_components[5].long_name);

			// Current weather report
			$.get('https://api.forecast.io/forecast/b421d301ce7ef50d4a9d6e02ff0373ed/' + lat +',' + lon + '?units=' + units, function(weatherInfo) {
				//$('.curr-wthr .container').css('background-image', 'url("images/bgs/' + weatherInfo.weather[0].icon + '.jpg")');
				$('.curr-wthr .temp h1').html(Math.floor(weatherInfo.currently.temperature) + '<span>' + unitText() + '</span>');

				$('.curr-wthr-state .icon img').attr('src', 'images/icons/' + weatherInfo.currently.icon + '.svg');
				$('.curr-wthr-state .description').html(upper(weatherInfo.currently.summary));

				$('.daily .day').each(function(day) {
					var day=day+1;

					$(this).children('.heading').html(time(weatherInfo.daily.data[day].time));
					$(this).children('.icon').children('img').attr('src', 'images/icons/' + weatherInfo.daily.data[day].icon + '.svg');
					$(this).children('.temp').html(Math.floor((weatherInfo.daily.data[day].temperatureMin+weatherInfo.daily.data[day].temperatureMax)/2) + unitText());
				});

			}, 'jsonp');
		});
	};

	function error() {
		$('.error').css('display', 'flex');
	};

	navigator.geolocation.getCurrentPosition(success, error);
});