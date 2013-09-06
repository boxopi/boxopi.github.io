$(document).ready(function(){

    $(window).scroll(function(){ 
	if ($(window).scrollTop() > 0){
	    $('.goUp').show();
	} else {
	    $('.goUp').hide();
	}
    });

    $('.goUp').click(function(){
	if ($.browser.webkit){
	    $(window).scrollTop(0);
	} else {
	    $(window).scrollTop(0);
	}

    });
	
	$(window).scroll(function(){ 
	if ($(window).scrollTop() > 0){
	    $('.goUp2').show();
	} else {
	    $('.goUp2').hide();
	}
    });

    $('.goUp2').click(function(){
	if ($.browser.webkit){
	    window.scrollTo(0, document.body.scrollHeight);
	} else {
	    window.scrollTo(0, document.body.scrollHeight);
	}

    });
});