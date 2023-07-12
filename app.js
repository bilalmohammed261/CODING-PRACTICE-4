const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
//console.log(open);
let db;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error message:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
//API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT *
    FROM cricket_team;`;
  const playersData = await db.all(getPlayersQuery);
  // console.log("Hi");
   response.send(
 playersData.map((eachPlayer) =>
convertDbObjectToResponseObject(eachPlayer)
)
);
});

//API 2
app.post("/players/", async (request, response) => {
  const newPlayer = request.body;
  const { playerName, jerseyNumber, role } = newPlayer;
  const addQuery = `INSERT INTO cricket_team(player_name,jersey_number,role) 
  VALUES('${playerName}','${jerseyNumber}','${role}');`;
  await db.run(addQuery);
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //console.log(request.params);
  const getQuery = `SELECT *
    FROM cricket_team WHERE 
    player_id ='${playerId}';`;
  const dbResponse = await db.get(getQuery);
  response.send(convertDbObjectToResponseObject(dbResponse));

});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  // console.log(request.body);
  // { playerName: 'Maneesh', jerseyNumber: 54, role: 'All-rounder' }
  const { playerName, jerseyNumber, role } = request.body;
  const updateQuery = ` UPDATE cricket_team
    SET  
    player_name = '${playerName}',
    jersey_number =  '${jerseyNumber}',
    role = '${role}' 
    WHERE player_id ='${playerId}';`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});



//API 5

app.delete("/players/:playerId/",async(request,response)=>{
    const { playerId } = request.params;
    const deleteQuery = `
    DELETE FROM cricket_team
    WHERE player_id =${playerId};`;
    await db.run(deleteQuery);
    response.send("Player Removed");
});

module.exports = app;