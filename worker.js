const API_URL = "https://api.the-odds-api.com";

/*
===========================================================
 BETLORD — SMARTER BASKETBALL PREDICTION ENGINE
===========================================================

What this version does:

1. Automatically discovers active basketball leagues.
2. Fetches today's basketball games.
3. Checks totals across ALL bookmakers returned.
4. Finds the strongest consensus total line.
5. Removes bookmaker margin (vig) when calculating probability.
6. Measures:
   - bookmaker agreement
   - price edge
   - line stability
   - market strength
7. Produces:
   - BET OVER
   - BET UNDER
   - NO BET
8. Never forces a prediction when the market is too close.
9. Uses Africa/Lagos as the display timezone.
10. Keeps BETLORD_API_KEY private inside Cloudflare Worker.

IMPORTANT:
This is a market-analysis engine, not a guarantee of results.
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
  padding:20px;
  background:#0b1728;
  display:flex;
  align-items:center;
  gap:12px;
  border-bottom:1px solid #1b2b40;
}

.logo{
  width:56px;
  height:56px;
  border-radius:15px;
  background:#19d37e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:30px;
  font-weight:bold;
  color:#06120c;
}

h1{
  margin:0;
  font-size:25px;
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
  border-radius:14px;
  padding:15px 22px;
  background:#142338;
  color:white;
  white-space:nowrap;
  font-size:16px;
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
  border-radius:20px;
  padding:24px;
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
  border-radius:14px;
  padding:16px;
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
  padding:15px;
  border-radius:14px;
  margin-bottom:15px;
  color:#9db0c5;
  line-height:1.4;
}

.game{
  background:#0d1b2c;
  border:1px solid #1b2b40;
  border-radius:20px;
  padding:18px;
  margin-bottom:15px;
}

.league{
  color:#19d37e;
  font-size:13px;
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
  padding:14px;
  border-radius:12px;
}

.odd span{
  display:block;
  color:#9db0c5;
  font-size:12px;
  margin-bottom:6px;
  font-weight:bold;
}

.odd-value{
  font-size:17px;
}

.prediction{
  margin-top:15px;
  padding:16px;
  border-radius:15px;
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
  font-size:13px;
  font-weight:bold;
  text-transform:uppercase;
  margin-bottom:8px;
}

.no-bet-title{
  color:#ffd35a;
  font-size:13px;
  font-weight:bold;
  text-transform:uppercase;
  margin-bottom:8px;
}

.pick{
  font-size:25px;
  font-weight:bold;
  line-height:1.2;
}

.no-bet-pick{
  color:#ffd35a;
  font-size:25px;
  font-weight:bold;
}

.confidence{
  margin-top:7px;
  color:#a9c8b9;
  font-size:14px;
}

.reason{
  margin-top:9px;
  color:#aab9c8;
  font-size:13px;
  line-height:1.5;
}

.note{
  margin-top:10px;
  color:#8296aa;
  font-size:11px;
  line-height:1.5;
}

.metrics{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:7px;
  margin-top:12px;
}

.metric{
  background:#0b1a2b;
  border-radius:10px;
  padding:9px;
  text-align:center;
}

.metric-label{
  display:block;
  color:#718399;
  font-size:10px;
  margin-bottom:4px;
}

.metric-value{
  font-size:13px;
  font-weight:bold;
}

.loading{
  text-align:center;
  padding:40px 20px;
  color:#9db0c5;
}

.error{
  background:#351820;
  color:#ff9ca8;
  padding:16px;
  border-radius:14px;
  line-height:1.5;
}

.empty{
  background:#102238;
  color:#9db0c5;
  padding:25px;
  border-radius:15px;
  text-align:center;
}

footer{
  text-align:center;
  color:#718399;
  padding:35px 15px;
  line-height:1.6;
  font-size:12px;
}

@media(max-width:600px){

  main{
    padding:12px;
  }

  .hero{
    padding:21px;
  }

  .hero h2{
    font-size:28px;
  }

  .teams{
    font-size:16px;
  }

  .odds{
    grid-template-columns:repeat(2,1fr);
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

  <button id="homeBtn">
    🏠 Home
  </button>

  <button
    id="basketBtn"
    class="active"
  >
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
   GET ALL TOTAL MARKETS
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
                  ).toLowerCase() === "over"
                );
              }
            );


          const under =
            market.outcomes.find(
              function(outcome){
                return (
                  String(
                    outcome.name
                  ).toLowerCase() === "under"
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


          /*
            Only accept genuine O/U pairs.
          */

          if(
            Math.abs(
              point - underPoint
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
   FIND CONSENSUS LINE
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

        if(
          !bestGroup
        ){

          bestGroup =
            group;

          return;

        }


        /*
          Primary:
          bookmaker count.

          Secondary:
          smaller line dispersion.

          Tertiary:
          more balanced market.
        */

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


  if(
    !bestGroup
  ){
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
   NORMALIZED MARKET PROBABILITY
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


  /*
    Decimal odds -> implied probability.
  */

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
      overRaw / total,

    under:
      underRaw / total

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


  /*
    Smaller difference =
    stronger stability.
  */

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
   MARKET BALANCE
========================================================= */

function calculateMarketBalance(
  probabilities
){

  if(!probabilities){
    return 0;
  }


  const difference =
    Math.abs(
      probabilities.over -
      probabilities.under
    );


  /*
    0 = perfectly balanced.
    Larger = stronger directional signal.
  */

  return clamp(
    difference * 2,
    0,
    1
  );

}


/* =========================================================
   SMART PREDICTION ENGINE
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


  const selectedProbability =
    pick === "OVER"
      ? probabilities.over
      : pick === "UNDER"
        ? probabilities.under
        : 0.50;


  const agreement =
    calculateAgreement(
      consensus.sources,
      pick
    );


  const stability =
    calculateLineStability(
      candidates,
      consensus.point
    );


  const marketBalance =
    calculateMarketBalance(
      probabilities
    );


  /*
    Market edge.

    Example:
    51% vs 49% = weak
    55% vs 45% = moderate
    60% vs 40% = strong
  */

  const probabilityEdge =
    Math.abs(
      probabilities.over -
      probabilities.under
    );


  /*
    Number of bookmakers matters.

    More independent books =
    stronger consensus.
  */

  const bookmakerScore =
    clamp(
      consensus.bookmakers / 8,
      0,
      1
    );


  /*
    Weighted model.

    Market probability:
      45%

    Bookmaker agreement:
      25%

    Line stability:
      15%

    Bookmaker coverage:
      15%
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


  /*
    Convert to a user-friendly confidence.

    The model intentionally keeps
    confidence conservative.
  */

  let confidence =
    50 +
    (
      rawScore *
      50
    );


  /*
    Small probability differences
    should never become huge confidence.
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


  /*
    NO BET rules.

    BetLord refuses to force a pick when:

    - probability difference is too small
    - bookmaker agreement is weak
    - too few bookmakers
    - market is unstable
  */

  let decision =
    "NO BET";


  let reason =
    "";


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
   EXPLANATION
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
      ) * 100
    );


  const agreementText =
    Math.round(
      agreement * 100
    );


  const stabilityText =
    Math.round(
      stability * 100
    );


  return (
    pick +
    " has the stronger market probability at " +
    probabilityText +
    "%. " +
    agreementText +
    "% of analysed bookmaker prices support the same direction, " +
    "with " +
    stabilityText +
    "% line stability across " +
    bookmakers +
    " bookmaker(s)."
  );

}


/* =========================================================
   RENDER GAMES
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


        let oddsHTML = "";


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
            '<div class="no-pick">' +
            'Over/Under market currently unavailable.' +
            '</div>';

        }


        let predictionHTML = "";


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
                    prediction.overProbability * 100
                  ) +

                  '% • Under: ' +

                  Math.round(
                    prediction.underProbability * 100
                  ) +

                  '%' +

                '</div>' +

                '<div class="reason">' +
                  escapeHTML(
                    prediction.reason
                  ) +
                '</div>' +

                '<div class="metrics">' +

                  '<div class="metric">' +

                    '<span class="metric-label">' +
                      'BOOKS' +
                    '</span>' +

                    '<span class="metric-value">' +
                      prediction.bookmakers +
                    '</span>' +

                  '</div>' +


                  '<div class="metric">' +

                    '<span class="metric-label">' +
                      'EDGE' +
                    '</span>' +

                    '<span class="metric-value">' +

                      (
                        prediction.probabilityEdge * 100
                      ).toFixed(1) +

                      '%' +

                    '</span>' +

                  '</div>' +


                  '<div class="metric">' +

                    '<span class="metric-label">' +
                      'STABILITY' +
                    '</span>' +

                    '<span class="metric-value">' +

                      Math.round(
                        prediction.stability * 100
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
                        prediction.probabilityEdge * 100
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
                        prediction.agreement * 100
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
                        prediction.stability * 100
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
    "Searching all available basketball leagues...";


  try{

    const response =
      await fetch(
        "/api/basketball",
        {
          cache:"no-store"
        }
      );


    if(
      !response.ok
    ){

      const text =
        await response.text();


      throw new Error(
        text ||
        "Basketball API request failed."
      );

    }


    const data =
      await response.json();


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
      (data.leagues || 0) +
      " available league(s).";


    renderGames(
      data.games
    );


  }
  catch(error){

    console.error(
      error
    );


    status.textContent =
      "Basketball data could not be loaded.";


    container.innerHTML =

      '<div class="error">' +

        'Unable to load basketball odds right now.' +

        '<br><br>' +

        escapeHTML(
          error.message
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


    /*
    ---------------------------------------------------------
    BASKETBALL API
    ---------------------------------------------------------
    */

    if(
      url.pathname ===
      "/api/basketball"
    ){

      if(!apiKey){

        return new Response(

          JSON.stringify({
            error:
              "BETLORD_API_KEY is missing."
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
      -------------------------------------------------------
      GET ALL SPORTS

      /sports does not consume odds quota.
      -------------------------------------------------------
      */

      const sportsResponse =
        await fetch(

          API_URL +
          "/v4/sports/?apiKey=" +
          encodeURIComponent(
            apiKey
          )

        );


      if(
        !sportsResponse.ok
      ){

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
      -------------------------------------------------------
      FIND ALL ACTIVE BASKETBALL LEAGUES
      -------------------------------------------------------
      */

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


            return (
              sport.active === true &&
              group.includes(
                "basketball"
              )
            );

          }

        );


      /*
      -------------------------------------------------------
      TODAY'S DATE IN NIGERIA
      -------------------------------------------------------
      */

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
      Convert Nigeria midnight boundaries
      to UTC ISO timestamps.

      Nigeria is UTC+1.
      -------------------------------------------------------
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


      /*
      -------------------------------------------------------
      FETCH EACH ACTIVE BASKETBALL LEAGUE
      -------------------------------------------------------
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

              "?regions=uk,eu,us,au" +

              "&markets=totals,h2h,spreads" +

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


              if(
                !response.ok
              ){

                console.error(
                  "Odds request failed:",
                  sport.key,
                  response.status
                );


                return [];

              }


              const games =
                await response.json();


              if(
                !Array.isArray(
                  games
                )
              ){

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

            }
            catch(error){

              console.error(
                "Failed basketball league:",
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


      /*
      -------------------------------------------------------
      COMBINE ALL GAMES
      -------------------------------------------------------
      */

      const games =
        results
          .flat()
          .filter(Boolean);


      /*
      -------------------------------------------------------
      REMOVE DUPLICATES
      -------------------------------------------------------
      */

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


      /*
      -------------------------------------------------------
      SORT BY START TIME
      -------------------------------------------------------
      */

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


      /*
      -------------------------------------------------------
      RESPONSE
      -------------------------------------------------------
      */

      return new Response(

        JSON.stringify({

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
              "*"

          }

        }

      );

    }


    /*
    ---------------------------------------------------------
    MAIN BETLORD PAGE
    ---------------------------------------------------------
    */

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
