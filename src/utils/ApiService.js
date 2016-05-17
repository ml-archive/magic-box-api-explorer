let MortarJS = require('../bootstrap').MortarJS;
let S = require('reqwest');
let _ = require('lodash');
let ErrorHandler = MortarJS.Utils.ErrorHandler;
let SuccessHandler = MortarJS.Utils.SuccessHandler;
let PaginationActionCreators = MortarJS.Actions.PaginationActionCreators;
let CmsActions = MortarJS.Actions.GeneralCmsActionCreators;
let QueryHelper = MortarJS.Utils.QueryHelper;
let UserStore = require('../stores/UserStore');

let ApiService = {
	/**
	 * Assign the authorization header
	 *
	 * @returns {{Authorization: string}}
	 */
	authorizationHeader: function () {
		// @todo The token should be retrieved via another method, but this is okay for now
		return {
			Authorization: 'Bearer ' + UserStore.getToken()
		};
	},

	/**
	 * Merge the developer's headers with the authorization header
	 *
	 * @param userHeaders
	 * @returns {*|exports}
	 */
	mergeHeaders: function (userHeaders) {
		return Object.assign(this.authorizationHeader(), userHeaders);
	},

	/**
	 * Build the URL string with modifiers
	 *
	 * @param {string} url
	 * @param {string} options
	 * @returns {string}
	 */
	buildUrlString: function (url, options) {
		return url + this.buildUrlModifiers(options.modifiers);
	},

	/**
	 * Send errors through the proper error flow
	 *
	 * @param response
	 * @param options
	 * @returns {*}
	 */
	handleError: function (response, options) {
		if (response.status === 401) {
			return CmsActions.failedAuthentication(response);
		}

		if (options.errorHandler) {
			return options.errorHandler(response);
		}

		let errorResponse = JSON.parse(response.response); // @todo why isn't this parsed already
		// call action creator callback that  receives user data (failure is handled in the dispatcher and
		// later in views by emitting the FAILED_{EVENT_NAME} event constant
		ErrorHandler.failedDataRetrieval(
			typeof options.error === 'undefined' ? errorResponse.error : options.error.error,
			typeof options.error === 'undefined' ? errorResponse.error_description : options.error.errorMessage
		);
	},

	/**
	 * Determine if data should be processed by reqwest
	 *
	 * @param {object} options
	 * @returns {boolean}
	 */
	shouldProcessData: function (options) {
		switch (options.contentType) {
			case 'form':
				return false;
			default:
				return true;
		}
	},

	/**
	 * Recursively (optionally) process a javascript object as form data
	 *
	 * @param {object} object
	 * @param {FormData} formData
	 * @param {object} options
	 * @returns {FormData}
	 */
	processFormData: function (object, formData, options, previousPrefix) {
		for (let key in object) {
			if (object.hasOwnProperty(key)) {
				let prefix = previousPrefix === '' ? key : previousPrefix + '[' + key + ']';

				if (object[key] instanceof File) {
					formData.append(prefix, object[key], object[key].name);
				} else if (typeof object[key] === 'object' && options.deepObjectParse) {
					this.processFormData(object[key], formData, options, prefix);
				} else {
					formData.append(prefix, object[key]);
				}
			}
		}

		return formData;
	},

	/**
	 * Handle form data processing
	 *
	 * @param {object} object
	 * @param {object} options
	 * @returns {FormData}
	 */
	parseForm: function (object, options) {
		let formData = new FormData();

		return this.processFormData(object, formData, options, '');
	},

	/**
	 * Set up data object
	 *
	 * @param data
	 * @param options
	 * @returns {*}
	 */
	setData: function (data, options) {
		switch (options.contentType) {
			case 'form':
				return this.parseForm(data, options);
			default:
				return JSON.stringify(data);
		}
	},

	/**
	 * Set up content type string
	 *
	 * @param options
	 * @returns {string}
	 */
	setContentType: function (options) {
		switch (options.contentType) {
			case 'form':
				return 'multipart/form-data';
			default:
				return 'application/json';
		}
	},

	/**
	 * Flatten an object and get paths to all its properties
	 *
	 * @param object
	 * @param path
	 * @param paths
	 * @returns {*}
	 */
	flatten: function (object, path, paths) {
		for (let key in object) {
			if (object.hasOwnProperty(key)) {
				if (typeof object[key] === 'object') {
					this.flatten(object[key], path + '.' + key, paths);
				} else {
					if (path !== '') {
						paths[key] = path.slice(1) + '.' + key;
					} else {
						paths[key] = key;
					}
				}
			}
		}

		return paths;
	},

	/**
	 * Build arbitrarily nested filters
	 *
	 * @param filters
	 * @param key
	 * @returns {Array}
	 */
	buildFilters: function (filters, key) {
		// Flatten the filters object to retrieve an object of {column_name: 'path.in.original.object'
		let flattened = this.flatten(filters, '', {});

		let filterStrings = [];
		for (let column in flattened) {
			// Remove column name from path, replace ORs and ANDs
			let orString = flattened[column]
				.toLowerCase()
				.replace(column, '')
				.replace(/or\./g, '[or]')
				.replace(/and\./g, '[and]');

			// Find the filter's value by the retrieved path
			let filter = orString.length === 0 ? filters[column] : _.get(filters, flattened[column].replace(column, ''))[column];

			// Build the query param part
			filterStrings.push(key + orString + '[' + column + ']=' + filter);
		}

		return filterStrings;
	},

	/**
	 * Build a query string (of modifiers) such as per_page, filter, etc
	 *
	 * @param modifiers
	 * @returns {string}
	 */
	buildUrlModifiers: function (modifiers) {
		let parts = [];
		for (let key in modifiers) {
			// Handle filters and sorts as php assoc. arrays ['key' => 'value']
			if (key === 'filters') {
				parts = parts.concat(this.buildFilters(modifiers[key], key));
			} else if (key === 'sort' || key === 'aggregate') {
				let part = modifiers[key];

				for (let column in part) {
					parts.push(key + '[' + column + ']=' + part[column]);
				}
			} else if (key === 'include') {
				modifiers[key].forEach((relation, index) => {
					parts.push('include[]=' + relation);
				});
			} else {
				// Handle others as objects to be serialized
				parts.push(QueryHelper.serialize(modifiers[key]));
			}
		}

		if (parts.length > 0) {
			return '?' + parts.join('&');
		}

		return '';
	},

	openInNewWindow: function (url, options, cb) {
		window.open(url);
	},

	/**
	 * Handle a GET request to the API
	 *
	 * @param url
	 * @param options
	 * @param cb
	 */
	get: function (url, options, cb) {
		if (options.inNewWindow) {
			this.openInNewWindow(this.buildUrlString(url, options), options, cb);
		}

		S({
			url         :     this.buildUrlString(url, options),
			method      :  'get',
			contentType : this.setContentType(options),
			processData : this.shouldProcessData(options),
			headers     : options.noAuth ? options.headers : this.mergeHeaders(options.headers),
			success     : function (response) {
				console.log('Success response', response);
				// Call pagination action creator to store pagination data
				if (response.meta && response.meta.pagination) {
					PaginationActionCreators.acceptPaginatedData(response.meta.pagination);
					cb(options.dataNode ? response[options.dataNode] : response, response.meta.pagination);
				} else {
					// Call action creator callback that receives user data
					cb(options.dataNode ? response[options.dataNode] : response);
				}
			},
			error:   function (response) {
				this.handleError(response, options);
			}.bind(this)
		});
	},

	/**
	 * Handle a POST request to the API
	 *
	 * @param url
	 * @param data
	 * @param options
	 * @param cb
	 */
	post: function (url, data, options, cb) {
		S({
			url         : this.buildUrlString(url, options),
			before      : function (XMLHttpRequest) {
				// Set up event listeners before sending request
				XMLHttpRequest.upload.addEventListener("progress", function (evt) {
					if (evt.lengthComputable) {
						CmsActions.uploadProgress(evt.loaded, evt.total);
					}
				}, false);
			},
			method      : 'post',
			data        : this.setData(data, options),
			contentType : this.setContentType(options),
			processData : this.shouldProcessData(options),
			headers     : options.noAuth ? options.headers : this.mergeHeaders(options.headers),
			success     : function (response) {
				console.log('Success response', response);

				if (!options.hideAlert) {
					SuccessHandler.success(options.alertText || 'Resource created.');
				}

				// Call action creator callback that receives user data
				cb(options.dataNode ? response[options.dataNode] : response);
			},
			error       : function (response) {
				this.handleError(response, options);
			}.bind(this)
		});
	},

	/**
	 * Handle a DELETE request to the API
	 *
	 * @param url
	 * @param data
	 * @param options
	 * @param cb
	 */
	delete: function (url, data, options, cb) {
		S({
			url         :         this.buildUrlString(url, options),
			method      :      'delete',
			type        :        'json',
			data        :        JSON.stringify(data),
			contentType : 'application/json',
			headers     :     options.noAuth ? options.headers : this.mergeHeaders(options.headers),
			success     :     function (response) {
				console.log('Success response', response);

				if (! options.hideAlert) {
					SuccessHandler.success(options.alertText || 'Resource created.');
				}

				// Call action creator callback that receives user data
				cb(options.dataNode ? response[options.dataNode] : response);
			},
			error       : function (response) {
				this.handleError(response, options);
			}.bind(this)
		})
	},

	/**
	 * Handle a PUT request to the API
	 *
	 * @param url
	 * @param data
	 * @param options
	 * @param cb
	 */
	put: function (url, data, options, cb) {
		S({
			url         : this.buildUrlString(url, options),
			method      : 'put',
			before      : function (XMLHttpRequest) {
				// Set up event listeners before sending request
				XMLHttpRequest.upload.addEventListener("progress", function (evt) {
					if (evt.lengthComputable) {
						CmsActions.uploadProgress(evt.loaded, evt.total);
					}
				}, false);
			},
			data        : this.setData(data, options),
			contentType : this.setContentType(options),
			processData : this.shouldProcessData(options),
			headers     : options.noAuth ? options.headers : this.mergeHeaders(options.headers),
			success     : function (response) {
				console.log('Success response', response);

				if (! options.hideAlert) {
					SuccessHandler.success(options.alertText || 'Resource created.');
				}

				// Call action creator callback that receives user data
				cb(options.dataNode ? response[options.dataNode] : response);
			},
			error       : function (response) {
				this.handleError(response, options);
			}.bind(this)
		});
	}
};

module.exports = ApiService;
