import asyncio
import websockets

# CLIENTS = set()
#
# async def echo(websocket):
#     CLIENTS.insert(websocket)
#     try:
#         async for message in websocket:
#             websockets.broadcast(CLIENTS,message)
#     finally:
#         CLIENTS.remove(websocket)
#
#
# async def main():
#     async with websockets.serve(echo, "localhost", 10_000):
#         await asyncio.Future()  # run forever

GROUPS = {}

async def echo(websocket):
    if GROUPS.get(websocket.path) is None:
        GROUPS[websocket.path] =set()
    clients = GROUPS[websocket.path]
    clients.add(websocket)
    try:
        async for message in websocket:
            websockets.broadcast(clients.difference(set([websocket])),message)
    finally:
        clients.remove(websocket)


async def main():
    async with websockets.serve(echo, "localhost", 10_000):
        await asyncio.Future()  # run forever

asyncio.run(main())
