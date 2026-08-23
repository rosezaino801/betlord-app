const API_URL = "https://api.the-odds-api.com";

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
  width:44px;
  height:44px;
  border-radius:12px;
  background:#19d37e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:24px;
  font-weight:bold;
}

h1{
  margin:0;
  font-size:22px;
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
  border-radius:10px;
  padding:11px 16px;
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
  padding:15px;
}

.hero{
  background:linear-gradient(135deg,#10283c,#0b1728);
  border-radius:18px;
  padding:20px;
  margin-bottom:18px;
}

.hero h2{
  margin-top:0;
}

.hero p{
  color:#b4c3d4;
}

.status{
  background:#102238;
  border:1px solid #1b2b40;
  padding:12px;
  border-radius:12px;
  margin-bottom:15px;
  color:#9db0c5;
}

.game{
  background:#0d1b2c;
  border:1px solid #1b2b40;
  border-radius:16px;
  padding:16px;
  margin-bottom:12px;
}

.league{
  color:#19d37e;
  font-size:12px;
  font-weight:bold;
  margin-bottom:10px;
  text-transform:uppercase;
}

.time{
  color:#718399;
  font-size:12px;
  margin-top:8px;
}

.teams{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  font-weight:bold;
}

.team{
  flex:1;
}

.vs{
  color:#718399;
  font-size:13px;
}

.odds{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;
  margin-top:14px;
}

.odd{
  background:#15263a;
  padding:12px;
  border-radius:10px;
}

.odd span{
  display:block;
  color:#9db0c5;
  font-size:12px;
  margin-bottom:5px;
}

.prediction{
  margin-top:14px;
  padding:14px;
  border-radius:12px;
  background:#102d22;
  border:1px solid #1c7149;
}

.prediction-title{
  color:#19d37e;
  font-size:12px;
  font-weight:bold;
  text-transform:uppercase;
  margin-bottom:6px;
}

.pick{
  font-size:20px;
  font-weight:bold;
}

.confidence{
  margin-top:5px;
  color:#a9c8b9;
  font-size:13px;
}

.note{
  margin-top:8px;
  color:#8296aa;
  font-size:11px;
  line-height:1.4;
}

.no-pick{
  margin-top:14px;
  padding:12px;
  border-radius:10px;
  background:#18283a;
  color:#9db0c5;
}

.loading{
  text-align:center;
  padding:30px;
  color:#9db0c5;
}

.error{
  background:#351820;
  color:#ff9ca8;
  padding:15px;
  border-radius:12px;
}

footer{
  text-align:center;
  color:#718399;
  padding:30px 15px;
  line-height:1.5;
}

.refresh{
  width:100%;
  border:0;
  border-radius:10px;
  padding:12px;
  background:#19d37e;
  color:#06120c;
  font-weight:bold;
  margin-bottom:15px;
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
  <button id="homeBtn">🏠 Home</button>
  <button id="basketBtn" class="active">🏀 Basketball</button>
  <button id="footballBtn">⚽ Football</button>
  <button id="popularBtn">🔥 Popular</button>
</nav>

<main>

<section class="hero">
  <h2 id="pageTitle">Today's Basketball</h2>
  <p id="pageDescription">
    Available basketball games with Over/Under markets and BetLord market analysis.
  </p>
</section>

<button class="refresh" onclick="loadBasketball()">
  🔄 Refresh Basketball Odds
</button>

<div id="status" class="status">
  Loading basketball leagues...
</div>

<div id="games">
  <div class="loading">Loading games...</div>
</div>

</main>

<footer>
  BetLord • Smart Sports Odds Dashboard<br>
  Predictions are market-based signals, not guaranteed results.
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

function formatTime(value){

  if(!value) return "";

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
  Find the best totals market across ALL bookmakers.

  The old code only checked:
  game.bookmakers[0]

  This version checks every bookmaker and looks for
  the most common totals line.
*/
function getConsensusTotals(game){

  const candidates = [];

  if(!Array.isArray(game.bookmakers)){
    return null;
  }

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

      const over = market.outcomes.find(function(o){
        return o.name === "Over";
      });

      const under = market.outcomes.find(function(o){
        return o.name === "Under";
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

      if(!Number.isFinite(point)){
        return;
      }

      const overPrice = Number(over.price);
      const underPrice = Number(under.price);

      if(!Number.isFinite(overPrice) || !Number.isFinite(underPrice)){
        return;
      }

      candidates.push({
        bookmaker: bookmaker.title || bookmaker.key || "Bookmaker",
        point: point,
        overPrice: overPrice,
        underPrice: underPrice
      });

    });

  });


  if(candidates.length === 0){
    return null;
  }


  /*
    Group by total point.

    Example:
    218.5 -> 5 bookmakers
    219.5 -> 1 bookmaker

    BetLord uses the line with the strongest bookmaker consensus.
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

    if(!bestGroup || group.length > bestGroup.length){
      bestGroup = group;
      return;
    }

    /*
      If equal number of bookmakers,
      prefer the group with the smallest
      average over/under price difference.
    */

    if(group.length === bestGroup.length){

      const groupDiff =
        Math.abs(
          average(group.map(x => x.overPrice)) -
          average(group.map(x => x.underPrice))
        );

      const bestDiff =
        Math.abs(
          average(bestGroup.map(x => x.overPrice)) -
          average(bestGroup.map(x => x.underPrice))
        );

      if(groupDiff < bestDiff){
        bestGroup = group;
      }

    }

  });


  const avgOver =
    average(bestGroup.map(x => x.overPrice));

  const avgUnder =
    average(bestGroup.map(x => x.underPrice));


  /*
    Convert decimal odds into normalized implied probabilities.

    This is NOT a guaranteed prediction.
    It is simply a market-consensus signal.
  */

  const overRaw = 1 / avgOver;
  const underRaw = 1 / avgUnder;

  const totalRaw = overRaw + underRaw;

  const overProbability = overRaw / totalRaw;
  const underProbability = underRaw / totalRaw;

  let pick;
  let probability;

  if(overProbability >= underProbability){
    pick = "OVER";
    probability = overProbability;
  }else{
    pick = "UNDER";
    probability = underProbability;
  }

  /*
    Keep displayed confidence conservative.
  */

  const confidence =
    Math.min(
      75,
      Math.max(
        50,
        Math.round(probability * 100)
      )
    );


  return {
    point: bestGroup[0].point,
    overPrice: avgOver,
    underPrice: avgUnder,
    bookmakers: bestGroup.length,
    pick: pick,
    confidence: confidence
  };
}


function average(values){

  if(!values.length){
    return 0;
  }

  return values.reduce(function(a,b){
    return a + b;
  },0) / values.length;
}


function renderGames(games){

  const container =
    document.getElementById("games");

  if(!Array.isArray(games) || games.length === 0){

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

      if(totals){

        oddsHTML =
          '<div class="odd">' +
            '<span>OVER</span>' +
            totals.point +
            ' @ ' +
            totals.overPrice.toFixed(2) +
          '</div>' +

          '<div class="odd">' +
            '<span>UNDER</span>' +
            totals.point +
            ' @ ' +
            totals.underPrice.toFixed(2) +
          '</div>';

      }else{

        oddsHTML =
          '<div class="no-pick">' +
          'Over/Under market currently unavailable' +
          '</div>';

      }


      let predictionHTML = "";

      if(totals){

        predictionHTML =
          '<div class="prediction">' +

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
              'Market confidence: ' +
              totals.confidence +
              '% • ' +
              totals.bookmakers +
              ' bookmaker(s)' +
            '</div>' +

            '<div class="note">' +
              'Signal is based on consensus Over/Under pricing. ' +
              'It is not a guarantee of the result.' +
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
              escapeHTML(game.away_team || "Away") +
            '</div>' +

            '<div class="vs">VS</div>' +

            '<div class="team" style="text-align:right">' +
              escapeHTML(game.home_team || "Home") +
            '</div>' +

          '</div>' +

          '<div class="time">' +
            '🕒 ' +
            escapeHTML(formatTime(game.commence_time)) +
          '</div>' +

          '<div class="odds">' +
            oddsHTML +
          '</div>' +

          predictionHTML +

        '</div>'

      );

    }).join("");

}


async function loadBasketball(){

  const container =
    document.getElementById("games");

  const status =
    document.getElementById("status");

  container.innerHTML =
    '<div class="loading">🏀 Loading basketball games...</div>';

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


    if(!data || !Array.isArray(data.games)){

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
      'Unable to load basketball odds right now.<br><br>' +
      escapeHTML(error.message) +
      '</div>';

  }

}


/*
  Navigation
*/

document
  .getElementById("basketBtn")
  .addEventListener("click",function(){

    setActive(this);
    loadBasketball();

  });


document
  .getElementById("homeBtn")
  .addEventListener("click",function(){

    setActive(this);

    document.getElementById("pageTitle").textContent =
      "Today's Basketball";

    document.getElementById("pageDescription").textContent =
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
  Initial load
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
      Basketball endpoint

      We first ask The Odds API which sports
      are currently active.

      /sports does NOT consume quota.
    */

    if(url.pathname === "/api/basketball"){

      if(!apiKey){

        return new Response(
          JSON.stringify({
            error:"BETLORD_API_KEY is missing"
          }),
          {
            status:500,
            headers:{
              "Content-Type":"application/json"
            }
          }
        );

      }


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
            status:sportsResponse.status,
            headers:{
              "Content-Type":"application/json"
            }
          }
        );

      }


      const sports =
        await sportsResponse.json();


      /*
        Select only active basketball sports.

        This means BetLord can automatically
        discover basketball leagues that are
        currently available rather than being
        permanently locked to NBA.
      */

      const basketballSports =
        sports.filter(function(sport){

          return (
            sport &&
            sport.active === true &&
            String(sport.group || "")
              .toLowerCase()
              .includes("basketball")
          );

        });


      /*
        Fetch each basketball league.

        We use one region to keep API usage
        reasonable.

        totals = Over/Under
        h2h = moneyline
        spreads = handicap
      */

      const requests =
        basketballSports.map(async function(sport){

          const oddsUrl =
            API_URL +
            "/v4/sports/" +
            encodeURIComponent(sport.key) +
            "/odds" +
            "?regions=uk" +
            "&markets=h2h,spreads,totals" +
            "&oddsFormat=decimal" +
            "&apiKey=" +
            encodeURIComponent(apiKey);


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


            return games.map(function(game){

              return {
                ...game,
                sport_title:
                  game.sport_title ||
                  sport.title ||
                  sport.key
              };

            });

          }catch(error){

            console.error(
              "Failed:",
              sport.key,
              error
            );

            return [];

          }

        });


      const results =
        await Promise.all(requests);


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
        Sort earliest games first.
      */

      unique.sort(function(a,b){

        return new Date(a.commence_time) -
               new Date(b.commence_time);

      });


      return new Response(
        JSON.stringify({
          leagues: basketballSports.length,
          games: unique
        }),
        {
          headers:{
            "Content-Type":"application/json",
            "Cache-Control":"no-store",
            "Access-Control-Allow-Origin":"*"
          }
        }
      );

    }


    /*
      Main page
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
