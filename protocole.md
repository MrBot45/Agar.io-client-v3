# Agar.io Protocol

This file contains information about the client-server connection protocol 9.

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

Node data that is marked for destruction has a simple format:

| Offset | Data Type | Description
|--------|-----------|-------------------
| 0      | uint32    | Node ID of killing cell
| 4      | uint32    | Node ID of killed cell
| ?      | uint32    | Hex data: 00 00 end of the destruction update

#### Node Data
Each visible node is described by the following data. This data repeats n times at the end of the Update Nodes packet, where n is the number specified by position 1 in the packet (number of nodes). Nodes that are stationary (like food) are only sent **once** to the client. In additon, the name field of each node is sent **once**.

##### Decompression type : 0xf0

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
| 17     | string    | Skin name (flags determined)
| ?      | uint8     | End of string Bytes: 00
| ?      | string    | Node name (flags determined)
| ?      | uint8     | End of string Bytes: 00

##### Decompression type : 0xff and others

If you are a developper and you can help me whit this please contact : 

My skype : slithervipbots@gmail.com or by email thx !

| Offset | Data Type | Description
|--------|-----------|-------------------
| 0      | uint32    | Node ID
| 4      | int32     | X position
| 8      | int32     | Y position
| 12     | uint16    | Radius of node
| ?      | uint8     | Flags - see below
| ?      | uint8     | Red component (flags determined)
| ?      | uint8     | Green component (flags determined)
| ?      | uint8     | Blue component (flags determined)
| ?      | string    | Skin name (flags determined) 
| ?      | uint8     | End of string Bytes: 00
| ?      | string    | Node name (flags determined)
| ?      | uint8     | End of string Bytes: 00


The flags field is 1 byte in length, and is a bitfield. Here's a table describing the known behaviors of setting specific flags:

##### Protocols v9

| Bit | Behavior
|-----|------------------
| 1   | Is virus
| 2   | Color present
| 4   | Skin present
| 8   | Name present
| 16  | Agitated cell
| 32  | Is ejected cell

### Packet 17: Update Position and Size in spectator mode

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | float32   | X position
| 5        | float32   | Y position
| 9        | float32   | Zoom factor of client

### Packet 20: Clear All Nodes not used

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

#### Protocols after v6
| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | The following repeats the number of times specified by this field.
| ?        | boolean   | Is me flag (0 - no, 1 - yes)
| ?        | string    | Player's name

### Packet 50: Update Leaderboard (Team)
Updates the leaderboard on the client's screen. Team score is the percentage of the total mass in game that the team has.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | Amount of teams
| ?        | float32   | Team score

### Packet 64: Set Border
Sets the map border.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | float64   | Left position
| 9        | float64   | Top position
| 17       | float64   | Right position
| 25       | float64   | Bottom position
| 26 to ?  | string    | I think it the version


### Packet 255: Compressed packet
Seen as an envelope of compressed packets 16 (Update nodes) and 64 (Set border). The compression uses LZ4 algorithm to compress data.

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
X and Y positions' data types:
- float64 at protocol 4
- int16 at early protocol 5
- int32 at late protocol 5 and newer

| Position | Data Type            | Description
|----------|----------------------|-----------------
| 0        | uint8                | Packet ID
| 1        | protocol-dependent   | Absolute mouse X on canvas
| ?        | protocol-dependent   | Absolute mouse Y on canvas
| ?        | uint32               | Node ID of the cell to control. Earlier used to move only specified cells.

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

### Packet 80: Send Token
Sent at the beginning of a connection, after packet 255.  
Used to authenticate with a one-use token issued by the load balancer.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | string    | Token. 8 characters, alpha-numeric, and some symbols. (uint8)

### Packet 254: Reset Connection 1
Sent at the beginning of a connection, before packet 255.
The server is obligated to send ClearNodes and SetBorder packets to ensure client doesn't drop the connection.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | Protocol version. Currently 8 as of vanilla 7/2/2016.

### Packet 255: Reset Connection 2
Sent at the beginning of a connection, after packet 254.

| Position | Data Type | Description
|----------|-----------|-----------------
| 0        | uint8     | Packet ID
| 1        | uint32    | Protocol version. Currently 2838145714 as of 7/2/2016. Unsure if changes.

