package com.houndify.mirror;

import android.content.Context;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.hound.android.fd.DefaultRequestInfoFactory;
import com.hound.core.model.sdk.ClientMatch;
import com.hound.core.model.sdk.HoundRequestInfo;

import java.util.ArrayList;

/**
 * We use a singleton in order to not hold a memory reference to the host activity since this is registered in the Houndify
 * singleton.
 */
public class StatefulRequestInfoFactory extends DefaultRequestInfoFactory {

    public static StatefulRequestInfoFactory instance;

    private JsonNode conversationState;

    public static StatefulRequestInfoFactory get(final Context context) {
        if (instance == null) {
            instance= new StatefulRequestInfoFactory(context);
        }
        return instance;
    }

    protected StatefulRequestInfoFactory(Context context) {
        super(context);
    }

    public void setConversationState(JsonNode conversationState) {
        this.conversationState = conversationState;
    }

    @Override
    public HoundRequestInfo create() {
        final HoundRequestInfo requestInfo = super.create();
        requestInfo.setConversationState(conversationState);
        requestInfo.setUserId("houndify-smart-mirror");

        /*
         * "Client Match"
         *
         * Below is sample code to demonstrate how to use the "Client Match" Houndify feature which
         * lets client apps specify their own custom phrases to match.  To try out this
         * feature you must:
         *
         * 1. Enable the "Client Match" domain from the Houndify website: www.houndify.com.
         * 2. Uncomment the code below.
         * 3. And finally, to see how the response is handled in go to the MainActivity and see
         *    "Client Match" demo code inside of onResponse()
         *
         * This example allows the user to say "turn on the lights", "turn off the lights", and
         * other variations on these phases.
         */


        ArrayList<ClientMatch> clientMatchList = new ArrayList<>();


        final JsonNodeFactory nodeFactory = JsonNodeFactory.instance;


        // add as many more client match entries as you like...
        ClientMatch clientMatch3 = new ClientMatch();
        clientMatch3.setExpression("\"clear\" . [\"the\"] . (\"mirror\" | \"screen\")");

        clientMatch3.setSpokenResponse("Ok, clearing the mirror.");
        clientMatch3.setSpokenResponseLong("Ok, clearing the mirror.");
        clientMatch3.setWrittenResponse("Ok, clearing the mirror.");
        clientMatch3.setWrittenResponseLong("Ok, clearing the mirror.");

        ObjectNode result3Node = nodeFactory.objectNode();
        result3Node.put("Intent", "CLEAR_MIRROR");
        clientMatch3.setResult(result3Node);

        // add next client match data to the array/list
        clientMatchList.add(clientMatch3);


        // add as many more client match entries as you like...
        ClientMatch clientMatch4 = new ClientMatch();
        clientMatch4.setExpression("\"breaking\" . \"news\"");

        clientMatch4.setSpokenResponse("Ok, here are some breaking news headlines.");
        clientMatch4.setSpokenResponseLong("Ok, here are some breaking news headlines.");
        clientMatch4.setWrittenResponse("Ok, here are some breaking news headlines.");
        clientMatch4.setWrittenResponseLong("Ok, here are some breaking news headlines.");

        ObjectNode result4Node = nodeFactory.objectNode();
        result4Node.put("Intent", "SHOW_NEWS");
        clientMatch4.setResult(result4Node);

        // add next client match data to the array/list
        clientMatchList.add(clientMatch4);


        //small easter egg
        // add as many more client match entries as you like...
        ClientMatch clientMatch5 = new ClientMatch();
        clientMatch5.setExpression("(\"magic\" | \"mirror\") . " +
                "\"mirror\" . \"on the wall\" . " +
                "(\"who is\" | \"who's\") . " +
                "\"the fairest\" . " +
                "(\"one of\" | \"of them\") . \"all\"");

        clientMatch5.setSpokenResponse("You are the fairest one of all!");
        clientMatch5.setSpokenResponseLong("You are the fairest one of all!");
        clientMatch5.setWrittenResponse("You are the fairest one of all!");
        clientMatch5.setWrittenResponseLong("You are the fairest one of all!");

        ObjectNode result5Node = nodeFactory.objectNode();
        result5Node.put("Intent", "FAIREST_ONE");
        clientMatch5.setResult(result5Node);

        // add next client match data to the array/list
        clientMatchList.add(clientMatch5);


        // add the list of matches to the request info object
        requestInfo.setClientMatches(clientMatchList);

        return requestInfo;
    }
}
