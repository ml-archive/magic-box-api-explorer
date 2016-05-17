import React from 'react';
import _ from 'lodash';
import APIExplorerActions from '../../actions/APIExplorerActions';
import APIExplorerStore from '../../stores/APIExplorerStore';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column');
let FormStore = MortarJS.Stores.FormStore;

class Includes extends React.Component {
	constructor() {
		super();

		this.PATH_DELIMITER = '->';

		this.formKey = 'include-relations';

		this.state = {
			includeRelations: {}
		};
	}

	getRelations(resource, levels) {
		if (typeof this.props.schema[resource] === 'undefined') {
			return {};
		}

		levels = typeof levels === 'undefined' ? 3 : levels;

		let relations = {};

		this.props.schema[resource].relations.forEach((relation) => {
			relations[relation] = {};
		});

		levels = levels - 1;

		if (levels === 0) {
			return relations;
		}

		for (let relation in relations) {
			if (! relations.hasOwnProperty(relation)) {
				continue;
			}

			relations[relation] = this.getRelations(relation, levels);
		}

		return relations;
	}

	componentWillMount() {
		FormStore.addChangeListener(this._formChanges.bind(this));
	}

	componentWillUnmount() {
		FormStore.removeChangeListener(this._formChanges.bind(this));
	}

	_formChanges() {
		let formStoreData = FormStore.getResource(this.formKey);
		let futureIncludes = this.getArrayIncludes(formStoreData);
		let currentIncludes = APIExplorerStore.getIncludes();

		// Don't continue if nothing changed
		if (_.isEqual(futureIncludes, currentIncludes)) {
			return;
		}

		this.setState({
			includeRelations: formStoreData
		}, () => {
			APIExplorerActions.setIncludes(futureIncludes);
			this.props.refreshData();
		});
	}

	getArrayIncludes(includes) {
		let arrayIncludes = [];
		for (var key in includes) {
			if (! includes.hasOwnProperty(key)) {
				continue;
			}

			if (includes[key]) {
				let regexp = new RegExp(this.PATH_DELIMITER, 'gi');
				arrayIncludes.push(key.replace(regexp, '.'));
			}
		}

		return arrayIncludes;
	}

	buildRelationsCheckboxes(relations, path, level) {
		let toRender = [];

		for (let relation in relations) {
			if (! relations.hasOwnProperty(relation)) {
				continue;
			}

			let currentPath = level === 0 ? relation : `${path}${this.PATH_DELIMITER}${relation}`;

			if (Object.getOwnPropertyNames(relations[relation]).length > 0) {
				// has subrelations
				let subRelations = this.buildRelationsCheckboxes(relations[relation], currentPath, level + 1);

				toRender.push(
					<div key={relation} className="indent-relation indent-relation-parent">
						<Br.Form.Toggle fieldKey={currentPath} fieldLabel={relation}  />
						{subRelations}
					</div>
				);

				continue;
			}

			toRender.push(
				<div key={relation} className="indent-relation">
					<Br.Form.Toggle fieldKey={currentPath} fieldLabel={relation}  />
				</div>
			);
		}

		return toRender;
	}

	buildRelationsForm(relations) {
		return (
			<Br.Form key={this.formKey} formKey={this.formKey} bindResource={this.state.includeRelations}>
				<Br.Row>
					<Br.Column grid="lg" size="12">
						{this.buildRelationsCheckboxes(relations, null, 0)}
					</Br.Column>
				</Br.Row>
			</Br.Form>
		);
	}

	render() {
		return (
			<div>
				<p>Include relations for {this.props.resource}:</p>
				<div className="explorer-top-container">
					<div>{this.buildRelationsForm(this.getRelations(this.props.resource, 3))}</div>
				</div>
			</div>
		);
	}
}

Includes.defaultProps = {};

export default Includes;
