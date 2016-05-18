import React from 'react';
import smoothScroll from 'smoothscroll'; // Allows for smooth scrolling
import config from '../config/config';

class NavComponent extends React.Component {
	render() {
		return (
			<nav className="navbar no-margin-bottom alt-font bg-white sidebar-nav">
				<div className="container navigation-menu main-nav-container">
					<div className="row">
						<div className="col-md-12 col-sm-12 navbar-header margin-twenty no-margin-lr no-margin-top sm-no-margin">
							<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
								<span className="sr-only">Toggle navigation</span>
								<span className="icon-bar"></span>
								<span className="icon-bar"></span>
								<span className="icon-bar"></span>
							</button>
						</div>
						<div className="col-md-12 sm-no-margin">
							<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
								<ul className="nav navbar-nav">
									<li><a href="https://fuzzproductions.com" className="section-link" data-scroll>Fuzz Productions</a></li>
									<li><a href="https://github.com/fuzz-productions/" className="section-link" data-scroll>Fuzz GitHub</a></li>
									<li><a href="https://github.com/fuzz-productions/magic-box" className="section-link" data-scroll>Magic Box</a></li>
									<li><a href="https://github.com/fuzz-productions/Mortar-JS" className="section-link" data-scroll>MortarJS</a></li>
									<li><a href="mailto:opensource@fuzzprodctions.com" className="section-link" data-scroll>Contact Us</a></li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</nav>
		);
	}
}

NavComponent.defaultProps = {};

export default NavComponent;
