package com.houndify.mirror;

import com.facebook.react.bridge.ReadableArray;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hound.android.sdk.TextSearch;
import com.hound.core.model.sdk.ClientState;
import com.hound.core.model.sdk.CommandResult;
import com.hound.core.model.sdk.HoundRequestInfo;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;

import java.util.HashMap;
import java.util.Map;

import android.app.Activity;
import android.media.AudioManager;

public class ReactHoundifyModule extends ReactContextBaseJavaModule {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    MainActivity mActivity;

    public ReactHoundifyModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    public ReactHoundifyModule(ReactApplicationContext reactContext, Activity activity) {
        super(reactContext);
        mActivity = (MainActivity)activity;
    }

    @Override
    public String getName() {
        return "ReactHoundifyModule";
    }


    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, "Short");
        constants.put(DURATION_LONG_KEY, "Long");
        return constants;
    }


    @ReactMethod
    public void indexDevices(ReadableArray devices, Callback successCallback) {
        MainActivity currentActivity = (MainActivity)getCurrentActivity();

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode devicesJson = mapper.readTree(devices.toString());

            ClientState clientState = new ClientState();
            clientState.setExtraField("IndexUserDevicesData", devicesJson);

            HoundRequestInfo requestInfo = currentActivity.getRequestInfoFactory().create();
            requestInfo.setClientState(clientState);

            TextSearch textSearch = new TextSearch.Builder()
                    .setRequestInfo( requestInfo )
                    .setClientId( Constants.CLIENT_ID )
                    .setClientKey( Constants.CLIENT_KEY )
                    .setQuery( "index_user_devices_from_request_info" )
                    .build();

            CommandResult commandResult = textSearch.search().getResponse().getResults().get(0);
            String json = mapper.writeValueAsString(commandResult);
            successCallback.invoke(json);
        } catch(Exception e) {
        }
    }

    @ReactMethod
    public void speak(ReadableMap config) {
        mActivity.textToSpeechMgr.speak(config.getString("text"));
    }

    @ReactMethod
    public void setVolume(ReadableMap config) {
        int maxVolume = mActivity.am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        int currentVolume = mActivity.am.getStreamVolume(AudioManager.STREAM_MUSIC);

        if (config.getString("command").equals("mute")) {
            mActivity.am.setStreamVolume(AudioManager.STREAM_MUSIC, 0, AudioManager.FLAG_SHOW_UI);
        }

        else if (config.getString("command").equals("unmute") && currentVolume == 0) {
            mActivity.am.setStreamVolume(AudioManager.STREAM_MUSIC, (int)(0.5 * maxVolume), AudioManager.FLAG_SHOW_UI);
        }

        else if (config.getString("command").equals("raise")) {
            mActivity.am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, AudioManager.FLAG_SHOW_UI);
        }

        else if (config.getString("command").equals("lower")) {
            mActivity.am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, AudioManager.FLAG_SHOW_UI);
        }

        else if (config.getString("command").equals("set")) {
            mActivity.am.setStreamVolume(AudioManager.STREAM_MUSIC, (int)(config.getDouble("value") * maxVolume), AudioManager.FLAG_SHOW_UI);
        }
    }

}
