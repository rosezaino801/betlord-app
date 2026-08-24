const API_URL = "https://api.the-odds-api.com";

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>BetLord</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  font-family:Arial,sans-serif;
  background:#07111f;
  color:white;
}

header{
  padding:20px;
  background:#0b1728;
  display:flex;
  align-items:center;
  gap:12px;
  border-bottom:1px solid #1b2b40;
}

.logo{
  width:48px;
  height:48px;
  border-radius:14px;
  background:#19d37e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:27px;
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
  gap:10px;
  padding:15px;
  overflow-x:auto;
}

nav button{
  border:0;
  border-radius:12px;
  padding:13px 18px;
  background:#142338;
  color:white;
  white-space:nowrap;
  font-size:16px;
}

nav button.active{
  background:#19d37e;
  color:#06120c;
}

main{
  padding:15px;
}

.hero{
  background:linear-gradient(135deg,#10283c,#0b1728);
  border-radius:20px;
  padding:22px;
  margin-bottom:18px;
}

.hero h2{
  margin-top:0;
  font-size:28px;
}

.hero p{
  color:#b4c3d4;
  line-height:1.5;
}

.refresh{
  width:100%;
  border:0;
  border-radius:12px;
  padding:15px;
  background:#19d37e;
  color:#06120c;
  font-weight:bold;
  font-size:16px;
  margin-bottom:15px;
}

.status{
  background:#102238;
  border:1px solid #1b2b40;
  padding:14px;
  border-radius:12px;
  margin-bottom:15px;
  color:#9db0c5;
  line-height:1.4;
}

.game{
  background:#0d1b2c;
  border:1px solid #1b2b40;
  border-radius:18px;
  padding:17px;
  margin-bottom:14px;
}

.league{
  color:#19d37e;
  font-size:12px;
  font-weight:bold;
  margin-bottom:12px;
  text-transform:uppercase;
}

.teams{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  font-weight:bold;
  font-size:17px;
}

.team{
  flex:1;
}

.vs{
  color:#718399;
  font-size:13px;
}

.time{
  color:#718399;
  font-size:12px;
  margin-top:9px;
}

.odds{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:9px;
  margin-top:15px;
}

.odd{
  background:#15263a;
  padding:13px;
  border-radius:11px;
}

.odd span{
  display:block;
  color:#9db0c5;
  font-size:12px;
  margin-bottom:6px;
}

.prediction{
  margin-top:15px;
  padding:16px;
  border-radius:14px;
}

.prediction.bet{
  background:#102d22;
  border:1px solid #1c7149;
}

.prediction.no-bet{
  background:#18283a;
  border:1px solid #34465b;
}

.prediction-title{
  font-size:13px;
  font-weight:bold;
  text-transform:uppercase;
  margin-bottom:8px;
}

.bet .prediction-title{
  color:#19d37e;
}

.no-bet .prediction-title{
  color:#ffd45c;
}

.pick{
  font-size:22px;
  font-weight:bold;
}

.no-bet .pick{
  color:#ffd45c;
}

.confidence{
  margin-top:7px;
  color:#a9c8b9;
  font-size:13px;
}

.no-bet .confidence{
  color:#a9b8c8;
}

.note{
  margin-top:9px;
  color:#8296aa;
  font-size:11px;
  line-height:1.5;
}

.loading{
  text-align:center;
  padding:35px;
  color:#9db0c5;
}

.error{
  background:#351820;
  color:#ff9ca8;
  padding:16px;
  border-radius:12px;
  line-height:1.5;
}

.no-pick{
  grid-column:1 / -1;
  padding:13px;
  border-radius:10px;
  background:#18283a;
  color:#9db0c5;
}

footer{
  text-align:center;
  color:#718399;
  padding:30px 15px;
  line-height:1.5;
}

@media(max-width:500px){

  .teams{
    font-size:16px;
  }

  .hero h2{
    font-size:26px;
  }

}
</style>
</head>

<body>

<header>

  <div class="logo">B</div>

  <div>
    <h1>BetLord</h1>
    <small>Smart Sports Odds</small>
  </div>

</header>

<nav>

  <button id="homeBtn">
    🏠 Home
  </button>

  <button id="basketBtn" class="active">
    🏀 Basketball
  </button>

  <button id="footballBtn">
    ⚽ Football
  </button>

  <button id="popularBtn">
    🔥 Popular
  </button>

</nav>

<main>

<section class="hero">

  <h2 id="pageTitle">
    Today's Basketball
  </h2>

  <p id="pageDescription">
    Available basketball games with Over/Under markets
    and BetLord market analysis.
  </p>

</section>

<button class="refresh" onclick="loadBasketball()">
  🔄 Refresh Basketball Odds
</button>

<div id="status" class="status">
  Loading basketball leagues...
</div>

<div id="games">

  <div class="loading">
    🏀 Loading games...
  </div>

</div>

</main>

<footer>

  BetLord • Smart Sports Odds Dashboard<br>

  Market signals are not guaranteed results.

</footer>

<script>

function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


function average(values){

  if(!values.length){
    return 0;
  }

  return values.reduce(function(total,value){

    return total + value;

  },0) / values.length;

}


function formatTime(value){

  if(!value){
    return "";
  }

  const date = new Date(value);

  if(Number.isNaN(date.getTime())){
    return "";
  }

  return date.toLocaleString([],{
    day:"2-digit",
    month:"short",
    hour:"2-digit",
    minute:"2-digit"
  });

}


/*
  BetLord market engine.

  It checks every bookmaker instead of only bookmaker #1.
*/

function getConsensusTotals(game){

  if(!Array.isArray(game.bookmakers)){
    return null;
  }

  const candidates = [];

  game.bookmakers.forEach(function(bookmaker){

    if(!Array.isArray(bookmaker.markets)){
      return;
    }

    bookmaker.markets.forEach(function(market){

      if(market.key !== "totals"){
        return;
      }

      if(!Array.isArray(market.outcomes)){
        return;
      }

      const over = market.outcomes.find(function(outcome){

        return outcome.name === "Over";

      });

      const under = market.outcomes.find(function(outcome){

        return outcome.name === "Under";

      });

      if(!over || !under){
        return;
      }

      if(over.point == null || under.point == null){
        return;
      }

      if(over.price == null || under.price == null){
        return;
      }

      const point = Number(over.point);

      const overPrice = Number(over.price);

      const underPrice = Number(under.price);

      if(!Number.isFinite(point)){
        return;
      }

      if(!Number.isFinite(overPrice)){
        return;
      }

      if(!Number.isFinite(underPrice)){
        return;
      }

      if(overPrice <= 1 || underPrice <= 1){
        return;
      }

      candidates.push({

        bookmaker:
          bookmaker.title ||
          bookmaker.key ||
          "Bookmaker",

        point:point,

        overPrice:overPrice,

        underPrice:underPrice

      });

    });

  });


  if(!candidates.length){
    return null;
  }


  /*
    Group bookmakers by their total line.
  */

  const groups = {};

  candidates.forEach(function(item){

    const key = String(item.point);

    if(!groups[key]){
      groups[key] = [];
    }

    groups[key].push(item);

  });


  let bestGroup = null;


  Object.values(groups).forEach(function(group){

    if(!bestGroup){

      bestGroup = group;

      return;

    }


    /*
      First priority:
      most bookmakers using the same line.
    */

    if(group.length > bestGroup.length){

      bestGroup = group;

      return;

    }


    /*
      If tied, prefer the line whose
      Over/Under pricing is more balanced.
    */

    if(group.length === bestGroup.length){

      const groupDifference =
        Math.abs(
          average(group.map(function(x){
            return x.overPrice;
          })) -
          average(group.map(function(x){
            return x.underPrice;
          }))
        );


      const bestDifference =
        Math.abs(
          average(bestGroup.map(function(x){
            return x.overPrice;
          })) -
          average(bestGroup.map(function(x){
            return x.underPrice;
          }))
        );


      if(groupDifference < bestDifference){

        bestGroup = group;

      }

    }

  });


  const avgOver =
    average(
      bestGroup.map(function(x){
        return x.overPrice;
      })
    );


  const avgUnder =
    average(
      bestGroup.map(function(x){
        return x.underPrice;
      })
    );


  /*
    Convert decimal odds into implied probability.
    Then remove bookmaker margin by normalizing them.
  */

  const overRaw = 1 / avgOver;

  const underRaw = 1 / avgUnder;

  const totalRaw =
    overRaw + underRaw;


  const overProbability =
    overRaw / totalRaw;


  const underProbability =
    underRaw / totalRaw;


  const overPercent =
    overProbability * 100;


  const underPercent =
    underProbability * 100;


  /*
    Difference between Over and Under.

    Example:

    Over 54%
    Under 46%

    Edge = 8 percentage points.
  */

  const edge =
    Math.abs(
      overPercent - underPercent
    );


  let pick = "NO BET";


  if(edge >= 6){

    pick =
      overPercent > underPercent
        ? "OVER"
        : "UNDER";

  }


  /*
    Signal strength.

    This is deliberately conservative.

    It is NOT claiming a 70% guaranteed
    chance of winning.
  */

  let confidence =
    Math.round(
      Math.max(
        overPercent,
        underPercent
      )
    );


  if(pick === "NO BET"){

    confidence =
      Math.round(
        Math.max(
          overPercent,
          underPercent
        )
      );

  }


  return {

    point:bestGroup[0].point,

    overPrice:avgOver,

    underPrice:avgUnder,

    bookmakers:bestGroup.length,

    pick:pick,

    overPercent:overPercent,

    underPercent:underPercent,

    edge:edge,

    confidence:confidence

  };

}


/*
  Render basketball games.
*/

function renderGames(games){

  const container =
    document.getElementById("games");


  if(!Array.isArray(games) || !games.length){

    container.innerHTML =
      '<div class="loading">' +
      'No basketball games with available odds right now.' +
      '</div>';

    return;

  }


  container.innerHTML =
    games.map(function(game){

      const totals =
        getConsensusTotals(game);


      let oddsHTML = "";

      let predictionHTML = "";


      if(totals){

        oddsHTML =

          '<div class="odd">' +

            '<span>OVER</span>' +

            escapeHTML(
              totals.point
            ) +

            ' @ ' +

            totals.overPrice.toFixed(2) +

          '</div>' +


          '<div class="odd">' +

            '<span>UNDER</span>' +

            escapeHTML(
              totals.point
            ) +

            ' @ ' +

            totals.underPrice.toFixed(2) +

          '</div>';


        if(totals.pick === "NO BET"){

          predictionHTML =

            '<div class="prediction no-bet">' +

              '<div class="prediction-title">' +
                '⚠️ BetLord Signal' +
              '</div>' +

              '<div class="pick">' +
                'NO BET' +
              '</div>' +

              '<div class="confidence">' +

                'Over: ' +
                totals.overPercent.toFixed(0) +
                '% • ' +

                'Under: ' +
                totals.underPercent.toFixed(0) +
                '%' +

              '</div>' +

              '<div class="note">' +

                'The Over/Under market is too close ' +
                'to call safely. BetLord will not force ' +
                'a selection.' +

              '</div>' +

            '</div>';

        }else{

          predictionHTML =

            '<div class="prediction bet">' +

              '<div class="prediction-title">' +
                '🤖 BetLord Prediction' +
              '</div>' +

              '<div class="pick">' +

                'BET ' +
                totals.pick +
                ' ' +
                totals.point +

              '</div>' +

              '<div class="confidence">' +

                'Market signal: ' +
                totals.confidence +
                '% • ' +
                totals.bookmakers +
                ' bookmaker(s)' +

              '</div>' +

              '<div class="note">' +

                'Consensus signal based on bookmaker ' +
                'Over/Under pricing. It is not a ' +
                'guarantee of the result.' +

              '</div>' +

            '</div>';

        }

      }else{

        oddsHTML =

          '<div class="no-pick">' +

          'Over/Under market currently unavailable.' +

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
                game.away_team ||
                "Away"
              ) +

            '</div>' +


            '<div class="vs">' +
              'VS' +
            '</div>' +


            '<div class="team" style="text-align:right">' +

              escapeHTML(
                game.home_team ||
                "Home"
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

            oddsHTML +

          '</div>' +


          predictionHTML +

        '</div>'

      );

    }).join("");

}


/*
  Load all currently active basketball leagues.
*/

async function loadBasketball(){

  const container =
    document.getElementById("games");


  const status =
    document.getElementById("status");


  container.innerHTML =
    '<div class="loading">' +
    '🏀 Loading basketball games...' +
    '</div>';


  status.textContent =
    "Finding available basketball leagues...";


  try{

    const response =
      await fetch("/api/basketball");


    if(!response.ok){

      const errorText =
        await response.text();

      throw new Error(
        errorText ||
        "Basketball API request failed"
      );

    }


    const data =
      await response.json();


    if(!data ||
       !Array.isArray(data.games)){

      throw new Error(
        "Invalid basketball response"
      );

    }


    status.textContent =
      "Found " +
      data.games.length +
      " basketball game(s) across " +
      (data.leagues || 0) +
      " available league(s).";


    renderGames(data.games);


  }catch(error){

    console.error(error);


    status.textContent =
      "Basketball data could not be loaded.";


    container.innerHTML =

      '<div class="error">' +

        'Unable to load basketball odds.' +

        '<br><br>' +

        escapeHTML(
          error.message
        ) +

      '</div>';

  }

}


/*
  Navigation.
*/

document
  .getElementById("basketBtn")
  .addEventListener("click",function(){

    setActive(this);

    document
      .getElementById("pageTitle")
      .textContent =
      "Today's Basketball";


    document
      .getElementById("pageDescription")
      .textContent =
      "Available basketball games with Over/Under markets and BetLord market analysis.";


    loadBasketball();

  });


document
  .getElementById("homeBtn")
  .addEventListener("click",function(){

    setActive(this);

    document
      .getElementById("pageTitle")
      .textContent =
      "Today's Basketball";


    document
      .getElementById("pageDescription")
      .textContent =
      "Available basketball games with Over/Under markets and BetLord market analysis.";


    loadBasketball();

  });


document
  .getElementById("footballBtn")
  .addEventListener("click",function(){

    setActive(this);

    alert(
      "Football section will be connected next."
    );

  });


document
  .getElementById("popularBtn")
  .addEventListener("click",function(){

    setActive(this);

    alert(
      "Popular section will be connected next."
    );

  });


function setActive(button){

  document
    .querySelectorAll("nav button")
    .forEach(function(btn){

      btn.classList.remove("active");

    });


  button.classList.add("active");

}


/*
  Start BetLord.
*/

loadBasketball();

</script>

</body>
</html>
`;


export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    const apiKey =
      env.BETLORD_API_KEY || "";


    /*
      Basketball API.
    */

    if(url.pathname === "/api/basketball"){

      if(!apiKey){

        return new Response(

          JSON.stringify({
            error:
              "BETLORD_API_KEY is missing"
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


      /*
        Get currently available sports.

        The sports endpoint does not consume
        normal odds quota.
      */

      const sportsResponse =
        await fetch(

          API_URL +
          "/v4/sports/?apiKey=" +
          encodeURIComponent(apiKey)

        );


      if(!sportsResponse.ok){

        return new Response(

          await sportsResponse.text(),

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


      /*
        Find active basketball leagues.
      */

      const basketballSports =
        sports.filter(function(sport){

          return (

            sport &&

            sport.active === true &&

            String(
              sport.group || ""
            )
            .toLowerCase()
            .includes("basketball")

          );

        });


      /*
        Request totals from every available
        basketball league.

        We use UK region here because it
        provides a useful bookmaker pool.

        We can change the region later if
        we get a direct SportyBet integration.
      */

      const requests =
        basketballSports.map(
          async function(sport){

            const oddsUrl =

              API_URL +

              "/v4/sports/" +

              encodeURIComponent(
                sport.key
              ) +

              "/odds" +

              "?regions=uk" +

              "&markets=totals" +

              "&oddsFormat=decimal" +

              "&apiKey=" +

              encodeURIComponent(
                apiKey
              );


            try{

              const response =
                await fetch(oddsUrl);


              if(!response.ok){

                return [];

              }


              const games =
                await response.json();


              if(!Array.isArray(games)){

                return [];

              }


              return games.map(
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
                "Basketball request failed:",
                sport.key,
                error
              );


              return [];

            }

          }
        );


      const results =
        await Promise.all(
          requests
        );


      const games =
        results
          .flat()
          .filter(Boolean);


      /*
        Remove duplicate games.
      */

      const unique =
        Array.from(

          new Map(

            games.map(function(game){

              return [
                game.id,
                game
              ];

            })

          ).values()

        );


      /*
        Earliest games first.
      */

      unique.sort(function(a,b){

        return (

          new Date(
            a.commence_time
          ) -

          new Date(
            b.commence_time
          )

        );

      });


      return new Response(

        JSON.stringify({

          leagues:
            basketballSports.length,

          games:
            unique

        }),

        {

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


    /*
      Main BetLord page.
    */

    return new Response(

      HTML,

      {

        headers:{

          "Content-Type":
            "text/html;charset=UTF-8"

        }

      }

    );

  }

};
