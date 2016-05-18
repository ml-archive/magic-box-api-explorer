require('normalize.css/normalize.css');
require('styles/theme/animate.css');
require('bootstrap/dist/css/bootstrap.min.css');
require('ionicons-npm/css/ionicons.css');
require('styles/fonts/icomoon/icomoon-style.css');
require('styles/theme/portfolio.css');
require('styles/theme/style.css');
require('styles/theme/superslides.css');

import React from 'react';
import ga from 'react-ga';
import config from '../config/config';
import Nav from './Navigation';
import APIExplorer from './APIExplorer';

class AppComponent extends React.Component {
	constructor() {
		super();

		this.schema = {
			locations: {
				relations: ['runs', 'reviews']
			},
			reviews: {
				relations: ['locations']
			},
			runs: {
				relations: ['location']
			}
		};
	}

	componentWillMount() {
		ga.initialize(config.analytics.google);

		ga.pageview(window.location.pathname);
	}

	render() {
		return (
			<div>
				<Nav />
				<div className="sidebar-wrapper personal">
					<APIExplorer schema={this.schema} defaultResource="locations" />
				</div>
			</div>
		);
	}
}

AppComponent.defaultProps = {};

export default AppComponent;
