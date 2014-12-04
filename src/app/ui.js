$(document).ready(function() {

	var timelineHeight = $('#timeline-nav').height();

	$(window).scroll(function() {

		var offset = $(window).height() - $('body').scrollTop() - timelineHeight - 40;

		if(offset <= 0) {
			$('#timeline-nav').addClass('fixed');
		} else {
			$('#timeline-nav').removeClass('fixed');
		}

	});
});