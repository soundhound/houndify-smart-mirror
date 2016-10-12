![smart mirror](http://f.cl.ly/items/1k2b1v1I3O3Q252J0p3N/Screen%20Shot%202016-05-31%20at%201.26.36%20PM.png)

# Houndify Smart Mirror

This project uses the [Houndify](https://houndify.com) Android SDK and React Native to create an Android tablet app that can be used as an interface for a smart mirror. This is built on the Android Houndify SDK Sample Project v0.2.17.


## Features

- OK Hound Phrase Spotting
- Native Weather Cards
- Able to turn a lamp on or off
- Shows top news headlines of the day
- Speaks and displays answers to various questions

## Prerequisites

- JDK 7+
- Android SDK (I recommend downloading Android 5.1 and 6.0, but download whatever your device needs)
- NodeJS v0.12+
- npm (v3.0+ preferably)

## Setup

1. Clone the project.
2. Install node modules.

```
npm install
```

3. Download and install [Genymotion](https://www.genymotion.com/). Then, setup a Genymotion Emulator. I set up a Custom Tablet running Android 5.1.0 on API 22.

### Houndify Setup

First, you need to set your Houndify *CLIENT_ID* and *CLIENT_KEY* values in the Constants.java file inside the src directory. You can get these by registering a client on [Houndify](https://www.houndify.com).

### React Native Setup

After running `npm install`, navigate to the root directory and start the React Native Packager:

```
cd /path/to/react-native-houndify
react-native start
```


### Build

After completing all the steps above, open up your Genymotion emulator and build the application using Android Studio.


## Developing Locally

Since we are using React Native, we can develop locally without recompiling the app when we are working on the user interface.

Note that the React Native Packager always has to be running. Refer to the **React Native Setup** section above for details.

1. Open the root folder in a code editor of your choice. I use Sublime Text or Atom.
2. Edit any of the JavaScript files. `index.android.js` is the main Android View file.
3. Once you save, the emulator should automatically Reload JS and apply changes.
4. If it doesn't, press Cmd+M on the emulator, open the menu, and click "Reload JS".

Obviously, if you make any changes on the Java side, you will have to recompile and run your app again.

## Running on device

To run on device:

- Android Studio > Build > Build APK
- This will generate an APK inside build/outputs/apk
- cd /path/to/app/build/outputs/apk
- adb install --abi armeabi-v7a -r houndify-smart-mirror-1-debug.apk
- Now the app should be installed on the tablet as "Houndify Sample". But when you open the app, you will get some React Native error.
- Make sure React Native Packager is running, and your laptop is on the same network as the tablet.
- Then run adb reverse tcp:8081 tcp:8081
- Run Reload JS
- Now the Mirror should be working on the tablet.

Ping Asif or Tilo with any questions.


## Troubleshooting

If you run into any issues during these steps, you can try out Stack Overflow or refer to my blog post where I have some fixes for common React Native issues.

- [React Native on Android Troubleshooting](http://tilomitra.com/react-native-on-android-troubleshooting/)
