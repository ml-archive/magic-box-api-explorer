import keyMirror from 'keymirror';

/**
 * Application action constants
 *
 * @type {{ActionTypes: {user: (*|exports), venues: (*|exports), dashboard: (*|exports)}}}
 */
export default {
	ActionTypes: {
		apiExplorer : keyMirror({
			SET_VALUE: null
		})
	}
};
