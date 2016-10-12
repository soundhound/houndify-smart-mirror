var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');
var React = require('react');
var Text = ReactNative.Text;
var View = ReactNative.View;
var TouchableHighlight = ReactNative.TouchableHighlight;
var TextInput = ReactNative.TextInput;
var WeatherIconMap = require('../lib/weather-icon-map');
import Icon from 'react-native-vector-icons/Ionicons';

var WeatherWidget = React.createClass({
    getInitialState() {
        return {
            edit: false,
            weather: null
        }
    },

    getWeather(latitude, longitude) {
        var self = this;
        this.setState({ latitude, longitude });
        fetch('https://api.forecast.io/forecast/FORECAST_API_KEY/' + latitude + ',' + longitude, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(responseData => {
                self.setState({
                    weather: responseData
                });
            })
            .catch(error => {
                console.warn(error);
            });
    },

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.getWeather(position.coords.latitude.toString(), position.coords.longitude.toString());
          },
          (error) => {
            console.log(error);
            this.getWeather('43.6532', '-79.38');
          }
        );
    },

    toggleEdit() {
        this.setState({
            edit: !this.state.edit
        });
    },

    render() {
        var widget = (<Text style={styles.contentHead}>Getting Weather Information...</Text>);

        if (this.state.edit) {
            widget = (
                <View>
                    <Text>Latitude</Text>
                    <TextInput value={this.state.latitude}
                               style={{ width: 200 }}
                               onChangeText={(latitude) => this.getWeather(latitude, this.state.longitude)}/>
                    <Text>Longitude</Text>
                    <TextInput value={this.state.longitude}
                               style={{ width: 200 }}
                               onChangeText={(longitude) => this.getWeather(this.state.latitude, longitude)}/>
                    <TouchableHighlight onPress={this.toggleEdit} style={{ padding: 10, width: 100, backgroundColor: "teal", alignItems: 'center', justifyContent: 'center' }}>
                        <Text >Save</Text>
                    </TouchableHighlight>
                </View>
            );
        } else if (this.state.weather) {
            widget = (
                <View>
                    <Icon name={WeatherIconMap[this.state.weather.currently.icon] || WeatherIconMap.default} size={80}  color="white" />
                    <Text style={styles.title}>
                        {Math.round(this.state.weather.currently.temperature)} °F
                    </Text>
                    <Text style={styles.subtitle}>
                        {this.state.weather.currently.summary} right now.
                    </Text>
                    <Text style={styles.subtitle}>
                        {this.state.weather.hourly.summary}
                    </Text>
                </View>
            );
        }

        return (
            <TouchableHighlight onPress={this.toggleEdit}>
                {widget}
            </TouchableHighlight>
        );
    }
});

const styles = ReactNative.StyleSheet.create({

    title: {
        fontSize: 30,
        color: 'white',
        fontWeight: '100',
        width: 280
    },

    subtitle: {
        fontSize: 16,
        color: '#888',
        width: 280
    }
});

module.exports = WeatherWidget;
