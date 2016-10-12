var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');
var React = require('react');
var moment = require('moment');
var Text = ReactNative.Text;
var Image = ReactNative.Image;
var View = ReactNative.View;
var WeatherIconMap = require('../lib/weather-icon-map');
import Icon from 'react-native-vector-icons/Ionicons';
const myIcon = (<Icon name="ios-partly-sunny" size={80} color="#fff" />)

var WeatherDailyForecast = React.createClass({
    getDay(d) {
        var year = d.Year;
        var month = d.Month;
        var dayOfMonth = d.DayOfMonth;

        if (month < 10) month = '0' + month;
        if (dayOfMonth < 10) dayOfMonth = '0' + dayOfMonth;
        return moment(year + '-' + month + '-' + dayOfMonth, 'YYYY-MM-DD').format('ddd');
    },
    render() {
        return (
            <View style={styles.dailyForecast}>
                <View style={styles.dailyForecastIcon}>
                    <Icon name={WeatherIconMap[this.props.conditions.Key] || WeatherIconMap.default} size={36} color="#fff" />
                </View>
                <Text style={styles.dailyForecastDay}>
                    {this.getDay(this.props.date)}
                </Text>
                <Text style={styles.dailyForecastTemp}>
                    {this.props.temperature.Value}
                    {this.props.temperature.WrittenUnits}
                </Text>
            </View>
        )
    }
});



var WeatherCard = React.createClass({
    render() {
        var response = this.props.response;

        var imageSrc = {
            uri: 'http://static.midomi.com/h/images/w/weather_mostlysunny.png'
        };

        this.props.speak({ text: response.SpokenResponse });

        var dailyForecastsJsx = [];
        for (var i = 0; i < 6; i++) {
            dailyForecastsJsx.push(
                <WeatherDailyForecast
                    key={'weather-daily-' + i}
                    date={response.NativeData.DailyForecasts[i].ForecastDateAndTime.Date}
                    conditions={response.NativeData.DailyForecasts[i].ConditionsImage}
                    temperature={response.NativeData.DailyForecasts[i].HighTemperature.Value}
                />
            )
        }

        return (
            <View style={styles.container}>
                <Animatable.View animation="fadeIn" easing="ease-out" iterationCount={1}>
                    <View style={styles.card}>
                        <View style={styles.headerBar}>
                            <View style={styles.iconView}>
                                {myIcon}
                            </View>
                            <View style={styles.headerView}>
                                <Text style={styles.headerText}>
                                    {response.NativeData.CurrentTemperature.Value.Value}
                                    {response.NativeData.CurrentTemperature.Value.WrittenUnits}
                                </Text>
                                <Text style={styles.label}>
                                    It is {response.NativeData.ConditionsShortPhrase.toLowerCase()} in {response.NativeData.Location.Label}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.text}>
                                Here's how the next few days look.
                            </Text>
                        </View>
                        <View style={styles.dailyForecastWrap}>
                            {dailyForecastsJsx}
                        </View>
                    </View>
                </Animatable.View>

            </View>
        )
    }
})

const styles = ReactNative.StyleSheet.create({

    container: {
        flex: 1
    },

    card: {
        marginTop: 200,
        flex:1,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
    },

    iconView: {
        flex: 1
    },

    headerBar: {
        width: 500,
        flexDirection: 'row'
    },

    content: {
        width: 500,
        padding: 20
    },

    dailyForecastWrap: {
        flexDirection: 'row'
    },

    dailyForecast: {
        width: 85,
        justifyContent: 'center',
        alignItems: 'center'
    },

    dailyForecastDay: {
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },

    dailyForecastTemp: {
        color: '#999',
        textAlign: 'center'
    },

    weatherIcon: {
        width: 64,
        height: 64
    },

    headerView: {
        width: 400,
        marginTop: 15
    },

    headerText: {
        fontSize: 24,
        color: 'white'
    },

    label: {
        fontSize: 16,
        fontWeight: '300',
        color: 'white'
    },
    text: {
        fontSize: 16,
        color: '#FFFFFF'
    },
    subText: {
        fontSize: 18,
        color: '#CCCCCC',
        textAlign: 'center'
    }
});

module.exports = WeatherCard;
