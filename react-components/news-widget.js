var ReactNative = require('react-native');
var Animatable = require('react-native-animatable');
var moment = require('moment');
var React = require('react');
var Text = ReactNative.Text;
var View = ReactNative.View;
import Icon from 'react-native-vector-icons/Ionicons';
const newsIcon = (<Icon name="ios-arrow-dropright-circle" size={30} color="#00a7f5" style={{marginRight: 20}}/>)

var NewsCard = React.createClass({
    getInitialState() {
        return {
            response: undefined
        }
    },

    componentDidMount() {
        var self = this;
        fetch('http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=8&q=http%3A%2F%2Fnews.google.com%2Fnews%3Foutput%3Drss')
            .then(response => response.json())
            .then(responseJson => {
                self.setState({
                    response: responseJson
                })
            })
            .catch(error => {
              console.warn(error);
            });
    },

    render() {
        if (!this.state.response) {
            return (
                <View></View>
            )
        }
        else {
            var jsxNewsItem = this.state.response.responseData.feed.entries.map(function (item, index) {
                return (
                    <View style={styles.newsItem} key={'news-item' + index}>
                        {newsIcon}
                        <Text style={styles.newsItemTitle} numberOfLines={2}>{item.title}</Text>
                    </View>
                )
            });

            return (
                <View style={styles.newsCard}>
                    {jsxNewsItem}
                </View>
            )
        }

    }
});

const styles = ReactNative.StyleSheet.create({

    newsCard: {
        marginTop: 100,
        flex:1,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
    },

    newsItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },

    newsItemTitle: {
        fontSize: 16,
        color: 'white',
        fontWeight: '100',
        width: 500
    },

    title: {
        fontSize: 30,
        color: 'white',

        width: 300
    }
});

module.exports = NewsCard;
