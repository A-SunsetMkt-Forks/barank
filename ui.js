function select_all(event){
	var objsIpt = $(this).parents("fieldset").find(":checkbox");
	var status = $(this)[0].checked;
	for(var i=0; i<objsIpt.length; i++){
		objsIpt[i].checked = status;
	}
}

function select_chars(event){
	var objsIpt = $(this).parents("li").find(":checkbox");
	var status = $(this)[0].checked;
	for(var i=0; i<objsIpt.length; i++){
		objsIpt[i].checked = status;
	}
}

function toggle_chars(is_char_on){
	$("#toggle-chars-off").toggle();
	$("#toggle-chars-on").toggle();
	
	$(".group-chars").toggle();
	$("#hint_select").show();
	$("#hint_select").fadeOut(6000);
}


// UI初期化
$(document).ready( function(){
	$(".group-outer").bind("change", select_all);
	$(".group-inner").bind("change", select_chars);
	
	$("#toggle-chars-off").toggle();
	$(".group-chars").toggle();
});

