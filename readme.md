# Space invaders

To get everything up and running you need to:

1. Start up the computer in the arcade machine
1. From that computer, run the server, the frontend and the input program (see instructions below)
1. From the secondary computer (connected to 2 screens) visit the dashboard and game pages

## Running the server

```
cd server
npm ci
npm run start
```

The snapshot of the current server state is stored in a json file inside `server/.node-persist`.
You can edit the server's state by editing the snapshot before starting the server. This is useful
for instance if you want to have an enormous waiting list of people without having to enter their names
manually.

## Running the frontend

```
cd frontend
npm ci
npm run start -- --host 0.0.0.0
```

Visit `localhost:4200/dashboard` to see the dashboard and `localhost:4200/game` to see the game.

## Running the input program

```
cd input
cargo run --release
```

Notice the `--release` flag, which is absolutely necessary if you expect the application to perform well. Without it,
the background soundtrack will not work properly.
