# ti.chatwidget
A widget for adding chat to your Titanium app

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
  dateTime: '2019-03-07 14:46:04'
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
