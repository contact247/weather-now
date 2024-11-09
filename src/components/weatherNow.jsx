import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WiDaySunny, WiCloudy, WiRain, WiStrongWind } from 'react-icons/wi';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  font-family: 'Roboto', sans-serif;
  padding: 20px;
`;

const WeatherCard = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  width: 80%;
  max-width: 700px;
  height: 90vh;
  max-height: 800px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  font-weight:bold;
  outline: none;
  text-align:center;
`;

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 10px 10px 10px 10px;
  background-color: #3498db;
  color: white;
  font-size: 1.25rem;
  max-width:200px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 50%;
  white-space: nowrap;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const WeatherInfo = styled.div`
  color: #fff;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Temperature = styled.p`
  font-size: 3rem;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const WeatherIcon = styled.div`
  font-size: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WeatherDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 10px;
  text-align: center;
  font-size: 0.9rem;
  font-weight:bold;

  h3 {
    font-size: 1rem;
    margin-bottom: 0.2rem;
  }

  p {
    margin: 0;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 0.5rem;
`;

export default function WeatherNow() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude } = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode`
      );
      const weatherData = await weatherResponse.json();

      setWeather({
        current: weatherData.current_weather,
        hourly: weatherData.hourly,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const getWeatherIcon = (weathercode) => {
    switch (true) {
      case weathercode <= 1:
        return <WiDaySunny />;
      case weathercode <= 3:
        return <WiCloudy />;
      case weathercode <= 67:
        return <WiRain />;
      default:
        return <WiStrongWind />;
    }
  };

  const getWeatherDescription = (weathercode) => {
    switch (true) {
      case weathercode <= 1:
        return 'Clear sky';
      case weathercode <= 3:
        return 'Partly cloudy';
      case weathercode <= 67:
        return 'Rainy';
      default:
        return 'Windy';
    }
  };

  const getWindDirection = (degrees) => {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <AppContainer>
      <WeatherCard>
        <Title>Weather Now</Title>
        <StyledForm onSubmit={handleSubmit}>
          <StyledInput
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            aria-label="City name"
          />
          <StyledButton type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </StyledButton>
        </StyledForm>

        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        {weather && (
          <WeatherInfo>
            <div>
              <h2>{city}</h2>
              <WeatherIcon>
                {getWeatherIcon(weather.current.weathercode)}
              </WeatherIcon>
              <Temperature>{weather.current.temperature}°C</Temperature>
              <Description>
                {getWeatherDescription(weather.current.weathercode)}
              </Description>
            </div>
            <WeatherDetails>
              <DetailItem>
                <h3>Wind Speed</h3>
                <p>{weather.current.windspeed} km/h</p>
              </DetailItem>
              <DetailItem>
                <h3>Wind Direction</h3>
                <p>{getWindDirection(weather.current.winddirection)}</p>
              </DetailItem>
              <DetailItem>
                <h3>Humidity</h3>
                <p>{weather.hourly.relativehumidity_2m[0]}%</p>
              </DetailItem>
              <DetailItem>
                <h3>Precipitation</h3>
                <p>{weather.hourly.precipitation_probability[0]}%</p>
              </DetailItem>
            </WeatherDetails>
          </WeatherInfo>
        )}
      </WeatherCard>
    </AppContainer>
  );
}
