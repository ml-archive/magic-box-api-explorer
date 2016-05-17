import React from 'react';
import APIExplorerActions from '../../actions/APIExplorerActions';
import APIExplorerStore from '../../stores/APIExplorerStore';

let MortarJS = require('../../bootstrap').MortarJS;
let Br = MortarJS.require('components', 'Form', 'Checkbox', 'Row', 'Column', 'Button');
let FormStore = MortarJS.Stores.FormStore;

class Paginator extends React.Component {
	constructor() {
		super();

		this.formKey = 'pagination-form';

		this.state = {
			pagination: {}
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
			pagination: FormStore.getResource(this.formKey)
		});
	}

	handleAction(action, resource) {
		switch (action) {
			case 'next-page':
				if (APIExplorerStore.getCurrentPage() === APIExplorerStore.getTotalPages()) {
					break;
				}

				APIExplorerActions.setPage(APIExplorerStore.getCurrentPage() + 1);
				this.props.refreshData();
				break;
			case 'previous-page':
				if (APIExplorerStore.getCurrentPage() === 1) {
					break;
				}

				APIExplorerActions.setPage(APIExplorerStore.getCurrentPage() - 1);
				this.props.refreshData();
				break;
			default:
				break;
		}
	}

	render() {
		return (
			<Br.Column grid="lg" size="12" classes="pagination-container">
				<Br.Row>
					<div className="explorer-top-container">
						<div>
							<Br.Column grid="lg" size="1" classes="col-lg-offset-7">
								<Br.Button action="previous-page" handleAction={this.handleAction.bind(this)}
										   text="Previous" mods={['success']}
										   disabled={APIExplorerStore.getCurrentPage() === 1} />
							</Br.Column>

							<Br.Column grid="lg" size="1" classes="col-lg-offset-1">
								<p className="paginator-page">{APIExplorerStore.getCurrentPage()}/{APIExplorerStore.getTotalPages()}</p>
							</Br.Column>

							<Br.Column grid="lg" size="1">
								<Br.Button action="next-page" handleAction={this.handleAction.bind(this)}
										   text="Next" mods={['success']}
										   disabled={APIExplorerStore.getCurrentPage() === APIExplorerStore.getTotalPages()} />
							</Br.Column>
						</div>
					</div>
				</Br.Row>
			</Br.Column>
		);
	}
}

Paginator.defaultProps = {};

export default Paginator;
