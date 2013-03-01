( function ( win, doc ) {
	'use strict';

	/**
	 * Controlls the timer of the tasks.
	 * @author Adria Jimenez <ajimix>
	 */
	var Timer = function (){
		var oTimeElement,
			oTimer,
			oStartDate;

		return {

			/**
			 * Initializer
			 * @author Adria Jimenez <ajimix>
			 */
			init: function () {
				oTimeElement = doc.getElementById( 'elapsed-time' );
			},

			/**
			 * Starts the timer.
			 * @author Adria Jimenez <ajimix>
			 */
			startTimer: function () {
				var self = this;

				oStartDate = new Date();

				oTimeElement.innerText = '00';

				oTimer = win.setInterval( function () {
					self.updateTimer();
				}, 1000 );
			},

			/**
			 * Stops the timer.
			 * @author Adria Jimenez <ajimix>
			 */
			stopTimer: function () {
				win.clearTimeout( oTimer );
			},

			/**
			 * Updates the timer.
			 * @author Adria Jimenez <ajimix>
			 */
			updateTimer: function () {
				oTimeElement.innerText = this.formatTime( new Date( new Date() - oStartDate ) );
			},

			/**
			 * Formats the time.
			 * @author Adria Jimenez <ajimix>
			 * @param  {object} oDate Date to format.
			 * @return {string} Resulting text.
			 */
			formatTime: function ( oDate ) {
				var nHours = oDate.getHours() - 1,
					nMinutes = oDate.getMinutes(),
					nSeconds = oDate.getSeconds(),
					sSeparator = ':',
					sReturn = '';

				if ( nHours > 0 ) {
					sReturn += nHours + sSeparator;
				}

				if ( nHours > 0 || nMinutes > 0 ) {
					nMinutes = ( '0' + nMinutes ).substr( -2 );
					sReturn += nMinutes + sSeparator;
				}

				nSeconds = ( '0' + nSeconds ).substr( -2 );

				sReturn += nSeconds;

				return sReturn;
			}

		};
	};

	win.Timer = Timer;

} ( window, document ) );