const socket = io();

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let peerConnections = {}; // Store peer connections
let isBroadcaster = false; // Flag to determine if user is the broadcaster
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ],
};

// Get user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;

        // Check if the user is the first to connect
        socket.on('firstUser', () => {
            isBroadcaster = true; // This user is the broadcaster
            createPeerConnections(); // Set up connections to viewers
        });

        // Handle incoming signals
        socket.on('newUser', (userId) => {
            if (isBroadcaster) {
                createPeerConnection(userId); // Create connection for new viewer
            }
        });

        // Send the stream to the broadcaster
        if (isBroadcaster) {
            createOffer();
        }
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

// Create peer connection for a viewer
function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection(servers);
    peerConnections[userId] = peerConnection; // Store the connection

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', { candidate: event.candidate, userId });
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0]; // Update remote video
    };
}

// Create an offer from the broadcaster
function createOffer() {
    for (let userId in peerConnections) {
        peerConnections[userId].createOffer()
            .then(offer => {
                return peerConnections[userId].setLocalDescription(offer);
            })
            .then(() => {
                socket.emit('signal', { offer: peerConnections[userId].localDescription, userId });
            })
            .catch(error => {
                console.error('Error creating offer:', error);
            });
    }
}

// Handle incoming signals
socket.on('signal', (data) => {
    const { userId } = data;

    if (data.offer) {
        createPeerConnection(userId); // Create a connection for the user if it's an offer
        peerConnections[userId].setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(() => {
                return peerConnections[userId].createAnswer();
            })
            .then(answer => {
                return peerConnections[userId].setLocalDescription(answer);
            })
            .then(() => {
                socket.emit('signal', { answer: peerConnections[userId].localDescription, userId });
            })
            .catch(error => {
                console.error('Error handling offer:', error);
            });
    } else if (data.answer) {
        peerConnections[userId].setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        peerConnections[userId].addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});

// Notify when a new user joins
socket.emit('join');
