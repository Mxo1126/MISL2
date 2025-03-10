# Major Impact Softball League Website

A modern, responsive website for the Major Impact Softball League (MISL) built with TypeScript and Socket.IO for real-time updates.

## Features

- Live game scores and updates
- Team standings and statistics
- Player profiles and performance metrics
- League documents and resources
- Dark/Light theme support
- Offline functionality with Service Worker
- Real-time notifications for game updates

## Project Structure

```
misl-website/
├── src/
│   ├── services/
│   │   ├── websocket.ts
│   │   └── preferences.ts
│   ├── types.ts
│   └── main.ts
├── public/
│   ├── images/
│   ├── documents/
│   └── service-worker.js
├── dist/
│   └── js/
├── css/
├── index.html
├── teams.html
├── fixtures.html
├── live-scores.html
├── standings.html
├── stats.html
├── downloads.html
├── news.html
├── styles.css
├── package.json
└── tsconfig.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Technologies Used

- TypeScript
- Socket.IO for real-time updates
- Service Workers for offline functionality
- Jest for testing
- Modern CSS with CSS Variables
- Font Awesome icons

## Development

The project uses TypeScript for better type safety and developer experience. The code is organized into services and types for better maintainability.

Key components:
- `WebSocketService`: Handles real-time updates for live games
- `PreferencesService`: Manages user preferences including theme and notifications
- Service Worker: Provides offline functionality and caching

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
