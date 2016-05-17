var MortarJS = require('../bootstrap').MortarJS;
var AppDispatcher = MortarJS.Dispatcher;
var ModelStore = MortarJS.Stores.ModelStore;

// User data storage
var _user = {
	_me        : {},
	_tokenStore: {
		accessToken: false
	},
	refreshToken  : '',
	_authenticated: false,
	_error        : false,
	_scopes       : []
};

// Misc
var _passwordResetSent = null;
var _requestingSignOut = false;
var _verifyingAccessToken = false;

var CmsUserStore = Object.assign({}, ModelStore, {
	getToken: function() {
		var tokenStore = this._getLocalTokenStore();
		return tokenStore !== null ? tokenStore.accessToken : _user._tokenStore.accessToken;
	},

	getRefreshToken: function() {
		var tokenStore = this._getLocalTokenStore();
		return tokenStore !== null ? tokenStore.refreshToken : _user._tokenStore.refreshToken;
	},

	isTokenExpired: function() {
		var tokenStore = this._getLocalTokenStore();

		if (tokenStore === null) {
			return false;
		}

		// Buffer time in seconds
		var expiryBuffer = 100;

		return Date.now() > tokenStore.expiresAt - expiryBuffer;
	},

	me: function() {
		return _user._me;
	},

	scopes: function() {
		var scopesStore = this._getLocalScopesStore();
		return scopesStore !== null ? scopesStore.scopes : _user._scopes;
	},

	isAuthenticated: function() {
		return _user._authenticated;
	},

	getError: function() {
		return _user._error;
	},

	getUserPermissions: function() {
		return _user._scopes;
	},

	getPasswordResetSentStatus: function() {
		return _passwordResetSent;
	},

	isRequestingSignOut: function() {
		return _requestingSignOut;
	},

	isVeryifyingAccessToken: function() {
		return _verifyingAccessToken;
	},

	_saveTokenToLocalStorage: function(action) {
		var tokenStore = {
			accessToken : action.accessToken,
			expiresIn   : action.expiresIn,
			expiresAt   : Date.now() + action.expiresIn * 1000, // Convert to milliseconds
			refreshToken: action.refreshToken
		};
		localStorage.removeItem('tokenStore');
		localStorage.removeItem('scopesStore');
		localStorage.setItem('tokenStore', JSON.stringify(tokenStore));
	},

	_getLocalTokenStore: function() {
		return JSON.parse(localStorage.getItem('tokenStore'));
	},

	_saveScopesToLocalStorage: function(scopes) {
		var scopesStore = {
			scopes: scopes
		};

		localStorage.removeItem('scopesStore');
		localStorage.setItem('scopesStore', JSON.stringify(scopesStore));
	},

	_getLocalScopesStore: function() {
		return JSON.parse(localStorage.getItem('scopesStore'));
	}

});

/**
 * Event listeners
 */
CmsUserStore.dispatchToken = AppDispatcher.register(function() {
	return true; // Needed for Flux promise resolution
});

module.exports = CmsUserStore;

