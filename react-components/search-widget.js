
'use strict';

var React = require('react');
var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');

var Text = ReactNative.Text;
var View = ReactNative.View;
var ScrollView = ReactNative.ScrollView;
var Image = ReactNative.Image;
var DeviceEventEmitter = ReactNative.DeviceEventEmitter;
var ReactHoundifyModule = ReactNative.NativeModules.ReactHoundifyModule;

module.exports = React.createClass({

    render() {

        var houndIcon = null;

        if (this.props.recording) {
            houndIcon = (
                <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" className="okhoundRecording">
                    <Image source={{uri: 'https://lh3.googleusercontent.com/tAPT1aiR-YWP80qFTYX-RUxxskd7JopYHuFtcf0kUmC7H3S2FzUvPTRLil5YKNUxlpQ=w170'}} style={{width: 72, height: 72}} />
                </Animatable.View>
            )
        }
        else {
            houndIcon = (
                <Image source={{uri: 'https://lh3.googleusercontent.com/tAPT1aiR-YWP80qFTYX-RUxxskd7JopYHuFtcf0kUmC7H3S2FzUvPTRLil5YKNUxlpQ=w170'}} style={{width: 64, height: 64}}/>
            )
        }


        return (
            <View style={styles.footer}>
                {houndIcon}
                <Text style={styles.okhound}>
                     { this.props.recording ?this.props.transcript : "Say \"OK Hound\" to start a voice search." }
                </Text>
             </View>
        );
    }
});


var styles = ReactNative.StyleSheet.create({
    recordingicon: {
        width: 64,
        height: 64
    },

    okhoundRecording: {
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 100,

    },

    okhound: {
        marginTop: 10,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#ccc'
    },

    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    }
});
