( function ( win, doc, storage, _UNDEFINED_ ) {
	'use strict';

	var _NULL_ = null,
		_TRUE_ = true,
		_FALSE_ = false,
		$$ = win.$$,
		sHidden = 'hidden',
		fpGetById = function ( sId ) {
			return doc.getElementById( sId );
		},

		/**
		 * Time tracker that will control everything of the tasks.
		 * @author Adria Jimenez <ajimix>
		 * @param  {boolean} bJiraIntegration Enable or disable Jira integration.
		 */
		TimeTracker = function ( bJiraIntegration ) {

			var sTasks = 'tasks',
				sDone = 'done',
				sPending = 'pending',
				sActive = 'active',
				sPaused = 'paused',
				sJiraLink = 'jira-link',
				oTimer,
				oTasks,
				oTaskList,
				oTaskInput,
				oTaskAdd;

			return {

				/**
				 * Initializer
				 * @author Adria Jimenez <ajimix>
				 */
				init: function () {
					var self = this,
						aElements = [];

					self.setProperties();
					self.addEvents();
					self.loadTasks();

					oTimer.init();

					// Create the tasks in the DOM.
					Object.each( oTasks, function ( oTask, sId ) {
						// Purge the object from the last time deleted ones.
						if ( oTask.bCompleted ) {
							self.deleteTask( sId );
						} else {
							aElements.push( self.taskDom( sId, oTask.sText, oTask.bCompleted ) );
						}
					} );

					if ( aElements.length > 0 ) {
						oTaskList.adopt( aElements );
					}

					self.saveTasks();
				},

				/**
				 * Properties setter.
				 * @author Adria Jimenez <ajimix>
				 */
				setProperties: function () {
					oTimer = new win.Timer();
					oTaskList = fpGetById( 'task-list' );
					oTaskInput = fpGetById( 'task-input' );
					oTaskAdd = fpGetById( 'task-add' );
				},

				/**
				 * Add events to the elements.
				 * @author Adria Jimenez <ajimix>
				 */
				addEvents: function () {
					var self = this;

					oTaskList.addEvent( 'click:relay(li)', self.taskClick.bind( self ) );
					oTaskAdd.addEvent( 'click', self.showTaskInput.bind( self ) );
					oTaskInput.addEvent( 'keydown', self.inputKeydown.bind( self ) );
				},

				/**
				 * Event that will be fired on click over the tasks.
				 * @author Adria Jimenez <ajimix>
				 * @param  {object} oEvent
				 * @param  {object} oElement Element will always be the li, as the event is delegated.
				 */
				taskClick: function ( oEvent, oElement ) {
					var self = this,
						oTarget = oEvent.target,
						oTargetTag = oTarget.tagName,
						sId = oElement.id,
						bCompleted;

					// If it's a jira link.
					if ( oTargetTag === 'A' && oTarget.hasClass( sJiraLink ) ) {
						win.open( oTarget.href );
					// If it's the complete/incomplete button.
					} else if ( oTargetTag === 'A' ) {
						sId = oTarget.parentNode.id;
						bCompleted = oElement.hasClass( sPending );

						self.setTaskStatus( sId, bCompleted );
						self.saveTasks();
						self.updateDomTask( sId );
						if ( oElement.hasClass( sActive ) ) {
							oTimer.stopTimer();
						}
					// If the task is active.
					} else if ( oElement.hasClass( sActive ) ) {
						oElement.removeClass( sActive );
						oElement.addClass( sPaused );
						oTimer.stopTimer();
					// If the task is inactive.
					} else {
						$$( '.' + sActive ).removeClass( sActive );
						$$( '.' + sPaused ).removeClass( sPaused );
						oTimer.stopTimer();
						oTimer.startTimer( sId );
						oElement.addClass( sActive );
					}

					oEvent.preventDefault();
				},

				/**
				 * Keyboard event for the input.
				 * @author Adria Jimenez <ajimix>
				 * @param  {object} oEvent
				 */
				inputKeydown: function ( oEvent ) {
					if ( oEvent.key === 'enter' ) {
						this.newTask( oTaskInput.value );
						oTaskInput.addClass( sHidden );
					} else if ( oEvent.key === 'esc' ) {
						oTaskInput.addClass( sHidden );
					}
				},

				/**
				 * Function that shows the input and focus it.
				 * @author Adria Jimenez <ajimix>
				 * @param  {object} oEvent
				 */
				showTaskInput: function ( oEvent ) {
					oTaskInput.removeClass( sHidden );
					oTaskInput.value = '';
					oTaskInput.focus();
					oEvent.preventDefault();
				},

				/**
				 * Updates a task DOM.
				 * @author Adria Jimenez <ajimix>
				 * @param  {string} sId Id of the task to update.
				 */
				updateDomTask: function ( sId ) {
					var oTask = oTasks[sId];
					fpGetById( sId ).outerHTML = this.taskDom( sId, oTask.sText, oTask.bCompleted ).outerHTML;
				},

				/**
				 * Generates the DOM for the task passed.
				 * @author Adria Jimenez <ajimix>
				 * @param  {string} sId Id of the task.
				 * @param  {string} sText Text for the task.
				 * @param  {boolean} bCompleted If the task is completed or not.
				 * @return {element} The newly created element.
				 */
				taskDom: function ( sId, sText, bCompleted ) {
					var Element = win.Element,
						oLi = new Element( 'li#' + sId + '.task.clearfix.' + ( bCompleted ? sDone : sPending ) ),
						oSpan = new Element( 'span.task-text' ),
						oCheck = new Element( 'a.status' ),
						oJiraLink,
						reTask = /^[A-Z]{3,5}\-\d{1,10}/,
						aMatch = sText.match( reTask );

					if ( bJiraIntegration && aMatch !== _NULL_ ) {
						oJiraLink = new Element( 'a.' + sJiraLink );
						oJiraLink.href = 'http://jira.redtonic/browse/' + aMatch[0];
						oJiraLink.target = '_blank';
						oJiraLink.innerText = aMatch[0];
						sText = sText.replace( aMatch[0], '' );
						oSpan.grab( oJiraLink );
					}

					oSpan.innerHTML += sText;
					oCheck.href = '#';

					oLi.adopt( oCheck, oSpan );

					return oLi;
				},

				/**
				 * Creates a new task with the text passed.
				 * @author Adria Jimenez <ajimix>
				 * @param  {string} sText Text of the task.
				 */
				newTask: function ( sText ) {
					var self = this,
						sId = String.uniqueID();

					oTaskList.grab( self.taskDom( sId, sText, _FALSE_ ) );

					self.updateTask( sId, sText );
					self.saveTasks();
				},

				/**
				 * Updates task status.
				 * @author Adria Jimenez <ajimix>
				 * @param  {string} sId Id of the task.
				 * @param  {boolean} bCompleted If task is completed or not.
				 */
				setTaskStatus: function ( sId, bCompleted ) {
					oTasks[sId].bCompleted = bCompleted;
				},

				/**
				 * Updates the task.
				 * @author Adria Jimenez <ajimix>
				 * @param  {string} sId Id of the task to update.
				 * @param  {string} sText New text for the updated task.
				 * @param  {boolean} bCompleted If task is completed or not.
				 */
				updateTask: function ( sId, sText, bCompleted ) {
					oTasks[sId] = {
						sText: sText,
						bCompleted: bCompleted
					};
				},

				/**
				 * Deletes a task from the main object.
				 * @author Adria Jimenez <ajimix>
				 * @param  {string} sId Id of the task to delete.
				 */
				deleteTask: function ( sId ) {
					delete oTasks[sId];
				},

				/**
				 * Loads tasks from the local storage.
				 * @author Adria Jimenez <ajimix>
				 */
				loadTasks: function () {
					oTasks = JSON.decode( storage.getItem( sTasks ) );

					if ( oTasks === _NULL_ )
					{
						oTasks = {};
					}
				},

				/**
				 * Saves task in the local storage.
				 * @author Adria Jimenez <ajimix>
				 */
				saveTasks: function () {
					storage.setItem( sTasks, JSON.encode( oTasks ) );
				}

			};
		};

		win.TimeTracker = TimeTracker;

} ( window, document, localStorage ) );