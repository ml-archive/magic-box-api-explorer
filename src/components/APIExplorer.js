import React from 'react';
import ResourceActions from '../actions/ResourceActionCreators';
import APIExplorerActions from '../actions/APIExplorerActions';
import APIExplorerStore from '../stores/APIExplorerStore';
import Includes from './api-explorer/Includes';
import Filters from './api-explorer/Filters';
import ResourcePicker from './api-explorer/ResourcePicker';
import JSONViewer from './api-explorer/JSONViewer';
import Sorting from './api-explorer/Sorting';
import Paginator from './api-explorer/Paginator';

let MortarJS = require('../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column');
let FormStore = MortarJS.Stores.FormStore;

class APIExplorer extends React.Component {
	/**
	 * Load up a new resource action
	 *
	 * @param {string} resource
	 */
	getResourceAction(resource) {
		return new ResourceActions(resource);
	}

	/**
	 * Set a new target resource
	 *
	 * @param {string} resource
	 */
	setResource(resource) {
		APIExplorerActions.setResource(resource);
		this.requestData('listResource');
	}

	/**
	 * Refresh data from API with new request modifiers
	 *
	 * @return {void}
	 */
	refreshData() {
		this.requestData('listResource');
	}

	/**
	 * Mount store change listeners so we can react to store changes
	 */
	componentWillMount() {
		// Set the initial resource
		this.setResource(this.props.defaultResource);

		APIExplorerStore.addChangeListener(this._onChange.bind(this));
		FormStore.addChangeListener(this._formChanges.bind(this));
	}

	/**
	 * Dismount store change listeners so we can clean up
	 */
	componentWillUnmount() {
		APIExplorerStore.removeChangeListener(this._onChange.bind(this));
		FormStore.removeChangeListener(this._formChanges.bind(this));
	}

	/**
	 * React to APIExplorerStore changes
	 *
	 * @private
	 */
	_onChange() {
		this.forceUpdate();
	}

	/**
	 * React to FormStore changes
	 *
	 * @private
	 */
	_formChanges() {

	}

	/**
	 * Request new data from the API with new modifiers
	 *
	 * @todo support more than 'listResource'
	 * @param {string} method
	 */
	requestData(method) {
		this.getResourceAction(APIExplorerStore.getResource())[method](APIExplorerStore.getOptions());
	}

	render() {
		let resource = APIExplorerStore.getResource();
		return (
			<section id="api-explorer" className="section">
				<div className="container">

					<Br.Row>
						<Br.Column grid="md" size="12" className="wow fadeIn">
							<div className="section-head">
								<h2 className="heading light-gray">Magic Box API Explorer</h2>
								<h4>
									<span className="sub-heading light-gray">
										Query the FuzzPro CrubClub™ API
								</span>
								</h4>
							</div>
						</Br.Column>
					</Br.Row>

					<Br.Row>
						<Br.Row>
							<Br.Column grid="md" size="12" className="wow fadeIn">
							<p>CRUB (Coffee Runners United Brigade) is a long standing Fuzz tradition of going outside to get coffee. As a group. Together. For fun. The CRUBClub™ API powers our decision making by providing a collection of coffee shops around our office along with reviews and a historical account of where we've been. The API is also integrated with our office tools like Slack and an IoT Arduino-powered button to announce when it's time for the group to assemble and head out.</p>
							<p>This is a React and <a href="https://github.com/fuzz-productions/Mortar-JS">MortarJS</a> powered API Explorer that's connected to a <a href="https://github.com/fuzz-productions/magic-box">Magic Box</a> powered API. You can use it to explore and play with some of the features Magic Box supports out of the (magic) box. Feel free to <a href="mailto:opensource@fuzzprodctions.com">contact us</a> with questions or comments!</p>
							</Br.Column>
						</Br.Row>
						<Br.Row>
							<ResourcePicker resource={resource} refreshData={this.refreshData.bind(this)} schema={this.props.schema} />
						</Br.Row>

						<Br.Row>
							<Br.Column grid="md" size="5" className="">
								<Filters resource={resource} refreshData={this.refreshData.bind(this)} schema={this.props.schema} />
							</Br.Column>

							<Br.Column grid="md" size="5" classes="col-md-offset-1">
								<Br.Row>
									<Sorting resource={resource} refreshData={this.refreshData.bind(this)} schema={this.props.schema} />
								</Br.Row>
							</Br.Column>
						</Br.Row>

						<br />

						<Br.Row>
							<Br.Column grid="md" size="8" className="">
								<JSONViewer />
								<Paginator resource={resource} refreshData={this.refreshData.bind(this)} schema={this.props.schema} />
							</Br.Column>

							<Br.Column grid="md" size="4" className="">
								<br />
								<Includes resource={resource} refreshData={this.refreshData.bind(this)} schema={this.props.schema} />
							</Br.Column>

							<Br.Column grid="md" size="4" classes="col-md-offset-1">
								<br/>
								<Br.Row>

								</Br.Row>
							</Br.Column>
						</Br.Row>
					</Br.Row>
				</div>
			</section>
		);
	}
}

APIExplorer.propTypes = {
	schema         : React.PropTypes.object.isRequired,
	defaultResource: React.PropTypes.string.isRequired
};

APIExplorer.defaultProps = {
	schema: {}
};

export default APIExplorer;
