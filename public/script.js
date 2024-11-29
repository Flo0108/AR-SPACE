
        // SET CAMERA HEIGHT BASED ON DEVICE
        // Get the camera entity 
        const playerCamera = document.querySelector("#playerCamera");

        // Function to set camera height based on VR status
        function setCameraHeight(isVR) {
            playerCamera.setAttribute("position", { x: 0, y: isVR ? 1.6 : 1.6, z: 0 });
        }

        // Listen for entering and exiting VR mode
        const sceneEl = document.querySelector("a-scene");

        sceneEl.addEventListener("enter-vr", () => {
            setCameraHeight(true); // Set height for VR
        });

        sceneEl.addEventListener("exit-vr", () => {
            setCameraHeight(false); // Set height for non-VR
        });

        // Initial height setting for non-VR (e.g., upon loading)
        setCameraHeight(false);




        

        const grid      = document.getElementById("grid");

        const rows      = 20;
        const cols      = rows;
        const spacing   = 1.2;
        const planeSize = 1;
        const visibilityDistance = 10;

        // Function to calculate distance between two positions
        function calculateDistance(pos1, pos2) {
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const dz = pos1.z - pos2.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }

        // Generate the grid of planes
        for (let i = -10; i < rows; i++) {
            for (let j = -10; j < cols; j++) {
                const plane = document.createElement("a-plane");
                const x = j * spacing;
                const z = i * spacing;
                const y = -0.1;

                plane.setAttribute("position", `${x} ${y} ${z}`);
                plane.setAttribute("rotation", "-90 0 0");
                plane.setAttribute("width", planeSize);
                plane.setAttribute("height", planeSize);
                plane.setAttribute("color", "#7BC8A4");
                plane.setAttribute("visible", "true");
                plane.classList.add("grid-plane");

                grid.appendChild(plane);
            }
        }


        // Center the grid around the origin
        const offsetX = (cols - 1) * spacing / 2;
        const offsetZ = (rows - 1) * spacing / 2;

        grid.setAttribute("position", `-${offsetX} 0 -${offsetZ}`);

        // Update visibility based on player's distance
        function updateVisibility() {
            const player = document.getElementById('player'); // Get player entity
            const camera = player.object3D;;  // Camera within player
            const playerPos = new THREE.Vector3();
            camera.getWorldPosition(playerPos);

            

            const planes = document.querySelectorAll(".grid-plane");

            planes.forEach((plane) => {
                const planePos = new THREE.Vector3();
                plane.object3D.getWorldPosition(planePos);
                const distance = playerPos.distanceTo(planePos);

                if (distance <= visibilityDistance) {
                    let value = 1 / distance * 1.2;
                    value = Math.max(0.1, Math.min(value, 5))  + 0.5;
                    plane.object3D.scale.set(value, value, value);
                    plane.setAttribute("visible", "true");
                } else {
                    plane.object3D.scale.set(0.25, 0.25, 0.25);
                    plane.setAttribute("visible", "true");
                }
            });

            // Request the next frame
            requestAnimationFrame(updateVisibility);

        }


        requestAnimationFrame(updateVisibility);
















        let playerName;
        const socket = io(window.location.origin);

        // Function to handle name submission
        function submitName() {
            const playerName = document.getElementById('playerNameInput').value.trim();

            if (playerName === '') {
                alert("Please enter a name.");
                return;
            }

            document.getElementById('overlay').style.display = 'none';
            document.getElementById('playerNameText').setAttribute('value', playerName);

            console.log(playerName)
            socket.emit('playerName', playerName)

            if (playerName === 'camera_master') {
                document.getElementById('adminControls').style.display = 'block';
            }
        }
        
        


        let countdownValue = 2 * 60; // Countdown starting from 5 minutes (300 seconds)
        let timerText   = document.getElementById('timerText');
        let speakerText = document.getElementById('activeSpeaker');
        let player1Text = document.getElementById('player1Text');
        let player2Text = document.getElementById('player2Text');
        let countdownInterval;

        let speaker1Rotation = player1Text.getAttribute('rotation');
        let speaker2Rotation = player2Text.getAttribute('rotation');
        let speakerRotation  = speakerText.getAttribute('rotation');
        let timerRotation    = timerText.getAttribute('rotation');


        // Function to update the countdown timer
        function updateTimer() {
            let minutes = Math.floor(countdownValue / 60);
            let seconds = countdownValue % 60;
            let timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timerText.setAttribute('value', timeFormatted);

            // Play ticking sound during the last 5 seconds
            if (countdownValue <= 5 && countdownValue > 0) {
                const tickSound = document.getElementById('tickingSound');
                tickSound.play(); // Play the ticking sound every second in the last 5 seconds
            }

            countdownValue--;

            if (countdownValue < 0) {
                clearInterval(countdownInterval); // Stop the timer
                timerText.setAttribute('value', 'Time\'s Up!');

                // Trigger end round when time is up
                //endRound();
            }
        }




        let colora 
        let colorb 
        let colorc

        colora = 0
        colorb = 220
        colorc = 52
        


        function endRound() {
            // Send a message to other clients to sync the visibility
            socket.emit('endRound');

            const voteMessageUI = document.getElementById('roundEndMessage');
            voteMessageUI.style.display = 'flex'; // Show the message

            const roundEndSound = document.getElementById('roundEndSound');
            roundEndSound.play();

            setTimeout(() => {
                document.getElementById('roundEndMessage').style.display = 'none'; // Hide the message after 5 seconds
            }, 5000);
        }

        function endGame() {
            // Send a message to other clients to sync the visibility
            socket.emit('endGame');
        }



        // Client-side (JavaScript)

        // Listen for the event to trigger visibility change and start the countdown
        socket.on('updateModelVisibility', (newVisibility) => {
            const modelContainer = document.getElementById('modelContainer');
            modelContainer.setAttribute('visible', newVisibility);
        });
        
        // Client-side (JavaScript)
        socket.on('updateModelVisibility2', (newVisibility) => {
            const modelContainer = document.getElementById('modelContainer2');
            modelContainer.setAttribute('visible', newVisibility);
        });



        // Listen for the toggle visibility sync
        socket.on('toggleModelVisibility', (newVisibility) => {

            const point1 = document.getElementById("point1");
            point1.setAttribute("position", `${-20} ${2} ${12.5}`);

            const point2 = document.getElementById("point2");
            point2.setAttribute("position", `${20} ${2} ${12.5}`);

            const point3 = document.getElementById("point3");
            point3.setAttribute("position", `${0} ${2} ${-25}`);

            const iframe = document.getElementById("myIframe");
            iframe.style.visibility = "visible";

            const closestPointInterval = setInterval(updateClosestPoint, 2000);

            const modelContainer = document.getElementById('modelContainer');
            modelContainer.setAttribute('visible', newVisibility);
        });

        // Listen for the toggle visibility sync
        socket.on('toggleModelVisibility2', (newVisibility) => {
            const modelContainer = document.getElementById('modelContainer2');
            modelContainer.setAttribute('visible', newVisibility);
        });



        // Listen for showing the vote message UI
        socket.on('showVoteMessage', () => {
            const voteMessageUI = document.getElementById('voteMessageUI');
            voteMessageUI.style.display = 'flex'; // Show the message

            // Automatically start the countdown when the model becomes visible
            countdownValue = 0.5 * 60; // Reset to 5 minutes
            countdownInterval = setInterval(updateTimer, 1000); // Start the countdown

            const roundEndSound = document.getElementById('roundEndSound');
            roundEndSound.play();
        });

        // Listen for hiding the vote message UI
        socket.on('hideVoteMessage', () => {
            const voteMessageUI = document.getElementById('voteMessageUI');
            voteMessageUI.style.display = 'none'; // Hide the message
        });


        // Listen for showing the vote message UI
        socket.on('showVoteMessage2', () => {
            const voteMessageUI = document.getElementById('voteMessageUI2');
            voteMessageUI.style.display = 'flex'; // Show the message

            // Automatically start the countdown when the model becomes visible
            countdownValue = 2 * 60; // Reset to 5 minutes
            countdownInterval = setInterval(updateTimer, 1000); // Start the countdown
        });

        // Listen for hiding the vote message UI
        socket.on('hideVoteMessage2', () => {
            const voteMessageUI = document.getElementById('voteMessageUI2');
            voteMessageUI.style.display = 'none'; // Hide the message
        });







        let players = {};
        const player = document.getElementById('player'); // Get player entity
        const camera = player.querySelector('a-camera');  // Camera within player
        const closestPlayerDiv = document.getElementById('closest-player'); // Div for closest player info

        // Points in the scene
        const points = [
            { id: 'point1', element: document.getElementById('point1') },
            { id: 'point2', element: document.getElementById('point2') },
            { id: 'point3', element: document.getElementById('point3') },
            { id: 'point4', element: document.getElementById('point4') }
        ];

        const points2 = [
            { id: 'point5', element: document.getElementById('point5') },
            { id: 'point6', element: document.getElementById('point6') },
        ];

        // Handle the current players on initial connection
        socket.on('currentPlayers', (serverPlayers) => {
            for (const id in serverPlayers) {
                if (!players[id]) {
                    createPlayerSphere(id, serverPlayers[id].position, serverPlayers[id].name);
                }
            }
        });

        // Handle new player joining
        socket.on('newPlayer', (data) => {
            createPlayerSphere(data.id, data.position, data.name);
        });

        // Handle player movement
        socket.on('move', (data) => {
            const playerSphere = players[data.id]; // Find the player's sphere
            if (playerSphere) {
                // Update the player's sphere position
                playerSphere.object3D.position.set(data.position.x, data.position.y, data.position.z);

                // Update the position of the name tag above the player sphere
                const nameText = playerSphere.nameText;
                if (nameText) {
                    nameText.object3D.position.set(

                        data.position.x,
                        data.position.y + 4.2, // Adjust Y to be above the sphere
                        data.position.z
                    );
                }
            }


            const playerModel = players[data.id].model;
            if (playerModel) {
                    playerModel.setAttribute('position', `${data.position.x} ${data.position.y} ${data.position.z}`);
            }
        

        });

        // Handle player disconnect
        socket.on('removePlayer', (id) => {
            if (players[id]) {
                players[id].parentNode.removeChild(players[id]);
                delete players[id];
            }
        });

        // Handle Player Namechange
        socket.on('nameChange', (data) => {
            const playerSphere = players[data.id]; // Find the player's sphere
            console.log(data.name)
            if (playerSphere) {
                const nameText = playerSphere.nameText;
                nameText.setAttribute('value', data.name); //////
            }
        });




        // Create a sphere for each player with a name label
        function createPlayerSphere(id, position, name) {
            const sphere = document.createElement('a-sphere');
            
            // Check if the current player is the local player
            if (id === socket.id) {
                sphere.setAttribute('color', 'green'); // Local player color
                sphere.setAttribute('radius', '1');
            } else {
                sphere.setAttribute('color', 'red'); // Other players color
                sphere.setAttribute('radius', '0.5');
            }
            
            sphere.setAttribute('position', position);
            sphere.setAttribute('visible', false);
            sphere.setAttribute('id', id);
            document.querySelector('a-scene').appendChild(sphere);
            players[id] = sphere; // Store the sphere for future reference


            // Generate a random color
            const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            // Create a GLTF model for the player
            const playerModel = document.createElement('a-entity');
            playerModel.setAttribute('gltf-model', 'models/Character.glb');
            playerModel.setAttribute('position', position); // Set the same position as the sphere
            playerModel.setAttribute('scale', '1 1 1');
            // Set the material with the random color
            playerModel.setAttribute(
                'material',
                `shader: standard; color: ${randomColor};`
            );
            playerModel.setAttribute('shadow', 'receive: true; cast: true');
            document.querySelector('a-scene').appendChild(playerModel);
            players[id].model = playerModel; // Store the model for future reference


            // Create a text label for the player's name
            const playerNameText = document.createElement('a-text');
            playerNameText.setAttribute('value', name); //////
            playerNameText.setAttribute('align', 'center');
            playerNameText.setAttribute('color', 'black');
            playerNameText.setAttribute('width', '20'); // Adjust width if needed
            playerNameText.object3D.position.set(position.x, position.y + 4.2, position.z); // Position above the sphere

            // Append text to the scene and link it to the player
            document.querySelector('a-scene').appendChild(playerNameText);
            players[id].nameText = playerNameText; // Store the text element for future updates

            console.log(`Created sphere for player ${id} with name tag at position`, position); // Debug
        }

        // Calculate and display the closest point
        function updateClosestPoint() {
            const playerPos = player.getAttribute('position');
            let closestPoint = null;
            let closestDistance = Infinity;

            // Iterate over defined points to find the closest one
            points.forEach(point => {
                const pointPos = point.element.getAttribute('position');
                const distance = Math.sqrt(
                    Math.pow(pointPos.x - playerPos.x, 2) +
                    Math.pow(pointPos.y - playerPos.y, 2) +
                    Math.pow(pointPos.z - playerPos.z, 2)
                );

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = point.id; // Keep track of the closest point
                }
            });
        
            // Send the closest point to the server
            socket.emit('updateSupportPoint', {
                playerId: socket.id,  // Send player ID to the server
                supportPoint: closestPoint // Send closest point ID
            });
        
        }

        // Calculate and display the closest point
        function updateClosestPoint1() {
            const playerPos = player.getAttribute('position');
            let closestPoint = null;
            let closestDistance = Infinity;

            // Iterate over defined points to find the closest one
            points2.forEach(point => {
                const pointPos = point.element.getAttribute('position');
                const distance = Math.sqrt(
                    Math.pow(pointPos.x - playerPos.x, 2) +
                    Math.pow(pointPos.y - playerPos.y, 2) +
                    Math.pow(pointPos.z - playerPos.z, 2)
                );

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = point.id; // Keep track of the closest point
                }
            });

            //console.log(closestPoint)
        
            // Send the closest point to the server
            socket.emit('updateSupportPoint1', {
                playerId: socket.id,  // Send player ID to the server
                supportPoint: closestPoint // Send closest point ID
            });
        
        }
        
        // Calculate and display the closest point
        function updateClosestPoint2() {
            const playerPos = player.getAttribute('position');
            let closestPoint = null;
            let closestDistance = Infinity;

            // Iterate over defined points to find the closest one
            points2.forEach(point => {
                const pointPos = point.element.getAttribute('position');
                const distance = Math.sqrt(
                    Math.pow(pointPos.x - playerPos.x, 2) +
                    Math.pow(pointPos.y - playerPos.y, 2) +
                    Math.pow(pointPos.z - playerPos.z, 2)
                );

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = point.id; // Keep track of the closest point
                }
            });

            //console.log(closestPoint)
        
            // Send the closest point to the server
            socket.emit('updateSupportPoint2', {
                playerId: socket.id,  // Send player ID to the server
                supportPoint: closestPoint // Send closest point ID
            });
        
        }

        // Calculate and display the closest point
        function updateClosestPoint3() {
            const playerPos = player.getAttribute('position');
            let closestPoint = null;
            let closestDistance = Infinity;

            // Iterate over defined points to find the closest one
            points2.forEach(point => {
                const pointPos = point.element.getAttribute('position');
                const distance = Math.sqrt(
                    Math.pow(pointPos.x - playerPos.x, 2) +
                    Math.pow(pointPos.y - playerPos.y, 2) +
                    Math.pow(pointPos.z - playerPos.z, 2)
                );

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPoint = point.id; // Keep track of the closest point
                }
            });

            //console.log(closestPoint)
        
            // Send the closest point to the server
            socket.emit('updateSupportPoint3', {
                playerId: socket.id,  // Send player ID to the server
                supportPoint: closestPoint // Send closest point ID
            });
        
        }



        // Listen for support point updates from the server
        socket.on('supportPoint1Update', (data) => {
            const { pointCountsRound0, playerId, supportPoint, playerScores } = data;

            console.log(pointCountsRound0)

            // Update the HTML with the latest counts
            document.getElementById('point1Count').textContent = `Player 1 Supporters: ${pointCountsRound0.point5}`;
            document.getElementById('point2Count').textContent = `Player 2 Supporters: ${pointCountsRound0.point6}`;

            // Assume these are the values to compare
            const point5 = pointCountsRound0.point5;
            const point6 = pointCountsRound0.point6;

            // Determine the higher count and corresponding player number
            let winningPlayer = 0;  // This will hold the player number (1 or 2)
            if (point5 > point6) {
                drawAndDisplayTriangles(document.querySelector('a-scene'), 1, x1aa, y1aa, x2aa, y2aa, x3aa, y3aa, triangleGroup4, colora, 50, 50);
                winningPlayer = 1;
            } else if (point6 > point5) {
                drawAndDisplayTriangles(document.querySelector('a-scene'), 1, x1ab, y1ab, x2ab, y2ab, x3ab, y3ab, triangleGroup5, colora, 50, 50);
                winningPlayer = 2;
            } else {
                winningPlayer = "It's a tie!";
            }

            drawAndDisplayTriangles(document.querySelector('a-scene'), 2, x1a, y1a, x2a, y2a, x3a, y3a, triangleGroup1, colora, 50, 50);

            // Display the result based on the comparison
            if (typeof winningPlayer === "number") {  // Only show a message if there’s a winning player
                document.getElementById('gameStartedText1a').innerText = `Player ${winningPlayer}`;
                document.getElementById('gameStartedText1b').innerText = 'You made it into the chamber of secrets, sit on your chair';
            } else {
                document.getElementById('gameStartedText1a').innerText = winningPlayer;
                document.getElementById('gameStartedText1b').innerText = ''; // Clear the second line if it's a tie
            }

            roundEndMessage1.style.display = 'flex'; // Show the message

            // Hide the message after 5 seconds of being shown
            setTimeout(() => {
                roundEndMessage1.style.display = 'none';
            }, 5000);
            });

        // Listen for support point updates from the server
        socket.on('supportPoint2Update', (data) => {
            const { pointCountsRound0, playerId, supportPoint, playerScores } = data;

            console.log(pointCountsRound0)

            // Update the HTML with the latest counts
            document.getElementById('point1Count').textContent = `Player 1 Supporters: ${pointCountsRound0.point5}`;
            document.getElementById('point2Count').textContent = `Player 2 Supporters: ${pointCountsRound0.point6}`;

            // Assume these are the values to compare
            const point5 = pointCountsRound0.point5;
            const point6 = pointCountsRound0.point6;

            // Determine the higher count and corresponding player number
            let winningPlayer = 0;  // This will hold the player number (1 or 2)
            if (point5 > point6) {
                drawAndDisplayTriangles(document.querySelector('a-scene'), 1, x1bb, y1bb, x2bb, y2bb, x3bb, y3bb, triangleGroup7, colorb, 50, 50);
                winningPlayer = 1;
            } else if (point6 > point5) {
                drawAndDisplayTriangles(document.querySelector('a-scene'), 1, x1ba, y1ba, x2ba, y2ba, x3ba, y3ba, triangleGroup6, colorb, 50, 50);
                winningPlayer = 2;
            } else {
                winningPlayer = "It's a tie!";
            }

            drawAndDisplayTriangles(document.querySelector('a-scene'), 2, x1b, y1b, x2b, y2b, x3b, y3b, triangleGroup2, colorb, 50, 50);

            // Display the result based on the comparison
            if (typeof winningPlayer === "number") {  // Only show a message if there’s a winning player
                document.getElementById('gameStartedText1a').innerText = `Player ${winningPlayer}`;
                document.getElementById('gameStartedText1b').innerText = 'You made it into the chamber of secrets, sit on your chair';
            } else {
                document.getElementById('gameStartedText1a').innerText = winningPlayer;
                document.getElementById('gameStartedText1b').innerText = ''; // Clear the second line if it's a tie
            }

            roundEndMessage1.style.display = 'flex'; // Show the message

            // Hide the message after 5 seconds of being shown
            setTimeout(() => {
                roundEndMessage1.style.display = 'none';
            }, 5000);
        });

        // Listen for support point updates from the server
        socket.on('supportPoint3Update', (data) => {
            const { pointCountsRound0, playerId, supportPoint, playerScores } = data;

            console.log(pointCountsRound0)

            // Update the HTML with the latest counts
            document.getElementById('point1Count').textContent = `Player 1 Supporters: ${pointCountsRound0.point5}`;
            document.getElementById('point2Count').textContent = `Player 2 Supporters: ${pointCountsRound0.point6}`;

            // Assume these are the values to compare
            const point5 = pointCountsRound0.point5;
            const point6 = pointCountsRound0.point6;


            
            

            // Determine the higher count and corresponding player number
            let winningPlayer = 0;  // This will hold the player number (1 or 2)
            if (point5 > point6) {
                drawAndDisplayTriangles(document.querySelector('a-scene'), 1, x1ca, y1ca, x2ca, y2ca, x3ca, y3ca, triangleGroup8, colorc, 50, 50);
                winningPlayer = 1;
            } else if (point6 > point5) {
                drawAndDisplayTriangles(document.querySelector('a-scene'), 1, x1cb, y1cb, x2cb, y2cb, x3cb, y3cb, triangleGroup9, colorc, 50, 50);
                winningPlayer = 2;
            } else {
                winningPlayer = "It's a tie!";
            }

            drawAndDisplayTriangles(document.querySelector('a-scene'), 2, x1c, y1c, x2c, y2c, x3c, y3c, triangleGroup3, colorc, 50, 50);

            // Display the result based on the comparison
            if (typeof winningPlayer === "number") {  // Only show a message if there’s a winning player
                document.getElementById('gameStartedText1a').innerText = `Player ${winningPlayer}`;
                document.getElementById('gameStartedText1b').innerText = 'You made it into the chamber of secrets, sit on your chair';
            } else {
                document.getElementById('gameStartedText1a').innerText = winningPlayer;
                document.getElementById('gameStartedText1b').innerText = ''; // Clear the second line if it's a tie
            }

            roundEndMessage1.style.display = 'flex'; // Show the message

            // Hide the message after 5 seconds of being shown
            setTimeout(() => {
                roundEndMessage1.style.display = 'none';
            }, 5000);
        });

        // Listen for support point updates from the server
        socket.on('supportPointUpdate', (data) => {
            const { pointCounts, playerId, supportPoint, playerScores } = data;

            console.log(pointCounts.point1, pointCounts.point2, pointCounts.point3)


            // Update the HTML with the latest counts
            document.getElementById('point1Count').textContent = `Player 1 Supporters: ${pointCounts.point1}`;
            document.getElementById('point2Count').textContent = `Player 2 Supporters: ${pointCounts.point2}`;
            document.getElementById('point3Count').textContent = `Player 3 Supporters: ${pointCounts.point3}`;

            const absval = pointCounts.point1 + pointCounts.point2 + pointCounts.point3

            const val1 = Math.trunc(((pointCounts.point1 / absval) * 4) + playerScores.point1)
            const val2 = Math.trunc(((pointCounts.point2 / absval) * 4) + playerScores.point2)
            const val3 = Math.trunc(((pointCounts.point3 / absval) * 4) + playerScores.point3)

            // Initial draw with subdivision depth of 3
            drawAndDisplayTriangles(document.querySelector('a-scene'), val3, x1a, y1a, x2a, y2a, x3a, y3a, triangleGroup1, colora, 50, 50);
            drawAndDisplayTriangles(document.querySelector('a-scene'), val2, x1b, y1b, x2b, y2b, x3b, y3b, triangleGroup2, colorb, 50, 50);
            drawAndDisplayTriangles(document.querySelector('a-scene'), val1 , x1c, y1c, x2c, y2c, x3c, y3c, triangleGroup3, colorc, 50, 50);

        });

    
        // Joystick setup
        const joystick = nipplejs.create({
            zone: document.getElementById('joystick'),
            mode: 'static',
            position: { left: '50%', bottom: '20px' },
            size: 150,
            color: 'red'
        });
    
        let joystickActive = false; // Track joystick activity
        let currentMoveDirection = new THREE.Vector3(); // Store the current move direction

        // Joystick movement handling
        joystick.on('move', (evt, data) => {
            joystickActive = true; // Joystick is being manipulated
            const moveDistance = 0.3; // Movement speed
            const angle = data.angle.degree;

            const rad = angle * (Math.PI / 180); // Convert to radians

            // Get the camera's world direction
            const cameraDirection = new THREE.Vector3();
            camera.object3D.getWorldDirection(cameraDirection);
            
            // Project the camera direction onto the X-Z plane (ignore Y)
            cameraDirection.y = 0; // Set Y to zero for 2D movement
            cameraDirection.normalize(); // Normalize to get a unit vector

            // Calculate the movement direction based on joystick input
            currentMoveDirection.set(
                cameraDirection.z * Math.cos(rad) + cameraDirection.x * -Math.sin(rad), // Swapped to make 'up' move left
                0, // Keep Y at 0 for 2D movement
                cameraDirection.z * -Math.sin(rad) - cameraDirection.x * Math.cos(rad) // Swapped to make 'down' move right
            );

        });

        // Event when joystick is released
        joystick.on('end', () => {
            joystickActive = false; // Joystick is not being manipulated
            currentMoveDirection.set(0, 0, 0); // Reset direction
        });



        // Function to update text rotation for all players
        function updatePlayerNameTextRotations() {
            const cameraPosition = new THREE.Vector3();
            playerCamera.object3D.getWorldPosition(cameraPosition); // Get camera position

            const playerSphere = players[socket.id];
            //const nameText = playerSphere.nameText;
            // nameText.setAttribute('value', data.name); //////

            for (const id in players) {
                const playerNameText = players[id].nameText; // Assuming the text is a child of the player

                if (playerNameText) {
                    const textPosition = new THREE.Vector3();
                    playerNameText.object3D.getWorldPosition(textPosition);

                    playerNameText.object3D.lookAt(cameraPosition); // Make text face the camera
                }
            }
        }


        // Update loop
        function update() {
            if (joystickActive) {
                const moveDistance = 0.25; // Movement speed

                // Update player position based on the calculated direction
                player.object3D.position.x += currentMoveDirection.x * moveDistance;
                player.object3D.position.z += currentMoveDirection.z * moveDistance;

                // Update the player's sphere position to match the player entity
                const playerSphere = players[socket.id]; // Get the sphere associated with this player
                if (playerSphere) {
                    playerSphere.setAttribute('position', `${player.object3D.position.x} ${player.object3D.position.y} ${player.object3D.position.z}`);
                    
                    // Update the name tag position to stay above the player's sphere
                    const nameText = playerSphere.nameText;
                    if (nameText) {
                        nameText.setAttribute('position', `${player.object3D.position.x} ${player.object3D.position.y + 4.2} ${player.object3D.position.z}`);
                    }
                }

                const playerModel = players[socket.id].model;
                if (playerModel) {

                    // Generate a random color
                    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
                    playerModel.setAttribute(
                        'material',
                        `shader: standard; color: ${randomColor};`
                    );

                    playerModel.setAttribute('position', `${player.object3D.position.x} ${player.object3D.position.y} ${player.object3D.position.z}`);
                }
                    

                // Emit the new position to the server
                socket.emit('move', { id: socket.id, position: player.object3D.position });
            }
            updatePlayerNameTextRotations(); // Ensure name texts always face the camera
            requestAnimationFrame(update); // Continue the update loop
        }
        // Start the update loop
        update();








        // Select all box objects with the class 'interactive-box'
        const boxes = document.querySelectorAll('.interactive-box');
        const reactions = document.querySelectorAll('.reactions');

        // Loop through each box and add event listeners
        boxes.forEach((box) => {
            let isIntersected = false;

            // Store the original color in a dataset attribute
            box.dataset.originalColor = box.getAttribute('color');

            // Get the corresponding reaction model based on the box's ID
            const reactionModel = reactions[Math.trunc(box.id)];

            // Event listener for intersection
            box.addEventListener('raycaster-intersected', () => {
                
                // console.log(Math.trunc(box.id))
                // box.setAttribute('material', 'color', 'yellow');


                // Update the color for the GLTF model mesh
                const mesh = reactionModel.getObject3D('mesh');
                if (mesh) {
                    mesh.traverse((node) => {
                        if (node.isMesh) {
                            node.material.color.set('yellow');  // Set the color to yellow
                            node.material.needsUpdate = true;  // Ensure the material updates
                        }
                    });
                }
            });


            // Event listener for clearing intersection
            box.addEventListener('raycaster-intersected-cleared', () => {
                // Reset to original color
                // const originalColor = box.dataset.originalColor;
                // box.setAttribute('material', 'color', originalColor);

                // Reset the color for the GLTF model mesh
                const mesh = reactionModel.getObject3D('mesh');
                if (mesh) {
                    mesh.traverse((node) => {
                        console.log()
                        if (node.isMesh) {
                            node.material.color.set('green');  // Set the color to yellow
                            node.material.needsUpdate = true;  // Ensure the material updates
                        }
                    });
                }

            });

        });


        socket.on('newCube', (cubePosition) => {

            console.log(cubePosition)
            placeOtherCube(cubePosition)
            
        });
        

        socket.on('updateModelVisibility', (newVisibility) => {
            const modelContainer = document.getElementById('modelContainer');
            modelContainer.setAttribute('visible', newVisibility);
        });


        // Function to place cube at the player's current position
        function placeOtherCube(cubePosition) {
            // Create the cube
            const cube = document.createElement("a-box");
            cube.setAttribute("position", `${cubePosition.x + 11} ${cubePosition.y} ${cubePosition.z + 11}`);
            cube.setAttribute("color", "blue");
            grid.appendChild(cube);

        }


        // Function to place cube at the player's current position
        function placeCube() {
            const camera = player.object3D;
            const playerPos = new THREE.Vector3();
            camera.getWorldPosition(playerPos); 

            // Create the cube
            const cube = document.createElement("a-box");
            cube.setAttribute("position", `${playerPos.x + 11} ${playerPos.y} ${playerPos.z + 11}`);
            cube.setAttribute("color", "blue");
            grid.appendChild(cube);

            socket.emit('CubePosition', playerPos)
        }

        // Event listener for button click
        document.getElementById("placeButton").addEventListener("click", placeCube);
