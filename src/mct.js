/**
 * mahjong_check_tool
 * github   https://github.com/tamacool/mahjong_check_tool
 */

/**
 * htmlページのtableタグのElementオブジェクトを配列で格納
 * @type {Array}
 */
var tables = [];

/**
 * htmlページをロード完了後に呼び出される関数
 */
window.addEventListener('load', function(){

  document.querySelector("#linkArea").hidden = true;
  //document.querySelector("#linkArea").hidden = false;

  //モードセレクトボックスの初期化
  setupMode();

  //datalistの初期化
  //setDatalistNames();

  //URLからデフォルト値を取得
  setDefaultParameter();

  tables = [
    document.querySelector("#tonTable"),
    document.querySelector("#nanTable"),
    document.querySelector("#syaTable"),
    document.querySelector("#peiTable")
  ];

  for (var i=0; i<tables.length; i++){
    // セルの内周余白量を設定
    tables[i].cellPadding = "5";

    // セルの外周余白量を設定
    tables[i].cellSpacing = "1";

    // テーブル内の線ルールを設定　すべて
    tables[i].rules = "all";
    tables[i].border = "1";
  }
})

//ボタンを押した時の処理
function rankcheck(){

  //テーブル初期化
  for(i=0;i<4;i++){
    while (tables[i].rows.length > 0) tables[i].deleteRow(0);
  }

  var startPoints = [
    document.getElementById('tonchaPoint').value,
    document.getElementById('nanchaPoint').value,
    document.getElementById('syachaPoint').value,
    document.getElementById('peichaPoint').value
  ];

  var playerName = [
    document.getElementById('tonchaName').value,
    document.getElementById('nanchaName').value,
    document.getElementById('syachaName').value,
    document.getElementById('peichaName').value
  ];

  var honba = Number(document.getElementById('honba').value);
  if( isNaN(honba)){
    honba = 0;
  }
  var kyoutaku = Number(document.getElementById('kyoutaku').value);
  if( isNaN(kyoutaku)){
    kyoutaku = 0;
  }

  var ranks = rankcall(startPoints);

  //親の場所。pointChangeの最初の引数に仕様。標準は北家スタート(3)
  var oyaPosition = 3;

  titles = [playerName[0]+"の上がり",playerName[1]+"の上がり",
  playerName[2]+"の上がり",playerName[3]+"の上がり"];

  //順位変動を記録する配列の準備
  //まずは席の数だけ配列を用意
  var rankChangePoints = new Array(4);
  //rankChangePoints[席順][順位上昇-1][上がり相手]
  for(i=0;i<4;i++){
    if(ranks[i] != 1){
      rankChangePoints[i] = new Array(ranks[i]-1);
      for(l=0;l<(ranks[i]-1);l++){
        rankChangePoints[i][l] = new Array(4);
        for(k=0;k<4;k++){
          //すべての値を-1で初期化
          rankChangePoints[i][l][k] = -1;
        }
      }
    }
  }

  //console.log(rankChangePoints);


  for(k=0;k<4;k++){

    var tr1 = tables[k].insertRow(-1);
    var td0 = tr1.insertCell(-1);
    td0.colSpan="5";
    td0.innerHTML = titles[k];

    //一行増やす
    var tr0=tables[k].insertRow(-1);

    var tds = [
      tr0.insertCell(-1),
      tr0.insertCell(-1),
      tr0.insertCell(-1),
      tr0.insertCell(-1),
      tr0.insertCell(-1)
    ];

    var rowTitleName = [
      playerName[0]+"からのロン",
      playerName[1]+"からのロン",
      playerName[2]+"からのロン",
      playerName[3]+"からのロン"
    ];

    //上がり者のいる列の名前を変更
    rowTitleName[k] = "ツモ";

    tds[0].innerHTML = "翻数と符";
    tds[1].innerHTML = rowTitleName[0];
    tds[2].innerHTML = rowTitleName[1];
    tds[3].innerHTML = rowTitleName[2];
    tds[4].innerHTML = rowTitleName[3];

    for(var i=0; i<pointList(-1); i++){
      var tr0=tables[k].insertRow(-1);

      var tdMains = [
        tr0.insertCell(-1),
        tr0.insertCell(-1),
        tr0.insertCell(-1),
        tr0.insertCell(-1),
        tr0.insertCell(-1)
      ];

      if(k == oyaPosition){
        tdMains[0].innerHTML =
          "ロン " + pointList(i,'oyaron') +"点<br>"
          + "ツモ " + pointList(i,'oyatumo')
          +"点オール<br>"
          + "(" + pointList(i,'display') + ")";
      }else{
        tdMains[0].innerHTML =
          "ロン " + pointList(i,'koron') +"点<br>"
          + "ツモ " + pointList(i,'kotumoko') + "-" + pointList(i,'kotumooya')
          +"点<br>"
          + "(" + pointList(i,'display') + ")";
      }



      for(l=0;l<4;l++){
        var agari = pointChange(oyaPosition,k,l,i,startPoints,honba,kyoutaku);

        var afterRank = rankcall(agari);

        //順位変動をチェック
        if(afterRank[k] < ranks[k]){
          //順位が上がっていたら
          var rankUp = ranks[k] - afterRank[k] -1;
          if(rankChangePoints[k][rankUp][l] == -1){
            rankChangePoints[k][rankUp][l] = i;
          }
        }

        tdMains[l+1].innerHTML = afterRank+ '位<br>'+agari;
      }

    }
  }

  console.log(rankChangePoints);

  var textArea = document.querySelector("#textArea");
  //textArea.innerHTML = "test";

  //リザルト表示処理
  var textData = "";
  for(i=0;i<4;i++){
    textData += "<" + playerName[i] + "の条件><br>";
    if(ranks[i] != 1){
      //現在一位でない場合の処理
      for(l=0;l<rankChangePoints[i].length;l++){
        textData += "　○" + Number(ranks[i] - (l+1)) + "位への条件<br>";
        //ツモ上がり条件
        if(rankChangePoints[i][l][i] != -1){
          if(i == oyaPosition){
            textData += "　　" + pointList(rankChangePoints[i][l][i],'oyatumo')
              + "点オールのツモ上がり<br>";
          }else{
            textData += "　　" + pointList(rankChangePoints[i][l][i],'kotumoko')
              + "-" + pointList(rankChangePoints[i][l][i],'kotumooya')
              + "点のツモ上がり<br>";
          }
        }

        //ロン上がり用配列
        var ronArray = rankChangePoints[i][l].slice();
        //ツモの部分を排除
        ronArray.splice(i,1);
        console.log(ronArray);

        //どこからでもロン上がり条件
        var allRon = -1;
        for(k=0;k<3;k++){
          if(allRon < ronArray[k]){
            allRon = ronArray[k];
          }
        }

        //デバサイ
        var debasai = 100;
        for(k=0;k<3;k++){
          if((debasai > ronArray[k]) && (ronArray[k] != -1)){
            debasai = ronArray[k];
          }
        }
        //console.log(debasai);
        if (debasai != 100){
          var ronPlayers = [];
          var debasaiArray = rankChangePoints[i][l].slice();
          //ツモ部分を無効にするため-1を代入
          debasaiArray[i] = -1;
          for(j=0;j<4;j++){
            if(debasai == debasaiArray[j]){
              ronPlayers.push(playerName[j]);
            }
          }

          //でばさいがなければどこからロンもない
          //でばさいとどこからロンが一緒ならどこからロンはなし
          if ((allRon != -1) && (allRon != debasai) ){
            if(i == oyaPosition){
              textData += "　　どこからでも" + pointList(allRon,'oyaron')
                + "点のロン上がり<br>";
            }else{
              textData += "　　どこからでも" + pointList(allRon,'koron')
                + "点のロン上がり<br>";;
            }
          }


          if(i == oyaPosition){
            textData += "　　" + ronPlayers + "からなら" + pointList(debasai,'oyaron')
              + "点のロン上がり<br>";
          }else{
            textData += "　　" + ronPlayers + "からなら" + pointList(debasai,'koron')
              + "点のロン上がり<br>";;
          }
        }

      }
    }
  }

  textArea.innerHTML = textData;


}

//URL生成ボタン
function makeLink(){
  //現在のurlを取得
  var url = location.origin  + location.pathname;

  //テキストボックスのid名を配列で取得
  var idArray = inputIdElements();

  //最初に追加されたidか確認するためのフラグを初期化
  var firstFlag = true;

  for (var i = 0, len = idArray.length; i < len; ++i){
    if(document.querySelector("#"+idArray[i]).value){
      if (firstFlag){
        url += "?";
        firstFlag = false;
      }else{
        url += "&";
      }
      url += idArray[i] + "="
          + encodeURIComponent(document.querySelector("#"+idArray[i]).value);
    }
  }

  document.querySelector("#linkURL").value = url;
  document.querySelector("#linkArea").hidden = false;
  document.querySelector("#makedLink").innerHTML = '<a href="'
    + url + '">このページのリンク</a>';
}

//点数の変動関数
function pointChange(oyaPosition,winner,target,pointListIndex,points,honba,kyoutaku){
  var afterPoints =[];
  if (winner == target){
    //ツモ処理
    for(var i=0; i<4; i++){
      if (winner == i){
        //ツモ上がり
        if (oyaPosition == i){
          //親の場合
          afterPoints[i] =
          Number(pointList(pointListIndex,'oyatumo')) * 3
          + Number(points[i]) + ((honba*300)+(kyoutaku*1000));
        }else{
          afterPoints[i] =
          (Number(pointList(pointListIndex,'kotumoko')) * 2)
          + Number(pointList(pointListIndex,'kotumooya'))
          + Number(points[i])+ ((honba*300)+(kyoutaku*1000));
        }
      }else{
        //ツモ上がられ
        if (oyaPosition == i){
          //親の場合
          afterPoints[i] = Number(points[i])
          - Number(pointList(pointListIndex,'kotumooya'))
          - (honba*100);
        }else{
          //子の場合
          if (oyaPosition == winner){
            //上がった人が親の場合
            afterPoints[i] = Number(points[i])
            - Number(pointList(pointListIndex,'oyatumo'))
            - (honba*100);
          }else{
            //上がった人が子の場合
            afterPoints[i] = Number(points[i])
            - Number(pointList(pointListIndex,'kotumoko'))
            - (honba*100);
          }
        }
      }
    }
  }else{
    //ロン上がり
    //まずは全員の点数を結果に代入
    for(var i=0; i<4; i++){
      afterPoints[i] = Number(points[i]);
    }

    //親の上がりかチェック
    if(winner == oyaPosition){
      //親のロン上がりの場合
      afterPoints[winner] = Number(afterPoints[winner])
      + Number(pointList(pointListIndex,'oyaron'))
      + ((honba*300)+(kyoutaku*1000));

      afterPoints[target] = Number(afterPoints[target])
      - Number(pointList(pointListIndex,'oyaron'))
      - (honba*300);
    }else{
      //子のロン上がりの場合
      afterPoints[winner] = Number(afterPoints[winner])
      + Number(pointList(pointListIndex,'koron'))
      + ((honba*300)+(kyoutaku*1000));

      afterPoints[target] = Number(afterPoints[target])
      - Number(pointList(pointListIndex,'koron'))
      - (honba*300);
    }
  }

  return afterPoints;
}

/**
 * 数値用の比較関数を定義
 * これは数字が高い順に並べる。逆は「a - b」
 * @param  {Number} a 比較対象数字1
 * @param  {Number} b 比較対象数字2
 * @return {Number}   結果
 */
function compareNumbers(a, b) {
  return b - a;
}

//順位判定関数
//点数の入った配列を引数にすると、戻り値は順位の配列
function rankcall(array){
  //ソート前と後をそれぞれ格納するために値渡しにする
  var sortedArray = array.slice();
  sortedArray.sort(compareNumbers);
  //alert(array);
  //alert(sortedArray);

  //順位の結果を入れる配列。
  var ranks = new Array(array.length);

  for(var i =0; i<sortedArray.length; i++){
    for(var l=0; l<array.length; l++){
      if (sortedArray[i] == array[l]){
        if(typeof(ranks[l]) === 'undefined'){
          //console.log('sa='+sortedArray[i]+',a='+array[l]);
          ranks[l] = i+1;
        }
      }
    }
  }

  return ranks;
}


//点数リスト
function pointList(index,type){
  var points = [
    {display:'1ハン30符',
    oyaron:1500, oyatumo:500, koron:1000, kotumoko:300, kotumooya:500},
    {display:'1ハン40符、2ハン20符',
    oyaron:2000, oyatumo:700, koron:1300, kotumoko:400, kotumooya:700},
    {display:'1ハン50符、2ハン25符',
    oyaron:2400, oyatumo:800, koron:1600, kotumoko:400, kotumooya:800},
    {display:'1ハン60符、2ハン30符',
    oyaron:2900, oyatumo:1000, koron:2000, kotumoko:500, kotumooya:1000},
    {display:'1ハン70符',
    oyaron:3400, oyatumo:1200, koron:2300, kotumoko:600, kotumooya:1200},
    {display:'1ハン80符、2ハン40符、3ハン20符',
    oyaron:3900, oyatumo:1300, koron:2600, kotumoko:700, kotumooya:1300},
    {display:'1ハン90符',
    oyaron:4400, oyatumo:1500, koron:2900, kotumoko:800, kotumooya:1500},
    {display:'1ハン100符、2ハン50符、3ハン25符',
    oyaron:4800, oyatumo:1600, koron:3200, kotumoko:800, kotumooya:1600},
    {display:'1ハン110符',
    oyaron:5300, oyatumo:1800, koron:3600, kotumoko:900, kotumooya:1800},
    {display:'2ハン60符、3ハン30符',
    oyaron:5800, oyatumo:2000, koron:3900, kotumoko:1000, kotumooya:2000},
    {display:'2ハン70符',
    oyaron:6800, oyatumo:2300, koron:4500, kotumoko:1200, kotumooya:2300},
    {display:'2ハン80符、3ハン40符、4ハン20符',
    oyaron:7700, oyatumo:2600, koron:5200, kotumoko:1300, kotumooya:2600},
    {display:'2ハン90符',
    oyaron:8700, oyatumo:2900, koron:5800, kotumoko:1500, kotumooya:2900},
    {display:'2ハン100符、3ハン50符、4ハン25符',
    oyaron:9600, oyatumo:3200, koron:6400, kotumoko:1600, kotumooya:3200},
    {display:'2ハン110符',
    oyaron:10600, oyatumo:3600, koron:7100, kotumoko:1800, kotumooya:3600},
    {display:'3ハン60符、4ハン30符',
    oyaron:11600, oyatumo:3900, koron:7700, kotumoko:2000, kotumooya:3900},
    {display:'3ハン70符、満貫',
    oyaron:12000, oyatumo:4000, koron:8000, kotumoko:2000, kotumooya:4000},
    {display:'跳満',
    oyaron:18000, oyatumo:6000, koron:12000, kotumoko:3000, kotumooya:6000},
    {display:'倍満',
    oyaron:24000, oyatumo:8000, koron:16000, kotumoko:4000, kotumooya:8000},
    {display:'3倍満',
    oyaron:36000, oyatumo:12000, koron:24000, kotumoko:6000, kotumooya:12000},
    {display:'役満',
    oyaron:48000, oyatumo:16000, koron:32000, kotumoko:8000, kotumooya:16000}
  ];

  if (index < 0){
    return points.length;
  }else{
    return points[index][type];
  }

}


//文字入力欄が変化した時に呼ばれる関数
// function chageInputText(){
//   console.log('test');
// }

//デフォルト値をURLのパラメータから取得する関数
function setDefaultParameter(){
  var idArray = inputIdElements();

  var paramArray = getURLParameter();

  if(paramArray){
    for (var i = 0, len = idArray.length; i < len; ++i){
      if(paramArray[idArray[i]]){
        var element = document.querySelector("#"+idArray[i]);
        element.value = decodeURIComponent(paramArray[idArray[i]]);
      }
    }
  }
}

//テキストボックスのid名の配列を返す関数
function inputIdElements(){
  var idArray = [
    'tonchaPoint',
    'nanchaPoint',
    'syachaPoint',
    'peichaPoint',
    'tonchaName',
    'nanchaName',
    'syachaName',
    'peichaName',
    'honba',
    'kyoutaku',
    //'mode',
    'title'
  ];
  return idArray;
}

/**
 * URLパラメータを取得して連想配列で返す
 * @return {Array} URLパラメータを格納した連想配列
 */
function getURLParameter(){
      //URLパラメータの?を除いた２文字目以降を取得
  var urlParam = location.search.substring(1),
      //パラメータを格納する連想配列
      paramArray = [];

  if(urlParam){
    //&が含まれていたら&で分割（この時点では=で繋がっている）
    var params = urlParam.split('&');

    // 用意した配列にパラメータを格納
    for (i = 0; i < params.length; i++) {
      var paramItems = params[i].split('=');
      paramArray[paramItems[0]] = paramItems[1];
    }

    return paramArray;

  }

  return null;

}


//モードのセレクトボックスをセット
function setupMode(){
  var modeLists = [
    {val:"normal", txt:"ノーマル"},
    {val:"ml2018f", txt:"Mリーグ2018ファイナル"}
  ];

  //連想配列をループ処理で値を取り出してセレクトボックスにセットする
  for(var i=0;i<modeLists.length;i++){
    let op = document.createElement("option");
    op.value = modeLists[i].val;  //value値
    op.text = modeLists[i].txt;   //テキスト値
    document.getElementById("mode").appendChild(op);
  }
  //document.getElementById("mode").value = "ml2018f";
}

//datalistのnamesの部分の初期化(現在未使用)
function setDatalistNames(){
  //すでにidがnamesのdatalistの子要素をすべて削除
  var idNames = document.getElementById("names");
  while(idNames.lastChild){
		idNames.removeChild(idNames.lastChild);
	}

  var nameLists = [
    "園田","村上","たろう",
    "亜樹","滝沢","勝又",
    "寿人","高宮","前原",
    "多井","白鳥","松本"
  ];

  //連想配列をループ処理で値を取り出してセレクトボックスにセットする
  for(var i=0;i<nameLists.length;i++){
    let op = document.createElement("option");
    op.value = nameLists[i];  //value値
    idNames.appendChild(op);
  }

}

//モードをセレクトボックスでチェンジした時の処理
function changeMode(){
  var mode = document.getElementById("mode").value;
  console.log(mode);
  //document.querySelector("#nanchaName").hidden = true;
  switch (mode){
    case "ml2018f":
      changeModeMl2018f();
      break;
    case "normal":
      changeModeNormal();
      break;
  }

}

//モードをml2018fにした時の処理
function changeModeMl2018f(){
  //console.log("test");
  var inputNames = [
    "tonchaName",
    "nanchaName",
    "syachaName",
    "peichaName"
  ];

  var nameLists = [
    "","園田","村上","たろう",
    "亜樹","滝沢","勝又",
    "寿人","高宮","前原",
    "多井","白鳥","松本"
  ];

  //セレクトボックスを表示させてテキストボックスを隠す
  for(var i=0;i<4;i++){
    document.getElementById(inputNames[i]).hidden = true;
    document.getElementById(inputNames[i]+"Select").hidden = false;

    //すでにセレクトボックスにある子要素をすべて削除
    var idNames = document.getElementById(inputNames[i]+"Select");
    while(idNames.lastChild){
  		idNames.removeChild(idNames.lastChild);
  	}

    //連想配列をループ処理で値を取り出してセレクトボックスにセットする
    for(var l=0;l<nameLists.length;l++){
      let op = document.createElement("option");
      op.value = nameLists[l];  //value値
      if(nameLists[l]){
        op.text = nameLists[l] + " (" + checkTeamName(nameLists[l]) + ")";
      }else{
        op.text ="";
      }

      document.getElementById(inputNames[i]+"Select").appendChild(op);
    }

    //テキストボックスから反映
    var teamName = checkTeamName(document.getElementById(inputNames[i]).value);
    if(teamName){
      document.getElementById(inputNames[i]+"Select").value =
        document.getElementById(inputNames[i]).value;
    }
  }

  //エラーメッセージ処理
  changeName();
}

//モードをnormalにした時の処理
function changeModeNormal(){
  var inputNames = [
    "tonchaName",
    "nanchaName",
    "syachaName",
    "peichaName"
  ];

  //セレクトボックスを隠してテキストボックスを表示
  for(var i=0;i<4;i++){
    document.getElementById(inputNames[i]).hidden = false;
    document.getElementById(inputNames[i]+"Select").hidden = true;
  }

  //エラーメッセージを消して確認開始ボタンを押せるように
  document.getElementById("errorMessage").value = "";

  //条件確認ボタンを押せるようにする
  document.getElementById("checkButton").disabled = false;
}

//引数に名前を入れると所属チームを返す関数
function checkTeamName(name){
  var names = [
    "園田","村上","たろう",
    "亜樹","滝沢","勝又",
    "寿人","高宮","前原",
    "多井","白鳥","松本"
  ];

  var teams = [
    "ドリブンズ","ドリブンズ","ドリブンズ",
    "EX風林火山","EX風林火山","EX風林火山",
    "麻雀格闘倶楽部","麻雀格闘倶楽部","麻雀格闘倶楽部",
    "アベマズ","アベマズ","アベマズ"
  ];

  //namesでnameの名前を検索して見つかったらの処理
  if(names.indexOf(name) == -1){
    return "";
  }else{
    return teams[names.indexOf(name)];
  }

}

//セレクトボックスを変更した時の処理
function changeName(place){
  //セレクトボックスの変更で引数ありで呼び出した時にテキストボックスに反映させる
  if(place){
    if(document.getElementById(place+"Select").value){
      document.getElementById(place).value =
        document.getElementById(place+"Select").value;
    }
  }

  //エラーチェック
  //各チームのカウント
  var teamCounts = [0,0,0,0];

  //セレクトボックスの名前（"Select"抜き）
  var inputNames = [
    "tonchaName",
    "nanchaName",
    "syachaName",
    "peichaName"
  ];

  for(var i=0; i<inputNames.length; i++){
    var teamname = checkTeamName(document.getElementById(inputNames[i]+"Select").value);
    switch (teamname) {
      case "ドリブンズ":
        teamCounts[0] += 1;
        break;

      case "EX風林火山":
        teamCounts[1] += 1;
        break;

      case "麻雀格闘倶楽部":
        teamCounts[2] += 1;
        break;

      case "アベマズ":
        teamCounts[3] += 1;
        break;

      default:
    }
  }

  var nullcheck = false;

  for(var l=0; l<teamCounts.length; l++){
    if(teamCounts[l] == 0){
      nullcheck = true;
    }
  }

  if(nullcheck){
    document.getElementById("errorMessage").value =
      "選択されていないチームがあります。";

    //条件確認ボタンを押せないようにする
    document.getElementById("checkButton").disabled = true;
  }else{
    document.getElementById("errorMessage").value =
      "";

    //条件確認ボタンを押せるようにする
    document.getElementById("checkButton").disabled = false;
  }

}
