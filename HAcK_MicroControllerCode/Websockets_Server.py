print("PYTHON FILE STARTED")

import asyncio
import serial
import json
import websockets
from websockets.exceptions import ConnectionClosed

notes = ["C", "D", "E", "F", "G", "A", "B"]

PICO_PORT = "COM7"

pico = serial.Serial(PICO_PORT, 115200, timeout = 0.1)

connected_clients = set()

async def handler(websocket):
    print("Website connected")

    connected_clients.add(websocket)
    
    try:
       await websocket.wait_closed()

    except ConnectionClosed:
        connected_clients.discard(websocket)    
        print("Website Disconnected")

async def pico_read():
    while True:
        line = await asyncio.to_thread(pico.readline)

        if not line:
            continue

        try:
            message = line.decode("utf-8").strip()

            if not message.startswith("{"):
                print("Pico:", message)
                continue

            data = json.loads(message)

            print("Received from Pico ", data)

            if connected_clients:

                dead_clients = []

                for websocket in connected_clients:
                    try:
                        await websocket.send(
                            json.dumps(data)
                        )
                    except ConnectionClosed:
                        dead_clients.append(websocket)

                for websocket in dead_clients:
                    connected_clients.discard(websocket)

        except Exception as error:
            print("Serial message error: ", error)

async def main():

    print("Connected to Pico on", PICO_PORT)

    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server started")
        await pico_read()


asyncio.run(main())