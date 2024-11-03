<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebRTC Viewer</title>
</head>
<body>
    <h1>Viewer</h1>
    <video id="remoteVideo" autoplay></video>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io(); // Your socket.io setup here
        let viewerPeerConnection;

        function joinStream() {
            viewerPeerConnection = new RTCPeerConnection();

            viewerPeerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Viewer sent ICE candidate:', event.candidate);
                    socket.emit('signal', { candidate: event.candidate });
                }
            };

            socket.on('signal', async (data) => {
                if (data.offer) {
                    console.log('Viewer: Received offer:', data.offer);
                    await viewerPeerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await viewerPeerConnection.createAnswer();
                    await viewerPeerConnection.setLocalDescription(answer);
                    socket.emit('signal', { answer: viewerPeerConnection.localDescription });
                }

                if (data.candidate) {
                    console.log('Received ICE candidate:', data.candidate);
                    try {
                        await viewerPeerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                        console.log('ICE candidate added successfully.');
                    } catch (error) {
                        console.error('Error adding ICE candidate:', error);
                    }
                }
            });

            viewerPeerConnection.ontrack = (event) => {
                console.log('Received remote stream from broadcaster.');
                const remoteVideo = document.getElementById('remoteVideo');
                remoteVideo.srcObject = event.streams[0];
            };
        }

        joinStream();
    </script>
</body>
</html>
