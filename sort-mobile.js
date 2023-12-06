let fadeInTime = 200;
const fadeOutTime = 0;
let RankNum = 0;
const noFacePatternNo = 99;
let FacePattern = 0;
const FacePatternDefault = 1;
let BackupTree = null;
let EvenList = [];
let ElapsedTime = 0;
let TimeStarted = null;
let isFirstRemoveChoice = true;
// 初期化
$(document).ready(function() {
	$("#caption").hide();
	$("#result").hide();
	$("#ui").hide();
	$("#reset").hide();
	$("#samp").toggle();
	$("#sampback").toggle();
	$("#start_button").bind("click", ask_start);
	$("#reset_button").bind("click", reset_do);
	$("#left > *").bind("click", {
		win: 0
		, lose: 1
	}, button_click);
	$("#right > *").bind("click", {
		win: 1
		, lose: 0
	}, button_click);
	if (show_result_from_hash()) {
		$("#init").hide();
		$("#reset").show();
	}
	loadImage();
});

/**
* リソースデータの画像をプリロードします。
*/
function loadImage(){
	let kPatterns = [1, 2, 99];
	for( let i = ResourceData.length -1; i>=0; i-- ){
		let obj = new SortObject(ResourceData[i]);
		for( let j in kPatterns ){
			FacePattern = j;
			let path = new Image(obj.getImagePath());
		}
	}
}

function backup() {
	// IDツリーへ保存
	QuestionBackup = [Question[0].id, Question[1].id];
	BackupTree.setupCTree();
	BackupTree.initTree(SortTree, BackupTree);
}

function restore() {
	// IDツリーから復元
	Question = [QuestionBackup[0], QuestionBackup[1]];
	QuestionBackup = null;
	// 確定順位表示を一旦消す
	$("#caption").hide();
	SortTree = BackupTree.restoreCTree(BackupTree, null);
}

function initRankNum() {
	if (!RankNum) {
		if (location.search.length < 2) {
			let numObj = $("#rank_num option:selected");
			let numLen = parseInt(numObj.val());
			RankNum = numLen;
		} else {
			RankNum = location.search.slice(1).split("-").length;
		}
	}
}
// 結果情報が付加されているか調べて表示
function show_result_from_hash() {
	if (location.search.length < 2) {
		return false;
	}
	let strParams = location.search.slice(1).split("-");
	QuestionCount = 0;
	FacePattern = 0;
	initRankNum();
	
	if( !RankNum ){
		// 非対応ブラウザ。古いスマートフォン？
		alert("動作非対応ブラウザをお使いのようです。オプション指定無しのまま実行します。");
		RankNum = 10;
		FacePattern = FacePatternDefault;
	}
	// 経過秒数が付いている場合、付与（cs ver1.16.0～）
	let lastQuery = strParams[strParams.length - 1];
	if (lastQuery.charAt(0) == "t") { // face
		strParams.pop();
		lastQuery = lastQuery.slice(1, lastQuery.length);
		if (isNaN(lastQuery) == false) {
			ElapsedTime = parseInt(lastQuery);
		}
	}
	
	// フェースパターン指定が付いている場合、付与（cs ver1.8.0～）
	lastQuery = strParams[strParams.length - 1];
	if (lastQuery.charAt(0) == "f") { // face
		strParams.pop();
		lastQuery = lastQuery.slice(1, lastQuery.length);
		if (isNaN(lastQuery) == false) {
			FacePattern = parseInt(lastQuery);
		}
	}
	// 質問数が付いている場合、付与（cs ver1.7.0～）
	lastQuery = strParams[strParams.length - 1];
	if (lastQuery.charAt(0) == "q") { // question
		strParams.pop();
		lastQuery = lastQuery.slice(1, lastQuery.length);
		if (isNaN(lastQuery) == false) {
			QuestionCount = parseInt(lastQuery) + 1;
		}
	}
	SortTree = new SortObject(["!root", , , , ]);
	let objPal = SortTree;
	for (let i = 0; i < strParams.length; i++) {
		let isEven = (strParams[i].charAt(0) == "!");
		if(isEven){
			strParams[i] = strParams[i].substr(1, strParams[i].length - 1);
		}
		for (let j = 0; j < ResourceData.length; j++) {
			if (strParams[i] == ResourceData[j][0]) {
				let objChil = new SortObject(ResourceData[j]);
				objChil.isEven = isEven;
				objPal.add(objChil, false);
				objPal = objChil;
				// thanks @ide_an
				break;
			}
		}
	}
	show_result();
	return true;
}
// 旧作とWin版の同名キャラを区別:幽香除く alt属性値でvalueを置き換える
function initOldVersionStyle() {
	if ($("#enableOldVersionStyle").is(":checked")) {
		$(":checkbox[alt].char").each(function(index) {
			let v = $(this).attr("alt");
			$(this).val(v);
		});
	}
}
// ソート開始
function ask_start() {
	QuestionBackup = null;
	QuestionCount = 0;
	initRankNum();
	SortTree = new SortObject(["!root", , , , ]);
	initOldVersionStyle();
	FacePattern = $("[name='facePattern']:checked").val();
	// 選択キャラ構築（ユニーク）
	selectedChars = [];
	$(":checkbox.char").each(function(index) {
		let v = $(this).attr("value");
		if ($(this).is(":checked") && $.inArray(v, selectedChars) === -1) {
			selectedChars.push(v);
		}
	});
	// そんな設定で大丈夫か？
	if( selectedChars.length >= 400){
		if( confirm("ソートする対象が " + selectedChars.length + " 件あります。\n設問数が非常に多くなる事が想定されますが、覚悟はよろしいですか？") === false ){
			return false;
		}
	}
	if (selectedChars.length <= 1) {
		alert("ソートするものがありません。");
		return false;
	}
	if ($("#enableEvenChoice").is(":checked")) {
		$("#even").show();
	} else {
		$("#even").hide();
	}
	for (let i = 0; i < ResourceData.length; i++) {
		let resourceId = ResourceData[i][0];
		// ID で属性値検索してヒットしたらそのキャラは対象とする
		if ($.inArray(resourceId, selectedChars) > -1) {
			SortTree.add(new SortObject(ResourceData[i]), false);
		}
	}
	$("div.caption").show();
	TimeStarted = new Date();
	ask_next();
	// 復元準備
	BackupTree = new IDSortTree();
	BackupTree.setupCTree();
	BackupTree.initTree(SortTree, BackupTree);
	$("#init").hide(0);
	$("#ui").fadeIn(1000);
	$("#reset").show();
}
// 次の質問
function ask_next(isBacked) {
	QuestionCount++;
	hide_question();
	//$("#samp").html(SortTree.toString());
	$("#count").text(QuestionCount);
	$("#hold").css("visibility", "visible");
	$("#back").css("visibility", "visible");
	// 第1問は戻れないので消しとく
	if (QuestionCount == 1) {
		$("#back").css("visibility", "hidden");
	}
	// 「待った」の場合、質問を復元
	if (isBacked === true) {
		$("#back").css("visibility", "hidden");
		Question = SortTree.ask(Question);
	} else {
		Question = SortTree.ask();
	}
	if (Question) {
		if (Question[1].level() > RankNum) {
			return false;
		}
		show_question();
		return true;
	}
	return false;
}
// 待った！
function ask_back() {
	// 復元して問い合わせ直す
	restore();
	QuestionCount -= 2;
	return ask_next(true);
}
// あとで
function ask_hold() {
	// ここで元々設問数をカウントアップしていたが、よくよく考えたら後の選択で増えるのでやめた
	// QuestionCount++;
	backup();
	let currentQ = [Question[0].id, Question[1].id];
	let isHoldedBefore = false;
	// 前に同じ組み合わせでパスした事がある場合引き分けを確認する (同IDは居ないので単純な組み合わせ比較)
	let len = EvenList.length;
	for( let i = 0; i < len; i++ ){
		if(EvenList[i][0] === currentQ[0] || EvenList[i][1] === currentQ[0]){
			if(EvenList[i][1] === currentQ[1] || EvenList[i][1] === currentQ[1]){
				if( confirm("之前也跳过的选择。\n是否选择一样喜欢？") ){
					return select_even();
				} else {
					isHoldedBefore = true;
					break;
				}
			}
		}
	}
	// 前にも同じ選択肢でパスしていなければ記録
	if( isHoldedBefore === false ){
		EvenList.push(currentQ);
	}

	// 前と違う質問を探す（もうパスできない時を考慮し、ある程度回数を制限する）
	let limit = 20;
	let isChange = false;
	for (let i = 1; i <= limit; i++) {
		if (currentQ && Question) {
			// 強制パス指定でask
			Question = SortTree.ask("PASS");
			if ($.inArray(Question[0].id, currentQ) == -1 || $.inArray(Question[1].id, currentQ) == -1) {
				hide_question();
				isChange = true;
				break;
			}
		}
	}
	if (isChange == false) {
		if( confirm("无法跳过。\n是否选择一样喜欢？") ){
			let up = null;
			let down = null;
			if(Question[0].id < Question[1].id){
				up = Question[0];
				down = Question[1];
			} else {
				up = Question[1];
				down = Question[0];
			}
			down.isEven = true;
			up.add(down, true);
		}
	}
	if (ask_next() == false) {
		show_result();
		return false;
	}
	$("#count").text(QuestionCount);
	$("#hold").css("visibility", "visible");
	$("#back").css("visibility", "visible");
	if (Question) {
		if (Question[1].level() > RankNum) {
			return false;
		}
		show_question();
		return true;
	}
	return false;
}

function view_character(id, data) {
	$(id + " img").attr("src", data.getImagePath());
	$(id + " img").attr("alt", data.name);
	$(id + " p").text(data.name);
	$(id + " h3").text(data.nick);
}

function hide_question() {
	$("#left").fadeOut(fadeOutTime);
	$("#right").fadeOut(fadeOutTime);
}

function show_question() {
	view_character("#left", Question[0]);
	view_character("#right", Question[1]);
	$("#left").fadeIn(fadeInTime);
	$("#right").fadeIn(fadeInTime);
}

function view_progress() {}

// 選択
function button_click(arg) {
	$("#left").fadeOut(fadeOutTime);
	$("#right").fadeOut(fadeOutTime);
	backup();
	// 敗者と同着ツリー最上位の上に、勝者を追加する
	let winner = Question[arg.data.win];
	let loser = Question[arg.data.lose];
	winner.add(loser, false);

	if (ask_next() == false) {
		show_result();
	}
}

// 引き分け
function select_even() {
	$("#left").fadeOut(fadeOutTime);
	$("#right").fadeOut(fadeOutTime);
	backup();
	Question[1].isEven = true;
	Question[0].add(Question[1], true);
	if (ask_next() == false) {
		show_result();
	}
}

function toggle_current() {
	$("#samp").toggle();
	$("#samp").html(SortTree.toString());
	return false;
}

// どっちも除外
function remove_both() {
	Question[0].remove();
	Question[1].remove();
	if (ask_next() == false) {
		show_result();
	}
}

// 左は除外
function remove_left() {
	if(isFirstRemoveChoice){
		alert("注意：「ソートから外す」を選択すると、\n結果にも表示されなくなります。\nなるべく枠内を選択してくださいね。");
		isFirstRemoveChoice = false;
	}
	backup();
	Question[0].remove();
	if (ask_next() == false) {
		show_result();
	}
}

// 右は除外
function remove_right() {
	if(isFirstRemoveChoice){
		alert("注意：「ソートから外す」を選択すると、\n結果にも表示されなくなります。\nなるべく枠内を選択してくださいね。");
		isFirstRemoveChoice = false;
	}
	backup();
	Question[1].remove();
	if (ask_next() == false) {
		show_result();
	}
}

/**
* ランダム自動ソート用自動選択処理。タイマーをかけて使う。
*/
function realtimeSelect(){
	if( ask_next() ){
		Question[0].add(Question[1], false);
		return true;
	} else {
		clearInterval(GIntervalTimer);
		show_result();
		return false;
	}
};

/**
* ランダム自動ソート
*/
function auto_sort() {
	$(".special_select").hide();
	fadeInTime = 0;
	// グローバルスコープでタイマーをセット
	GIntervalTimer = setInterval(realtimeSelect, 50);
	
	return false;
}

function reset_do() {
	$("#init").removeAttr("style");
	$("#ui").hide();
	$("#result").hide();
	$("#reset").hide();
	$("#hold").css("visibility", "visible");
	$("#back").css("visibility", "visible");
	Question = null;
	QuestionBackup = null;
	SortTree = null;
	document.location = location.pathname;
}
// 結果表示
function show_result() {
	// 結果が出た時点でインクリメント済みなので1つ戻す
	--QuestionCount;
	// 経過時間の確認
	let timeElapsed = 0;
	let timeElapsedMinutes = 0;
	if( !ElapsedTime && TimeStarted ){
		timeElapsed = Math.floor((new Date().getTime() - TimeStarted.getTime()) / 1000);
		timeElapsedMinutes = Math.floor((timeElapsed / 60));
		ElapsedTime = timeElapsed;
		console.log("経過時間: " + timeElapsed + " 秒( " + timeElapsedMinutes +" 分)");
	} else if (ElapsedTime){
		timeElapsed = ElapsedTime;
		timeElapsedMinutes = Math.floor((timeElapsed / 60));
	}
	
	$("#ui").hide();
	$("#result").html("");
	let aryRanks = [];
	// ツリーを全て辿って一次元配列化（SortTreeメソッド化要検討）
	let objCur = SortTree.children[0];
	while(aryRanks.length < RankNum) {
		aryRanks.push(objCur);
		if (objCur.children.length >= 1) {
			objCur = objCur.children[0];
		} else {
			break;
		}
	}
	
	let strHtm = "";
	let strResults = [];
	let tweetResult = [];
	let simpleResult = [];
	simpleResult.push('<button id="viewSimpleResult">文字版结果</button><ul class="simpleResult">');
	tweetResult.push(encodeURIComponent("蔚蓝档案学生好感排序結果！\n"));
	strHtm += '\n<h2>排序结果发表！';
	if (QuestionCount > 0) {
		strHtm += '<span id="times">(第 ' + QuestionCount + ' 问后结束)</span>';
	}
	if( timeElapsed > 0 ){
		strHtm += '<span id="elapsed"> (' + timeElapsedMinutes + ' 分)</span>';
	}
	for (let i = 0; i < aryRanks.length; i++) {
		if (i <= 10 && i % 2 == 0) {
			strHtm += '</ul>\n<ul class="rs_2nd">\n';
		}
		if (i >= 10 && i % 4 == 2) {
			strHtm += '</ul>\n<ul class="rs_4th">\n';
		}
		let rankNo = aryRanks[i].rank();
		strHtm += '<li><h3>' + rankNo + '</h3>';
		if (FacePattern == noFacePatternNo) {
			strHtm += aryRanks[i].name + '</li><br/>\n';
		} else {
			strHtm += '<img src="' + aryRanks[i].getImagePath() + '" alt="' + aryRanks[i].nick + '" /><br />' + aryRanks[i].name + '</li>\n';
		}
		// 引き分けている場合は先頭に識別子を付加
		strResults.push((aryRanks[i].isEven ? "!" : "") + aryRanks[i].id);
		
		let recordText = rankNo + "位：" + aryRanks[i].name;
		if (i < 7) {
			tweetResult.push(encodeURIComponent(recordText + "\n"));
		}
		simpleResult.push("<li>" + recordText + "</li>");
	}
	tweetResult.push(encodeURIComponent("查看全" + aryRanks.length + "位→ "));
	simpleResult.push("</ul>");
	strHtm += "</ul>\n";
	let siteQuery = strResults.join("-") + '-q' + QuestionCount + '-f' + FacePattern + '-t'  + ElapsedTime;
	if (location.search.length < 2) {
		strHtm += '<div class="special_select"><br />';
		strHtm += '[<a target="_blank" href="https://twitter.com/intent/tweet?url=' + location.href + '?' + siteQuery + '&amp;text=' +
			tweetResult.join("") + '">将此结果发推</a>]<br />';
		strHtm += '[<a href="?' + siteQuery + '">复制此结果的URL</a>] (用于分享到Twitter之外的场合)<br />';
		strHtm += '服务器不便宜，<a href="https://afdian.net/a/khrisma" target="_blank">赞助作者</a>来让本站更好运营！<br />';
		strHtm += '</div>';
	}
	strHtm += simpleResult.join("\n");
	$("#result").html(strHtm);
	$("#result").fadeIn(1000);
	
	$(".simpleResult").slideToggle();
	$("#viewSimpleResult").click(function(){
		$(".simpleResult").slideToggle();
	});
}
// データクラス
function SortObject(data) {
	this.id = data[0];
	this.name = data[1];
	this.nick = data[2];
	// ファイル名ソートしやすいように
	this.img = "c" + (this.id);
	this.ext = ".png";
	
	// 上位関係と下位関係
	this.parent = null;
	this.isEven = false; // 上位と引き分けているか？
	this.children = [];
}
SortObject.prototype = {
	constructor : SortObject,
	
	/**
	* 画像パス取得
	*/
	getImagePath : function() {
		let strImageSrc = "./char/";
		// デフォルト以外はフォルダを掘る
		if (FacePattern != 0 && FacePattern != FacePatternDefault) {
			strImageSrc += "f" + FacePattern + "/";
		}
		strImageSrc += this.img + this.ext;
		// 画像なし特殊設定
		if (FacePattern == noFacePatternNo) {
			strImageSrc = "./char/noImage.png";
		}
		return strImageSrc;
	},
	
	/**
	* 順位取得
	*/
	rank : function() {
		if (this.parent) {
			return (this.isEven ? this.parent.rank() : this.level());
		}
		return 0;
	},
	
	/**
	* 深さ取得
	*/
	level : function() {
		if (this.parent) {
			return this.parent.level() + 1;
		}
		return 0;
	},
	
	/**
	* 子ノードに追加
	*/
	add : function(child, doEvenAction) {
		// まず子の関係性を断つ 1R-
		if (child.parent) {
			child.parent.children.splice($.inArray(child, child.parent.children), 1);
		}
		
		// 引き分け特有の処理をする。
		if(doEvenAction){
			// 自分の子をすべて子に明け渡す 2A-, 3a+
			let copies = this.children.splice(0, this.children.length);
			for(let i=copies.length-1; i>=0; i--){
				copies[i].parent = child;
			}
			Array.prototype.push.apply(child.children, copies);
		}
		
		// 2A+
		this.children.push(child);
		child.parent = this;
	},
	
	/**
	* 文字列表示
	*/
	toString : function() {
		let str = "<li>" + this.name + "(" + this.rank() + ")";
		if (this.children.length > 0) {
			str += "<ul>";
			for (let i = 0; i < this.children.length; i++) {
				str += this.children[i].toString();
			}
			str += "</ul>";
		}
		str += "</li>";
		return str;
	},
	
	/**
	* 子ノードを絞込み
	*/
	ask : function(question) {
		// 質問するキャラクターの指定がある場合、キャラクターを検索
		// 検索結果が両方とも存在した場合、その2キャラを返す。
		// 存在しなければ通常通りにランダム検索したキャラを返す。
		if (question) {
			let left = this.findSortObjectById(question[0]);
			let right = this.findSortObjectById(question[1]);
			if (left !== null && right !== null) {
				return [left, right];
			}
		}
		let isForceRandom = (arguments[0] == "PASS");
		if (this.children.length == 0) {
			return false;
		}
		if (this.children.length == 1) {
			// 同じ順位のキャラがいなくなった＝順位が確定した
			let currentResultRank = this.level() + 1;
			let captionText = "現在、" + currentResultRank + " 位まで確定しています。";
			$("#caption").text(captionText);
			$("#caption").show();
			return this.children[0].ask();
		}
		let both = [0, 0];
		while (true) {
			if (both[0] != both[1]) {
				break;
			}
			for (let i in [0, 1]) {
				both[i] = Math.floor(Math.random() * this.children.length);
			}
		}
		return [this.children[both[0]], this.children[both[1]]];
	},
	
	/**
	* 削除
	*/
	remove : function() {
		while (this.children.length > 0) {
			this.parent.add(this.children[0], false);
		}
		this.parent.children.splice($.inArray(this, this.parent.children), 1);
	},
	
	/**
	* ノード全体をリソースIDで検索して SortObject を返す。見つからなければ null を返す。
	*/
	findSortObjectById : function(resourceId) {
		if (this.id === resourceId) {
			return this;
		}
		let len = this.children.length;
		for (let i = 0; i < len; i++) {
			let result = this.children[i].findSortObjectById(resourceId);
			if (result !== null) {
				return result;
			}
		}
		return null;
	}
};

/**
 * バックアップ用に ID のみを保存するツリーです。
 */
function IDSortTree() {
	let rootID = -1;
	this.id = rootID;
	this.isEven = false; // 上位と引き分けているか？
	this.nodes = [];
	this.cTree = null;
}

IDSortTree.prototype = {
	constructor : IDSortTree,
	
	/**
	 * ルートアイテム設定をします
	 * public void
	 */
	setupCTree : function() {
		this.cTree = new SortObject(["!root", , , , ]);
		this.nodes = [];
	},
	
	/**
	 * キャラクターアイテムクラスのソート状態からIDツリーを生成します
	 * public void
	 */
	initTree : function(cTree, idNode) {
		let len = cTree.children.length;
		for (let i = 0; i < len; i++) {
			let node = new IDSortTree();
			node.id = cTree.children[i].id;
			node.isEven = cTree.children[i].isEven;
			idNode.nodes.push(node);
			this.initTree(cTree.children[i], node);
		}
	},
	
	/**
	 * このIDツリーからキャラクターアイテムクラスのソート状態を復元します
	 * public SortTree
	 */
	restoreCTree : function(idTree, cNode) {
		if (cNode === null) {
			cNode = this.cTree;
		}
		let len = idTree.nodes.length;
		for (let i = 0; i < len; i++) {
			let nodeId = idTree.nodes[i].id;
			let isEven = idTree.nodes[i].isEven;
			let cItem = null;
			for (let j = 0; j < ResourceData.length; j++) {
				if (nodeId == ResourceData[j][0]) {
					cItem = new SortObject(ResourceData[j]);
					cItem.isEven = isEven;
					break;
				}
			}
			// 謎の NOT FOUND
			if (cItem === null) {
				continue;
			}
			cNode.add(cItem, false);
			this.restoreCTree(idTree.nodes[i], cItem);
		}
		return this.cTree;
	}
};

