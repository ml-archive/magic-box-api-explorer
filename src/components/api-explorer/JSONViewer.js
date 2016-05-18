import React from 'react';
import APIExplorerStore from '../../stores/APIExplorerStore';
import jsonPretty from '../../utils/json';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column', 'Button');

class JSONViewer extends React.Component {
	/**
	 * JSONViewer component constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Mount store change listeners so we can react to store changes
	 */
	componentWillMount() {
		APIExplorerStore.addChangeListener(this._onChange.bind(this));
	}

	/**
	 * Dismount store change listeners so we can clean up
	 */
	componentWillUnmount() {
		APIExplorerStore.removeChangeListener(this._onChange.bind(this));
	}

	/**
	 * Force a component update whenever the APIExplorer store updates
	 *
	 * @private
	 */
	_onChange() {
		this.forceUpdate();
	}

	/**
	 * Wrap a JSON string in
	 *
	 * @param {object} object
	 * @returns {{__html: string}}
	 */
	renderJSON(object) {
		return {__html: '<pre>' + jsonPretty.prettyPrint(object) + '</pre>'};
	}

	render() {
		return (
			<div>
				<p>JSON Response for: {APIExplorerStore.getUrl()}</p>

				<div className="api-explorer-json-viewer" dangerouslySetInnerHTML={this.renderJSON(APIExplorerStore.getResponse())}>
				</div>
			</div>
		);
	}
}

JSONViewer.defaultProps = {};

export default JSONViewer;
