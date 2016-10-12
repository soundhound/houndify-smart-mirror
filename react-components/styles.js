var ReactNative = require('react-native');


module.exports = ReactNative.StyleSheet.create({
    container: {
        flex:1,
        flexDirection:'column',
        backgroundColor: '#000000'
    },

    list: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },

    row: {
        flex: 1,
        backgroundColor: 'black',
        margin: 3,
        padding: 20,
        right: 0
    },

    centerRow: {
        flex: 2,
        margin: 3,
        padding: 20,
        right: 0
    },

    scrollView: {
        height: 300
    },

    head: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
        margin: 10
    },

    okhound: {
        textAlign: 'center',
        color: 'white'
    },

    writtenResponse: {
        color: 'white',
        fontSize: 24,
        width: 550,
        marginTop: 250,
        textAlign: 'center'
    },

    writtenResponseWrap: {
        flex: 1,
        alignItems:'center',
        justifyContent:'center'
    },

    okHoundWrap: {
        borderRadius: 30,
        backgroundColor: '#333',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 10
    },

    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    }
});
