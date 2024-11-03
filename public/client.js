const socket = io();

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const remoteName = document.getElementById('remoteName'); // Element to display the remote user's name
let localStream;
let peerConnection;
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add more STUN/TURN servers if needed
    ],
};

let userCount = 0; // Initialize user count

// Function to generate a random name
function generateRandomName() {
    const names = ["Alice", "Bob", "Charlie", "Dana", "Eve", "Frank"];
    return names[Math.floor(Math.random() * names.length)];
}

// Generate a random name for the user
const userName = generateRandomName();

// Get user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
        // Create peer connection
        peerConnection = new RTCPeerConnection(servers);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('signal', { candidate: event.candidate });
            }
        };

        peerConnection.ontrack = (event) => {
            // Only set remote video source for the first user
            userCount++; // Increment user count
            if (userCount === 1) {
                remoteVideo.srcObject = event.streams[0];
                remoteName.innerText = "Remote User: " + userName; // Set the remote user's generated name
            } else {
                // Hide the remote video for subsequent users
                remoteVideo.srcObject = null; // Clear remote video source
                remoteName.innerText = ""; // Clear the name
                // You can also hide the video element if needed
                remoteVideo.style.display = 'none';
            }
        };

        // Create offer
        return peerConnection.createOffer();
    })
    .then(offer => {
        return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
        socket.emit('signal', { offer: peerConnection.localDescription });
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

// Handle incoming signals
socket.on('signal', (data) => {
    if (data.offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(() => {
                return peerConnection.createAnswer();
            })
            .then(answer => {
                return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
                socket.emit('signal', { answer: peerConnection.localDescription });
            })
            .catch(error => {
                console.error('Error handling offer.', error);
            });
    } else if (data.answer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});
