'use strict';

var React = require('react');
var ReactNative = require('react-native');

var DeviceEventEmitter = ReactNative.DeviceEventEmitter;
var ReactHoundifyModule = ReactNative.NativeModules.ReactHoundifyModule;

var MainView = require('./react-components/main-view');


var MirrorApp = React.createClass({
    getInitialState: function () {
        return {
            responseType: null,
            recording: false,
            response: null,
            transcript: "",
            error: null
        }
    },
    componentWillMount: function() {
        var self = this;

        DeviceEventEmitter.addListener('houndifyResponseSuccess', function(ev) {
            var response = typeof(ev.results) === 'string' ? JSON.parse(ev.results) : ev.results;
            self.setState({
                responseType: 'houndifyResponseSuccess',
                response: response
            });
        });

        DeviceEventEmitter.addListener('houndifyResponseTranscript', function(ev) {
            self.setState({
                responseType: 'houndifyResponseTranscript',
                transcript: ev.results || "Listening..."
            });
        });

        DeviceEventEmitter.addListener('houndifyRecordingStarted', function(ev) {
            self.setState({
                responseType: 'houndifyRecordingStarted',
                recording: true,
                response: null,
                transcript: "Listening..."
            });
        });

        DeviceEventEmitter.addListener('houndifyRecordingStopped', function(ev) {
            self.setState({
                responseType: 'houndifyRecordingStopped',
                recording: false
            });
        });

        DeviceEventEmitter.addListener('houndifyResponseError', function(ev) {
            self.setState({
                responseType: 'houndifyResponseError',
                error: ev.error
            });
        });
    },
    componentDidMount: function() {
        console.disableYellowBox = true;
    },
    houndify: {
        speak: ReactHoundifyModule.speak,
        indexDevices: ReactHoundifyModule.indexDevices,
        setVolume: ReactHoundifyModule.setVolume
    },
    render: function() {
        return (<MainView {...this.state} {...this.houndify} />);
    }
})

ReactNative.AppRegistry.registerComponent('MirrorApp', () => MirrorApp);
