import React from 'react';
import APIExplorerStore from '../../stores/APIExplorerStore';
import jsonPretty from '../../utils/json';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column', 'Button');

class JSONViewer extends React.Component {
	constructor() {
		super();
	}

	componentWillMount() {
		APIExplorerStore.addChangeListener(this._onChange.bind(this));
	}

	componentWillUnmount() {
		APIExplorerStore.removeChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		this.forceUpdate();
	}

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
