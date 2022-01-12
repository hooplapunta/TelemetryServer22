# SUITS RESTful Telemetry Server
... Docs coming soon.


# Quick API calls

### Get Rooms:
``` REST
Method: GET
URI: /api/rooms
Required Paramters:
    -- none --
Returns: 
    id - <integer> ID of the room
    name - <string> Name of the room
    users - <integer> Number of user in the room
    createdAt - <string> Time room was created
    updatedAt - <string> Last time room was updated
Example Return:
    [{
        "id": 1,
        "name": "alpha",
        "users": 0,
        "createdAt": "2022-01-12T18:30:46.510Z",
        "updatedAt": "2022-01-12T18:30:46.510Z"
    },
    {
        "id": 2,
        "name": "beta",
        "users": 0,
        "createdAt": "2022-01-12T18:30:46.510Z",
        "updatedAt": "2022-01-12T18:30:46.510Z"
    },...]
```

### Register new user:
``` REST 
Method: POST
URI: /api/auth/register
Required Paramters:
    "username": "<string>"
    "room": <integer>
Payload Example: 
 { "username": "Nick", "room": 1 }
Returns:
    id
    username
    room
    updatedAt
    createdAt
Example Return:
    {"id":6,"username":"Nick","room":1,"updatedAt":"2022-01-12T18:46:29.177Z","createdAt":"2022-01-12T18:46:29.177Z"}
``` 

### Get Users in Room:
``` REST 
Method: POST
URI: /api/users/room/:roomid
Required 'Route' Paramters:
    roomid: <integer> id of the desired room
Returns:
    user object
Example Return:
    [{
        "id": 6,
        "username": "Nick",
        "room": 1,
        "createdAt": "2022-01-12T18:46:29.177Z",
        "updatedAt": "2022-01-12T18:46:29.177Z"
    },
    {
        "id": 7,
        "username": "John",
        "room": 1,
        "createdAt": "2022-01-12T18:57:36.414Z",
        "updatedAt": "2022-01-12T18:57:36.414Z"
    },...
    ]
```
