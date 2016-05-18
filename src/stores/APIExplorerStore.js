import _ from 'lodash';
import AppActionConstants from '../constants/AppActionConstants';
import config from '../config/config';

let MortarJS = require('../bootstrap').MortarJS;
let AppDispatcher = MortarJS.Dispatcher;
let ModelStore = MortarJS.Stores.ModelStore;
let MortarConstants = MortarJS.Constants.ActionTypes;

/**
 * Main APIExplorerStore data storage
 *
 * @type {{resource: string, id: null, response: {}, options: {modifiers: {filters: {}, include: Array, sort: {}, pagination: {per_page: number, page: number}}}, paginationData: {count: number, links: {next: string, previous: string}, total: number, total_pages: number}, dataNode: string}}
 */
let storeData = {
	resource: '',
	id      : null,
	response: {},
	options : {
		modifiers: {
			filters : {},
			include : [],
			sort    : {},
			pagination: {
				per_page: 10,
				page    : 1
			}
		}
	},
	paginationData: {
		count: 0,
		links: {
			next: '',
			previous: ''
		},
		total: 0,
		total_pages: 0
	},
	dataNode: 'data'
};

/**
 * Determine the event name we should be listening to according to the current resource
 *
 * @param {string} name
 * @returns {string}
 */
function eventName(name) {
	return storeData.resource.toUpperCase() + '_' + name;
}

/**
 * The APIExplorer Store
 * @type {*}
 */
let APIExplorerStore = Object.assign({}, ModelStore, {
	/**
	 * Getter for current resource
	 *
	 * @returns {string}
	 */
	getResource: function() {
		return storeData.resource;
	},

	/**
	 * Getter for current response
	 *
	 * @returns {string}
	 */
	getResponse: function() {
		return storeData.response;
	},

	/**
	 * Getter for current modifiers
	 *
	 * @returns {object}
	 */
	getModifiers: function(key) {
		if (key) {
			return storeData.options.modifiers[key];
		}

		return storeData.options.modifiers;
	},

	/**
	 * Getter for current includes
	 *
	 * @returns {object}
	 */
	getIncludes: function () {
		return storeData.options.modifiers.include;
	},

	/**
	 * Getter for current options
	 *
	 * @returns {object}
	 */
	getOptions: function() {
		return storeData.options;
	},

	/**
	 * Getter for current dataNode
	 *
	 * @returns {string}
	 */
	getDataNode: function() {
		return storeData.dataNode;
	},

	/**
	 * Getter for current URL
	 *
	 * @returns {string}
	 */
	getUrl: function (path) {
		if (path) {
			return config.base.apiVersionedUrl + path;
		}

		return storeData.id === null ? `${config.base.apiVersionedUrl}${this.getResource()}` : `${config.base.apiVersionedUrl}${this.getResource()}/${storeData.id}`;
	},

	/**
	 * Getter for current per page count
	 *
	 * @returns {int}
	 */
	getPerPage() {
		return storeData.options.modifiers.pagination.per_page;
	},

	/**
	 * Getter for current page
	 *
	 * @returns {int}
	 */
	getCurrentPage() {
		return storeData.options.modifiers.pagination.page;
	},

	/**
	 * Getter for current total page count
	 *
	 * @returns {int}
	 */
	getTotalPages() {
		return storeData.paginationData.total_pages;
	}
});

/**
 * Event listeners
 */
APIExplorerStore.dispatchToken = AppDispatcher.register(function(action) {
	switch (action.type) {
		case AppActionConstants.ActionTypes.apiExplorer.SET_VALUE:
			_.set(storeData, action.key, action.value);

			APIExplorerStore.emitChange();
			// handle setting a value
			break;
		case eventName('LISTED'):
			storeData.response = action.data;
			storeData.id       = null;

			APIExplorerStore.emitChange();
			break;
		case eventName('RECEIVED'):
			storeData.response = action.data;
			storeData.id       = action.data.id;

			APIExplorerStore.emitChange();
			break;
		case MortarConstants.cms.pagination.RECEIVED_PAGINATED_DATA:
			storeData.options.modifiers.pagination.page = action.paginationObject.current_page;
			storeData.options.modifiers.pagination.per_page = action.paginationObject.per_page;

			storeData.paginationData = {
				count: action.paginationObject.count,
				links: {
					next: action.paginationObject.links.next,
					previous: action.paginationObject.links.previous
				},
				total: action.paginationObject.total,
				total_pages: action.paginationObject.total_pages
			};

			APIExplorerStore.emitChange();
			break;
		default:
		// do nothing
	}

	return true; // Needed for Flux promise resolution
});

export default APIExplorerStore;

