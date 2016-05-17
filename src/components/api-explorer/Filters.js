import React from 'react';
import APIExplorerActions from '../../actions/APIExplorerActions';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column', 'Button');
let FormStore = MortarJS.Stores.FormStore;

class Filters extends React.Component {
	constructor() {
		super();

		this.formKey = 'filters-form';

		this.state = {
			filters: [
				{
					column: '',
					token : '',
					filter: '',
					close : ''
				}
			],
			filterExample: {
				column: 'profile_id',
				token : '[',
				filter: '34,56,78',
				close : ']' // or null
			}
		};
	}

	componentWillMount() {
		FormStore.addChangeListener(this._formChanges.bind(this));
	}

	componentWillUnmount() {
		FormStore.removeChangeListener(this._formChanges.bind(this));
	}

	_formChanges() {
		this.setState({
			filters: FormStore.getResource(this.formKey)
		});
	}

	applyFilters(filters) {
		let applyFilters = {};

		filters.forEach((filter) => {
			applyFilters[filter.column] = `${filter.token}${filter.filter}${filter.close}`;
		});

		APIExplorerActions.setFilters(applyFilters);
		this.props.refreshData();
	}

	handleAction(action, resource) {
		switch (action) {
			case 'add-filter-row':
				this.setState((previousState) => {
					previousState.filters.push({
						column: '',
						token : '',
						filter: '',
						close : ''
					});
				});
				break;
			case 'remove-filter-row':
				this.setState((previousState) => {
					delete previousState.filters[resource];
				});
				break;
			case 'apply-filters':
				this.applyFilters(this.state.filters);
				break;
			default:
				break;
		}
	}

	renderFormInputs() {
		return this.state.filters.map((filter, index) => {
			return (
				<Br.Row key={index}>
					<Br.Column grid="md" size="3">
						<Br.Form.Input fieldKey={`[${index}].column`} type="text" placeholder="Column" required="true" />
					</Br.Column>
					<Br.Column grid="md" size="2">
						<Br.Form.Input fieldKey={`[${index}].token`} type="text" placeholder="Token" required="true" />
					</Br.Column>
					<Br.Column grid="md" size="4">
						<Br.Form.Input fieldKey={`[${index}].filter`} type="text" placeholder="Filter" required="true" />
					</Br.Column>
					<Br.Column grid="md" size="2">
						<Br.Form.Input fieldKey={`[${index}].close`} type="text" placeholder="Token" required="false" />
					</Br.Column>
					<Br.Column grid="md" size="1" classes="pull-right">
						<Br.Button action="remove-filter-row" handleAction={this.handleAction.bind(this, 'remove-filter-row', index)} text="-" mods={['pull-right', 'danger']} />
					</Br.Column>
				</Br.Row>
			);
		});
	}

	render() {
		return (
			<div>
				<Br.Row>
					<h4>Filter API request by:</h4>
					<p>Ex: <b>['id', '=', '1']</b> or <b>['id', '[', '1,2,3', ']'].</b> </p>
					<p>'Closing Token' is not always required, see <a href="https://github.com/fuzz-productions/magic-box#filtering">Magic Box docs</a> for more information.</p>
					<div className="explorer-top-container">
						<div>
							<Br.Form key={this.formKey} formKey={this.formKey} bindResource={this.state.filters}>
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
					<Br.Button action="add-filter-row" handleAction={this.handleAction.bind(this)} text="+" mods={['pull-right', 'success']} />
					<Br.Button action="apply-filters" handleAction={this.handleAction.bind(this)} text="Apply" mods={['pull-left', 'raised', 'fullwidth-btn', 'explorer-apply-filter-btn']} />
				</Br.Row>
			</div>
		);
	}
}

Filters.defaultProps = {};

export default Filters;
