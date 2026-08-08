print("PYTHON FILE STARTED")

import asyncio
import json
import websockets
from websockets.exceptions import ConnectionClosed

notes = ["C", "D", "E", "F", "G", "A", "B"]

async def handler(websocket):
    print("Website connected")

    index = 0
    try:
        while True:
            message = {
                "type": "note",
                "value": notes[index]
            }
            print("Sending: ", message)

            await websocket.send(json.dumps(message))

            index = (index + 1) % len(notes)

            await asyncio.sleep(1)
    except ConnectionClosed:
            print("Website Disconnected")

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server started")
        await asyncio.Future()


asyncio.run(main())