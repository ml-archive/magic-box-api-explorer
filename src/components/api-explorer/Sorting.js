import React from 'react';
import APIExplorerActions from '../../actions/APIExplorerActions';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column', 'Button');
let FormStore = MortarJS.Stores.FormStore;

class Sorting extends React.Component {
	/**
	 * Sorting component constructor
	 */
	constructor() {
		super();

		this.formKey = 'sorts-form';

		this.state = {
			sorts: [
				{
					column: '',
					direction : ''
				}
			],
			sortExample: {
				column: 'date',
				direction: 'desc'
			}
		};
	}

	/**
	 * Mount store change listeners so we can react to store changes
	 */
	componentWillMount() {
		FormStore.addChangeListener(this._formChanges.bind(this));
	}

	/**
	 * Dismount store change listeners so we can clean up
	 */
	componentWillUnmount() {
		FormStore.removeChangeListener(this._formChanges.bind(this));
	}

	/**
	 * React to FormStore changes
	 *
	 * @private
	 */
	_formChanges() {
		this.setState({
			sorts: FormStore.getResource(this.formKey)
		});
	}

	/**
	 * Apply sort options to API request
	 *
	 * @param {array} sorts
	 */
	applySorts(sorts) {
		let applySorts = {};

		sorts.forEach((sort) => {
			applySorts[sort.column] = sort.direction;
		});

		APIExplorerActions.setSort(applySorts);
		this.props.refreshData();
	}

	/**
	 * Sift through actions and route them to appropriate logic
	 *
	 * @param {string} action
	 * @param {*} resource
	 */
	handleAction(action, resource) {
		switch (action) {
			case 'add-sorts-row':
				this.setState((previousState) => {
					previousState.sorts.push({
						column: '',
						direction: ''
					});
				});
				break;
			case 'remove-sorts-row':
				this.setState((previousState) => {
					delete previousState.sorts[resource];
				});
				break;
			case 'apply-sorts':
				this.applySorts(this.state.sorts);
				break;
			default:
				break;
		}
	}

	/**
	 * Build sort input rows
	 *
	 * @returns {Array}
	 */
	renderFormInputs() {
		return this.state.sorts.map((sort, index) => {
			return (
				<Br.Row key={index}>
					<Br.Column grid="md" size="4">
						<Br.Form.Input fieldKey={`[${index}].column`} type="text" placeholder="Column" required="true" />
					</Br.Column>
					<Br.Column grid="md" size="4">
						<Br.Form.Input fieldKey={`[${index}].direction`} type="text" placeholder="Direction" required="true" />
					</Br.Column>
					<Br.Column grid="md" size="4" classes="pull-right">
						<Br.Button action="remove-sorts-row" handleAction={this.handleAction.bind(this, 'remove-sorts-row', index)} text="-" mods={['pull-right', 'danger']} />
					</Br.Column>
				</Br.Row>
			);
		});
	}

	render() {
		return (
			<Br.Column grid="lg" size="12">
				<Br.Row>
					<h4>Sort API request by:</h4>
					<p>Ex: <b>['id', 'desc']</b> or <b>['datetime', 'asc'].</b></p>
					<div className="explorer-top-container">
						<div>
							<Br.Form key={this.formKey} formKey={this.formKey} bindResource={this.state.sorts}>
								<Br.Row>
									<Br.Column grid="lg" size="12">
										{this.renderFormInputs()}
									</Br.Column>
								</Br.Row>
							</Br.Form>
						</div>
					</div>
				</Br.Row>

				<Br.Row>
					<Br.Button action="add-sorts-row" handleAction={this.handleAction.bind(this)} text="+" mods={['pull-right', 'success']} />
					<Br.Button action="apply-sorts" handleAction={this.handleAction.bind(this)} text="Apply" mods={['pull-left', 'raised', 'fullwidth-btn', 'explorer-apply-sort-btn']} />
				</Br.Row>
			</Br.Column>
		);
	}
}

Sorting.defaultProps = {};

export default Sorting;
