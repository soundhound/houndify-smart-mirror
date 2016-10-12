        
'use strict';

var React = require('react');
var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');

var Text = ReactNative.Text;
var View = ReactNative.View;
var ScrollView = ReactNative.ScrollView;

// Custom Widgets (These are rendered on the home page)
var TimeWidget = require('./time-widget');
var WeatherWidget = require('./weather-widget');
var LightsWidget = require('./lights-widget');
var NewsWidget = require('./news-widget');
var SearchWidget = require('./search-widget');

var styles = require('./styles');

// Houndify Widgets (These are rendered on responses)
var HoundifyWeatherCard = require('./weather-card');
var HoundifyHomeAutomation = require('./home-automation');



var MainView = React.createClass({
    render: function() {
        var response = this.props.response;
        var jsxCenterSection = null;
        var defaultSpokenResponse = "";
        if (response) {
            var requiresClientIntegration = response["ClientActionSucceededResult"] ||
                                    response["ClientActionFailedResult"] ||
                                    response["RequiredFeaturesSupportedResult"] ||
                                    response["LaunchSoundHoundAppResult"];

            if (requiresClientIntegration) {
                defaultSpokenResponse = "This feature is not yet supported.";
                jsxCenterSection = (
                    <Text style={styles.writtenResponse}>
                        This feature is not yet supported.
                    </Text>
                );
            } else {
                defaultSpokenResponse = response.SpokenResponse;
                jsxCenterSection = (
                    <Text style={styles.writtenResponse}>
                        {response.WrittenResponseLong}
                    </Text>
                );
            }


            if (response.CommandKind === 'WeatherCommand' && response.NativeData.CurrentTemperature) {
                jsxCenterSection = (
                    <HoundifyWeatherCard {...this.props} />
                );
            }

            else if (response.CommandKind === 'HomeAutomationControlCommand' || response.CommandKind === 'DeviceControlCommand') {
                jsxCenterSection = (
                    <HoundifyHomeAutomation {...this.props} />
                );
            }

            else if (response.CommandKind === 'ClientMatchCommand') {
                this.props.speak({ text: response.SpokenResponse });

                if (response.Result.Intent === 'CLEAR_MIRROR') {
                    jsxCenterSection = null;
                }

                else if (response.Result.Intent === 'SHOW_NEWS') {
                    jsxCenterSection = (
                        <NewsWidget />
                    );
                }
            }

            else {
                //need to handle each command kind separately
                this.props.speak({ text: defaultSpokenResponse });
            }
        }

        return (
            <View style={styles.container}>
                <View style={styles.list}>
                    <View style={styles.row}>
                        <WeatherWidget />
                        <LightsWidget {...this.props} />
                    </View>
                    <View style={styles.centerRow}>
                        <ScrollView style={styles.scrollView}>
                            <Animatable.View animation="fadeIn" style={styles.writtenResponseWrap}>
                                {jsxCenterSection}
                            </Animatable.View>
                        </ScrollView>
                    </View>
                    <View style={styles.row}>
                        <TimeWidget />
                    </View>
                </View>
                <SearchWidget {...this.props} />
            </View>
        );
    }
});

module.exports = MainView;


    