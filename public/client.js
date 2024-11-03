const socket = io();

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let peerConnection;
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add more STUN/TURN servers if needed
    ],
};

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
            remoteVideo.srcObject = event.streams[0];
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