const API_URL = "https://api.the-odds-api.com";

/*
===========================================================
 BETLORD — COMPLETE BASKETBALL ENGINE
===========================================================

• Automatically discovers basketball leagues
• Fetches games for today + next 24 hours
• Does NOT hard-code NBA or 46 games
• Uses all basketball leagues returned by The Odds API
• Uses totals / Over-Under
• Checks every bookmaker returned
• Creates BET OVER / BET UNDER / NO BET
• Lagos time
• API key stays inside Cloudflare
===========================================================
*/

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>BetLord</title>

<style>
*{box-sizing:border-box}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:#07111f;
  color:#fff;
}

header{
  padding:18px;
  background:#0b1728;
  display:flex;
  align-items:center;
  gap:12px;
  border-bottom:1px solid #1b2b40;
}

.logo{
  width:50px;
  height:50px;
  border-radius:14px;
  background:#19d37e;
  color:#06120c;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:28px;
  font-weight:bold;
}

h1{
  margin:0;
  font-size:23px;
}

header small{
  color:#9db0c5;
}

nav{
  display:flex;
  gap:8px;
  padding:12px;
  overflow-x:auto;
  background:#07111f;
}

nav button{
  border:0;
  border-radius:12px;
  padding:12px 17px;
  background:#142338;
  color:white;
  white-space:nowrap;
  font-size:15px;
}

nav button.active{
  background:#19d37e;
  color:#06120c;
}

main{
  max-width:950px;
  margin:auto;
  padding:14px;
}

.hero{
  background:linear-gradient(135deg,#10283c,#0b1728);
  border-radius:20px;
  padding:22px;
  margin-bottom:15px;
}

.hero h2{
  margin:0 0 8px;
  font-size:28px;
}

.hero p{
  margin:0;
  color:#aebed0;
  line-height:1.5;
}

.controls{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-bottom:12px;
}

.control{
  border:0;
  border-radius:12px;
  padding:14px;
  background:#142338;
  color:white;
  font-weight:bold;
}

.control.primary{
  background:#19d37e;
  color:#06120c;
}

.status{
  background:#102238;
  border:1px solid #1b2b40;
  border-radius:13px;
  padding:13px;
  margin-bottom:14px;
  color:#9db0c5;
  line-height:1.5;
}

.game{
  background:#0d1b2c;
  border:1px solid #1b2b40;
  border-radius:18px;
  padding:17px;
  margin-bottom:12px;
}

.league{
  color:#19d37e;
  font-size:12px;
  font-weight:bold;
  text-transform:uppercase;
  margin-bottom:9px;
}

.teams{
  display:flex;
  align-items:center;
  gap:10px;
}

.team{
  flex:1;
  font-weight:bold;
  font-size:16px;
  line-height:1.35;
}

.team.right{
  text-align:right;
}

.vs{
  color:#718399;
  font-size:12px;
  font-weight:bold;
}

.time{
  color:#718399;
  font-size:12px;
  margin-top:8px;
}

.odds{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-top:14px;
}

.odd{
  background:#15263a;
  border-radius:11px;
  padding:12px;
}

.odd-label{
  color:#8fa3b8;
  font-size:11px;
  font-weight:bold;
  margin-bottom:5px;
}

.odd-value{
  font-size:17px;
  font-weight:bold;
}

.prediction{
  margin-top:13px;
  border-radius:14px;
  padding:14px;
}

.prediction.bet{
  background:#102d22;
  border:1px solid #1c7149;
}

.prediction.no{
  background:#18283a;
  border:1px solid #344b63;
}

.pred-title{
  color:#19d37e;
  font-size:12px;
  font-weight:bold;
  margin-bottom:6px;
}

.no-title{
  color:#ffd35a;
  font-size:12px;
  font-weight:bold;
  margin-bottom:6px;
}

.pick{
  font-size:23px;
  font-weight:bold;
}

.no-pick{
  color:#ffd35a;
  font-size:23px;
  font-weight:bold;
}

.details{
  color:#a9b8c8;
  font-size:12px;
  line-height:1.5;
  margin-top:7px;
}

.metrics{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px;
  margin-top:10px;
}

.metric{
  background:#0b1a2b;
  border-radius:9px;
  padding:8px;
  text-align:center;
}

.metric span{
  display:block;
}

.metric .label{
  color:#718399;
  font-size:9px;
  margin-bottom:3px;
}

.metric .value{
  font-size:12px;
  font-weight:bold;
}

.loading{
  text-align:center;
  padding:40px 15px;
  color:#9db0c5;
}

.error{
  background:#351820;
  color:#ff9ca8;
  padding:15px;
  border-radius:13px;
  line-height:1.5;
}

.empty{
  background:#102238;
  padding:25px;
  border-radius:14px;
  color:#9db0c5;
  text-align:center;
  line-height:1.5;
}

footer{
  text-align:center;
  color:#718399;
  padding:30px 15px;
  font-size:11px;
  line-height:1.5;
}

@media(max-width:600px){
  .controls{
    grid-template-columns:1fr 1fr;
  }

  .team{
    font-size:14px;
  }
}
</style>
</head>

<body>

<header>
  <div class="logo">B</div>
  <div>
    <h1>BetLord</h1>
    <small>Smart Basketball Predictions</small>
  </div>
</header>

<nav>
  <button id="homeBtn" class="active">🏠 Home</button>
  <button id="basketBtn">🏀 Basketball</button>
  <button id="footballBtn">⚽ Football</button>
  <button id="popularBtn">🔥 Popular</button>
</nav>

<main>

<section class="hero">
  <h2>Today's Basketball</h2>
  <p>
    All basketball games currently available from the connected odds feed.
    BetLord analyses available Over/Under markets.
  </p>
</section>

<div class="controls">
  <button class="control primary" id="refreshBtn">
    🔄 Refresh
  </button>

  <button class="control" id="nextBtn">
    📅 Next Games
  </button>
</div>

<div id="status" class="status">
  Connecting to basketball data...
</div>

<div id="games">
  <div class="loading">
    🏀 Loading basketball games...
  </div>
</div>

</main>

<footer>
BetLord • Basketball Prediction Engine<br>
Market analysis only. Predictions are not guaranteed results.
</footer>

<script>

let currentMode = "today";

function escapeHTML(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function formatTime(value){

  if(!value){
    return "Time unavailable";
  }

  const date = new Date(value);

  if(Number.isNaN(date.getTime())){
    return "Time unavailable";
  }

  return date.toLocaleString("en-NG",{
    timeZone:"Africa/Lagos",
    day:"2-digit",
    month:"short",
    year:"numeric",
    hour:"2-digit",
    minute:"2-digit"
  });
}

function average(values){

  if(!values.length){
    return 0;
  }

  return values.reduce(
    (a,b)=>a+b,
    0
  ) / values.length;
}

function clamp(value,min,max){
  return Math.max(
    min,
    Math.min(max,value)
  );
}


/* =========================================================
   COLLECT ALL TOTALS
========================================================= */

function collectTotals(game){

  const markets = [];

  if(!Array.isArray(game.bookmakers)){
    return markets;
  }

  for(const bookmaker of game.bookmakers){

    if(!Array.isArray(bookmaker.markets)){
      continue;
    }

    for(const market of bookmaker.markets){

      if(market.key !== "totals"){
        continue;
      }

      if(!Array.isArray(market.outcomes)){
        continue;
      }

      const overs =
        market.outcomes.filter(
          x =>
            String(x.name).toLowerCase() === "over" &&
            Number.isFinite(Number(x.point)) &&
            Number.isFinite(Number(x.price))
        );

      const unders =
        market.outcomes.filter(
          x =>
            String(x.name).toLowerCase() === "under" &&
            Number.isFinite(Number(x.point)) &&
            Number.isFinite(Number(x.price))
        );

      for(const over of overs){

        const under =
          unders.find(
            x =>
              Math.abs(
                Number(x.point) -
                Number(over.point)
              ) < 0.01
          );

        if(!under){
          continue;
        }

        const overPrice =
          Number(over.price);

        const underPrice =
          Number(under.price);

        if(
          overPrice <= 1 ||
          underPrice <= 1
        ){
          continue;
        }

        markets.push({
          bookmaker:
            bookmaker.title ||
            bookmaker.key ||
            "Bookmaker",

          point:
            Number(over.point),

          over:
            overPrice,

          under:
            underPrice
        });
      }
    }
  }

  return markets;
}


/* =========================================================
   FIND MOST COMMON TOTAL LINE
========================================================= */

function findConsensus(markets){

  if(!markets.length){
    return null;
  }

  const groups = {};

  for(const market of markets){

    const key =
      market.point.toFixed(1);

    if(!groups[key]){
      groups[key] = [];
    }

    groups[key].push(market);
  }

  let best = null;

  for(const key of Object.keys(groups)){

    const group =
      groups[key];

    if(
      !best ||
      group.length > best.length
    ){
      best = group;
    }
  }

  if(!best){
    return null;
  }

  return {
    point:
      Number(best[0].point),

    over:
      average(
        best.map(x=>x.over)
      ),

    under:
      average(
        best.map(x=>x.under)
      ),

    books:
      best.length,

    sources:
      best
  };
}


/* =========================================================
   MARKET PROBABILITY
========================================================= */

function probabilities(over,under){

  const overRaw =
    1 / over;

  const underRaw =
    1 / under;

  const total =
    overRaw +
    underRaw;

  return {
    over:
      overRaw / total,

    under:
      underRaw / total
  };
}


/* =========================================================
   BETLORD PREDICTION
========================================================= */

function predict(game){

  const markets =
    collectTotals(game);

  if(!markets.length){
    return {
      available:false
    };
  }

  const consensus =
    findConsensus(markets);

  if(!consensus){
    return {
      available:false
    };
  }

  const p =
    probabilities(
      consensus.over,
      consensus.under
    );

  const difference =
    Math.abs(
      p.over -
      p.under
    );

  const direction =
    p.over >= p.under
      ? "OVER"
      : "UNDER";

  const selected =
    direction === "OVER"
      ? p.over
      : p.under;

  const agreementCount =
    markets.filter(
      market => {

        const bp =
          probabilities(
            market.over,
            market.under
          );

        const bookmakerDirection =
          bp.over >= bp.under
            ? "OVER"
            : "UNDER";

        return (
          bookmakerDirection ===
          direction
        );
      }
    ).length;

  const agreement =
    agreementCount /
    markets.length;

  const bookmakerScore =
    clamp(
      consensus.books / 6,
      0,
      1
    );

  const edgeScore =
    clamp(
      difference * 5,
      0,
      1
    );

  const confidence =
    Math.round(
      clamp(
        50 +
        edgeScore * 18 +
        agreement * 12 +
        bookmakerScore * 8,
        50,
        78
      )
    );

  let decision =
    "NO BET";

  let reason =
    "The market is too balanced.";

  if(
    consensus.books >= 2 &&
    difference >= 0.035 &&
    agreement >= 0.55 &&
    confidence >= 56
  ){

    decision =
      direction;

    reason =
      direction +
      " has the stronger market signal across " +
      consensus.books +
      " bookmaker(s).";
  }

  return {

    available:true,

    point:
      consensus.point,

    over:
      consensus.over,

    under:
      consensus.under,

    overProbability:
      p.over,

    underProbability:
      p.under,

    books:
      consensus.books,

    agreement,

    confidence,

    decision,

    reason
  };
}


/* =========================================================
   RENDER
========================================================= */

function renderGames(games){

  const container =
    document.getElementById("games");

  if(
    !Array.isArray(games) ||
    games.length === 0
  ){

    container.innerHTML =
      '<div class="empty">' +
      'No basketball games with available odds were returned by the data provider for this period.' +
      '</div>';

    return;
  }

  container.innerHTML =
    games.map(
      function(game){

        const prediction =
          predict(game);

        let odds = "";

        if(prediction.available){

          odds =
            '<div class="odd">' +
              '<div class="odd-label">OVER</div>' +
              '<div class="odd-value">' +
                escapeHTML(
                  prediction.point
                ) +
                ' @ ' +
                escapeHTML(
                  prediction.over.toFixed(2)
                ) +
              '</div>' +
            '</div>' +

            '<div class="odd">' +
              '<div class="odd-label">UNDER</div>' +
              '<div class="odd-value">' +
                escapeHTML(
                  prediction.point
                ) +
                ' @ ' +
                escapeHTML(
                  prediction.under.toFixed(2)
                ) +
              '</div>' +
            '</div>';

        }else{

          odds =
            '<div class="odd">' +
              '<div class="odd-label">TOTALS</div>' +
              '<div class="odd-value">Unavailable</div>' +
            '</div>';
        }


        let predictionHTML = "";

        if(!prediction.available){

          predictionHTML =
            '<div class="prediction no">' +

              '<div class="no-title">' +
                '⚠️ BETLORD SIGNAL' +
              '</div>' +

              '<div class="no-pick">' +
                'NO BET' +
              '</div>' +

              '<div class="details">' +
                'No usable Over/Under market was returned.' +
              '</div>' +

            '</div>';

        }else if(
          prediction.decision === "NO BET"
        ){

          predictionHTML =
            '<div class="prediction no">' +

              '<div class="no-title">' +
                '⚠️ BETLORD SIGNAL' +
              '</div>' +

              '<div class="no-pick">' +
                'NO BET' +
              '</div>' +

              '<div class="details">' +
                escapeHTML(
                  prediction.reason
                ) +
              '</div>' +

              '<div class="metrics">' +

                '<div class="metric">' +
                  '<span class="label">BOOKS</span>' +
                  '<span class="value">' +
                    prediction.books +
                  '</span>' +
                '</div>' +

                '<div class="metric">' +
                  '<span class="label">CONFIDENCE</span>' +
                  '<span class="value">' +
                    prediction.confidence +
                    '%' +
                  '</span>' +
                '</div>' +

                '<div class="metric">' +
                  '<span class="label">AGREEMENT</span>' +
                  '<span class="value">' +
                    Math.round(
                      prediction.agreement * 100
                    ) +
                    '%' +
                  '</span>' +
                '</div>' +

              '</div>' +

            '</div>';

        }else{

          predictionHTML =
            '<div class="prediction bet">' +

              '<div class="pred-title">' +
                '🤖 BETLORD PREDICTION' +
              '</div>' +

              '<div class="pick">' +
                'BET ' +
                escapeHTML(
                  prediction.decision
                ) +
                ' ' +
                escapeHTML(
                  prediction.point
                ) +
              '</div>' +

              '<div class="details">' +
                escapeHTML(
                  prediction.reason
                ) +
              '</div>' +

              '<div class="metrics">' +

                '<div class="metric">' +
                  '<span class="label">CONFIDENCE</span>' +
                  '<span class="value">' +
                    prediction.confidence +
                    '%' +
                  '</span>' +
                '</div>' +

                '<div class="metric">' +
                  '<span class="label">BOOKS</span>' +
                  '<span class="value">' +
                    prediction.books +
                  '</span>' +
                '</div>' +

                '<div class="metric">' +
                  '<span class="label">AGREEMENT</span>' +
                  '<span class="value">' +
                    Math.round(
                      prediction.agreement * 100
                    ) +
                    '%' +
                  '</span>' +
                '</div>' +

              '</div>' +

            '</div>';
        }


        return (

          '<div class="game">' +

            '<div class="league">' +
              escapeHTML(
                game.sport_title ||
                game.sport_key ||
                "Basketball"
              ) +
            '</div>' +

            '<div class="teams">' +

              '<div class="team">' +
                escapeHTML(
                  game.away_team
                ) +
              '</div>' +

              '<div class="vs">VS</div>' +

              '<div class="team right">' +
                escapeHTML(
                  game.home_team
                ) +
              '</div>' +

            '</div>' +

            '<div class="time">' +
              '🕒 ' +
              escapeHTML(
                formatTime(
                  game.commence_time
                )
              ) +
            '</div>' +

            '<div class="odds">' +
              odds +
            '</div>' +

            predictionHTML +

          '</div>'
        );
      }
    ).join("");
}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadBasketball(){

  const gamesElement =
    document.getElementById("games");

  const status =
    document.getElementById("status");

  gamesElement.innerHTML =
    '<div class="loading">' +
    '🏀 Loading ALL available basketball games...' +
    '</div>';

  status.textContent =
    "Searching basketball leagues and games...";

  try{

    const response =
      await fetch(
        "/api/basketball?mode=" +
        encodeURIComponent(
          currentMode
        ),
        {
          cache:"no-store"
        }
      );

    const data =
      await response.json();

    if(!response.ok){

      throw new Error(
        data.error ||
        "Basketball API request failed."
      );
    }

    const games =
      Array.isArray(data.games)
        ? data.games
        : [];

    status.textContent =
      games.length +
      " basketball game(s) found across " +
      (data.leagues || 0) +
      " basketball league(s).";

    renderGames(games);

  }catch(error){

    console.error(error);

    status.textContent =
      "Unable to load basketball data.";

    gamesElement.innerHTML =
      '<div class="error">' +
        escapeHTML(
          error.message
        ) +
      '</div>';
  }
}


/* =========================================================
   BUTTONS
========================================================= */

document
  .getElementById("refreshBtn")
  .addEventListener(
    "click",
    function(){
      loadBasketball();
    }
  );

document
  .getElementById("nextBtn")
  .addEventListener(
    "click",
    function(){

      currentMode =
        currentMode === "today"
          ? "next"
          : "today";

      this.textContent =
        currentMode === "today"
          ? "📅 Next Games"
          : "📅 Today's Games";

      loadBasketball();
    }
  );

document
  .getElementById("basketBtn")
  .addEventListener(
    "click",
    function(){

      document
        .querySelectorAll("nav button")
        .forEach(
          b => b.classList.remove("active")
        );

      this.classList.add("active");

      loadBasketball();
    }
  );

document
  .getElementById("homeBtn")
  .addEventListener(
    "click",
    function(){

      document
        .querySelectorAll("nav button")
        .forEach(
          b => b.classList.remove("active")
        );

      this.classList.add("active");

      currentMode = "today";

      loadBasketball();
    }
  );

document
  .getElementById("footballBtn")
  .addEventListener(
    "click",
    function(){

      alert(
        "Football will be connected after Basketball is working."
      );
    }
  );

document
  .getElementById("popularBtn")
  .addEventListener(
    "click",
    function(){

      alert(
        "Popular games will be connected after Basketball is working."
      );
    }
  );


loadBasketball();

</script>

</body>
</html>
`;


/* =========================================================
   CLOUDFLARE WORKER
========================================================= */

export default {

  async fetch(request, env){

    const url =
      new URL(request.url);

    const apiKey =
      env.BETLORD_API_KEY || "";

    /* -------------------------------------------------------
       API KEY CHECK
    ------------------------------------------------------- */

    if(!apiKey){

      return new Response(
        JSON.stringify({
          error:
            "BETLORD_API_KEY is missing in Cloudflare."
        }),
        {
          status:500,
          headers:{
            "Content-Type":
              "application/json"
          }
        }
      );
    }


    /* -------------------------------------------------------
       BASKETBALL ENDPOINT
    ------------------------------------------------------- */

    if(
      url.pathname ===
      "/api/basketball"
    ){

      const mode =
        url.searchParams.get("mode") ||
        "today";


      /* -----------------------------------------------------
         GET AVAILABLE SPORTS
      ----------------------------------------------------- */

      const sportsResponse =
        await fetch(
          API_URL +
          "/v4/sports/?apiKey=" +
          encodeURIComponent(apiKey)
        );


      if(!sportsResponse.ok){

        return new Response(
          JSON.stringify({
            error:
              "Unable to get available sports.",
            details:
              await sportsResponse.text()
          }),
          {
            status:
              sportsResponse.status,
            headers:{
              "Content-Type":
                "application/json"
            }
          }
        );
      }


      const sports =
        await sportsResponse.json();


      /* -----------------------------------------------------
         ONLY REAL BASKETBALL SPORTS
      ----------------------------------------------------- */

      const basketballSports =
        sports.filter(
          function(sport){

            if(!sport){
              return false;
            }

            const key =
              String(
                sport.key || ""
              ).toLowerCase();

            const group =
              String(
                sport.group || ""
              ).toLowerCase();

            const title =
              String(
                sport.title || ""
              ).toLowerCase();


            /*
              Basketball game feeds normally have
              basketball in their group.

              Exclude futures/championship markets.
            */

            const isBasketball =
              group === "basketball" ||
              group.includes("basketball") ||
              key.startsWith("basketball_") ||
              title.includes("basketball");


            const isFuture =
              key.includes("winner") ||
              key.includes("championship") ||
              key.includes("futures") ||
              title.includes("winner") ||
              title.includes("championship");


            return (
              sport.active === true &&
              isBasketball &&
              !isFuture
            );
          }
        );


      /* -----------------------------------------------------
         NIGERIA DAY
      ----------------------------------------------------- */

      const now =
        new Date();

      const formatter =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone:"Africa/Lagos",
            year:"numeric",
            month:"2-digit",
            day:"2-digit"
          }
        );

      const nigeriaDate =
        formatter.format(now);


      /*
        Start of today in Lagos.
      */

      const start =
        new Date(
          nigeriaDate +
          "T00:00:00+01:00"
        );


      /*
        Today mode:
        Lagos midnight -> next Lagos midnight.

        Next mode:
        next Lagos midnight -> 48 hours later.
      */

      let from;
      let to;

      if(mode === "next"){

        from =
          new Date(
            start.getTime() +
            24 * 60 * 60 * 1000
          );

        to =
          new Date(
            from.getTime() +
            48 * 60 * 60 * 1000
          );

      }else{

        from =
          start;

        to =
          new Date(
            start.getTime() +
            24 * 60 * 60 * 1000
          );
      }


      /* -----------------------------------------------------
         FETCH EACH BASKETBALL LEAGUE
      ----------------------------------------------------- */

      const allGames = [];


      /*
        Do them in small batches rather than firing
        every league simultaneously.

        This reduces the chance of Cloudflare/API
        throttling.
      */

      const BATCH_SIZE = 5;

      for(
        let i = 0;
        i < basketballSports.length;
        i += BATCH_SIZE
      ){

        const batch =
          basketballSports.slice(
            i,
            i + BATCH_SIZE
          );


        const batchResults =
          await Promise.all(
            batch.map(
              async function(sport){

                try{

                  const oddsURL =
                    API_URL +
                    "/v4/sports/" +
                    encodeURIComponent(
                      sport.key
                    ) +
                    "/odds" +
                    "?apiKey=" +
                    encodeURIComponent(
                      apiKey
                    ) +
                    "&regions=uk,eu" +
                    "&markets=h2h,spreads,totals" +
                    "&oddsFormat=decimal" +
                    "&dateFormat=iso" +
                    "&commenceTimeFrom=" +
                    encodeURIComponent(
                      from.toISOString()
                    ) +
                    "&commenceTimeTo=" +
                    encodeURIComponent(
                      to.toISOString()
                    );


                  const response =
                    await fetch(
                      oddsURL
                    );


                  if(!response.ok){

                    console.error(
                      "League failed:",
                      sport.key,
                      response.status
                    );

                    return [];
                  }


                  const data =
                    await response.json();


                  if(
                    !Array.isArray(data)
                  ){
                    return [];
                  }


                  return data.map(
                    function(game){

                      return {
                        ...game,

                        sport_title:
                          game.sport_title ||
                          sport.title ||
                          sport.key
                      };
                    }
                  );

                }catch(error){

                  console.error(
                    "League error:",
                    sport.key,
                    error
                  );

                  return [];
                }
              }
            )
          );


        for(
          const result of batchResults
        ){

          if(Array.isArray(result)){

            allGames.push(
              ...result
            );
          }
        }
      }


      /* -----------------------------------------------------
         REMOVE DUPLICATES
      ----------------------------------------------------- */

      const uniqueGames =
        Array.from(
          new Map(
            allGames.map(
              function(game){

                return [
                  game.id,
                  game
                ];
              }
            )
          ).values()
        );


      /* -----------------------------------------------------
         SORT
      ----------------------------------------------------- */

      uniqueGames.sort(
        function(a,b){

          return (
            new Date(
              a.commence_time
            ) -
            new Date(
              b.commence_time
            )
          );
        }
      );


      /* -----------------------------------------------------
         RETURN
      ----------------------------------------------------- */

      return new Response(
        JSON.stringify({

          success:true,

          date:
            nigeriaDate,

          timezone:
            "Africa/Lagos",

          mode,

          leagues:
            basketballSports.length,

          games:
            uniqueGames
        }),
        {
          status:200,

          headers:{
            "Content-Type":
              "application/json",

            "Cache-Control":
              "no-store",

            "Access-Control-Allow-Origin":
              "*"
          }
        }
      );
    }


    /* -------------------------------------------------------
       MAIN PAGE
    ------------------------------------------------------- */

    return new Response(
      HTML,
      {
        status:200,

        headers:{
          "Content-Type":
            "text/html;charset=UTF-8",

          "Cache-Control":
            "no-store"
        }
      }
    );
  }
};
