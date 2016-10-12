var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');
var moment = require('moment');
var React = require('react');
var Text = ReactNative.Text;
var View = ReactNative.View;
var ListView = ReactNative.ListView;
var Button = ReactNative.Button;
var TouchableHighlight = ReactNative.TouchableHighlight;
var TextInput = ReactNative.TextInput;
import Icon from 'react-native-vector-icons/Ionicons';

// Phillips Hue API Documentation: http://www.developers.meethue.com/documentation/getting-started

var LightCard = React.createClass({

    getInitialState() {
        return {
            edit: false,
            serverURL: 'BRIDGE_ADDRESS', //Phillips Hue Bridge ip address
            serverCode: 'BRIDGE_CODE', //Phillips Hue Bridge api username
            devices: {}
        }
    },

    toggleEdit() {
        this.setState({ edit: !this.state.edit });
    },

    componentWillMount() {
        setInterval(() => {
            this.fetchLightStates({});
        }, 1000);
    },

    setLightState(id, value) {
        if (value.briDelta) {
            value.bri = this.state.devices[id].state.bri + value.briDelta;
        }

        fetch('http://' + this.state.serverURL + '/api/' + this.state.serverCode + '/lights/' + id + '/state', {
              method: 'PUT',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(value)
        })
        .catch(err => {

        });
    },

    componentWillReceiveProps(nextProps) {
        var response = nextProps.response;
        if (response && response.CommandKind === 'HomeAutomationControlCommand') {
            var value = null;
            if (response.Operation === 'TurnOn') {
                value = { on: true };
            } else if (response.Operation === 'TurnOff') {
                value = { on: false };
            } else if (response.Operation === 'SetColor') {
                value = {
                    hue: Math.round(65280 * response.Color.Hue / 360),
                    sat: Math.round(255 * response.Color.Saturation / 100),
                    bri: Math.round(255 * response.Color.Brightness / 100)
                };
            } else if (response.Operation === 'SetBrightness') {
                value = { bri: Math.round(response.Brightness * 255) };
            } else if (response.Operation === 'SetBrightnessDelta') {
                value = { briDelta: Math.round(response.BrightnessDelta * 255) };
            }

            var deviceIds = [];
            if (response.DeviceSpecifier &&
                response.DeviceSpecifier.Specifier === "Here" &&
                response.DeviceSpecifier.Type === "Light") {
                deviceIds = Object.keys(this.state.devices);
            } else {
                deviceIds = response.DeviceSpecifier.Devices.map(d => d.ID);
            }

            deviceIds.forEach(id => this.setLightState(id, value));
        }
    },

    indexDevices(devices) {
        var _devices = [];
        for (var id in devices) {
            var d = devices[id];
            _devices.push({
                "HomeAutomationSolution": "Client",
                "Name": d.name,
                "ID": id,
                "Type": "Light",
                "Capabilities":
                [
                    "TurnOn",
                    "TurnOff",
                    "SetBrightness",
                    "SetBrightnessDelta",
                    "SetColor"
                ]
            });
        }

        this.props.indexDevices(_devices, function(response) {
        });
    },

    fetchLightStates(params) {
        var serverCode = params.serverCode || this.state.serverCode;
        var serverURL = params.serverURL || this.state.serverURL;
        fetch('http://' + serverURL + '/api/' + serverCode + '/lights')
            .then(response => {
                return response.json();
            })
            .then(_devices => {
                var devices = {};
                for (var id in _devices) {
                    var d = _devices[id];
                    if (d.state.reachable) {
                        devices[id] = d;
                    }
                }

                if (Object.keys(this.state.devices).length !== Object.keys(devices).length)
                    this.indexDevices(devices);

                this.setState({ devices });
            })
            .catch(err => {

            });
        this.setState({ serverCode, serverURL });
    },


    render() {
        var devices = this.state.devices;
        var widget = null;


        var deviceList = [];

        for (var deviceId in devices) {
            var device = devices[deviceId];
            var status = device.state.on ? "on" : "off";
            var lightIcon = null;
            if (status === 'on') {
                lightIcon = (<Icon name="ios-flash" size={32} color="yellow" style={styles.lightIcon} />)
            } else {
                lightIcon = (<Icon name="ios-flash-outline" size={32} color="#fff" style={styles.lightIcon} />)
            }

            deviceList.push((
                <View key={deviceId} style={{flex:1, flexDirection: 'row'}}>
                    {lightIcon}
                    <Text style={styles.title}>
                        {device.name} {status}.
                    </Text>
                </View>
            ));
        }

        if (deviceList.length === 0) {
            deviceList = (
                <Text style={styles.title}>No lights found</Text>
            );
        }

        if (this.state.edit) {
            widget = (
                <View>
                    <Text>Server URL</Text>
                    <TextInput value={this.state.serverURL}
                        onChangeText={deviceId => this.fetchLightStates({ serverURL })}/>
                    <Text>Server Code</Text>
                    <TextInput value={this.state.serverCode}
                        onChangeText={serverCode => this.fetchLightStates({ serverCode })}/>
                    <TouchableHighlight onPress={this.toggleEdit}
                        style={styles.saveButton}>
                        <Text>Save</Text>
                    </TouchableHighlight>
                </View>
            );
        } else {
            widget = (
                <View style={styles.lightsCard}>
                   {deviceList}
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
    lightsCard: {
        flex: 1,
        flexDirection: 'column',
        marginTop: 15
    },

    title: {
        fontSize: 16,
        color: 'white',
        fontWeight: '100',
        textAlign: 'left',
        width: 300
    },

    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'left',
        width: 300
    },

    saveButton: {
        padding: 10,
        width: 100,
        backgroundColor: "teal",
        alignItems: 'center',
        justifyContent: 'center'
    },

    lightIcon: {
        marginRight: 10,
        marginTop: -3
    }
});

module.exports = LightCard;
