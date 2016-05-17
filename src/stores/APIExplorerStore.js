import _ from 'lodash';
import AppActionConstants from '../constants/AppActionConstants';
import config from '../config/config';

let MortarJS = require('../bootstrap').MortarJS;
let AppDispatcher = MortarJS.Dispatcher;
let ModelStore = MortarJS.Stores.ModelStore;
let MortarConstants = MortarJS.Constants.ActionTypes;

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

function eventName(name) {
	return storeData.resource.toUpperCase() + '_' + name;
}

let APIExplorerStore = Object.assign({}, ModelStore, {
	getResource: function() {
		return storeData.resource;
	},

	getResponse: function() {
		return storeData.response;
	},

	getModifiers: function(key) {
		if (key) {
			return storeData.options.modifiers[key];
		}

		return storeData.options.modifiers;
	},

	getIncludes: function () {
		return storeData.options.modifiers.include;
	},

	getOptions: function() {
		return storeData.options;
	},

	getDataNode: function() {
		return storeData.dataNode;
	},

	getUrl: function (path) {
		if (path) {
			return config.base.apiVersionedUrl + path;
		}

		return storeData.id === null ? `${config.base.apiVersionedUrl}${this.getResource()}` : `${config.base.apiVersionedUrl}${this.getResource()}/${storeData.id}`;
	},

	getPerPage() {
		return storeData.options.modifiers.pagination.per_page;
	},

	getCurrentPage() {
		return storeData.options.modifiers.pagination.page;
	},

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

