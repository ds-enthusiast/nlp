import asyncio
import json
import logging
import websockets
import ssl
import time

from library.helpers import *
from actions import process_message

from pprint import pprint

logging.basicConfig()

STATE = {}
CONNECTIONS = {}


async def register(websocket):
    # print('register')
    connection_id = time.time()
    CONNECTIONS[connection_id] = websocket
    STATE[connection_id] = new_state()
    await websocket.send(json.dumps({
        "type": "connection_id",
        "connection_id": connection_id
    }))
    return connection_id


async def unregister(connection_id):
    #CONNECTIONS.remove(connection_id)
    pass

async def counter(websocket, path):
    print("New Connection")
    connection_id = await register(websocket)
    connection_await = True
    res = await websocket.recv()
    res = json.loads(res)
    # print("above if")
    if res.get("connection_id"):
        past_connection_id = res.get("connection_id")
        # print("connection_id")
        if past_connection_id != connection_id:
            # print("past_connection_id != connection_id")
            if STATE.get(past_connection_id):
                # print("if STATE.get(past_connection_id)")
                STATE[connection_id] = STATE[past_connection_id]
            else:
                # print("else STATE.get(past_connection_id)")
                await websocket.send(json.dumps({
                    "type": "first_message",
                    "message": "Hi, I'm a question answering bot. What question would you like to ask?"
                }))
        else:
            await websocket.send(json.dumps({
                "type": "first_message",
                "message": "Hi, I'm a question answering bot. What question would you like to ask?"
            }))
    try:
        async for message in websocket:
            message_data = json.loads(message)
            # print(message_data['message'])
            result = process_message(STATE[connection_id], message_data, connection_id)
            # print('result')
            # print('result', json.dumps(result))
            await websocket.send(json.dumps(result))
    finally:
        await unregister(connection_id)

# asyncio.get_event_loop().run_until_complete(
#     websockets.serve(counter, 'localhost', 8765))
# asyncio.get_event_loop().run_forever()

# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# ssl_context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
start_server = websockets.serve(counter, 'localhost', 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()