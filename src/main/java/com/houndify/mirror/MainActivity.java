package com.houndify.mirror;

import android.app.Activity;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.widget.Toast;

import com.facebook.react.LifecycleState;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.shell.MainReactPackage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.hound.android.libphs.PhraseSpotterReader;
import com.hound.android.sdk.VoiceSearch;
import com.hound.android.sdk.VoiceSearchInfo;
import com.hound.android.sdk.VoiceSearchListener;
import com.hound.android.sdk.audio.SimpleAudioByteStreamSource;
import com.hound.core.model.sdk.CommandResult;
import com.hound.core.model.sdk.HoundResponse;
import com.hound.core.model.sdk.PartialTranscript;
import com.oblador.vectoricons.VectorIconsPackage;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Locale;




public class MainActivity extends Activity implements DefaultHardwareBackBtnHandler {
    private ReactRootView mReactRootView;
    protected ReactInstanceManager mReactInstanceManager;

    // Houndify SDK Objects
    private VoiceSearch voiceSearch;
    private PhraseSpotterReader phraseSpotterReader;
    private Handler mainThreadHandler = new Handler(Looper.getMainLooper());

    protected AudioManager am;
    protected TextToSpeechMgr textToSpeechMgr;
    private SoundPool soundPool;
    private int soundOnRecordStart;
    private int soundOnRecordStop;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //Remove title bar
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        View decorView = getWindow().getDecorView();
        int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN;
        decorView.setSystemUiVisibility(uiOptions);

        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(getApplication())
                .setBundleAssetName("index.android.bundle")
                .setJSMainModuleName("index.android")
                .addPackage(new MainReactPackage())
                .addPackage(new HoundifyReactPackage(this))
                .addPackage(new VectorIconsPackage())
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();
        mReactRootView.startReactApplication(mReactInstanceManager, "MirrorApp", null);
        setContentView(mReactRootView);

        am = (AudioManager)getSystemService(Context.AUDIO_SERVICE);

        AudioAttributes attr = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();

        soundPool = new SoundPool.Builder()
            .setMaxStreams(2)
            .setAudioAttributes(attr)
            .build();

        soundOnRecordStart = soundPool.load(this, com.hound.android.voicesdk.R.raw.houndify_start, 1);
        soundOnRecordStop = soundPool.load(this, com.hound.android.voicesdk.R.raw.houndify_stop, 1);

        textToSpeechMgr = new TextToSpeechMgr( this );

        startPhraseSpotting();
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onPause();
        }

        if ( phraseSpotterReader != null ) {
            stopPhraseSpotting();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (mReactInstanceManager != null) {
            mReactInstanceManager.onResume(this, this);
        }

        if ( phraseSpotterReader == null ) {
            startPhraseSpotting();
        }
    }

    @Override
    public void onBackPressed() {
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onBackPressed();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        textToSpeechMgr.destroy();
        soundPool.release();
        mReactInstanceManager.onDestroy();
        stopPhraseSpotting();
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_MENU && mReactInstanceManager != null) {
            mReactInstanceManager.showDevOptionsDialog();
            return true;
        }
        return super.onKeyUp(keyCode, event);
    }



    /**
     * Called to start the Phrase Spotter
     */
    private void startPhraseSpotting() {
        if ( phraseSpotterReader == null ) {
            phraseSpotterReader = new PhraseSpotterReader(new SimpleAudioByteStreamSource());
            phraseSpotterReader.setListener( phraseSpotterListener );
            Log.d("MirrorApp", "Started Phrase spotting.");
            phraseSpotterReader.start();
        }
    }

    /**
     * Called to stop the Phrase Spotter
     */
    private void stopPhraseSpotting() {
        if ( phraseSpotterReader != null ) {
            Log.d("MirrorApp", "Stopped Phrase spotting.");
            phraseSpotterReader.stop();
            phraseSpotterReader = null;
        }
    }


    protected StatefulRequestInfoFactory getRequestInfoFactory() {
        return StatefulRequestInfoFactory.get(this);
    }

    /**
     * Implementation of the PhraseSpotterReader.Listener interface used to handle PhraseSpotter
     * call back.
     */
    private final PhraseSpotterReader.Listener phraseSpotterListener = new PhraseSpotterReader.Listener() {
        @Override
        public void onPhraseSpotted() {

            // It's important to note that when the phrase spotter detects "Ok Hound" it closes
            // the input stream it was provided.
            mainThreadHandler.post(new Runnable() {
                @Override
                public void run() {
                    stopPhraseSpotting();
                    // Now start the HoundifyVoiceSearchActivity to begin       the search.
                    Log.d("MirrorApp", "Stopped Phrase spotting. About to begin the search");

                    soundPool.play(soundOnRecordStart, 1.0f, 1.0f, 0, 0, 1.0f);

                    voiceSearch = new VoiceSearch.Builder()
                            .setRequestInfo( getRequestInfoFactory().create() )
                            .setAudioSource( new SimpleAudioByteStreamSource() )
                            .setClientId( Constants.CLIENT_ID )
                            .setClientKey( Constants.CLIENT_KEY )
                            .setListener( voiceListener )
                            .build();
                    voiceSearch.start();

                    ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
                    if (reactContext != null) {
                        WritableMap params = Arguments.createMap();
                        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("houndifyRecordingStarted", params);
                    }
                }
            });
        }

        @Override
        public void onError(final Exception ex) {
            Log.d("MirrorApp", "Got error from Phrase Spotter");
            //For this sample we don't care about errors from the "Ok Hound" phrase spotter.
        }
    };


    /**
     * Implementation of the VoiceSearchListener interface used for receiving search state information
     * and the final search results.
     */
    private final VoiceSearchListener voiceListener = new VoiceSearchListener() {

        @Override
        public void onTranscriptionUpdate(final PartialTranscript transcript) {
            ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
            if (reactContext != null) {
                WritableMap params = Arguments.createMap();
                params.putString("results", transcript.getPartialTranscript());

                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("houndifyResponseTranscript", params);
            }
        }

        @Override
        public void onResponse(final HoundResponse response, VoiceSearchInfo voiceSearchInfo) {

            if (response.getResults().size() > 0) {
                ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
                if (reactContext != null) {
                    CommandResult commandResult = response.getResults().get(0);

                    // Required for conversational support
                    getRequestInfoFactory().setConversationState(response.getResults().get(0).getConversationState());

                    ObjectMapper mapper = new ObjectMapper();
                    mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
                    String json = new String();
                    try {
                        json = mapper.writeValueAsString(commandResult.getJsonNode());
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                    }

                    WritableMap params = Arguments.createMap();
                    params.putString("results", json);

                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("houndifyResponseSuccess", params);
                }
            }
            else {
                Log.d("MirrorApp", "Received empty response");
            }

            if ( phraseSpotterReader == null ) {
                startPhraseSpotting();
            }
        }

        @Override
        public void onError(final Exception ex, final VoiceSearchInfo voiceSearchInfo) {
            Log.d("MirrorApp", voiceSearchInfo.getErrorType().toString() + "\n\n" + exceptionToString(ex));

            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
            String json = new String();

            WritableMap params = Arguments.createMap();
            params.putString("error", json);

            ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("houndifyResponseError", params);

            if ( phraseSpotterReader == null ) {
                startPhraseSpotting();
            }
        }

        @Override
        public void onRecordingStopped() {
            soundPool.play(soundOnRecordStop, 1.0f, 1.0f, 0, 0, 1.0f);
            ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
            if (reactContext != null) {
                WritableMap params = Arguments.createMap();
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("houndifyRecordingStopped", params);
            }
        }

        @Override
        public void onAbort(final VoiceSearchInfo info) {
        }

    };



    /**
     * Helper class used for managing the TextToSpeech engine
     */
    class TextToSpeechMgr implements TextToSpeech.OnInitListener {
        private TextToSpeech textToSpeech;
        public static final int CHECK_TTS_AVAILABILITY = 101;
        private static final String TAG = "ActivityTTS";
        private String NO_TTS_ANDROID_MARKET_REDIRECT =
                "'SpeechSynthesis Data Installer' is not installed on your system, you are being redirected to" +
                        " the installer package. You may also be able to install it my going to the 'Home Screen' then " +
                        "(Menu -> Settings -> Voice Input & output -> Text-to-speech settings)";
        private String NO_TTS_AVAILABLE =
                "'SpeechSynthesis Data Installer' is not available on your system, " +
                        "you may have to install it manually yourself. You may also be able to install it my going to the 'Home Screen' " +
                        "then (Menu -> Settings -> Voice Input & output -> Text-to-speech settings)";


        public TextToSpeechMgr( Activity activity ) {

            Log.d("MirrorApp", "constructor called in TextToSpeechMgr");

            try { //A weird error was occurring on some phones with the TTS, hence the try catch
                //TTS Service
                textToSpeech = new TextToSpeech( activity, this );
            } catch (Exception e) {
                Log.d("MirrorApp", "Error when creating text to speech");
                Log.getStackTraceString(e);
                Toast.makeText(activity, NO_TTS_AVAILABLE, Toast.LENGTH_LONG).show();
            }
        }

        @Override
        public void onInit( int status ) {
            // Set language to use for playing text
            if ( status == TextToSpeech.SUCCESS ) {
                int result = textToSpeech.setLanguage(Locale.US);
            }
        }

        public void destroy() {
            //Close the Text to Speech Library
            if(textToSpeech != null) {
                textToSpeech.stop();
                textToSpeech.shutdown();
                Log.d("Houndify", "TTS Destroyed");
            }

            Log.d("Houndify", "TTS was null");
        }

        /**
         * Play the text to the device speaker
         *
         * @param textToSpeak
         */
        public void speak( String textToSpeak ) {
            HashMap<String, String> params = new HashMap<>();
            params.put(TextToSpeech.Engine.KEY_PARAM_STREAM, "" + AudioManager.STREAM_MUSIC);

            textToSpeech.speak(textToSpeak, TextToSpeech.QUEUE_ADD, params);
        }
    }


    private static String exceptionToString(final Exception ex) {
        try {
            final StringWriter sw = new StringWriter(1024);
            final PrintWriter pw = new PrintWriter(sw);
            ex.printStackTrace(pw);
            pw.close();
            return sw.toString();
        }
        catch (final Exception e) {
            return "";
        }
    }


}