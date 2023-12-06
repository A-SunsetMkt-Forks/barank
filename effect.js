$(document).ready(function() {
	//move the image in pixel
	var move = -10;
	var move_x = -10;
	var move_y = -15;
	//zoom percentage, 1.2 =120%
	var zoom = 1.05;

	//On mouse over those thumbnail
	$('.zitem').hover(function() {
		//Set the width and height according to the zoom percentage
		width = $('.zitem').width() * zoom;
		height = $('.zitem').height() * zoom;
		
		//Move and zoom the image
		$(this).find('img').stop(false,true).animate({'width':width, 'height':height, 'top':move_y, 'left':move_x}, {duration:200});
		
		// come on, is it no image ?
		if( FacePattern && noFacePatternNo && FacePattern == noFacePatternNo ){
			return;
		}
		
		//Display the caption
		$(this).find('div.caption').stop(false,true).fadeIn(200);
	},
	function() {
		//Reset the image
		$(this).find('img').stop(false,true).animate({'width':$('.zitem').width(), 'height':$('.zitem').height(), 'top':'0', 'left':'0'}, {duration:100});	

		// come on, is it no image ?
		if( FacePattern && noFacePatternNo && FacePattern == noFacePatternNo ){
			return;
		}
		
		//Hide the caption
		$(this).find('div.caption').stop(false,true).fadeOut(200);
	});
});

