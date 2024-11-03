const socket = io(); // Your socket.io setup here
let viewerPeerConnection;

// When the viewer joins
function joinStream() {
    viewerPeerConnection = new RTCPeerConnection();

    // Add event listeners for ICE candidates
    viewerPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('Viewer sent ICE candidate:', event.candidate);
            socket.emit('signal', { candidate: event.candidate });
        }
    };

    // When receiving a signal
    socket.on('signal', (data) => {
        if (data.offer) {
            console.log('Viewer: Received offer:', data.offer);
            viewerPeerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
                .then(() => {
                    console.log('Received offer, creating answer.');
                    return viewerPeerConnection.createAnswer();
                })
                .then(answer => {
                    console.log('Sending answer:', answer);
                    return viewerPeerConnection.setLocalDescription(answer);
                })
                .then(() => {
                    socket.emit('signal', { answer: viewerPeerConnection.localDescription });
                })
                .catch(error => console.error('Error handling offer:', error));
        }

        if (data.candidate) {
            console.log('Received ICE candidate:', data.candidate);
            viewerPeerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                .then(() => {
                    console.log('ICE candidate added successfully.');
                })
                .catch(error => {
                    console.error('Error adding ICE candidate:', error);
                });
        }
    });

    // Handle remote stream
    viewerPeerConnection.ontrack = (event) => {
        console.log('Received remote stream from broadcaster.');
        const remoteVideo = document.getElementById('remoteVideo'); // Your video element ID
        remoteVideo.srcObject = event.streams[0];
    };
}

// Call this function when the viewer joins
joinStream();
