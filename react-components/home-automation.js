var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');
var React = require('react');
var moment = require('moment');
var Text = ReactNative.Text;
var Image = ReactNative.Image;
var View = ReactNative.View;
var ScrollView = ReactNative.ScrollView;
var styles = require('./styles');

var HomeAutomationCard = React.createClass({
    render() {
        var result = this.props.response;
        if (!result.HomeAutomationControlCommandKind && result.DeviceControlCommandKind !== 'VolumeCommand')
            return null;

        if (result.DeviceSpecifier && result.DeviceSpecifier.Specifier === "Here" && result.DeviceSpecifier.Type !== "Light") {
            this.props.speak({ text: "This feature is not yet supported." });
            return (
                <Text style={styles.writtenResponse}>
                    This feature is not yet supported.
                </Text>
            );
        }


        if (result.CommandType === "MuteSound") {
            this.props.setVolume({ command: 'mute' });
        } else if (result.CommandType === "UnMuteSound") {
            this.props.setVolume({ command: 'unmute' });
            result.ClientActionSucceededResult.SpokenResponse = "The sound is unmuted.";
            result.ClientActionSucceededResult.WrittenResponse = "The sound is unmuted.";
        } else if (result.CommandType === "AdjustVolume" && result.VolumeDelta > 0) {
            this.props.setVolume({ command: 'raise' });
        } else if (result.CommandType === "AdjustVolume" && result.VolumeDelta < 0) {
            this.props.setVolume({ command: 'lower' });
        } else if (result.CommandType === "SetVolume") {
            this.props.setVolume({ command: 'set', value: result.VolumeValue });
            result.ClientActionSucceededResult.SpokenResponse =
                result.ClientActionSucceededResult.SpokenResponse.replace("%volume", result.VolumeValue * 100);
            result.ClientActionSucceededResult.WrittenResponse = result.ClientActionSucceededResult.SpokenResponse;
        }

        this.props.speak({ text: result.ClientActionSucceededResult.SpokenResponse });

        return (
            <Text style={styles.writtenResponse}>
                 {result.ClientActionSucceededResult.WrittenResponse}
            </Text>
        )
    }
});

module.exports = HomeAutomationCard;
