import React from 'react';
import APIExplorerActions from '../../actions/APIExplorerActions';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column', 'Button');

class ResourcePicker extends React.Component {
	constructor() {
		super();

		this.formKey = 'resource-picker';

		this.state = {
			resource: {}
		};
	}

	getResourceOptionList() {
		let options = [];
		for (let resource in this.props.schema) {
			if (! this.props.schema.hasOwnProperty(resource)) {
				continue;
			}

			options.push(resource);
		}

		return options;
	}

	handleResourceSelection(fieldKey, value) {
		this.setState({
			resource: {
				resource: value
			}
		}, () => {
			APIExplorerActions.setFilters({});
			APIExplorerActions.setIncludes([]);
			APIExplorerActions.setResource(this.state.resource.resource);
			this.props.refreshData();
		});
	}

	render() {
		return (
			<Br.Column grid="md" size="12">
				<div className="explorer-resource-picker">
					<div>
						<Br.Form.DropdownSelect key="resource" fieldKey="resource" multiple={false}
												inputLabel='Choose Resource to Query'
												options={this.getResourceOptionList()}
												placeholder={this.props.resource || 'Select a resource to query'} required={true}
												changeCallback={this.handleResourceSelection.bind(this)} />
					</div>
				</div>
			</Br.Column>
		);
	}
}

ResourcePicker.defaultProps = {};

export default ResourcePicker;
