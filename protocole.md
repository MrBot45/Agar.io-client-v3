# Agar.io Protocol v11 - 13

This file contains information about the client-server connection protocol 11.

## Data Types
Agar.io uses standard JavaScript DataView data types.

| Data Type | Description 
|-----------|-----------
| uint8     | Unsigned 1 byte integer (byte)
| uint16    | Unsigned 2 byte integer (short)
| uint32    | Unsigned 4 byte integer (int)
| float32   | Signed 4 byte floating point value
| float64   | Signed 8 byte floating point value
| string    | UTF-8
| boolean   | uint32 where 0 = false, 1 = true

Each packet starts with a uint8 containing the packet ID.

## Clientbound Packets
### Packet 16: Update Nodes (Decompressed part of the packet 255)
Sent to the client by the server to update information about one or more nodes. Nodes to be destroyed are placed at the beginning of the node data list.

#### Eat record

| Position | Data Type     | Description
|----------|---------------|-----------------
| 0        | uint8         | Packet ID
| 1        | uint16        | Number of nodes to be destroyed
| 2...?    | Destruct Data | Nodes' ID marked for destruction
| ?...?    | Node Data     | Data for all nodes
| ?        | uint32        | Always 0; terminates the node data listing
| ?        | uint16        | Always 0; discarded by the client
| ?        | uint16        | Number of nodes marked for destroying
| ?...?    | Destruct Data | Node ID of each destroyed node (uint32)

#### Node Data
Each visible node is described by the following data. This data repeats n times at the end of the Update Nodes packet, where n is the number specified by position 1 in the packet (number of nodes). Nodes that are stationary (like food) are only sent **once** to the client. In additon, the name field of each node is sent **once**.

##### Decompression type : 0xf0 & 0xff 0xf1 & 0xf2 & 0xf3

| Offset | Data Type | Description
|--------|-----------|-------------------
| 0      | uint32    | Node ID
| 4      | int32     | X position
| 8      | int32     | Y position
| 12     | uint16    | Radius of node
| 17     | uint8     | Flags - see below
| 14     | uint8     | Red component (flags determined)
| 15     | uint8     | Green component (flags determined)
| 16     | uint8     | Blue component (flags determined)
| ?      | uint8     | If the flags is 130. This is an other flags see below. (flags determined)
| ?      | string    | Skin name (flags determined)
| ?      | uint8     | End of string Bytes: 00
| ?      | string    | Node name (flags determined)
| ?      | uint8     | End of string Bytes: 00

##### Decompression type : Others

If you are a developper and you can help me whit this please contact : 

My skype : slithervipbots@gmail.com or by email thx !

| Offset | Data Type | Description
|--------|-----------|-------------------
| 0      | uint32    | Node ID
| 4      | int32     | X position
| 8      | int32     | Y position
| 12     | uint16    | Radius of node
| 14     | uint8     | Flags - see below
| 15..?  | uint8     | Red component (flags determined)
| 16..?  | uint8     | Green component (flags determined)
| 17..?  | uint8     | Blue component (flags determined)
| ?      | uint8     | If the flags is 130. This is an other flags see below. (flags determined)
| ?      | string    | Skin name (flags determined) 
| ?      | uint8     | End of string Bytes: 00
| ?      | string    | Node name (flags determined)
| ?      | uint8     | End of string Bytes: 00

#### Flags for Protocol v11

| Bit | Behavior
|-----|------------------
| 1   | Is virus or ejected food
| 2   | Color present
| 4   | Skin present
| 8   | Name present
| 10  | Agitated cell or ejected food or virus (If player or ejected food or virus is moving)
| 130 | A byte form is_ejected_food_or_virus to define is type.

##### Flags of flags 130

| Bit | Behavior
|-----|------------------
| 1   | Is virus
| 255 | Is ejected mass
| ?   | Is ??? (For other type please send me what you thing via skype or email. You can also post an issue !)

#### Remove record

Node data that is marked for destruction has a simple format:

| Offset | Data Type | Description
|--------|-----------|-------------------
| 0      | uint32    | Node ID of killing cell
| 4      | uint32    | Node ID of killed cell
| ?      | uint32    | Hex data: 00 00 end of the destruction update

### Packet 17: Update Position and Size in spectator mode

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | float32   | X position
| 5        | float32   | Y position
| 9        | float32   | Zoom factor of client

### Packet 18: Reset all cells

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID

### Packet 20: Clear All Nodes (not needed)

Clears all nodes off of the player's screen.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID

### Packet 21: Draw Line
Draws a line from all the player cells to the specified position.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint16    | X position
| 3        | uint16    | Y position

### Packet 32: Add Node (New ball ID)
Bot new ball ID. Used to get the bot ID. 
Sended after spawn.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | Node ID

### Packet 49: Update Leaderboard (FFA)
Updates the leaderboard on the client's screen.

#### Protocol 11
| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | The following repeats the number of times specified by this field.
| 5        | uint32    | Highlight
| ?        | string    | Player's name 

### Packet 50: Update Leaderboard (Team)
Updates the leaderboard on the client's screen. Team score is the percentage of the total mass in game that the team has.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | Amount of teams
| 5        | float32   | Team score A
| 9        | float32   | Team score B 
| 13       | float32   | Team score C

### Packet 64: Set Border
Sets the map border.
<b> Packet form 255 </b>
<b> This packet is <i> PROBALY </i> compressed whit an unknown type.</b>

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | float64   | Left position
| 9        | float64   | Top position
| 17       | float64   | Right position
| 25       | float64   | Bottom position
| 33       | Int32     | Server Type: FFA = 0, TEAMS = 1, EXPERIMENTAL = 4, PARTY = 8
| 37       | string    | Server version: Currenly it is @12.1.1
| ?        | End       | Zero-terminated string with server version

### Packet 255: Compressed packet
Envelope of compressed packets 16 (Update nodes) and 64 (Set border). 
The compression uses LZ4 algorithm to compress data.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1...?    | bytes     | Compressed data

## Serverbound Packets
### Packet 0: Set Nickname
Sets the player's nickname.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | string    | Nickname

### Packet 1: Spectate
Puts the player in spectator mode.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID

### Packet 16: Mouse Move
Sent when the player's mouse moves.

| Position | Data Type            | Description
|----------|----------------------|-----------------
| 0        | uint8                | Packet ID
| 1        | int32			      | Absolute mouse X on canvas
| 5        | int32			      | Absolute mouse Y on canvas
| 9        | uint32               | Node ID of the cell to control. Earlier used to move only specified cells.

### Packet 17: Split
Splits the player's cell.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID

### Packet 18: Key Q Pressed
Sent when the player presses Q.  
In early iterations, was used to bring your cells closer together after spreading them apart. Now is used to enable free-roam mode while spectating.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID

### Packet 19: Key Q Released
Sent when the player releases Q. See packet 18.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID

### Packet 21: Eject Mass
Ejects mass from the player's cell.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID

### Packet 254: Reset Connection 1
Sent at the beginning of a connection, before packet 255.
The server is obligated to send ClearNodes and SetBorder packets to ensure client doesn't drop the connection.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | Protocol version. Currently 11.

### Packet 255: Reset Connection 2
Sent at the beginning of a connection, after packet 254.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | Random keys reseted each hour. How to get it you need a sniffer. Find for 255
<b> After send this reset you will get encrypted packet. </b>

