# ti.chatwidget
A widget for adding chat to your Titanium app

**This is very much a WORK IN PROGRESS. Not production ready yet. PR's welcome**

Currently not fully functional yet. Features right now:

- add messages
- remove messages
- adjust messages

Chatting itself (input) is not yet supported. 

This widget is being developed live on stream https://twitch.tv/wraldpyk

Join the #Twitch channel on https://tislack.org to get notified when going live.

## How to

- Include the code as a widget in your alloy app
- Include the widget in an empty window
```xml
<Widget src="chat" id="chat" />
```

- Add messages using the default structure

Default message structure:
```js
{
  id: 1,
  message: "Hello, World!",
  me: true,
  dateTime: '2019-03-07 14:46:04',
  image: 'myImage.jpg' // !optional! Supports local blobs, local images & remote images.
}
```
*`dateTime` needs to be parsable by momentjs, `me` determines wether the message is on the right or on the left (ping-pong layout)*

- add the message

```js
$.chat.addMessages(array);
$.chat.addMessage(message);
```

- update messages
```js
$.chat.updateMessage(message);
```

- remove messages
```js
$.chat.removeMessage(message);
```

For update you can pass a stripped out message object, it only needs the to-be-updated property and the `id`.

For remove only the `id` is required.

## New messages
A new message will be added if the user types it in the box. An event will trigger for this new message. It is your responsibility to submit this message to the server and update the ID of the message after submit has been succesful.

- Add event listener

```xml
<TextField id="chatBox" onReturn="sendMessage" />
```

This function will get the following object:

```js
    message {
        "dateTime": "2019-03-11T16:12:22+01:00",
        "day": 20190311,
        "id": 1552317142742,
        "me": true;
        "message": "My Message";
        "timestamp": 1552317142;
    };
    updateId: function(oldId, newId)
  }
```

Call `updateId` function with the generated (`oldId`) ID and the server generated `newId`. This way you can keep control over the newly created message. 

If server fails to create message in chat you could always call `removeMessage` with `oldId`
