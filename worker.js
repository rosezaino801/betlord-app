const API_URL = "https://api.the-odds-api.com";

/*
===========================================================
 BETLORD — SMART BASKETBALL PREDICTION ENGINE
===========================================================
 FEATURES
 - Automatically discovers active basketball game leagues
 - EXCLUDES championship/futures/outright markets
 - Fetches today's basketball games
 - Collects Over/Under totals
 - Checks multiple bookmakers
 - Finds consensus total line
 - Removes bookmaker vig
 - Calculates:
     • market probability
     • bookmaker agreement
     • line stability
     • bookmaker coverage
     • confidence
 - Produces:
     • BET OVER
     • BET UNDER
     • NO BET
 - Uses Africa/Lagos timezone
 - API key remains private in Cloudflare Worker
===========================================================
*/

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1.0"
>

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
  padding:24px 20px;
  background:#0b1728;
  display:flex;
  align-items:center;
  gap:14px;
  border-bottom:1px solid #1b2b40;
}

.logo{
  width:58px;
  height:58px;
  border-radius:16px;
  background:#19d37e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:32px;
  font-weight:bold;
  color:#06120c;
}

h1{
  margin:0;
  font-size:27px;
}

header small{
  color:#9db0c5;
  font-size:14px;
}

nav{
  display:flex;
  gap:10px;
  padding:15px;
  overflow-x:auto;
  background:#07111f;
  scrollbar-width:none;
}

nav::-webkit-scrollbar{
  display:none;
}

nav button{
  border:0;
  border-radius:15px;
  padding:16px 24px;
  background:#142338;
  color:white;
  white-space:nowrap;
  font-size:17px;
  cursor:pointer;
}

nav button.active{
  background:#19d37e;
  color:#06120c;
}

main{
  padding:15px;
  max-width:900px;
  margin:auto;
}

.hero{
  background:linear-gradient(
    135deg,
    #10283c,
    #0b1728
  );
  border-radius:22px;
  padding:25px;
  margin-bottom:18px;
}

.hero h2{
  margin-top:0;
  font-size:30px;
}

.hero p{
  color:#b4c3d4;
  line-height:1.5;
  font-size:17px;
}

.refresh{
  width:100%;
  border:0;
  border-radius:15px;
  padding:17px;
  background:#19d37e;
  color:#06120c;
  font-weight:bold;
  font-size:17px;
  margin-bottom:15px;
  cursor:pointer;
}

.refresh:active{
  transform:scale(.99);
}

.status{
  background:#102238;
  border:1px solid #1b2b40;
  padding:16px;
  border-radius:15px;
  margin-bottom:15px;
  color:#9db0c5;
  line-height:1.5;
}

.game{
  background:#0d1b2c;
  border:1px solid #1b2b40;
  border-radius:21px;
  padding:18px;
  margin-bottom:15px;
}

.league{
  color:#19d37e;
  font-size:14px;
  font-weight:bold;
  margin-bottom:13px;
  text-transform:uppercase;
}

.teams{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  font-weight:bold;
  font-size:18px;
}

.team{
  flex:1;
  line-height:1.3;
}

.vs{
  color:#718399;
  font-size:13px;
  flex-shrink:0;
}

.time{
  color:#718399;
  font-size:13px;
  margin-top:9px;
}

.odds{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:9px;
  margin-top:16px;
}

.odd{
  background:#15263a;
  padding:15px;
  border-radius:13px;
}

.odd span{
  display:block;
  color:#9db0c5;
  font-size:12px;
  margin-bottom:7px;
  font-weight:bold;
}

.odd-value{
  font-size:18px;
}

.prediction{
  margin-top:15px;
  padding:17px;
  border-radius:16px;
}

.prediction.bet{
  background:#102d22;
  border:1px solid #1c7149;
}

.prediction.no-bet{
  background:#18283a;
  border:1px solid #344b63;
}

.prediction-title{
  color:#19d37e;
  font-size:14px;
  font-weight:bold;
  text-transform:uppercase;
  margin-bottom:9px;
}

.no-bet-title{
  color:#ffd35a;
  font-size:14px;
  font-weight:bold;
  text-transform:uppercase;
  margin-bottom:9px;
}

.pick{
  font-size:27px;
  font-weight:bold;
  line-height:1.2;
}

.no-bet-pick{
  color:#ffd35a;
  font-size:27px;
  font-weight:bold;
}

.confidence{
  margin-top:8px;
  color:#a9c8b9;
  font-size:14px;
}

.reason{
  margin-top:10px;
  color:#aab9c8;
  font-size:14px;
  line-height:1.55;
}

.metrics{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
  margin-top:13px;
}

.metric{
  background:#0b1a2b;
  border-radius:11px;
  padding:10px;
  text-align:center;
}

.metric-label{
  display:block;
  color:#718399;
  font-size:10px;
  margin-bottom:5px;
}

.metric-value{
  font-size:14px;
  font-weight:bold;
}

.loading{
  text-align:center;
  padding:45px 20px;
  color:#9db0c5;
}

.error{
  background:#351820;
  color:#ff9ca8;
  padding:17px;
  border-radius:15px;
  line-height:1.6;
}

.empty{
  background:#102238;
  color:#9db0c5;
  padding:28px;
  border-radius:16px;
  text-align:center;
  line-height:1.5;
}

footer{
  text-align:center;
  color:#718399;
  padding:35px 15px;
  line-height:1.7;
  font-size:12px;
}

@media(max-width:600px){

  main{
    padding:12px;
  }

  .hero{
    padding:22px;
  }

  .hero h2{
    font-size:28px;
  }

  .teams{
    font-size:16px;
  }

  .metrics{
    grid-template-columns:repeat(3,1fr);
  }

}

</style>

</head>

<body>

<header>

  <div class="logo">B</div>

  <div>
    <h1>BetLord</h1>

    <small>
      Smart Sports Odds
    </small>
  </div>

</header>

<nav>

  <button
    id="homeBtn"
  >
    🏠 Home
  </button>

  <button
    id="basketBtn"
    class="active"
  >
    🏀 Basketball
  </button>

  <button
    id="footballBtn"
  >
    ⚽ Football
  </button>

  <button
    id="popularBtn"
  >
    🔥 Popular
  </button>

</nav>

<main>

<section class="hero">

  <h2 id="pageTitle">
    Today's Basketball
  </h2>

  <p id="pageDescription">
    All available basketball games with
    intelligent Over/Under market analysis.
  </p>

</section>

<button
  class="refresh"
  onclick="loadBasketball()"
>
  🔄 Refresh Basketball Odds
</button>

<div
  id="status"
  class="status"
>
  Loading basketball data...
</div>

<div id="games">

  <div class="loading">
    🏀 Loading basketball games...
  </div>

</div>

</main>

<footer>

  BetLord • Smart Basketball Prediction Engine

  <br>

  Market signals are analytical estimates,
  not guaranteed results.

</footer>

<script>

/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================================
   TIME
========================================================= */

function formatTime(value){

  if(!value){
    return "";
  }

  const date =
    new Date(value);

  if(
    Number.isNaN(
      date.getTime()
    )
  ){
    return "";
  }

  return date.toLocaleString(
    "en-NG",
    {
      timeZone:"Africa/Lagos",
      day:"2-digit",
      month:"short",
      year:"numeric",
      hour:"2-digit",
      minute:"2-digit"
    }
  );

}


/* =========================================================
   MATH
========================================================= */

function average(values){

  if(
    !Array.isArray(values) ||
    values.length === 0
  ){
    return 0;
  }

  return values.reduce(
    function(sum,value){
      return sum + value;
    },
    0
  ) / values.length;

}


function median(values){

  if(
    !Array.isArray(values) ||
    values.length === 0
  ){
    return 0;
  }

  const sorted =
    values
      .slice()
      .sort(
        function(a,b){
          return a-b;
        }
      );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if(
    sorted.length % 2 === 0
  ){

    return (
      sorted[middle-1] +
      sorted[middle]
    ) / 2;

  }

  return sorted[middle];

}


function clamp(
  value,
  min,
  max
){

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );

}


/* =========================================================
   COLLECT TOTALS
========================================================= */

function collectTotals(game){

  const candidates = [];

  if(
    !game ||
    !Array.isArray(
      game.bookmakers
    )
  ){

    return candidates;

  }

  game.bookmakers.forEach(
    function(bookmaker){

      if(
        !Array.isArray(
          bookmaker.markets
        )
      ){

        return;

      }

      bookmaker.markets.forEach(
        function(market){

          if(
            market.key !== "totals"
          ){

            return;

          }

          if(
            !Array.isArray(
              market.outcomes
            )
          ){

            return;

          }

          const over =
            market.outcomes.find(
              function(outcome){

                return (
                  String(
                    outcome.name
                  ).toLowerCase() ===
                  "over"
                );

              }
            );

          const under =
            market.outcomes.find(
              function(outcome){

                return (
                  String(
                    outcome.name
                  ).toLowerCase() ===
                  "under"
                );

              }
            );

          if(
            !over ||
            !under
          ){

            return;

          }

          const point =
            Number(
              over.point
            );

          const underPoint =
            Number(
              under.point
            );

          const overPrice =
            Number(
              over.price
            );

          const underPrice =
            Number(
              under.price
            );

          if(
            !Number.isFinite(point) ||
            !Number.isFinite(underPoint) ||
            !Number.isFinite(overPrice) ||
            !Number.isFinite(underPrice)
          ){

            return;

          }

          if(
            Math.abs(
              point -
              underPoint
            ) > 0.01
          ){

            return;

          }

          if(
            overPrice <= 1 ||
            underPrice <= 1
          ){

            return;

          }

          candidates.push({

            bookmaker:
              bookmaker.title ||
              bookmaker.key ||
              "Bookmaker",

            bookmakerKey:
              bookmaker.key ||
              "",

            point,

            overPrice,

            underPrice

          });

        }
      );

    }
  );

  return candidates;

}


/* =========================================================
   GROUP TOTAL LINES
========================================================= */

function groupByLine(
  candidates
){

  const groups = {};

  candidates.forEach(
    function(item){

      const key =
        item.point.toFixed(1);

      if(
        !groups[key]
      ){

        groups[key] = [];

      }

      groups[key].push(item);

    }
  );

  return groups;

}


/* =========================================================
   PRICE SPREAD
========================================================= */

function calculatePriceSpread(
  group
){

  if(
    !group ||
    group.length < 2
  ){

    return 0;

  }

  const overPrices =
    group.map(
      x => x.overPrice
    );

  const underPrices =
    group.map(
      x => x.underPrice
    );

  return (
    Math.max(...overPrices) -
    Math.min(...overPrices) +
    Math.max(...underPrices) -
    Math.min(...underPrices)
  );

}


/* =========================================================
   CONSENSUS LINE
========================================================= */

function chooseConsensusLine(
  candidates
){

  if(
    candidates.length === 0
  ){

    return null;

  }

  const groups =
    groupByLine(
      candidates
    );

  let bestGroup =
    null;

  Object.values(groups)
    .forEach(
      function(group){

        if(!bestGroup){

          bestGroup =
            group;

          return;

        }

        if(
          group.length >
          bestGroup.length
        ){

          bestGroup =
            group;

          return;

        }

        if(
          group.length ===
          bestGroup.length
        ){

          const groupSpread =
            calculatePriceSpread(
              group
            );

          const bestSpread =
            calculatePriceSpread(
              bestGroup
            );

          if(
            groupSpread <
            bestSpread
          ){

            bestGroup =
              group;

          }

        }

      }
    );

  if(!bestGroup){

    return null;

  }

  return {

    point:
      median(
        bestGroup.map(
          x => x.point
        )
      ),

    overPrice:
      median(
        bestGroup.map(
          x => x.overPrice
        )
      ),

    underPrice:
      median(
        bestGroup.map(
          x => x.underPrice
        )
      ),

    bookmakers:
      bestGroup.length,

    sources:
      bestGroup

  };

}


/* =========================================================
   REMOVE VIG
========================================================= */

function calculateProbability(
  overPrice,
  underPrice
){

  if(
    overPrice <= 1 ||
    underPrice <= 1
  ){

    return null;

  }

  const overRaw =
    1 / overPrice;

  const underRaw =
    1 / underPrice;

  const total =
    overRaw +
    underRaw;

  if(
    total <= 0
  ){

    return null;

  }

  return {

    over:
      overRaw /
      total,

    under:
      underRaw /
      total

  };

}


/* =========================================================
   BOOKMAKER AGREEMENT
========================================================= */

function calculateAgreement(
  candidates,
  pick
){

  if(
    !candidates.length
  ){

    return 0;

  }

  let agreeing =
    0;

  candidates.forEach(
    function(item){

      const probabilities =
        calculateProbability(
          item.overPrice,
          item.underPrice
        );

      if(!probabilities){

        return;

      }

      const bookmakerPick =
        probabilities.over >
        probabilities.under

          ? "OVER"

          : probabilities.under >
            probabilities.over

            ? "UNDER"

            : "NONE";

      if(
        bookmakerPick ===
        pick
      ){

        agreeing++;

      }

    }
  );

  return (
    agreeing /
    candidates.length
  );

}


/* =========================================================
   LINE STABILITY
========================================================= */

function calculateLineStability(
  candidates,
  consensusPoint
){

  if(
    !candidates.length
  ){

    return 0;

  }

  const differences =
    candidates.map(
      function(item){

        return Math.abs(
          item.point -
          consensusPoint
        );

      }
    );

  const averageDifference =
    average(
      differences
    );

  if(
    averageDifference <= 0.1
  ){

    return 1;

  }

  if(
    averageDifference <= 0.25
  ){

    return 0.95;

  }

  if(
    averageDifference <= 0.5
  ){

    return 0.85;

  }

  if(
    averageDifference <= 1
  ){

    return 0.70;

  }

  if(
    averageDifference <= 1.5
  ){

    return 0.55;

  }

  return 0.40;

}


/* =========================================================
   PREDICTION ENGINE
========================================================= */

function buildPrediction(
  game
){

  const candidates =
    collectTotals(
      game
    );

  if(
    candidates.length === 0
  ){

    return {
      available:false
    };

  }

  const consensus =
    chooseConsensusLine(
      candidates
    );

  if(!consensus){

    return {
      available:false
    };

  }

  const probabilities =
    calculateProbability(
      consensus.overPrice,
      consensus.underPrice
    );

  if(!probabilities){

    return {
      available:false
    };

  }

  const pick =
    probabilities.over >
    probabilities.under

      ? "OVER"

      : probabilities.under >
        probabilities.over

        ? "UNDER"

        : "NONE";

  const probabilityEdge =
    Math.abs(
      probabilities.over -
      probabilities.under
    );

  const agreement =
    calculateAgreement(
      candidates,
      pick
    );

  const stability =
    calculateLineStability(
      candidates,
      consensus.point
    );

  const bookmakerScore =
    clamp(
      consensus.bookmakers /
      8,
      0,
      1
    );

  /*
    MODEL WEIGHTS

    Market probability = 45%
    Bookmaker agreement = 25%
    Line stability = 15%
    Bookmaker coverage = 15%
  */

  const rawScore =
    (
      probabilityEdge *
      0.45
    )
    +
    (
      agreement *
      0.25
    )
    +
    (
      stability *
      0.15
    )
    +
    (
      bookmakerScore *
      0.15
    );

  let confidence =
    50 +
    (
      rawScore *
      50
    );

  /*
    KEEP SMALL EDGES CONSERVATIVE
  */

  if(
    probabilityEdge < 0.02
  ){

    confidence =
      Math.min(
        confidence,
        52
      );

  }

  if(
    probabilityEdge < 0.04
  ){

    confidence =
      Math.min(
        confidence,
        56
      );

  }

  if(
    probabilityEdge < 0.06
  ){

    confidence =
      Math.min(
        confidence,
        61
      );

  }

  confidence =
    Math.round(
      clamp(
        confidence,
        50,
        75
      )
    );

  let decision =
    "NO BET";

  let reason = "";

  /*
    NO BET RULES
  */

  if(
    consensus.bookmakers < 2
  ){

    reason =
      "Not enough bookmakers are offering the same total line.";

  }

  else if(
    probabilityEdge < 0.025
  ){

    reason =
      "The Over/Under market is extremely balanced.";

  }

  else if(
    agreement < 0.55
  ){

    reason =
      "Bookmakers are not showing enough directional agreement.";

  }

  else if(
    stability < 0.55
  ){

    reason =
      "The available total lines are too spread out.";

  }

  else if(
    confidence < 55
  ){

    reason =
      "The market signal is too weak for a confident selection.";

  }

  else {

    decision =
      pick;

    reason =
      buildReason(
        pick,
        probabilities,
        agreement,
        stability,
        consensus.bookmakers
      );

  }

  return {

    available:true,

    point:
      consensus.point,

    overPrice:
      consensus.overPrice,

    underPrice:
      consensus.underPrice,

    bookmakers:
      consensus.bookmakers,

    overProbability:
      probabilities.over,

    underProbability:
      probabilities.under,

    probabilityEdge,

    agreement,

    stability,

    confidence,

    decision,

    reason

  };

}


/* =========================================================
   REASON
========================================================= */

function buildReason(
  pick,
  probabilities,
  agreement,
  stability,
  bookmakers
){

  const probabilityText =
    Math.round(
      (
        pick === "OVER"
          ? probabilities.over
          : probabilities.under
      ) *
      100
    );

  const agreementText =
    Math.round(
      agreement *
      100
    );

  const stabilityText =
    Math.round(
      stability *
      100
    );

  return (

    pick +
    " has the stronger market probability at " +
    probabilityText +
    "%. " +

    agreementText +
    "% of analysed bookmaker prices support the same direction, with " +

    stabilityText +
    "% line stability across " +

    bookmakers +
    " bookmaker(s)."

  );

}


/* =========================================================
   RENDER GAME
========================================================= */

function renderGames(
  games
){

  const container =
    document.getElementById(
      "games"
    );

  if(
    !Array.isArray(games) ||
    games.length === 0
  ){

    container.innerHTML =
      '<div class="empty">' +

      'No basketball games with available Over/Under markets were found for today.' +

      '</div>';

    return;

  }

  container.innerHTML =
    games.map(
      function(game){

        const prediction =
          buildPrediction(
            game
          );

        let oddsHTML =
          "";

        if(
          prediction.available
        ){

          oddsHTML =

            '<div class="odd">' +

              '<span>OVER</span>' +

              '<div class="odd-value">' +

                escapeHTML(
                  prediction.point
                ) +

                ' @ ' +

                escapeHTML(
                  prediction.overPrice.toFixed(2)
                ) +

              '</div>' +

            '</div>' +

            '<div class="odd">' +

              '<span>UNDER</span>' +

              '<div class="odd-value">' +

                escapeHTML(
                  prediction.point
                ) +

                ' @ ' +

                escapeHTML(
                  prediction.underPrice.toFixed(2)
                ) +

              '</div>' +

            '</div>';

        }

        else {

          oddsHTML =

            '<div class="odd">' +

              '<span>MARKET</span>' +

              '<div class="odd-value">' +

              'Over/Under unavailable' +

              '</div>' +

            '</div>';

        }


        let predictionHTML =
          "";


        if(
          prediction.available
        ){

          if(
            prediction.decision ===
            "NO BET"
          ){

            predictionHTML =

              '<div class="prediction no-bet">' +

                '<div class="no-bet-title">' +

                  '⚠️ BETLORD SIGNAL' +

                '</div>' +

                '<div class="no-bet-pick">' +

                  'NO BET' +

                '</div>' +

                '<div class="confidence">' +

                  'Over: ' +

                  Math.round(
                    prediction.overProbability *
                    100
                  ) +

                  '% • Under: ' +

                  Math.round(
                    prediction.underProbability *
                    100
                  ) +

                  '% • ' +

                  prediction.bookmakers +

                  ' bookmaker(s)' +

                '</div>' +

                '<div class="reason">' +

                  escapeHTML(
                    prediction.reason
                  ) +

                '</div>' +

                '<div class="metrics">' +

                  '<div class="metric">' +

                    '<span class="metric-label">' +

                      'EDGE' +

                    '</span>' +

                    '<span class="metric-value">' +

                      (
                        prediction.probabilityEdge *
                        100
                      ).toFixed(1) +

                      '%' +

                    '</span>' +

                  '</div>' +

                  '<div class="metric">' +

                    '<span class="metric-label">' +

                      'AGREEMENT' +

                    '</span>' +

                    '<span class="metric-value">' +

                      Math.round(
                        prediction.agreement *
                        100
                      ) +

                      '%' +

                    '</span>' +

                  '</div>' +

                  '<div class="metric">' +

                    '<span class="metric-label">' +

                      'STABILITY' +

                    '</span>' +

                    '<span class="metric-value">' +

                      Math.round(
                        prediction.stability *
                        100
                      ) +

                      '%' +

                    '</span>' +

                  '</div>' +

                '</div>' +

              '</div>';

          }

          else {

            predictionHTML =

              '<div class="prediction bet">' +

                '<div class="prediction-title">' +

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

                '<div class="confidence">' +

                  'Model confidence: ' +

                  prediction.confidence +

                  '% • ' +

                  prediction.bookmakers +

                  ' bookmaker(s)' +

                '</div>' +

                '<div class="reason">' +

                  escapeHTML(
                    prediction.reason
                  ) +

                '</div>' +

                '<div class="metrics">' +

                  '<div class="metric">' +

                    '<span class="metric-label">' +

                      'EDGE' +

                    '</span>' +

                    '<span class="metric-value">' +

                      (
                        prediction.probabilityEdge *
                        100
                      ).toFixed(1) +

                      '%' +

                    '</span>' +

                  '</div>' +

                  '<div class="metric">' +

                    '<span class="metric-label">' +

                      'AGREEMENT' +

                    '</span>' +

                    '<span class="metric-value">' +

                      Math.round(
                        prediction.agreement *
                        100
                      ) +

                      '%' +

                    '</span>' +

                  '</div>' +

                  '<div class="metric">' +

                    '<span class="metric-label">' +

                      'STABILITY' +

                    '</span>' +

                    '<span class="metric-value">' +

                      Math.round(
                        prediction.stability *
                        100
                      ) +

                      '%' +

                    '</span>' +

                  '</div>' +

                '</div>' +

              '</div>';

          }

        }

        else {

          predictionHTML =

            '<div class="prediction no-bet">' +

              '<div class="no-bet-title">' +

                '⚠️ BETLORD SIGNAL' +

              '</div>' +

              '<div class="no-bet-pick">' +

                'NO BET' +

              '</div>' +

              '<div class="reason">' +

                'There is not enough reliable Over/Under market data for this game.' +

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

      }
    ).join("");

}


/* =========================================================
   LOAD BASKETBALL
========================================================= */

async function loadBasketball(){

  const container =
    document.getElementById(
      "games"
    );

  const status =
    document.getElementById(
      "status"
    );

  container.innerHTML =
    '<div class="loading">' +

    '🏀 Finding today\\'s basketball games...' +

    '</div>';

  status.textContent =
    "Searching active basketball game leagues...";

  try{

    const response =
      await fetch(
        "/api/basketball",
        {
          method:"GET",
          cache:"no-store",
          headers:{
            "Accept":
              "application/json"
          }
        }
      );

    const data =
      await response.json()
        .catch(
          function(){
            return {};
          }
        );

    if(
      !response.ok
    ){

      throw new Error(
        data.error ||
        "Basketball API request failed."
      );

    }

    if(
      !data ||
      !Array.isArray(
        data.games
      )
    ){

      throw new Error(
        "Invalid basketball response."
      );

    }

    status.textContent =
      "Found " +
      data.games.length +
      " basketball game(s) across " +
      data.leagues +
      " active basketball league(s).";

    renderGames(
      data.games
    );

  }

  catch(error){

    console.error(
      "BETLORD:",
      error
    );

    status.textContent =
      "Basketball data could not be loaded.";

    container.innerHTML =

      '<div class="error">' +

        '<strong>Unable to load basketball odds.</strong>' +

        '<br><br>' +

        escapeHTML(
          error.message ||
          "Unknown error"
        ) +

      '</div>';

  }

}


/* =========================================================
   NAVIGATION
========================================================= */

function setActive(
  button
){

  document
    .querySelectorAll(
      "nav button"
    )
    .forEach(
      function(btn){

        btn.classList.remove(
          "active"
        );

      }
    );

  button.classList.add(
    "active"
  );

}


document
  .getElementById(
    "basketBtn"
  )
  .addEventListener(
    "click",
    function(){

      setActive(
        this
      );

      document
        .getElementById(
          "pageTitle"
        )
        .textContent =
        "Today's Basketball";

      document
        .getElementById(
          "pageDescription"
        )
        .textContent =
        "All available basketball games with intelligent Over/Under market analysis.";

      loadBasketball();

    }
  );


document
  .getElementById(
    "homeBtn"
  )
  .addEventListener(
    "click",
    function(){

      setActive(
        this
      );

      document
        .getElementById(
          "pageTitle"
        )
        .textContent =
        "Today's Basketball";

      document
        .getElementById(
          "pageDescription"
        )
        .textContent =
        "All available basketball games with intelligent Over/Under market analysis.";

      loadBasketball();

    }
  );


document
  .getElementById(
    "footballBtn"
  )
  .addEventListener(
    "click",
    function(){

      setActive(
        this
      );

      alert(
        "Football section will be connected next."
      );

    }
  );


document
  .getElementById(
    "popularBtn"
  )
  .addEventListener(
    "click",
    function(){

      setActive(
        this
      );

      alert(
        "Popular section will be connected next."
      );

    }
  );


/* =========================================================
   INITIAL LOAD
========================================================= */

loadBasketball();

</script>

</body>
</html>
`;


/* =========================================================
   SERVER
========================================================= */

export default {

  async fetch(
    request,
    env
  ){

    const url =
      new URL(
        request.url
      );

    const apiKey =
      env.BETLORD_API_KEY ||
      "";


    /* =====================================================
       API ENDPOINT
    ===================================================== */

    if(
      url.pathname ===
      "/api/basketball"
    ){

      if(!apiKey){

        return new Response(

          JSON.stringify({

            error:
              "BETLORD_API_KEY is missing from Cloudflare Worker secrets."

          }),

          {

            status:500,

            headers:{
              "Content-Type":
                "application/json",

              "Access-Control-Allow-Origin":
                "*"
            }

          }

        );

      }


      /* ===================================================
         GET SPORTS
      =================================================== */

      let sportsResponse;

      try{

        sportsResponse =
          await fetch(

            API_URL +
            "/v4/sports/?apiKey=" +
            encodeURIComponent(
              apiKey
            )

          );

      }

      catch(error){

        return new Response(

          JSON.stringify({

            error:
              "Could not connect to The Odds API."

          }),

          {

            status:502,

            headers:{
              "Content-Type":
                "application/json",

              "Access-Control-Allow-Origin":
                "*"
            }

          }

        );

      }


      if(
        !sportsResponse.ok
      ){

        const errorText =
          await sportsResponse.text();

        return new Response(

          JSON.stringify({

            error:
              "The Odds API /sports request failed.",

            details:
              errorText

          }),

          {

            status:
              sportsResponse.status,

            headers:{
              "Content-Type":
                "application/json",

              "Access-Control-Allow-Origin":
                "*"
            }

          }

        );

      }


      const sports =
        await sportsResponse.json();


      /* ===================================================
         FIND ONLY REAL BASKETBALL GAME SPORTS

         IMPORTANT:
         Championship winner/futures sports are excluded.
      =================================================== */

      const basketballSports =
        sports.filter(
          function(sport){

            if(!sport){
              return false;
            }

            const group =
              String(
                sport.group ||
                ""
              ).toLowerCase();

            const key =
              String(
                sport.key ||
                ""
              ).toLowerCase();

            const title =
              String(
                sport.title ||
                ""
              ).toLowerCase();

            /*
              Must be an active basketball sport.
            */

            if(
              sport.active !== true
            ){

              return false;

            }

            if(
              !group.includes(
                "basketball"
              )
            ){

              return false;

            }

            /*
              NEVER request normal game markets
              from outright/futures sports.
            */

            if(
              sport.has_outrights === true
            ){

              return false;

            }

            if(
              key.includes(
                "winner"
              )
            ){

              return false;

            }

            if(
              key.includes(
                "championship"
              )
            ){

              return false;

            }

            if(
              key.includes(
                "tournament"
              ) &&
              (
                key.includes(
                  "winner"
                ) ||
                title.includes(
                  "winner"
                )
              )
            ){

              return false;

            }

            return true;

          }
        );


      /* ===================================================
         TODAY IN NIGERIA
      =================================================== */

      const now =
        new Date();


      const nigeriaDate =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone:
              "Africa/Lagos",

            year:"numeric",

            month:"2-digit",

            day:"2-digit"
          }
        ).format(
          now
        );


      /*
        Nigeria is UTC+1.
      */

      const dayStart =
        new Date(
          nigeriaDate +
          "T00:00:00+01:00"
        );


      const nextDay =
        new Date(
          dayStart.getTime() +
          (
            24 *
            60 *
            60 *
            1000
          )
        );


      const commenceFrom =
        dayStart.toISOString();


      const commenceTo =
        nextDay.toISOString();


      /* ===================================================
         FETCH EACH REAL BASKETBALL LEAGUE
      =================================================== */

      const leagueResults =
        await Promise.all(

          basketballSports.map(
            async function(sport){

              const oddsUrl =

                API_URL +

                "/v4/sports/" +

                encodeURIComponent(
                  sport.key
                ) +

                "/odds" +

                "?regions=us,uk,eu,au" +

                "&markets=h2h,spreads,totals" +

                "&oddsFormat=decimal" +

                "&commenceTimeFrom=" +

                encodeURIComponent(
                  commenceFrom
                ) +

                "&commenceTimeTo=" +

                encodeURIComponent(
                  commenceTo
                ) +

                "&apiKey=" +

                encodeURIComponent(
                  apiKey
                );


              try{

                const response =
                  await fetch(
                    oddsUrl
                  );


                /*
                  A single unsupported/problematic
                  league must NOT destroy the entire
                  basketball feed.
                */

                if(
                  !response.ok
                ){

                  console.error(

                    "BETLORD skipped league:",

                    sport.key,

                    response.status

                  );

                  return {

                    games:[],

                    skipped:true,

                    sport:
                      sport.key

                  };

                }


                const games =
                  await response.json();


                if(
                  !Array.isArray(
                    games
                  )
                ){

                  return {

                    games:[],

                    skipped:true,

                    sport:
                      sport.key

                  };

                }


                return {

                  games:

                    games.map(
                      function(game){

                        return {

                          ...game,

                          sport_title:

                            game.sport_title ||

                            sport.title ||

                            sport.key

                        };

                      }
                    ),

                  skipped:false,

                  sport:
                    sport.key

                };

              }

              catch(error){

                console.error(

                  "BETLORD league error:",

                  sport.key,

                  error

                );

                return {

                  games:[],

                  skipped:true,

                  sport:
                    sport.key

                };

              }

            }
          )

        );


      /* ===================================================
         COMBINE GAMES
      =================================================== */

      const games =
        leagueResults
          .flatMap(
            function(result){

              return result.games;

            }
          )
          .filter(
            Boolean
          );


      /* ===================================================
         REMOVE DUPLICATES
      =================================================== */

      const unique =
        Array.from(

          new Map(

            games.map(
              function(game){

                return [

                  game.id,

                  game

                ];

              }
            )

          ).values()

        );


      /* ===================================================
         SORT BY START TIME
      =================================================== */

      unique.sort(
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


      /* ===================================================
         FINAL RESPONSE
      =================================================== */

      return new Response(

        JSON.stringify({

          success:true,

          date:
            nigeriaDate,

          timezone:
            "Africa/Lagos",

          leagues:
            basketballSports.length,

          games:
            unique

        }),

        {

          status:200,

          headers:{

            "Content-Type":
              "application/json",

            "Cache-Control":
              "no-store",

            "Access-Control-Allow-Origin":
              "*",

            "Access-Control-Allow-Methods":
              "GET,OPTIONS"

          }

        }

      );

    }


    /* =====================================================
       MAIN BETLORD PAGE
    ===================================================== */

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
