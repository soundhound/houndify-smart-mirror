var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');
var moment = require('moment');
var React = require('react');
var Text = ReactNative.Text;
var View = ReactNative.View;

var TimeCard = React.createClass({
    _timer: undefined,
    getInitialState() {
        return {
            date: {
                day: moment().format('MMMM Do'),
                time: moment().format('h:mm a')
            }
        }
    },

    componentWillUnmount() {
        window.clearInterval(this._timer);
    },

    componentDidMount() {
        var self = this;
        this._timer = setInterval(function () {
            self.setState({
                date: {
                    day: moment().format('MMMM Do, YYYY'),
                    time: moment().format('h:mm a')
                }
            });
        }, 1000);
    },

    render() {
        return (
            <View>
                <Text style={styles.title}>
                    {this.state.date.time}
                </Text>
                <Text style={styles.subtitle}>
                    {this.state.date.day}
                </Text>
            </View>
        )
    }
});

const styles = ReactNative.StyleSheet.create({
    title: {
        fontSize: 30,
        color: 'white',
        fontWeight: '100',
        textAlign: 'right',
        width: 300
    },

    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'right',
        width: 300
    }
});

module.exports = TimeCard;
