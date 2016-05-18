import React from 'react';
import _ from 'lodash';
import APIExplorerActions from '../../actions/APIExplorerActions';
import APIExplorerStore from '../../stores/APIExplorerStore';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column');
let FormStore = MortarJS.Stores.FormStore;

class Includes extends React.Component {
	/**
	 * Includes component constructor
	 */
	constructor() {
		super();

		/**
		 * Delimit path identifiers so Mortar does not try to parse them as nested object paths
		 *
		 * @type {string}
		 */
		this.PATH_DELIMITER = '->';

		this.formKey = 'include-relations';

		this.state = {
			includeRelations: {}
		};
	}

	/**
	 * Recursively relations for resources
	 *
	 * Limit max nesting level with `levels` param
	 *
	 * @param {string} resource
	 * @param {int} levels
	 * @returns {object}
	 */
	getRelations(resource, levels) {
		// No schema yet, do nothing
		if (typeof this.props.schema[resource] === 'undefined') {
			return {};
		}

		// Set the max nesting level
		levels = typeof levels === 'undefined' ? 3 : levels;

		let relations = {};

		this.props.schema[resource].relations.forEach((relation) => {
			// @todo need to figure out a better way to handle these cases
			if (! relation.singular) {
				relations[relation] = {};
			}
		});

		levels = levels - 1;

		if (levels === 0) {
			return relations;
		}

		for (let relation in relations) {
			if (! relations.hasOwnProperty(relation)) {
				continue;
			}

			// Recursively get relations for resources
			relations[relation] = this.getRelations(relation, levels);
		}

		return relations;
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
	 * Handle FormStore changes
	 *
	 * @private
	 */
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

	/**
	 * Convert our include data structure into an array that's digestible by Mortar
	 *
	 * @param includes
	 * @returns {Array}
	 */
	getArrayIncludes(includes) {
		let arrayIncludes = [];
		for (var key in includes) {
			if (! includes.hasOwnProperty(key)) {
				continue;
			}

			if (includes[key]) {
				// Replace every occurrence of this.PATH_DELIMITER with '.'
				let regexp = new RegExp(this.PATH_DELIMITER, 'gi');
				arrayIncludes.push(key.replace(regexp, '.'));
			}
		}

		return arrayIncludes;
	}

	/**
	 * Set up the toggles for relations and their nested relations recursively
	 *
	 * @param {object} relations
	 * @param {string} path
	 * @param {int} level
	 * @returns {Array}
	 */
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

	/**
	 * Wrap the relations toggles in a Mortar Form
	 *
	 * @param {object} relations
	 * @returns {JSX}
	 */
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
