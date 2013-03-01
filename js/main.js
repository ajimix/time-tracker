( function ( win ) {
	'use strict';

	win.addEvent( 'domready', function () {
		var oTimeTracker = new win.TimeTracker( true );

		oTimeTracker.init();
	} );

} ( window ) );