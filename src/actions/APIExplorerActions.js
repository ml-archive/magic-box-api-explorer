import ga from 'react-ga';
import AppActionConstants from '../constants/AppActionConstants';

let AppDispatcher = require('../bootstrap').MortarJS.Dispatcher;

export default {
	set: function (key, value) {
		AppDispatcher.dispatch({
			type : AppActionConstants.ActionTypes.apiExplorer.SET_VALUE,
			key  : key,
			value: value
		});
	},

	sendAnalyticsEvent: function (event) {
		ga.event({
			category: 'APIExplorer',
			action  : event
		});
	},

	setResource: function (value) {
		this.set('resource', value);

		this.sendAnalyticsEvent('Set Resource');
	},

	setOptions: function (value) {
		this.set('options', value);

		this.sendAnalyticsEvent('Set Options');
	},

	setModifiers: function (value) {
		this.set('options.modifiers', value);

		this.sendAnalyticsEvent('Set Modifiers');
	},

	setFilters: function (value) {
		this.set('options.modifiers.filters', value);

		this.sendAnalyticsEvent('Set Filters');
	},

	setIncludes: function (value) {
		this.set('options.modifiers.include', value);

		this.sendAnalyticsEvent('Set Includes');
	},

	setSort: function (value) {
		this.set('options.modifiers.sort', value);

		this.sendAnalyticsEvent('Set Sort');
	},

	setPerPage: function (value) {
		this.set('options.modifiers.pagination.per_page', value);

		this.sendAnalyticsEvent('Set Per Page');
	},

	setPage: function (value) {
		this.set('options.modifiers.pagination.page', value);

		this.sendAnalyticsEvent('Set Per Page');
	},

	setDataNode: function (value) {
		this.set('dataNode', value);
	}
};
