import ga from 'react-ga';
import AppActionConstants from '../constants/AppActionConstants';

let AppDispatcher = require('../bootstrap').MortarJS.Dispatcher;

export default {
	/**
	 * Handle all setters
	 *
	 * @param {string} key
	 * @param {*} value
	 */
	set: function (key, value) {
		AppDispatcher.dispatch({
			type : AppActionConstants.ActionTypes.apiExplorer.SET_VALUE,
			key  : key,
			value: value
		});
	},

	/**
	 * Send an event of action to Google Analytics
	 *
	 * @param {string} event
	 */
	sendAnalyticsEvent: function (event) {
		ga.event({
			category: 'APIExplorer',
			action  : event
		});
	},

	/**
	 * Setter for new resource
	 *
	 * @param {string} value
	 */
	setResource: function (value) {
		this.set('resource', value);

		this.sendAnalyticsEvent('Set Resource');
	},

	/**
	 * Setter for new options
	 *
	 * @param {object} value
	 */
	setOptions: function (value) {
		this.set('options', value);

		this.sendAnalyticsEvent('Set Options');
	},

	/**
	 * Setter for new modifiers
	 *
	 * @param {object} value
	 */
	setModifiers: function (value) {
		this.set('options.modifiers', value);

		this.sendAnalyticsEvent('Set Modifiers');
	},

	/**
	 * Setter for new filters
	 *
	 * @param {object} value
	 */
	setFilters: function (value) {
		this.set('options.modifiers.filters', value);

		this.sendAnalyticsEvent('Set Filters');
	},

	/**
	 * Setter for new includes
	 *
	 * @param {object} value
	 */
	setIncludes: function (value) {
		this.set('options.modifiers.include', value);

		this.sendAnalyticsEvent('Set Includes');
	},

	/**
	 * Setter for new sorts
	 *
	 * @param {object} value
	 */
	setSort: function (value) {
		this.set('options.modifiers.sort', value);

		this.sendAnalyticsEvent('Set Sort');
	},

	/**
	 * Setter for new per page count
	 *
	 * @param {int} value
	 */
	setPerPage: function (value) {
		this.set('options.modifiers.pagination.per_page', value);

		this.sendAnalyticsEvent('Set Per Page');
	},

	/**
	 * Setter for new page number
	 *
	 * @param {int} value
	 */
	setPage: function (value) {
		this.set('options.modifiers.pagination.page', value);

		this.sendAnalyticsEvent('Set Per Page');
	},

	/**
	 * Setter for new dataNode
	 *
	 * @param {string} value
	 */
	setDataNode: function (value) {
		this.set('dataNode', value);
	}
};
