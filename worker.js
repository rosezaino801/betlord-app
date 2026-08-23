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
h1{margin:0;font-size:22px}
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
}
nav button.active{
  background:#19d37e;
  color:#06120c;
}
main{padding:15px}
.hero{
  background:linear-gradient(135deg,#10283c,#0b1728);
  border-radius:18px;
  padding:20px;
  margin-bottom:18px;
}
.hero h2{margin-top:0}
.game{
  background:#0d1b2c;
  border:1px solid #1b2b40;
  border-radius:16px;
  padding:16px;
  margin-bottom:12px;
}
.teams{
  display:flex;
  justify-content:space-between;
  gap:15px;
  font-weight:bold;
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
  <button class="active">🏠 Home</button>
  <button>🏀 NBA</button>
  <button>⚽ Football</button>
  <button>🔥 Popular</button>
</nav>

<main>

<section class="hero">
  <h2>Today's Odds</h2>
  <p>Compare available betting markets in one place.</p>
</section>

<div id="games">
  <div class="loading">Loading games...</div>
</div>

</main>

<footer>
  BetLord • Sports Odds Dashboard
</footer>

<script>
async function loadGames(){

  const container = document.getElementById("games");

  try{

    const response = await fetch("/api/odds");

    if(!response.ok){
      throw new Error("API request failed");
    }

    const games = await response.json();

    if(!Array.isArray(games) || games.length === 0){
      container.innerHTML =
        '<div class="loading">No games available right now.</div>';
      return;
    }

    container.innerHTML = games.map(function(game){

      const totalMarket =
        game.bookmakers &&
        game.bookmakers[0] &&
        game.bookmakers[0].markets &&
        game.bookmakers[0].markets.find(function(m){
          return m.key === "totals";
        });

      let oddsHTML = "";

      if(totalMarket && totalMarket.outcomes){

        oddsHTML = totalMarket.outcomes.map(function(o){

          return '<div class="odd">' +
            '<span>' + (o.name || "") + '</span>' +
            (o.point ?? "") +
            ' @ ' +
            (o.price ?? "") +
            '</div>';

        }).join("");

      }

      return '<div class="game">' +

        '<div class="teams">' +
          '<div>' + (game.away_team || "Away") + '</div>' +
          '<div>VS</div>' +
          '<div>' + (game.home_team || "Home") + '</div>' +
        '</div>' +

        '<div class="odds">' +
          (oddsHTML || '<div class="odd">Odds unavailable</div>') +
        '</div>' +

      '</div>';

    }).join("");

  }catch(error){

    container.innerHTML =
      '<div class="error">' +
        'Unable to load odds right now.' +
      '</div>';

    console.error(error);
  }
}

loadGames();
</script>

</body>
</html>
`;

export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    if (url.pathname === "/api/odds") {

      const apiUrl =
        API_URL +
        "/v4/sports/upcoming/odds" +
        "?regions=uk,eu,us,au" +
        "&markets=h2h,spreads,totals" +
        "&oddsFormat=decimal" +
        "&apiKey=" +
        encodeURIComponent(env.BETLORD_API_KEY || "");

      const response = await fetch(apiUrl);

      return new Response(await response.text(), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response(HTML, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8"
      }
    });
  }
};
