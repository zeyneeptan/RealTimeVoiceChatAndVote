REAL-TIME VOICE CHAT & VOTING SYSTEM

A real-time web application that enables voice communication using WebRTC and live voting.

## Features

Real-time voice communication between users using WebRTC.
Live voting system with Yes / No / Maybe options.
Vote history updates in real-time for all participants.
Reset votes feature that clears votes and history across all users.
WebSockets for real-time data synchronization.

## Prerequisites

Before you start, ensure you have the following installed:

Node.js (version 14+)
npm (or yarn)
A modern web browser (Google Chrome, Firefox, Edge)

## Setup Instructions

1. Clone the repository
2. Install dependencies
npm install  
3. Start the WebSocket & Signaling Server
node server.js  
The WebSocket server will start at ws://localhost:8080.

4. Open index.html in a browser
You can simply open index.html in a web browser.

## How It Works

Voice Communication (WebRTC)
Click "Start Call" to initiate a WebRTC audio call.
The connection will be established using a WebSocket signaling mechanism.
Click "End Call" to disconnect.
Live Voting System
Click "Yes", "No", or "Maybe" to cast a vote.
The vote count updates in real time across all open clients.
Vote history displays timestamps of all votes.
Reset Votes
Click "Reset Votes" to clear all votes and history.
This action applies to all connected users.

