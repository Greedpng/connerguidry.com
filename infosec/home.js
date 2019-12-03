$(document).ready(function(){


	var countdown = function() {
		var date = new Date(2019, 11, 4, 11, 0)
		var today = new Date();
		var oneDay = 24*60*60*1000;
		var days = ((date.getTime() - today.getTime()) / oneDay);
		days = Math.ceil(days);

		if(days == 0) {
			$("#days").text("It's here.");
        }
        if (days == 1) {
            $("#countdown").text(days.toString().concat(" "));
            $("#days").text("day left.");
        }
		if (days > 0) {
            $("#countdown").text(days.toString().concat(" "));
            $("#days").text("days left.");
        }
        
	};
	countdown();
	
  });